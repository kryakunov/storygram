<?php
$t = t();
$username = $username ?? '';
?>
<form class="search-form<?= !empty($compact) ? ' search-form-md' : '' ?>" method="get" action="<?= e(url('/search')) ?>">
    <label class="sr-only" for="username"><?= e($t['search']['usernameLabel']) ?></label>
    <input
        id="username"
        name="u"
        value="<?= e($username) ?>"
        placeholder="<?= e($t['search']['placeholder']) ?>"
        maxlength="30"
        autocomplete="off"
        required
    >
    <button class="btn" type="submit"><?= e($t['search']['submit']) ?></button>
</form>
