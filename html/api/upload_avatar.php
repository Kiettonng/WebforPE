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

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized. Please login.']);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

    // Đảm bảo thư mục uploads/avatars tồn tại trong DocumentRoot
    $upload_dir = $_SERVER['DOCUMENT_ROOT'] . '/uploads/avatars/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'user' . $user_id . '_' . time() . '.' . $ext;
    $full_path = $upload_dir . $filename;
    $web_path = '/uploads/avatars/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $full_path)) {
        $pdo = getPDO();
        $stmt = $pdo->prepare("UPDATE users SET avatar_path = :avatar_path WHERE id = :user_id");
        $stmt->bindParam(':avatar_path', $web_path);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            'message' => 'Avatar uploaded successfully!',
            'avatar_url' => $web_path
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload file.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST method is allowed.']);
}
?>
