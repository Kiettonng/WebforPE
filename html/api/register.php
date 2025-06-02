<?php
header('Content-Type: application/json');
require_once 'db.php';

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username'], $input['email'], $input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$username = trim($input['username']);
$email = trim($input['email']);
$password = $input['password'];

if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Fields cannot be empty']);
    exit;
}

// Check if email already exists
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}

// Hash password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
try {
    $stmt->execute([$username, $email, $password_hash]);
    $user_id = $pdo->lastInsertId();

    // Log registration
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $logStmt = $pdo->prepare('INSERT INTO logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)');
    $logStmt->execute([$user_id, 'User registered', $ip, $ua]);

    echo json_encode(['success' => true, 'message' => 'Registration successful']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Registration failed']);
}
?>
