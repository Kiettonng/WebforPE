<?php
header("Access-Control-Allow-Origin: *"); // Allow all origins for simplicity in demo
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS request (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit;
}

require_once __DIR__ . '/db.php';

/*
Expected users table structure:
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_path VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Username, email, and password are required.']);
        exit;
    }

    $username = trim($data['username']);
    $email = trim($data['email']);
    $password = $data['password'];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format.']);
        exit;
    }

    if (strlen($password) < 6) { // Basic password length check
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters long.']);
        exit;
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $pdo = getPDO();

    try {
        // Check if username or email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->fetch()) {
            http_response_code(409); // Conflict
            echo json_encode(['error' => 'Username or email already exists.']);
            exit;
        }

        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password_hash', $password_hash);

        if ($stmt->execute()) {
            http_response_code(201); // Created
            echo json_encode(['message' => 'User registered successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to register user.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        // For a pentest demo, you might want to expose more detailed errors,
        // but in production, log this and return a generic message.
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST method is allowed.']);
}
?>