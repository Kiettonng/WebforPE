<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Dashboard - Secure Web Application</title>
</head>
<body>
    <h1>Dashboard</h1>
    <p>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</p>
    <ul>
        <li><a href="profile.php">Profile</a></li>
        <li><a href="change-password.php">Change Password</a></li>
        <li><a href="api/logout.php">Logout</a></li>
    </ul>
</body>
</html>
