document.getElementById('resetBtn').addEventListener('click', resetPassword);

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function resetPassword() {
    const newPassword = document.getElementById('newPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    
    if (!newPassword || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    // Get verified email from session
    const email = sessionStorage.getItem('verifiedEmail');
    
    if (!email) {
        showMessage('Session expired. Please start the reset process again', 'error');
        setTimeout(() => {
            window.location.href = 'forgot-password.html';
        }, 2000);
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('wfh_users') || '{}');
    
    if (!users[email]) {
        showMessage('User not found', 'error');
        return;
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    users[email].password = hashedPassword;
    localStorage.setItem('wfh_users', JSON.stringify(users));
    
    // Clear session
    sessionStorage.removeItem('verifiedEmail');
    
    showMessage('Password reset successful! Redirecting to login...', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Check if user has verified email
window.addEventListener('load', () => {
    const verifiedEmail = sessionStorage.getItem('verifiedEmail');
    if (!verifiedEmail) {
        window.location.href = 'forgot-password.html';
    }
});
