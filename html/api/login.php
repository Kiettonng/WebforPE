<?php
header('Content-Type: application/json');
require_once 'db.php';

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email'], $input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$email = trim($input['email']);
$password = $input['password'];

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Fields cannot be empty']);
    exit;
}

// Find user by email
$stmt = $pdo->prepare('SELECT id, username, email, password_hash, avatar_path FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

// Generate a simple token (for demo purposes, not secure)
$token = base64_encode(random_bytes(24));

// Log login
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$logStmt = $pdo->prepare('INSERT INTO logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)');
$logStmt->execute([$user['id'], 'User logged in', $ip, $ua]);

// Return user info and token
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'token' => $token,
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'avatar' => $user['avatar_path'] ?? null
    ]
]);
?>
