// app.js - Handles frontend logic and API calls for the static web app

// Utility function to show messages
function showMessage(element, message, isSuccess) {
  element.textContent = message;
  element.className = isSuccess ? 'message success' : 'message error';
  element.style.display = 'block';
}

// Utility function to hide messages
function hideMessage(element) {
  element.style.display = 'none';
}

// Registration form submission handler
async function handleRegister(event) {
  event.preventDefault();
  const messageEl = document.getElementById('registerMessage');
  hideMessage(messageEl);

  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!username || !email || !password) {
    showMessage(messageEl, 'Please fill in all fields.', false);
    return;
  }

  try {
    const response = await fetch('/api/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    if (response.ok && data.success) {
      showMessage(messageEl, 'Registration successful! You can now login.', true);
      event.target.reset();
    } else {
      showMessage(messageEl, data.message || 'Registration failed.', false);
    }
  } catch (error) {
    showMessage(messageEl, 'Error connecting to server.', false);
  }
}

// Login form submission handler
async function handleLogin(event) {
  event.preventDefault();
  const messageEl = document.getElementById('loginMessage');
  hideMessage(messageEl);

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showMessage(messageEl, 'Please fill in all fields.', false);
    return;
  }

  try {
    const response = await fetch('/api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok && data.success) {
      // Save user info and token in localStorage or sessionStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    } else {
      showMessage(messageEl, data.message || 'Login failed.', false);
    }
  } catch (error) {
    showMessage(messageEl, 'Error connecting to server.', false);
  }
}

// Load user avatar on dashboard
async function loadAvatar() {
  const avatarImg = document.getElementById('avatarImage');
  if (!avatarImg) return;

  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.avatar) {
    avatarImg.src = 'default-avatar.png';
    return;
  }

  // Append timestamp to avoid caching
  avatarImg.src = user.avatar + '?t=' + new Date().getTime();
}

// Profile form submission handler (email change and avatar upload)
async function handleProfileUpdate(event) {
  event.preventDefault();
  const messageEl = document.getElementById('profileMessage');
  hideMessage(messageEl);

  const email = document.getElementById('profileEmail').value.trim();
  const avatarFile = document.getElementById('profileAvatar').files[0];
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!email) {
    showMessage(messageEl, 'Email cannot be empty.', false);
    return;
  }

  try {
    // Change email
    const emailResponse = await fetch('/api/change_email.php', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ email })
    });
    const emailData = await emailResponse.json();
    if (!emailResponse.ok || !emailData.success) {
      showMessage(messageEl, emailData.message || 'Failed to change email.', false);
      return;
    }

    // Upload avatar if file selected
    if (avatarFile) {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const avatarResponse = await fetch('/api/upload_avatar.php', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        body: formData
      });
      const avatarData = await avatarResponse.json();
      if (!avatarResponse.ok || !avatarData.success) {
        showMessage(messageEl, avatarData.message || 'Failed to upload avatar.', false);
        return;
      }
      // Update user avatar URL
      user.avatar = avatarData.avatarUrl;
      localStorage.setItem('user', JSON.stringify(user));
    }

    showMessage(messageEl, 'Profile updated successfully.', true);
    // Reload avatar image
    loadAvatar();
  } catch (error) {
    showMessage(messageEl, 'Error connecting to server.', false);
  }
}

// Password change form submission handler
async function handleChangePassword(event) {
  event.preventDefault();
  const messageEl = document.getElementById('passwordMessage');
  hideMessage(messageEl);

  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const token = localStorage.getItem('token');

  if (!oldPassword || !newPassword || !confirmPassword) {
    showMessage(messageEl, 'Please fill in all fields.', false);
    return;
  }

  if (newPassword !== confirmPassword) {
    showMessage(messageEl, 'New passwords do not match.', false);
    return;
  }

  try {
    const response = await fetch('/api/change_password.php', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await response.json();
    if (response.ok && data.success) {
      showMessage(messageEl, 'Password changed successfully.', true);
      event.target.reset();
    } else {
      showMessage(messageEl, data.message || 'Failed to change password.', false);
    }
  } catch (error) {
    showMessage(messageEl, 'Error connecting to server.', false);
  }
}

// Logout function
function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// On page load, attach event listeners based on page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
  }
  if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
  }
  if (document.getElementById('profileForm')) {
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    loadAvatar();
  }
  if (document.getElementById('passwordForm')) {
    document.getElementById('passwordForm').addEventListener('submit', handleChangePassword);
  }
  if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }
  if (document.getElementById('avatarImage')) {
    loadAvatar();
  }
});
