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
$user_id = $_SESSION['user_id']; // This is an integer, generally safe.
// --- End Authentication Check ---

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['new_email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'New email is required.']);
        exit;
    }

    $new_email = $data['new_email']; // User-supplied, potentially unsafe for direct SQL query

    // Basic email validation (client-side should also validate)
    if (!filter_var($new_email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format.']);
        exit;
    }
    
    $pdo = getPDO();

    try {
        // Check if the new email already exists for another user
        // Using prepared statement here for this check to avoid accidental issues during demo setup
        $stmt_check = $pdo->prepare("SELECT id FROM users WHERE email = :new_email AND id != :user_id");
        $stmt_check->bindParam(':new_email', $new_email);
        $stmt_check->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt_check->execute();

        if ($stmt_check->fetch()) {
            http_response_code(409); // Conflict
            echo json_encode(['error' => 'This email address is already in use by another account.']);
            exit;
        }

        // --- VULNERABILITY: SQL Injection ---
        // Constructing SQL query directly with user input ($new_email).
        // The $user_id is from the session and is an integer, so it's less of a direct vector here,
        // but the $new_email is the primary injection point.
        $sql = "UPDATE users SET email = '$new_email' WHERE id = $user_id";
        
        // For demonstration, we'll execute this vulnerable query.
        // In a real application, ALWAYS use prepared statements.
        $stmt = $pdo->query($sql); // Using query() which is dangerous with concatenated strings

        // $stmt will be a PDOStatement object on success, or false on error for some drivers/configs
        // For DML statements like UPDATE, rowCount() can tell us if any rows were affected.
        if ($stmt && $stmt->rowCount() > 0) {
            $_SESSION['email'] = $new_email; // Update session
            http_response_code(200);
            echo json_encode(['message' => 'Email updated successfully to ' . $new_email]);
        } else if ($stmt) {
            http_response_code(200); // Or 304 Not Modified if you prefer
            echo json_encode(['message' => 'Email is already set to ' . $new_email . ' or user not found (should not happen if authenticated).']);
        }
        else {
            // This part might not be reached if PDO is set to throw exceptions on errors.
            // If it does, it means the query failed for reasons other than "no rows affected".
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update email. SQL statement might have failed.']);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        // Exposing detailed error for pentest demo
        echo json_encode(['error' => 'Database error: ' . $e->getMessage(), 'sql_executed' => isset($sql) ? $sql : 'N/A']);
    }

} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST method is allowed.']);
}
?>