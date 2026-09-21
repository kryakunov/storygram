<?php

class SearchService
{
    /** @var Store */
    private $store;
    /** @var MockProvider */
    private $provider;
    /** @var array */
    private $config;

    public function __construct(Store $store, MockProvider $provider, array $config)
    {
        $this->store = $store;
        $this->provider = $provider;
        $this->config = $config;
    }

    public function search($username, $ipHash = 'anon', $skipRateLimit = false)
    {
        $started = microtime(true);
        $now = time();
        $parsed = parse_username($username);
        if (!$parsed['ok']) {
            return $this->finish([
                'status' => 'invalid_username',
                'username' => $username,
                'providerName' => $this->provider->name,
                'cache' => ['profile' => 'skipped', 'stories' => 'skipped'],
                'profile' => null,
                'stories' => [],
                'errorMessage' => $parsed['error'],
            ], $now, $started, $ipHash);
        }

        $username = $parsed['username'];
        $providerName = $this->provider->name;

        if (!$skipRateLimit && !$this->allow($ipHash)) {
            $window = (int) ceil(($this->config['rate_limit_window_ms'] ?? 60000) / 1000);
            return $this->finish([
                'status' => 'rate_limited',
                'username' => $username,
                'providerName' => $providerName,
                'cache' => ['profile' => 'skipped', 'stories' => 'skipped'],
                'profile' => null,
                'stories' => [],
                'errorMessage' => 'Retry in ' . $window . 's',
            ], $now, $started, $ipHash);
        }

        $failed = $this->store->get($this->failKey($username));
        if (is_array($failed)) {
            return $this->finish([
                'status' => $failed['status'],
                'username' => $username,
                'providerName' => $providerName,
                'cache' => ['profile' => 'hit', 'stories' => 'skipped'],
                'profile' => $failed['profile'] ?? null,
                'stories' => [],
                'errorMessage' => $failed['message'] ?? null,
            ], $now, $started, $ipHash);
        }

        $profileLookup = $this->loadProfile($username);
        if ($profileLookup['status'] === 'done') {
            return $this->finish($profileLookup['result'], $now, $started, $ipHash);
        }

        $profile = $profileLookup['profile'];
        $storiesLookup = $this->loadStories($username, $profile);

        return $this->finish([
            'status' => $storiesLookup['status'],
            'username' => $username,
            'providerName' => $providerName,
            'cache' => [
                'profile' => $profileLookup['cache'],
                'stories' => $storiesLookup['cache'],
            ],
            'profile' => $profile,
            'stories' => $storiesLookup['stories'],
            'errorMessage' => $storiesLookup['errorMessage'],
        ], $now, $started, $ipHash);
    }

    private function loadProfile($username)
    {
        $providerName = $this->provider->name;
        $cached = $this->store->get('profile:' . $providerName . ':' . $username);
        if (is_array($cached) && isset($cached['profile'])) {
            $profile = $cached['profile'];
            if (empty($profile['isPublic'])) {
                return [
                    'status' => 'done',
                    'result' => [
                        'status' => 'private_profile',
                        'username' => $username,
                        'providerName' => $providerName,
                        'cache' => ['profile' => 'hit', 'stories' => 'skipped'],
                        'profile' => $profile,
                        'stories' => [],
                        'errorMessage' => 'Private profiles are not supported.',
                    ],
                ];
            }
            return ['status' => 'continue', 'profile' => $profile, 'cache' => 'hit'];
        }

        try {
            $lookup = $this->provider->getProfileByUsername($username);
        } catch (Throwable $e) {
            return ['status' => 'done', 'result' => $this->unavailable($username, $e->getMessage())];
        }

        if ($lookup['status'] === 'not_found') {
            $this->cacheFailure($username, 'not_found', null, 'Profile not found.');
            return [
                'status' => 'done',
                'result' => [
                    'status' => 'not_found',
                    'username' => $username,
                    'providerName' => $providerName,
                    'cache' => ['profile' => 'miss', 'stories' => 'skipped'],
                    'profile' => null,
                    'stories' => [],
                    'errorMessage' => 'Profile not found.',
                ],
            ];
        }

        if ($lookup['status'] === 'private_profile') {
            $this->cacheFailure($username, 'private_profile', $lookup['profile'], 'Private profiles are not supported.');
            return [
                'status' => 'done',
                'result' => [
                    'status' => 'private_profile',
                    'username' => $username,
                    'providerName' => $providerName,
                    'cache' => ['profile' => 'miss', 'stories' => 'skipped'],
                    'profile' => $lookup['profile'],
                    'stories' => [],
                    'errorMessage' => 'Private profiles are not supported.',
                ],
            ];
        }

        $this->store->set('profile:' . $providerName . ':' . $username, ['profile' => $lookup['profile']], CACHE_TTL['profile']);
        return ['status' => 'continue', 'profile' => $lookup['profile'], 'cache' => 'miss'];
    }

    private function loadStories($username, array $profile)
    {
        $providerName = $this->provider->name;
        $cached = $this->store->get('stories:' . $providerName . ':' . $username);
        if (is_array($cached) && isset($cached['stories'])) {
            $now = time();
            $stories = array_values(array_filter($cached['stories'], function ($story) use ($now) {
                return strtotime($story['expiresAtRemote']) > $now;
            }));
            return [
                'status' => $stories ? 'success' : 'no_stories',
                'stories' => $stories,
                'cache' => 'hit',
                'errorMessage' => $stories ? null : 'No active stories.',
            ];
        }

        try {
            $lookup = $this->provider->getActiveStories($username);
        } catch (Throwable $e) {
            $unavailable = $this->unavailable($username, $e->getMessage());
            return [
                'status' => 'provider_unavailable',
                'stories' => [],
                'cache' => 'miss',
                'errorMessage' => $unavailable['errorMessage'],
            ];
        }

        if ($lookup['status'] === 'private_profile') {
            return [
                'status' => 'private_profile',
                'stories' => [],
                'cache' => 'miss',
                'errorMessage' => 'Private profiles are not supported.',
            ];
        }
        if ($lookup['status'] === 'not_found') {
            return [
                'status' => 'not_found',
                'stories' => [],
                'cache' => 'miss',
                'errorMessage' => 'Profile not found.',
            ];
        }
        if ($lookup['status'] === 'provider_unavailable') {
            return [
                'status' => 'provider_unavailable',
                'stories' => [],
                'cache' => 'miss',
                'errorMessage' => $lookup['message'] ?? 'Provider unavailable.',
            ];
        }

        $now = time();
        $stories = [];
        if ($lookup['status'] === 'found') {
            foreach ($lookup['stories'] as $story) {
                if (strtotime($story['expiresAtRemote']) > $now) {
                    $stories[] = $story;
                }
            }
        }

        $this->store->set('stories:' . $providerName . ':' . $username, ['stories' => $stories], CACHE_TTL['stories']);
        unset($profile);

        return [
            'status' => $stories ? 'success' : 'no_stories',
            'stories' => $stories,
            'cache' => 'miss',
            'errorMessage' => $stories ? null : 'No active stories.',
        ];
    }

    private function allow($ipHash)
    {
        $max = (int) ($this->config['rate_limit_max'] ?? 20);
        $window = (int) ceil(($this->config['rate_limit_window_ms'] ?? 60000) / 1000);
        $key = 'rl:' . $ipHash;
        $current = (int) ($this->store->get($key) ?: 0);
        if ($current >= $max) {
            return false;
        }
        $this->store->set($key, $current + 1, $window);
        return true;
    }

    private function cacheFailure($username, $status, $profile, $message)
    {
        $this->store->set($this->failKey($username), [
            'status' => $status,
            'profile' => $profile,
            'message' => $message,
        ], CACHE_TTL['failed']);
    }

    private function unavailable($username, $message)
    {
        $this->cacheFailure($username, 'provider_unavailable', null, $message);
        return [
            'status' => 'provider_unavailable',
            'username' => $username,
            'providerName' => $this->provider->name,
            'cache' => ['profile' => 'miss', 'stories' => 'skipped'],
            'profile' => null,
            'stories' => [],
            'errorMessage' => $message,
        ];
    }

    private function failKey($username)
    {
        return 'fail:' . $this->provider->name . ':' . $username;
    }

    private function finish(array $payload, $now, $started, $ipHash)
    {
        $durationMs = (int) round((microtime(true) - $started) * 1000);
        $this->store->recordSearch([
            'id' => new_id(),
            'username' => $payload['username'],
            'status' => $payload['status'],
            'searchedAt' => gmdate('c', $now),
            'providerName' => $payload['providerName'],
            'requesterIpHash' => $ipHash,
            'errorMessage' => $payload['errorMessage'],
        ]);
        $this->store->recordFetchLog([
            'id' => new_id(),
            'username' => $payload['username'],
            'providerName' => $payload['providerName'],
            'resultStatus' => $payload['status'],
            'durationMs' => $durationMs,
            'createdAt' => gmdate('c', $now),
            'errorDetails' => $payload['errorMessage'],
        ]);
        $payload['fetchedAt'] = gmdate('c', $now);
        return $payload;
    }
}
