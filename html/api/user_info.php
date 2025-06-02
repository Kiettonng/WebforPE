<?php
error_reporting(0);
ini_set('display_errors',0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';
session_start();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized. Please login.']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $pdo = getPDO();

    try {
        // Fetch user details, excluding password_hash
        $stmt = $pdo->prepare("SELECT id, username, email, avatar_path, created_at FROM users WHERE id = :user_id");
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            http_response_code(200);
            echo json_encode(['user' => $user]);
        } else {
            // This case should ideally not happen if session user_id is valid
            // and corresponds to an existing user. Could indicate data inconsistency or session tampering.
            http_response_code(404);
            echo json_encode(['error' => 'User not found, though session exists. Please re-login.']);
            // Optionally, destroy session here if user is not found
            // session_destroy(); 
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only GET method is allowed.']);
}
?>
