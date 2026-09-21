<?php

class App
{
    public function run()
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $path = request_path();

        if ($method === 'GET' && $path === '/') {
            $this->home();
            return;
        }
        if ($method === 'GET' && $path === '/search') {
            $this->searchPage();
            return;
        }
        if ($method === 'GET' && $path === '/recent') {
            $this->recentPage();
            return;
        }
        if ($method === 'GET' && $path === '/admin') {
            $this->adminPage();
            return;
        }
        if ($method === 'GET' && $path === '/pricing') {
            $this->pricingPage();
            return;
        }
        if ($method === 'GET' && $path === '/sitemap.xml') {
            $this->sitemap();
            return;
        }
        if ($method === 'GET' && $path === '/robots.txt') {
            $this->robots();
            return;
        }
        if ($method === 'GET' && $path === '/set-locale') {
            $this->setLocale();
            return;
        }
        if ($method === 'GET' && $path === '/set-theme') {
            $this->setTheme();
            return;
        }
        if ($method === 'GET' && $path === '/api/health') {
            json_response(['ok' => true, 'env' => config('app_env')]);
        }
        if ($method === 'GET' && $path === '/api/provider/health') {
            json_response((new MockProvider())->healthCheck());
        }
        if ($method === 'POST' && $path === '/api/search') {
            $this->apiSearch();
            return;
        }
        if ($method === 'GET' && $path === '/api/recent-searches') {
            json_response(['items' => store()->recentSearches()]);
        }
        if ($method === 'GET' && $path === '/api/saved-searches') {
            json_response(['items' => store()->savedSearches()]);
        }
        if ($method === 'POST' && $path === '/api/saved-searches') {
            $parsed = parse_username(json_body()['username'] ?? '');
            if (!$parsed['ok']) {
                json_response(['status' => 'invalid_username', 'error' => $parsed['error']], 400);
            }
            store()->saveSearch($parsed['username']);
            json_response(['ok' => true, 'username' => $parsed['username']]);
        }
        if ($method === 'DELETE' && $path === '/api/saved-searches') {
            $parsed = parse_username($_GET['username'] ?? '');
            if (!$parsed['ok']) {
                json_response(['status' => 'invalid_username', 'error' => $parsed['error']], 400);
            }
            store()->removeSavedSearch($parsed['username']);
            json_response(['ok' => true, 'username' => $parsed['username']]);
        }
        if ($method === 'GET' && $path === '/api/admin/status') {
            $this->apiAdmin();
            return;
        }
        if ($method === 'GET' && preg_match('#^/api/profile/([^/]+)/stories$#', $path, $m)) {
            $result = search_service()->search(rawurldecode($m[1]), hash_ip(client_ip()));
            json_response($result, status_code_for($result['status']));
        }
        if ($method === 'GET' && preg_match('#^/api/profile/([^/]+)$#', $path, $m)) {
            $result = search_service()->search(rawurldecode($m[1]), hash_ip(client_ip()));
            json_response([
                'status' => $result['status'],
                'profile' => $result['profile'],
            ], status_code_for($result['status']));
        }

        http_response_code(404);
        render('404', [
            'pageTitle' => t()['errors']['notFound'],
            'noindex' => true,
        ]);
    }

    private function home()
    {
        $demo = array_values(array_filter(demo_profiles(), function ($profile) {
            return $profile['scenario'] !== 'unavailable';
        }));
        render('home', [
            'pageTitle' => seo()['title'],
            'pageDescription' => seo()['description'],
            'canonicalPath' => '/',
            'jsonLd' => true,
            'demoProfiles' => array_slice($demo, 0, 4),
        ]);
    }

    private function searchPage()
    {
        $username = trim((string) ($_GET['u'] ?? ''));
        $result = null;
        if ($username !== '') {
            $result = search_service()->search(
                $username,
                hash_ip(client_ip()),
                isset($_GET['refresh'])
            );
        }
        $seo = seo();
        render('search', [
            'pageTitle' => sprintf($seo['titleTemplate'], $seo['searchTitle']),
            'pageDescription' => $seo['searchDescription'],
            'canonicalPath' => '/search',
            'username' => $username,
            'result' => $result,
        ]);
    }

    private function recentPage()
    {
        header('X-Robots-Tag: noindex, nofollow');
        render('recent', [
            'pageTitle' => sprintf(seo()['titleTemplate'], t()['recent']['title']),
            'noindex' => true,
            'items' => store()->recentSearches(),
            'saved' => store()->savedSearches(),
        ]);
    }

    private function adminPage()
    {
        header('X-Robots-Tag: noindex, nofollow');
        if (!admin_authorized()) {
            http_response_code(401);
            render('admin', [
                'pageTitle' => t()['admin']['title'],
                'noindex' => true,
                'unauthorized' => true,
                'snapshot' => null,
            ]);
            return;
        }
        if (!empty($_GET['token'])) {
            setcookie('admin_token', (string) $_GET['token'], [
                'expires' => time() + 86400 * 7,
                'path' => base_path() === '' ? '/' : base_path(),
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
        }
        render('admin', [
            'pageTitle' => sprintf(seo()['titleTemplate'], t()['admin']['title']),
            'noindex' => true,
            'unauthorized' => false,
            'snapshot' => $this->adminSnapshot(),
        ]);
    }

    private function pricingPage()
    {
        render('pricing', [
            'pageTitle' => sprintf(seo()['titleTemplate'], t()['pricing']['title']),
            'canonicalPath' => '/pricing',
        ]);
    }

    private function apiSearch()
    {
        $username = json_body()['username'] ?? ($_POST['username'] ?? '');
        $result = search_service()->search($username, hash_ip(client_ip()));
        json_response($result, status_code_for($result['status']));
    }

    private function apiAdmin()
    {
        if (!admin_authorized()) {
            json_response(['error' => 'Admin token required.'], 401);
        }
        json_response($this->adminSnapshot());
    }

    private function adminSnapshot()
    {
        $provider = new MockProvider();
        $health = $provider->healthCheck();
        $demos = [];
        foreach (demo_profiles() as $profile) {
            $demos[] = [
                'username' => $profile['username'],
                'scenario' => $profile['scenario'],
                'notes' => $profile['notes'],
            ];
        }
        return [
            'appEnv' => config('app_env'),
            'runtime' => 'php',
            'phpVersion' => PHP_VERSION,
            'provider' => [
                'selected' => config('story_provider', 'mock'),
                'registered' => ['mock'],
                'health' => $health,
            ],
            'cache' => [
                'backend' => 'files',
                'keys' => store()->cacheKeyCount(),
            ],
            'database' => [
                'ok' => store()->writable(),
            ],
            'rateLimit' => [
                'max' => (int) config('rate_limit_max', 20),
                'windowMs' => (int) config('rate_limit_window_ms', 60000),
            ],
            'demoUsernames' => $demos,
            'fetchLogs' => store()->fetchLogs(),
        ];
    }

    private function sitemap()
    {
        $base = site_url();
        $now = gmdate('c');
        header('Content-Type: application/xml; charset=utf-8');
        echo '<?xml version="1.0" encoding="UTF-8"?>';
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ([
            ['loc' => $base, 'freq' => 'daily', 'priority' => '1.0'],
            ['loc' => $base . '/search', 'freq' => 'weekly', 'priority' => '0.8'],
            ['loc' => $base . '/pricing', 'freq' => 'monthly', 'priority' => '0.4'],
        ] as $url) {
            echo '<url>';
            echo '<loc>' . e($url['loc']) . '</loc>';
            echo '<lastmod>' . $now . '</lastmod>';
            echo '<changefreq>' . $url['freq'] . '</changefreq>';
            echo '<priority>' . $url['priority'] . '</priority>';
            echo '</url>';
        }
        echo '</urlset>';
        exit;
    }

    private function robots()
    {
        $base = site_url();
        $host = preg_replace('#^https?://#', '', $base);
        header('Content-Type: text/plain; charset=utf-8');
        echo "User-Agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /recent\n\n";
        echo "User-Agent: Yandex\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /recent\n\n";
        echo 'Host: ' . $host . "\n";
        echo 'Sitemap: ' . $base . "/sitemap.xml\n";
        exit;
    }

    private function setLocale()
    {
        $lang = ($_GET['lang'] ?? '') === 'en' ? 'en' : 'ru';
        setcookie('locale', $lang, [
            'expires' => time() + 86400 * 365,
            'path' => base_path() === '' ? '/' : base_path(),
            'samesite' => 'Lax',
        ]);
        $back = $_GET['back'] ?? '/';
        if (!is_string($back) || strpos($back, '://') !== false) {
            $back = '/';
        }
        redirect($back);
    }

    private function setTheme()
    {
        $theme = ($_GET['theme'] ?? '') === 'light' ? 'light' : 'dark';
        setcookie('theme', $theme, [
            'expires' => time() + 86400 * 365,
            'path' => base_path() === '' ? '/' : base_path(),
            'samesite' => 'Lax',
        ]);
        $back = $_GET['back'] ?? '/';
        if (!is_string($back) || strpos($back, '://') !== false) {
            $back = '/';
        }
        redirect($back);
    }
}
