<?php $t = t(); ?>
<div class="stack narrow">
    <h1 class="h-search"><?= e($t['pricing']['title']) ?></h1>
    <p class="muted"><?= e($t['pricing']['intro']) ?></p>
    <div class="grid-2">
        <article class="card">
            <h3><?= e($t['pricing']['publicTitle']) ?></h3>
            <p class="muted"><?= e($t['pricing']['publicSoon']) ?></p>
            <p class="muted"><?= e($t['pricing']['publicNote']) ?></p>
        </article>
        <article class="card">
            <h3><?= e($t['pricing']['teamsTitle']) ?></h3>
            <p class="muted"><?= e($t['pricing']['teamsSoon']) ?></p>
            <p class="muted"><?= e($t['pricing']['teamsNote']) ?></p>
        </article>
    </div>
</div>
