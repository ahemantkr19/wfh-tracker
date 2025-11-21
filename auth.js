// Simple password hashing function (using SHA-256)
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Get users from localStorage
function getUsers() {
    const users = localStorage.getItem('wfh_users');
    return users ? JSON.parse(users) : {};
}

// Show message
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message show ${type}`;
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Initialize login page
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const currentSession = sessionStorage.getItem('wfh_session');
    if (currentSession) {
        window.location.href = 'index.html';
        return;
    }
    
    // Login button handler
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    
    // Enter key on password field
    document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Enter key on email field
    document.getElementById('emailInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('passwordInput').focus();
        }
    });
});

async function handleLogin() {
    const email = document.getElementById('emailInput').value.trim().toLowerCase();
    const password = document.getElementById('passwordInput').value;
    
    if (!email || !password) {
        showMessage('Please enter email and password', 'error');
        return;
    }
    
    // Validate email format
    if (!email.includes('@')) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    const users = getUsers();
    const user = users[email];
    
    if (!user) {
        showMessage('Invalid email or password', 'error');
        return;
    }
    
    const hashedPassword = await hashPassword(password);
    
    if (user.password !== hashedPassword) {
        showMessage('Invalid email or password', 'error');
        return;
    }
    
    // Create session
    const session = {
        email: email,
        fullName: user.fullName,
        loginTime: new Date().toISOString()
    };
    
    sessionStorage.setItem('wfh_session', JSON.stringify(session));
    showMessage('Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}
