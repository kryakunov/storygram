<?php

/**
 * Скопируйте в config.php и поправьте значения.
 * На shared-хостинге файл должен лежать рядом с index.php.
 */
return [
    'app_env' => 'production',
    'app_name' => 'Сторис анонимно',
    // Пусто = взять https://текущий-домен автоматически (удобно после заливки по FTP).
    'app_url' => '',
    'yandex_verification' => '',
    'google_verification' => '',
    'story_provider' => 'mock',
    'ip_hash_salt' => 'смените-на-случайную-строку',
    'rate_limit_max' => 20,
    'rate_limit_window_ms' => 60000,
    'admin_token' => '',
];
