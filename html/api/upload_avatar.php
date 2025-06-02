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

// Check if file uploaded
if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit;
}

// Vulnerable: no proper file validation
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filename = basename($_FILES['avatar']['name']);
$targetFile = $uploadDir . $filename;

if (!move_uploaded_file($_FILES['avatar']['tmp_name'], $targetFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
    exit;
}

// Save avatar path in database
$avatarUrl = '/uploads/' . $filename;
$stmt = $pdo->prepare('UPDATE users SET avatar = ? WHERE id = ?');
$stmt->execute([$avatarUrl, $user_id]);

// Log avatar upload
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$logStmt = $pdo->prepare('INSERT INTO logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)');
$logStmt->execute([$user_id, 'Avatar uploaded', $ip, $ua]);

echo json_encode(['success' => true, 'message' => 'Avatar uploaded', 'avatarUrl' => $avatarUrl]);
?>
