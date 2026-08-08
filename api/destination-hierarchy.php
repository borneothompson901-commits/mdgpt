<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'method_not_allowed']);
    exit;
}

$level = isset($_GET['level']) ? trim((string)$_GET['level']) : '';
$parentId = isset($_GET['parent_id']) ? trim((string)$_GET['parent_id']) : '';

$allowedLevels = ['province', 'city', 'district', 'subdistrict'];
if (!in_array($level, $allowedLevels, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid_level']);
    exit;
}

if ($level !== 'province' && ($parentId === '' || !ctype_digit($parentId))) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid_parent_id']);
    exit;
}

$apiKey = getenv('RAJAONGKIR_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'server_not_configured']);
    exit;
}

switch ($level) {
    case 'province':
        $url = 'https://rajaongkir.komerce.id/api/v1/destination/province';
        break;
    case 'city':
        $url = 'https://rajaongkir.komerce.id/api/v1/destination/city/' . $parentId;
        break;
    case 'district':
        $url = 'https://rajaongkir.komerce.id/api/v1/destination/district/' . $parentId;
        break;
    case 'subdistrict':
        $url = 'https://rajaongkir.komerce.id/api/v1/destination/sub-district/' . $parentId;
        break;
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'key: ' . $apiKey
    ]
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
        'id' => $item['id'] ?? '',
        'name' => $item['name'] ?? ($item['label'] ?? ''),
        'zip_code' => $item['zip_code'] ?? ''
    ];
}, $raw);

echo json_encode(['results' => $results]);
