<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method_not_allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$destinationId = isset($input['destination_id']) ? trim((string)$input['destination_id']) : '';
$weight = isset($input['weight']) ? (int)$input['weight'] : 0;
$courier = isset($input['courier']) ? trim((string)$input['courier']) : '';

if ($destinationId === '' || $weight <= 0 || $courier === '') {
    http_response_code(400);
    echo json_encode(['error' => 'invalid_params']);
    exit;
}

$apiKey = getenv('RAJAONGKIR_API_KEY');
$originId = getenv('RAJAONGKIR_ORIGIN_ID');

if (!$apiKey || !$originId) {
    http_response_code(500);
    echo json_encode(['error' => 'server_not_configured']);
    exit;
}

$ch = curl_init('https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => [
        'key: ' . $apiKey,
        'content-type: application/x-www-form-urlencoded'
    ],
    CURLOPT_POSTFIELDS => http_build_query([
        'origin' => $originId,
        'destination' => $destinationId,
        'weight' => max(1, $weight),
        'courier' => $courier,
        'price' => 'lowest'
    ])
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError || $httpCode >= 400) {
    http_response_code(502);
    echo json_encode(['error' => 'upstream_error', 'detail' => $curlError ?: $httpCode]);
    exit;
}

$data = json_decode($response, true);
$results = isset($data['data']) && is_array($data['data']) ? $data['data'] : [];

if (empty($results)) {
    http_response_code(404);
    echo json_encode(['error' => 'no_service_available']);
    exit;
}

usort($results, function ($a, $b) {
    return ($a['cost'] ?? PHP_INT_MAX) <=> ($b['cost'] ?? PHP_INT_MAX);
});

$cheapest = $results[0];

echo json_encode([
    'cost' => (int)($cheapest['cost'] ?? 0),
    'service' => $cheapest['service'] ?? $courier,
    'etd' => $cheapest['etd'] ?? ''
]);
