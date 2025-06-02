<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

// Fetch user info from session or API if needed
$username = $_SESSION['username'] ?? '';
$email = $_SESSION['email'] ?? '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Profile - Secure Web Application</title>
</head>
<body>
    <h1>Profile</h1>
    <?php if (!empty($_SESSION['avatar_path'])): ?>
        <img src="<?php echo htmlspecialchars($_SESSION['avatar_path']); ?>" alt="Avatar" style="width:100px;height:100px;border-radius:50%;object-fit:cover;">
    <?php endif; ?>
    <p>Username: <?php echo htmlspecialchars($username); ?></p>
    <p>Email: <?php echo htmlspecialchars($email); ?></p>
    <p><a href="dashboard.php">Back to Dashboard</a></p>
</body>
</html>
