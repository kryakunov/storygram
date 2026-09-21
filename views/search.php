<?php
$t = t();
$cacheLabel = [
    'hit' => $t['search']['cacheHit'],
    'miss' => $t['search']['cacheMiss'],
    'skipped' => $t['search']['cacheSkipped'],
];
$compact = true;
$statusTone = [
    'success' => 'ok',
    'no_stories' => 'warn',
    'not_found' => 'bad',
    'private_profile' => 'bad',
    'provider_unavailable' => 'bad',
    'invalid_username' => 'warn',
    'rate_limited' => 'warn',
];
?>
<div class="stack">
    <div>
        <h1 class="h-search"><?= e($t['search']['title']) ?></h1>
        <p class="muted wide"><?= e($t['search']['subtitle']) ?></p>
        <?php require ROOT_DIR . '/views/partials/search-form.php'; ?>
    </div>
    <aside class="disclaimer compact">
        <strong><?= e($t['disclaimer']['title']) ?></strong>
        <p><?= e($t['disclaimer']['body']) ?></p>
    </aside>

    <?php if ($username === ''): ?>
        <div class="empty"><?= e($t['search']['emptyPrompt']) ?></div>
    <?php elseif (is_array($result)): ?>
        <div class="result-meta">
            <p class="muted">
                <?= e($t['search']['lastChecked']) ?>
                <?= e(format_datetime($result['fetchedAt'])) ?> ·
                <?= e($t['search']['provider']) ?> <?= e($result['providerName']) ?> ·
                <?= e($t['search']['profileCache']) ?> <?= e($cacheLabel[$result['cache']['profile']] ?? $result['cache']['profile']) ?> ·
                <?= e($t['search']['storiesCache']) ?> <?= e($cacheLabel[$result['cache']['stories']] ?? $result['cache']['stories']) ?>
            </p>
            <div class="actions">
                <a class="btn btn-outline btn-sm" href="<?= e(url('/search?u=' . rawurlencode($username) . '&refresh=1')) ?>"><?= e($t['search']['refresh']) ?></a>
                <button class="btn btn-outline btn-sm" type="button" data-copy-link><?= e($t['search']['copyLink']) ?></button>
                <button class="btn btn-outline btn-sm" type="button" data-save-search="<?= e($username) ?>"><?= e($t['search']['save']) ?></button>
            </div>
        </div>
        <?php $st = $result['status']; ?>
        <div class="status status-<?= e($statusTone[$st] ?? 'bad') ?>">
            <p><strong><?= e($t['status'][$st]['title']) ?></strong></p>
            <p class="muted"><?= e($t['status'][$st]['description']) ?></p>
        </div>
        <?php if (!empty($result['profile'])): ?>
            <?php $p = $result['profile']; ?>
            <article class="card profile">
                <span class="story-ring avatar">
                    <img src="<?= e($p['avatarUrl'] ?: asset('demo/avatars/fallback.svg')) ?>" alt="<?= e(interpolate($t['profile']['avatarAlt'], ['name' => $p['displayName']])) ?>">
                </span>
                <div>
                    <div class="profile-head">
                        <h2><?= e($p['displayName']) ?></h2>
                        <span class="badge <?= !empty($p['isPublic']) ? 'badge-ok' : 'badge-bad' ?>">
                            <?= e(!empty($p['isPublic']) ? $t['profile']['public'] : $t['profile']['private']) ?>
                        </span>
                    </div>
                    <p class="muted">@<?= e($p['username']) ?></p>
                    <p><?= e(translate_demo('bios', $p['username'], $p['bio'])) ?></p>
                    <?php if (!empty($p['followerLabel'])): ?>
                        <p class="muted small"><?= e(interpolate($t['profile']['followers'], ['count' => $p['followerLabel']])) ?></p>
                    <?php endif; ?>
                </div>
            </article>
        <?php endif; ?>

        <?php if ($result['status'] === 'success' || !empty($result['stories'])): ?>
            <ul class="stories">
                <?php foreach ($result['stories'] as $index => $story): ?>
                    <?php $caption = translate_demo('captions', $story['providerStoryId'], $story['caption']); ?>
                    <li>
                        <button type="button" class="story-card" data-open-story="<?= (int) $index ?>">
                            <div class="story-thumb">
                                <img src="<?= e($story['thumbnailUrl'] ?: $story['mediaUrl']) ?>" alt="<?= e($caption ?: interpolate($t['stories']['storyN'], ['n' => $index + 1])) ?>">
                                <span class="badge"><?= e($story['mediaType'] === 'video' ? $t['stories']['video'] : $t['stories']['image']) ?></span>
                            </div>
                            <div class="story-meta">
                                <p><?= e($caption ?: $t['stories']['untitled']) ?></p>
                                <p class="muted small">
                                    <?= e(interpolate($t['stories']['posted'], ['time' => format_relative($story['createdAtRemote'])])) ?>
                                    ·
                                    <?= e(interpolate($t['stories']['expires'], ['time' => format_relative($story['expiresAtRemote'])])) ?>
                                </p>
                            </div>
                        </button>
                    </li>
                <?php endforeach; ?>
            </ul>
            <div id="viewer" class="viewer" hidden>
                <div class="viewer-panel" role="dialog" aria-modal="true" aria-label="<?= e($t['stories']['close']) ?>">
                    <div class="viewer-bars" id="viewer-bars"></div>
                    <div class="viewer-media" id="viewer-media"></div>
                    <div class="viewer-nav">
                        <button type="button" class="btn btn-secondary" data-prev><?= e($t['stories']['previous']) ?></button>
                        <button type="button" class="btn" data-next><?= e($t['stories']['next']) ?></button>
                    </div>
                    <button type="button" class="viewer-close" data-close aria-label="<?= e($t['stories']['close']) ?>">×</button>
                </div>
            </div>
            <script type="application/json" id="stories-data"><?= json_encode($result['stories'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?></script>
            <script type="application/json" id="stories-i18n"><?= json_encode([
                'captions' => $t['demo']['captions'],
                'video' => $t['stories']['video'],
                'image' => $t['stories']['image'],
                'unavailable' => $t['stories']['unavailable'],
                'copied' => $t['search']['copied'],
                'saved' => $t['search']['saved'],
                'saveFailed' => $t['search']['saveFailed'],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?></script>
        <?php endif; ?>

        <?php if ($result['status'] === 'not_found'): ?>
            <a class="btn btn-secondary" href="<?= e(url('/search?u=luna.travels')) ?>"><?= e($t['search']['tryDemo']) ?></a>
        <?php endif; ?>
    <?php endif; ?>
</div>
