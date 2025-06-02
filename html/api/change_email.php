<?php
header('Content-Type: application/json');
require_once 'db.php';

// Simple token check (for demo purposes)
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
$token = str_replace('Bearer ', '', $headers['Authorization']);

// For demo, token is not validated properly

// Get user id from token (not implemented, so assume user id 1)
$user_id = 1;

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

$email = $input['email'];

// Vulnerable to SQL injection due to unsafe query construction
$sql = "UPDATE users SET email = '$email' WHERE id = $user_id";

try {
    $pdo->exec($sql);

    // Log email change
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $logStmt = $pdo->prepare('INSERT INTO logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)');
    $logStmt->execute([$user_id, 'Email changed', $ip, $ua]);

    echo json_encode(['success' => true, 'message' => 'Email changed successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to change email']);
}
?>
