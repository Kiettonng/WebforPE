<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
// Note: Content-Type for file uploads is typically multipart/form-data,
// but we'll expect JSON for user_id and then handle $_FILES.
// For simplicity, we might not strictly enforce Content-Type here if it causes issues with form data.

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';
session_start();

// --- Authentication Check (Basic) ---
// In a real app, you'd validate the token sent in Authorization header
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized. Please login.']);
    exit;
}
$user_id = $_SESSION['user_id'];
// --- End Authentication Check ---

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    if (!isset($_FILES['avatar'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No avatar file provided.']);
        exit;
    }

    $file = $_FILES['avatar'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'File upload error: ' . $file['error']]);
        exit;
    }

    // --- VULNERABILITY: File Upload ---
    // 1. No strict type checking (e.g., allowing .php, .sh files if web server is misconfigured)
    // 2. Predictable file path and name (using original filename directly)
    // 3. Saving to a web-accessible directory without proper restrictions.

    $upload_dir = __DIR__ . '/uploads/avatars/'; // Web-accessible directory!
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true); // 0777 for demo purposes, very insecure
    }

    // VULNERABLE: Using original filename directly. Could lead to path traversal or overwriting critical files.
    $original_filename = basename($file['name']); // basename helps a bit, but still risky
    $file_extension = strtolower(pathinfo($original_filename, PATHINFO_EXTENSION));
    
    // VULNERABLE: Weak check for allowed extensions. Could be bypassed.
    // For a pentest, we might even remove this check or make it very permissive.
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif']; // Let's keep some basic ones for "appearance"
    // if (!in_array($file_extension, $allowed_extensions)) {
    //     http_response_code(400);
    //     echo json_encode(['error' => "Invalid file type. Allowed types: " . implode(', ', $allowed_extensions)]);
    //     exit;
    // }

    // VULNERABLE: Constructing path with user-supplied filename.
    // A more secure way would be to generate a unique filename.
    $new_file_path = $upload_dir . $original_filename; 
    $web_accessible_path = 'uploads/avatars/' . $original_filename; // Path to store in DB

    if (move_uploaded_file($file['tmp_name'], $new_file_path)) {
        $pdo = getPDO();
        try {
            $stmt = $pdo->prepare("UPDATE users SET avatar_path = :avatar_path WHERE id = :user_id");
            $stmt->bindParam(':avatar_path', $web_accessible_path);
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();

            http_response_code(200);
            echo json_encode([
                'message' => 'Avatar uploaded successfully.',
                'avatar_url' => $web_accessible_path // URL for the frontend to display
            ]);
        } catch (PDOException $e) {
            // If DB update fails, ideally delete the uploaded file (rollback)
            unlink($new_file_path);
            http_response_code(500);
            echo json_encode(['error' => 'Database error after upload: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to move uploaded file. Check permissions and path.']);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST method is allowed.']);
}
?>