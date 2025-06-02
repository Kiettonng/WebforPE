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
    <title>Register - Secure Web Application</title>
</head>
<body>
    <h1>Register</h1>
    <?php
    if (isset($_GET['error'])) {
        echo '<p style="color:red;">' . htmlspecialchars($_GET['error']) . '</p>';
    }
    ?>
    <form method="post" action="api/register.php">
        <label for="username">Username:</label><br />
        <input type="text" id="username" name="username" required /><br />
        <label for="email">Email:</label><br />
        <input type="email" id="email" name="email" required /><br />
        <label for="password">Password:</label><br />
        <input type="password" id="password" name="password" required /><br /><br />
        <button type="submit">Register</button>
    </form>
    <p>Already have an account? <a href="index.php">Login here</a>.</p>
</body>
</html>
