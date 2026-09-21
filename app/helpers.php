<?php

const USERNAME_REGEX = '/^(?!.*\.\.)(?!\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/';

const CACHE_TTL = [
    'profile' => 600,
    'stories' => 180,
    'failed' => 60,
    'health' => 30,
];

function e($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function interpolate($template, array $vars)
{
    foreach ($vars as $key => $value) {
        $template = str_replace('{' . $key . '}', (string) $value, $template);
    }
    return $template;
}

function config($key = null, $default = null)
{
    static $config;
    if ($config === null) {
        $file = ROOT_DIR . '/config.php';
        $config = is_file($file) ? require $file : [];
    }
    if ($key === null) {
        return $config;
    }
    return array_key_exists($key, $config) ? $config[$key] : $default;
}

function base_path()
{
    static $base;
    if ($base !== null) {
        return $base;
    }
    $script = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/index.php');
    $dir = rtrim(dirname($script), '/');
    $base = ($dir === '' || $dir === '/') ? '' : $dir;
    return $base;
}

function site_url()
{
    $configured = rtrim((string) config('app_url', ''), '/');
    if ($configured !== '') {
        return $configured;
    }
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ((int) ($_SERVER['SERVER_PORT'] ?? 80) === 443)
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return ($https ? 'https://' : 'http://') . $host . base_path();
}

function url($path = '/')
{
    $path = '/' . ltrim((string) $path, '/');
    if ($path === '/') {
        return base_path() === '' ? '/' : base_path() . '/';
    }
    return base_path() . $path;
}

function asset($path)
{
    return url('assets/' . ltrim($path, '/'));
}

function request_path()
{
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $uri = $uri === false || $uri === null ? '/' : rawurldecode($uri);
    $base = base_path();
    if ($base !== '' && strpos($uri, $base) === 0) {
        $uri = substr($uri, strlen($base));
    }
    if (isset($_GET['r']) && is_string($_GET['r']) && $_GET['r'] !== '') {
        $uri = $_GET['r'];
    }
    $uri = '/' . ltrim($uri, '/');
    if ($uri !== '/' && substr($uri, -1) === '/') {
        $uri = rtrim($uri, '/');
    }
    return $uri === '' ? '/' : $uri;
}

function redirect($path, $code = 302)
{
    header('Location: ' . (preg_match('#^https?://#', $path) ? $path : url($path)), true, $code);
    exit;
}

function json_response($data, $code = 200)
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_body()
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function client_ip()
{
    $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($forwarded !== '') {
        $parts = explode(',', $forwarded);
        return trim($parts[0]);
    }
    return $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
}

function hash_ip($ip)
{
    $ip = trim((string) $ip);
    if ($ip === '') {
        return 'anon';
    }
    return hash('sha256', config('ip_hash_salt', 'salt') . ':' . $ip);
}

function parse_username($value)
{
    $t = t();
    $value = trim((string) $value);
    if ($value === '') {
        return ['ok' => false, 'error' => $t['validation']['required']];
    }
    if (strlen($value) > 30) {
        return ['ok' => false, 'error' => $t['validation']['tooLong']];
    }
    if (!preg_match(USERNAME_REGEX, $value)) {
        return ['ok' => false, 'error' => $t['validation']['invalid']];
    }
    return ['ok' => true, 'username' => strtolower($value)];
}

function locale()
{
    $cookie = $_COOKIE['locale'] ?? '';
    return $cookie === 'en' ? 'en' : 'ru';
}

function t()
{
    static $dict = [];
    $locale = locale();
    if (!isset($dict[$locale])) {
        $file = ROOT_DIR . '/lang/' . $locale . '.php';
        $dict[$locale] = is_file($file) ? require $file : require ROOT_DIR . '/lang/ru.php';
    }
    return $dict[$locale];
}

function translate_demo($kind, $key, $fallback)
{
    $map = t()['demo'][$kind] ?? [];
    return $map[$key] ?? $fallback;
}

function format_datetime($iso, $loc = null)
{
    $loc = $loc ?: locale();
    $ts = is_numeric($iso) ? (int) $iso : strtotime((string) $iso);
    if (!$ts) {
        return (string) $iso;
    }
    if (class_exists('IntlDateFormatter')) {
        $fmt = new IntlDateFormatter(
            $loc === 'en' ? 'en_US' : 'ru_RU',
            IntlDateFormatter::MEDIUM,
            IntlDateFormatter::SHORT
        );
        return $fmt->format($ts);
    }
    return date('d.m.Y H:i', $ts);
}

function format_relative($iso, $loc = null)
{
    $loc = $loc ?: locale();
    $ts = is_numeric($iso) ? (int) $iso : strtotime((string) $iso);
    if (!$ts) {
        return (string) $iso;
    }
    $diff = time() - $ts;
    $abs = abs($diff);
    if ($abs < 45) {
        return t()['relative']['justNow'];
    }
    $minutes = (int) round($abs / 60);
    $hours = (int) round($abs / 3600);
    $days = (int) round($abs / 86400);
    $future = $diff < 0;
    if ($loc === 'en') {
        if ($minutes < 60) {
            return $future ? 'in ' . $minutes . ' min' : $minutes . ' min ago';
        }
        if ($hours < 24) {
            return $future ? 'in ' . $hours . ' h' : $hours . ' h ago';
        }
        return $future ? 'in ' . $days . ' d' : $days . ' d ago';
    }
    if ($minutes < 60) {
        return $future ? 'через ' . $minutes . ' мин' : $minutes . ' мин назад';
    }
    if ($hours < 24) {
        return $future ? 'через ' . $hours . ' ч' : $hours . ' ч назад';
    }
    return $future ? 'через ' . $days . ' дн' : $days . ' дн назад';
}

function current_theme()
{
    $cookie = $_COOKIE['theme'] ?? '';
    return $cookie === 'light' || $cookie === 'dark' ? $cookie : 'system';
}

function is_dark()
{
    $theme = current_theme();
    if ($theme === 'dark') {
        return true;
    }
    if ($theme === 'light') {
        return false;
    }
    $header = $_SERVER['HTTP_SEC_CH_PREFERS_COLOR_SCHEME'] ?? '';
    return $header === 'dark';
}

function seo()
{
    return [
        'locale' => 'ru_RU',
        'siteName' => config('app_name', 'Сторис анонимно'),
        'title' => 'Смотреть сторис Инстаграм анонимно онлайн бесплатно',
        'titleTemplate' => '%s — Сторис анонимно',
        'description' => 'Смотреть сторис анонимно в Инстаграме онлайн бесплатно и без регистрации. Вход в аккаунт не нужен. Только открытые профили, закрытые аккаунты не поддерживаются.',
        'keywords' => [
            'смотреть инстаграм сторис анонимно',
            'смотреть сторис анонимно в инстаграме онлайн',
            'смотреть сторис анонимно в инстаграме бесплатно',
            'смотреть сторис анонимно в инстаграме онлайн бесплатно',
            'сторис анонимно в инстаграме смотреть без регистрации',
            'смотреть инстаграм анонимно сторис онлайн без регистрации',
        ],
        'searchTitle' => 'Смотреть сторис анонимно — поиск открытого профиля',
        'searchDescription' => 'Введите никнейм и смотрите публичные сторис Инстаграм анонимно онлайн без регистрации.',
    ];
}

function faq_json_ld()
{
    return [
        [
            'question' => 'Можно ли смотреть инстаграм сторис анонимно?',
            'answer' => 'Да, вам не нужно входить в свой Instagram. Сервис не использует ваш логин и показывает только публичные истории, доступные выбранному источнику.',
        ],
        [
            'question' => 'Как смотреть сторис анонимно в Инстаграме онлайн бесплатно?',
            'answer' => 'Откройте сайт, введите открытый никнейм и нажмите «Смотреть истории». Просмотр работает в браузере без приложения и без оплаты.',
        ],
        [
            'question' => 'Сторис анонимно в Инстаграме смотреть без регистрации — это возможно?',
            'answer' => 'Да. Регистрация не нужна: поиск публичных сторис доступен сразу.',
        ],
        [
            'question' => 'Можно ли смотреть сторис закрытого аккаунта?',
            'answer' => 'Нет. Закрытые профили не поддерживаются. Сервис не обходит приватность Instagram.',
        ],
    ];
}

function render($view, array $data = [])
{
    extract($data, EXTR_SKIP);
    $t = t();
    $seo = seo();
    $viewFile = ROOT_DIR . '/views/' . $view . '.php';
    ob_start();
    require $viewFile;
    $content = ob_get_clean();
    require ROOT_DIR . '/views/layout.php';
}

function new_id()
{
    return bin2hex(random_bytes(8));
}

function store()
{
    static $store;
    if ($store === null) {
        $store = new Store(ROOT_DIR . '/data');
    }
    return $store;
}

function search_service()
{
    return new SearchService(store(), new MockProvider(), config());
}

function admin_authorized()
{
    $token = (string) config('admin_token', '');
    if ($token === '') {
        return true;
    }
    $header = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    $query = $_GET['token'] ?? '';
    $cookie = $_COOKIE['admin_token'] ?? '';
    return hash_equals($token, (string) $header)
        || hash_equals($token, (string) $query)
        || hash_equals($token, (string) $cookie);
}

function status_code_for($status)
{
    $map = [
        'success' => 200,
        'no_stories' => 200,
        'not_found' => 404,
        'private_profile' => 403,
        'provider_unavailable' => 503,
        'invalid_username' => 400,
        'rate_limited' => 429,
    ];
    return $map[$status] ?? 200;
}
