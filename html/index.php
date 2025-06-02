<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Login - Secure Web Application</title>
</head>
<body>
    <h1>Login</h1>
    <?php
    if (isset($_GET['error'])) {
        echo '<p style="color:red;">' . htmlspecialchars($_GET['error']) . '</p>';
    }
    ?>
    <form method="post" action="api/login.php">
        <label for="username">Email:</label><br />
        <input type="email" id="username" name="username" required /><br />
        <label for="password">Password:</label><br />
        <input type="password" id="password" name="password" required /><br /><br />
        <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <a href="register.php">Register here</a>.</p>
</body>
</html>
