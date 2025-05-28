<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';
session_start();

// --- Authentication Check (Basic) ---
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized. Please login.']);
    exit;
}
$user_id = $_SESSION['user_id'];
// --- End Authentication Check ---

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['old_password']) || empty($data['new_password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Old password and new password are required.']);
        exit;
    }

    $old_password = $data['old_password'];
    $new_password = $data['new_password'];

    if (strlen($new_password) < 6) { // Basic password length check
        http_response_code(400);
        echo json_encode(['error' => 'New password must be at least 6 characters long.']);
        exit;
    }
    
    if ($old_password === $new_password) {
        http_response_code(400);
        echo json_encode(['error' => 'New password cannot be the same as the old password.']);
        exit;
    }

    $pdo = getPDO();

    try {
        // Get current password hash
        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = :user_id");
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            // Should not happen if user is authenticated and session is valid
            http_response_code(404);
            echo json_encode(['error' => 'User not found.']);
            exit;
        }

        // Verify old password
        if (password_verify($old_password, $user['password_hash'])) {
            // Old password is correct, hash the new password
            $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

            // Update password in the database
            $update_stmt = $pdo->prepare("UPDATE users SET password_hash = :new_password_hash WHERE id = :user_id");
            $update_stmt->bindParam(':new_password_hash', $new_password_hash);
            $update_stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);

            if ($update_stmt->execute()) {
                http_response_code(200);
                echo json_encode(['message' => 'Password updated successfully.']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update password.']);
            }
        } else {
            http_response_code(401); // Unauthorized or Forbidden
            echo json_encode(['error' => 'Incorrect old password.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST method is allowed.']);
}
?>