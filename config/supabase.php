<?php

define('SUPABASE_URL', 'https://xjtkipgopiormwmbdtfa.supabase.co');
define('SUPABASE_KEY', 'sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO');

function fetchLinguaSection(string $section)
{
    $url = SUPABASE_URL . '/rest/v1/lingua_site_content'
         . '?section=eq.' . rawurlencode($section)
         . '&select=data';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SUPABASE_KEY,
            'Authorization: Bearer ' . SUPABASE_KEY,
        ],

        CURLOPT_CONNECTTIMEOUT => 2,
        CURLOPT_TIMEOUT => 3,
    ]);

    $response = curl_exec($ch);
    $errno = curl_errno($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno || $httpCode !== 200 || !$response) {
        return null;
    }

    $rows = json_decode($response, true);
    if (!is_array($rows) || empty($rows[0]['data'])) {
        return null;
    }

    return $rows[0]['data'];
}

function lg_e($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
