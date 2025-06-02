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

if (!isset($input['oldPassword'], $input['newPassword'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$oldPassword = $input['oldPassword'];
$newPassword = $input['newPassword'];

// Get current password hash
$stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$user = $stmt->fetch();

if (!$user || !password_verify($oldPassword, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Old password is incorrect']);
    exit;
}

// Hash new password
$newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

// Update password
$stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
try {
    $stmt->execute([$newPasswordHash, $user_id]);

    // Log password change
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $logStmt = $pdo->prepare('INSERT INTO logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)');
    $logStmt->execute([$user_id, 'Password changed', $ip, $ua]);

    echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to change password']);
}
?>
