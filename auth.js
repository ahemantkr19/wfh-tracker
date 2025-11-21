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

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('wfh_users', JSON.stringify(users));
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const currentSession = sessionStorage.getItem('wfh_session');
    if (currentSession) {
        window.location.href = 'index.html';
        return;
    }
    
    // Form switching
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });
    
    // Login
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Register
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('registerConfirmPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
});

async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showMessage('Please enter username and password', 'error');
        return;
    }
    
    const users = getUsers();
    const user = users[username];
    
    if (!user) {
        showMessage('Invalid username or password', 'error');
        return;
    }
    
    const hashedPassword = await hashPassword(password);
    
    if (user.password !== hashedPassword) {
        showMessage('Invalid username or password', 'error');
        return;
    }
    
    // Create session
    const session = {
        username: username,
        fullName: user.fullName,
        loginTime: new Date().toISOString()
    };
    
    sessionStorage.setItem('wfh_session', JSON.stringify(session));
    showMessage('Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

async function handleRegister() {
    const username = document.getElementById('registerUsername').value.trim();
    const fullName = document.getElementById('registerFullName').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validation
    if (!username || !fullName || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (username.length < 3) {
        showMessage('Username must be at least 3 characters', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    const users = getUsers();
    
    if (users[username]) {
        showMessage('Username already exists', 'error');
        return;
    }
    
    // Hash password and save user
    const hashedPassword = await hashPassword(password);
    users[username] = {
        fullName: fullName,
        password: hashedPassword,
        registeredAt: new Date().toISOString()
    };
    
    saveUsers(users);
    showMessage('Registration successful! Please login.', 'success');
    
    // Clear form and switch to login
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerFullName').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';
    
    setTimeout(() => {
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('loginUsername').value = username;
    }, 1500);
}
