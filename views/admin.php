<?php $t = t(); ?>
<?php if (!empty($unauthorized)): ?>
    <p class="muted"><?= e($t['admin']['unauthorized']) ?></p>
<?php else: ?>
    <?php $data = $snapshot; ?>
    <div class="stack">
        <div>
            <h1 class="h-search"><?= e($t['admin']['title']) ?></h1>
            <p class="muted"><?= e($t['admin']['subtitle']) ?></p>
        </div>
        <div class="grid-2">
            <article class="card">
                <h3><?= e($t['admin']['environment']) ?></h3>
                <p>APP_ENV: <?= e($data['appEnv']) ?></p>
                <p>PHP: <?= e($data['phpVersion']) ?></p>
                <p>
                    <?= e($t['admin']['database']) ?>:
                    <span class="badge <?= $data['database']['ok'] ? 'badge-ok' : 'badge-bad' ?>">
                        <?= e($data['database']['ok'] ? $t['admin']['reachable'] : $t['admin']['unavailableDb']) ?>
                    </span>
                </p>
                <p><?= e($t['admin']['cache']) ?>: <?= e($data['cache']['backend']) ?> · <?= (int) $data['cache']['keys'] ?> <?= e($t['admin']['keys']) ?></p>
                <p><?= e($t['admin']['rateLimit']) ?>: <?= (int) $data['rateLimit']['max'] ?> / <?= (int) $data['rateLimit']['windowMs'] ?>ms</p>
            </article>
            <article class="card">
                <h3><?= e($t['admin']['provider']) ?></h3>
                <p><?= e($t['admin']['selected']) ?>: <?= e($data['provider']['selected']) ?></p>
                <p><?= e($t['admin']['registered']) ?>: <?= e(implode(', ', $data['provider']['registered'])) ?></p>
                <p>
                    <?= e($t['admin']['health']) ?>:
                    <span class="badge <?= $data['provider']['health']['ok'] ? 'badge-ok' : 'badge-bad' ?>">
                        <?= e($data['provider']['health']['ok'] ? $t['admin']['ok'] : $t['admin']['down']) ?>
                    </span>
                </p>
                <p><?= e($data['provider']['health']['message']) ?></p>
                <p class="muted"><?= e($t['admin']['checked']) ?> <?= e(format_datetime($data['provider']['health']['checkedAt'])) ?></p>
            </article>
        </div>
        <article class="card">
            <h3><?= e($t['admin']['demoUsernames']) ?></h3>
            <div class="demo-list">
                <?php foreach ($data['demoUsernames'] as $item): ?>
                    <a class="demo-row" href="<?= e(url('/search?u=' . rawurlencode($item['username']))) ?>">
                        <span>@<?= e($item['username']) ?> — <?= e(translate_demo('notes', $item['username'], $item['notes'])) ?></span>
                        <span class="badge badge-muted"><?= e($t['scenario'][$item['scenario']] ?? $item['scenario']) ?></span>
                    </a>
                <?php endforeach; ?>
            </div>
        </article>
        <article class="card">
            <h3><?= e($t['admin']['fetchLogs']) ?></h3>
            <?php if (empty($data['fetchLogs'])): ?>
                <p class="muted"><?= e($t['admin']['noLogs']) ?></p>
            <?php else: ?>
                <?php foreach ($data['fetchLogs'] as $log): ?>
                    <div class="log-row">
                        <span>@<?= e($log['username']) ?> · <?= e($log['resultStatus']) ?> · <?= (int) $log['durationMs'] ?>ms</span>
                        <span class="muted"><?= e(format_datetime($log['createdAt'])) ?></span>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </article>
    </div>
<?php endif; ?>
