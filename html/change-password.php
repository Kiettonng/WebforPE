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
    <title>Change Password - Secure Web Application</title>
</head>
<body>
    <h1>Change Password</h1>
    <?php
    if (isset($_GET['error'])) {
        echo '<p style="color:red;">' . htmlspecialchars($_GET['error']) . '</p>';
    }
    if (isset($_GET['success'])) {
        echo '<p style="color:green;">Password changed successfully.</p>';
    }
    ?>
    <form method="post" action="api/change_password.php">
        <label for="current_password">Current Password:</label><br />
        <input type="password" id="current_password" name="current_password" required /><br />
        <label for="new_password">New Password:</label><br />
        <input type="password" id="new_password" name="new_password" required /><br /><br />
        <button type="submit">Change Password</button>
    </form>
    <p><a href="dashboard.php">Back to Dashboard</a></p>
</body>
</html>
