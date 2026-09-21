<?php $t = t(); ?>
<div class="stack">
    <div>
        <h1 class="h-search"><?= e($t['recent']['title']) ?></h1>
        <p class="muted"><?= e($t['recent']['subtitle']) ?></p>
    </div>
    <?php if (!empty($saved)): ?>
        <section>
            <h2 class="h-small"><?= e($t['recent']['saved']) ?></h2>
            <div class="chips">
                <?php foreach ($saved as $item): ?>
                    <a class="chip-link" href="<?= e(url('/search?u=' . rawurlencode($item['username']))) ?>">@<?= e($item['username']) ?></a>
                <?php endforeach; ?>
            </div>
        </section>
    <?php endif; ?>
    <?php if (empty($items)): ?>
        <div class="empty">
            <?= e($t['recent']['empty']) ?>
            <a href="<?= e(url('/search?u=luna.travels')) ?>">luna.travels</a>.
        </div>
    <?php else: ?>
        <div class="stack-sm">
            <?php foreach ($items as $item): ?>
                <article class="card row-between">
                    <div>
                        <a class="strong" href="<?= e(url('/search?u=' . rawurlencode($item['username']))) ?>">@<?= e($item['username']) ?></a>
                        <p class="muted small"><?= e(format_datetime($item['searchedAt'])) ?> · <?= e($item['providerName']) ?></p>
                    </div>
                    <span class="badge badge-muted"><?= e($t['status'][$item['status']]['label'] ?? $item['status']) ?></span>
                </article>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>
