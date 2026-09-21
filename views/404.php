<?php $t = t(); ?>
<div class="stack">
    <h1 class="h-search"><?= e($t['errors']['notFound']) ?></h1>
    <p class="muted"><?= e($t['errors']['notFoundBody']) ?></p>
    <a class="btn" href="<?= e(url('/')) ?>"><?= e($t['errors']['backHome']) ?></a>
</div>
