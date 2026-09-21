<?php $t = t(); ?>
<section class="hero">
    <div class="hero-copy">
        <span class="badge"><?= e($t['home']['badge']) ?></span>
        <h1><?= e($t['home']['headline']) ?></h1>
        <p class="lead"><?= e($t['home']['description']) ?></p>
        <?php require ROOT_DIR . '/views/partials/search-form.php'; ?>
        <div class="hero-actions">
            <a class="btn" href="<?= e(url('/search?u=luna.travels')) ?>"><?= e($t['home']['tryDemo']) ?></a>
            <a class="btn btn-outline" href="<?= e(url('/recent')) ?>"><?= e($t['home']['recentCta']) ?></a>
        </div>
    </div>
    <div class="card">
        <h3><?= e($t['home']['demoTitle']) ?></h3>
        <div class="demo-list">
            <?php foreach ($demoProfiles as $profile): ?>
                <a class="demo-row" href="<?= e(url('/search?u=' . rawurlencode($profile['username']))) ?>">
                    <span>
                        <strong>@<?= e($profile['username']) ?></strong>
                        <span class="muted"><?= e(translate_demo('notes', $profile['username'], $profile['notes'])) ?></span>
                    </span>
                    <span class="badge badge-muted"><?= e($t['scenario'][$profile['scenario']]) ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section>
    <h2><?= e($t['home']['featuresTitle']) ?></h2>
    <div class="grid-3">
        <?php foreach ($t['home']['features'] as $feature): ?>
            <article class="card">
                <h3><?= e($feature['title']) ?></h3>
                <p class="muted"><?= e($feature['body']) ?></p>
            </article>
        <?php endforeach; ?>
    </div>
</section>

<section>
    <h2><?= e($t['home']['howTitle']) ?></h2>
    <ol class="steps">
        <?php foreach ($t['home']['howSteps'] as $i => $step): ?>
            <li>
                <span class="muted"><?= $i + 1 ?></span>
                <?= e($step) ?>
            </li>
        <?php endforeach; ?>
    </ol>
</section>

<section>
    <h2><?= e($t['home']['limitsTitle']) ?></h2>
    <p class="muted wide"><?= e($t['home']['limitsBody']) ?></p>
</section>

<aside class="disclaimer">
    <strong><?= e($t['disclaimer']['title']) ?></strong>
    <p><?= e($t['disclaimer']['body']) ?></p>
</aside>

<section>
    <h2><?= e($t['home']['faqTitle']) ?></h2>
    <div class="faq">
        <?php foreach ($t['home']['faq'] as $item): ?>
            <article class="card">
                <h3><?= e($item['question']) ?></h3>
                <p class="muted"><?= e($item['answer']) ?></p>
            </article>
        <?php endforeach; ?>
    </div>
</section>
