<?php

class Store
{
    /** @var string */
    private $dir;
    /** @var string */
    private $cacheDir;

    public function __construct($dir)
    {
        $this->dir = rtrim($dir, '/');
        $this->cacheDir = $this->dir . '/cache';
        if (!is_dir($this->dir)) {
            @mkdir($this->dir, 0775, true);
        }
        if (!is_dir($this->cacheDir)) {
            @mkdir($this->cacheDir, 0775, true);
        }
    }

    public function get($key)
    {
        $file = $this->cacheFile($key);
        if (!is_file($file)) {
            return null;
        }
        $data = $this->readJson($file);
        if (!is_array($data) || ($data['expires'] ?? 0) < time()) {
            @unlink($file);
            return null;
        }
        return $data['value'] ?? null;
    }

    public function set($key, $value, $ttlSeconds)
    {
        $this->writeJson($this->cacheFile($key), [
            'expires' => time() + max(1, (int) $ttlSeconds),
            'value' => $value,
        ]);
    }

    public function cacheKeyCount()
    {
        $files = glob($this->cacheDir . '/*.json');
        return is_array($files) ? count($files) : 0;
    }

    public function writable()
    {
        return is_dir($this->dir) && is_writable($this->dir);
    }

    public function recordSearch(array $row)
    {
        $this->prepend('searches.json', $row, 100);
    }

    public function recordFetchLog(array $row)
    {
        $this->prepend('logs.json', $row, 80);
    }

    public function recentSearches($limit = 40)
    {
        return array_slice($this->readList('searches.json'), 0, $limit);
    }

    public function fetchLogs($limit = 40)
    {
        return array_slice($this->readList('logs.json'), 0, $limit);
    }

    public function savedSearches()
    {
        return $this->readList('saved.json');
    }

    public function saveSearch($username)
    {
        $items = $this->readList('saved.json');
        $items = array_values(array_filter($items, function ($item) use ($username) {
            return ($item['username'] ?? '') !== $username;
        }));
        array_unshift($items, [
            'username' => $username,
            'createdAt' => gmdate('c'),
        ]);
        $this->writeJson($this->dir . '/saved.json', $items);
    }

    public function removeSavedSearch($username)
    {
        $items = array_values(array_filter($this->readList('saved.json'), function ($item) use ($username) {
            return ($item['username'] ?? '') !== $username;
        }));
        $this->writeJson($this->dir . '/saved.json', $items);
    }

    private function prepend($filename, array $row, $max)
    {
        $items = $this->readList($filename);
        array_unshift($items, $row);
        $this->writeJson($this->dir . '/' . $filename, array_slice($items, 0, $max));
    }

    private function readList($filename)
    {
        $data = $this->readJson($this->dir . '/' . $filename);
        return is_array($data) ? $data : [];
    }

    private function cacheFile($key)
    {
        return $this->cacheDir . '/' . hash('sha256', $key) . '.json';
    }

    private function readJson($file)
    {
        if (!is_file($file)) {
            return null;
        }
        $fh = fopen($file, 'rb');
        if (!$fh) {
            return null;
        }
        flock($fh, LOCK_SH);
        $raw = stream_get_contents($fh);
        flock($fh, LOCK_UN);
        fclose($fh);
        $data = json_decode((string) $raw, true);
        return is_array($data) ? $data : null;
    }

    private function writeJson($file, $data)
    {
        $dir = dirname($file);
        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }
        $tmp = $file . '.tmp';
        $fh = fopen($tmp, 'cb');
        if (!$fh) {
            return;
        }
        flock($fh, LOCK_EX);
        ftruncate($fh, 0);
        fwrite($fh, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        fflush($fh);
        flock($fh, LOCK_UN);
        fclose($fh);
        @rename($tmp, $file);
    }
}
