<?php
$t = t();
$seo = seo();
$title = $pageTitle ?? $seo['title'];
$description = $pageDescription ?? $seo['description'];
$canonical = site_url() . ($canonicalPath ?? '/');
if (($canonicalPath ?? '/') === '/') {
    $canonical = site_url();
}
$noindex = !empty($noindex);
$jsonLd = !empty($jsonLd);
$locale = locale();
$theme = current_theme();
$darkClass = is_dark() ? ' dark' : '';
$yandex = trim((string) config('yandex_verification', ''));
$google = trim((string) config('google_verification', ''));
$back = request_path();
if (!empty($_SERVER['QUERY_STRING'])) {
    $back .= '?' . $_SERVER['QUERY_STRING'];
}
$backEnc = rawurlencode($back);
$keywords = implode(',', $seo['keywords']);
$nextTheme = is_dark() ? 'light' : 'dark';
$themeLabel = is_dark() ? $t['theme']['light'] : $t['theme']['dark'];
?>
<!DOCTYPE html>
<html lang="ru" class="h-full<?= $darkClass ?>" data-theme="<?= e($theme) ?>" data-base="<?= e(base_path()) ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($title) ?></title>
    <meta name="description" content="<?= e($description) ?>">
    <meta name="keywords" content="<?= e($keywords) ?>">
    <meta name="application-name" content="<?= e($seo['siteName']) ?>">
    <?php if ($noindex): ?>
        <meta name="robots" content="noindex, nofollow">
    <?php else: ?>
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="<?= e($canonical) ?>">
        <link rel="alternate" hreflang="ru" href="<?= e(site_url()) ?>">
        <link rel="alternate" hreflang="x-default" href="<?= e(site_url()) ?>">
    <?php endif; ?>
    <?php if ($yandex !== ''): ?>
        <meta name="yandex-verification" content="<?= e($yandex) ?>">
    <?php endif; ?>
    <?php if ($google !== ''): ?>
        <meta name="google-site-verification" content="<?= e($google) ?>">
    <?php endif; ?>
    <meta name="geo.region" content="RU">
    <meta name="geo.placename" content="Russia">
    <meta property="og:title" content="<?= e($title) ?>">
    <meta property="og:description" content="<?= e($description) ?>">
    <meta property="og:url" content="<?= e($canonical) ?>">
    <meta property="og:site_name" content="<?= e($seo['siteName']) ?>">
    <meta property="og:locale" content="ru_RU">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= e($title) ?>">
    <meta name="twitter:description" content="<?= e($description) ?>">
    <link rel="icon" href="<?= e(asset('favicon.svg')) ?>" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= e(asset('css/app.css')) ?>?v=2">
    <script>
        (function () {
            try {
                var t = localStorage.getItem('theme') || <?= json_encode($theme) ?>;
                var dark = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', dark);
            } catch (e) {}
        })();
    </script>
    <?php if ($jsonLd): ?>
        <script type="application/ld+json"><?php
            $faq = [];
            foreach (faq_json_ld() as $item) {
                $faq[] = [
                    '@type' => 'Question',
                    'name' => $item['question'],
                    'acceptedAnswer' => ['@type' => 'Answer', 'text' => $item['answer']],
                ];
            }
            echo json_encode([
                [
                    '@context' => 'https://schema.org',
                    '@type' => 'WebApplication',
                    'name' => $seo['siteName'],
                    'url' => site_url(),
                    'applicationCategory' => 'MultimediaApplication',
                    'operatingSystem' => 'Web',
                    'inLanguage' => 'ru',
                    'isAccessibleForFree' => true,
                    'description' => $seo['description'],
                    'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'RUB'],
                ],
                [
                    '@context' => 'https://schema.org',
                    '@type' => 'FAQPage',
                    'mainEntity' => $faq,
                ],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        ?></script>
    <?php endif; ?>
</head>
<body>
    <!-- Yandex.Metrika counter -->
    <script type="text/javascript">
        (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=112872117', 'ym');

        ym(112872117, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
    </script>
    <noscript><div><img src="https://mc.yandex.ru/watch/112872117" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
    <!-- /Yandex.Metrika counter -->
    <header class="site-header">
        <div class="wrap header-inner">
            <a class="brand" href="<?= e(url('/')) ?>">
                <span class="story-ring brand-mark"><span>СА</span></span>
                <span><?= e($t['appName']) ?></span>
            </a>
            <nav class="nav">
                <a href="<?= e(url('/search')) ?>"><?= e($t['nav']['search']) ?></a>
                <a href="<?= e(url('/recent')) ?>"><?= e($t['nav']['recent']) ?></a>
                <a href="<?= e(url('/admin')) ?>"><?= e($t['nav']['admin']) ?></a>
                <a href="<?= e(url('/pricing')) ?>"><?= e($t['nav']['pricing']) ?></a>
                <a class="chip<?= $locale === 'ru' ? ' is-active' : '' ?>" href="<?= e(url('/set-locale?lang=ru&back=' . $backEnc)) ?>">RU</a>
                <a class="chip<?= $locale === 'en' ? ' is-active' : '' ?>" href="<?= e(url('/set-locale?lang=en&back=' . $backEnc)) ?>">EN</a>
                <a class="icon-btn" href="<?= e(url('/set-theme?theme=' . $nextTheme . '&back=' . $backEnc)) ?>" aria-label="<?= e($themeLabel) ?>">☀</a>
            </nav>
        </div>
    </header>
    <main class="wrap main">
        <?= $content ?>
    </main>
    <footer class="site-footer">
        <div class="wrap footer-inner">
            <nav class="footer-nav">
                <a href="<?= e(url('/')) ?>"><?= e($t['footer']['watchAnon']) ?></a>
                <a href="<?= e(url('/search')) ?>"><?= e($t['footer']['onlineFree']) ?></a>
                <a href="<?= e(url('/pricing')) ?>"><?= e($t['nav']['pricing']) ?></a>
            </nav>
            <div class="footer-copy">
                <p><?= e($t['footer']['publicOnly']) ?></p>
                <p><?= e($t['footer']['noPrivate']) ?></p>
            </div>
        </div>
    </footer>
    <div id="toast" class="toast" hidden></div>
    <script src="<?= e(asset('js/app.js')) ?>"></script>
</body>
</html>
