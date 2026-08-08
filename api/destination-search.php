<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$query = isset($_GET['search']) ? trim((string)$_GET['search']) : '';

if (mb_strlen($query) < 3) {
    echo json_encode(['results' => []]);
    exit;
}

$apiKey = getenv('RAJAONGKIR_API_KEY');

if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'server_not_configured']);
    exit;
}

$url = 'https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?' . http_build_query([
    'search' => $query,
    'limit' => 8,
    'offset' => 0
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => ['key: ' . $apiKey]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError || $httpCode >= 400) {
    http_response_code(502);
    echo json_encode(['error' => 'upstream_error', 'results' => []]);
    exit;
}

$data = json_decode($response, true);
$raw = isset($data['data']) && is_array($data['data']) ? $data['data'] : [];

$results = array_map(function ($item) {
    return [
        'id' => $item['id'] ?? $item['subdistrict_id'] ?? '',
        'label' => $item['label'] ?? trim(
            ($item['subdistrict_name'] ?? '') . ', ' .
            ($item['district_name'] ?? '') . ', ' .
            ($item['city_name'] ?? '') . ', ' .
            ($item['province_name'] ?? ''),
            ', '
        )
    ];
}, $raw);

echo json_encode(['results' => $results]);
