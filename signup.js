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

// Initialize signup page
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const currentSession = sessionStorage.getItem('wfh_session');
    if (currentSession) {
        window.location.href = 'index.html';
        return;
    }
    
    // Signup button handler
    document.getElementById('signupBtn').addEventListener('click', handleSignup);
    
    // Enter key handlers
    document.getElementById('confirmPasswordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup();
    });
});

async function handleSignup() {
    const fullName = document.getElementById('fullNameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim().toLowerCase();
    const password = document.getElementById('passwordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (fullName.length < 2) {
        showMessage('Please enter your full name', 'error');
        return;
    }
    
    // Validate email format
    if (!email.includes('@') || !email.includes('.')) {
        showMessage('Please enter a valid organization email', 'error');
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
    
    if (users[email]) {
        showMessage('Email already registered', 'error');
        return;
    }
    
    // Hash password and save user
    const hashedPassword = await hashPassword(password);
    users[email] = {
        fullName: fullName,
        password: hashedPassword,
        registeredAt: new Date().toISOString()
    };
    
    saveUsers(users);
    showMessage('Registration successful! Redirecting to login...', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}
