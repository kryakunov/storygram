<?php

if (PHP_VERSION_ID < 70400) {
    header('Content-Type: text/plain; charset=utf-8', true, 500);
    echo 'Нужен PHP 7.4 или новее. Сейчас: ' . PHP_VERSION;
    exit;
}

date_default_timezone_set('UTC');
header_remove('X-Powered-By');

if (!defined('ROOT_DIR')) {
    define('ROOT_DIR', dirname(__DIR__));
}

require ROOT_DIR . '/app/helpers.php';
require ROOT_DIR . '/app/Store.php';
require ROOT_DIR . '/app/Catalog.php';
require ROOT_DIR . '/app/MockProvider.php';
require ROOT_DIR . '/app/SearchService.php';
require ROOT_DIR . '/app/App.php';
