// Email service using EmailJS (free email API)
// You'll need to set up an EmailJS account at https://www.emailjs.com/

let generatedOTP = '';
let userEmail = '';

document.getElementById('sendOtpBtn').addEventListener('click', sendOTP);
document.getElementById('verifyOtpBtn').addEventListener('click', verifyOTP);
document.getElementById('resendOtpBtn').addEventListener('click', sendOTP);

async function sendOTP() {
    const email = document.getElementById('emailInput').value.trim();
    
    if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
    }
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users[email]) {
        showMessage('Email address not found', 'error');
        return;
    }
    
    userEmail = email;
    
    // Generate 6-digit OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with timestamp (valid for 10 minutes)
    const otpData = {
        otp: generatedOTP,
        timestamp: Date.now(),
        email: email
    };
    sessionStorage.setItem('resetOTP', JSON.stringify(otpData));
    
    // In a real application, you would send email via backend API
    // For now, we'll simulate it and show the OTP in console (for testing)
    console.log('OTP for', email, ':', generatedOTP);
    
    // Simulate email sending
    await simulateEmailSend(email, generatedOTP);
    
    // Show OTP section
    document.getElementById('emailSection').style.display = 'none';
    document.getElementById('otpSection').style.display = 'block';
    showMessage('OTP has been sent to your email (Check console for demo)', 'success');
}

async function simulateEmailSend(email, otp) {
    // Simulate API call delay
    return new Promise((resolve) => {
        setTimeout(() => {
            // In production, replace this with actual email API call
            // Example using EmailJS or SendGrid
            console.log(`
═══════════════════════════════════
📧 EMAIL SENT TO: ${email}
═══════════════════════════════════
Subject: Password Reset OTP

Your OTP for password reset is: ${otp}

This OTP is valid for 10 minutes.

Do not share this OTP with anyone.
═══════════════════════════════════
            `);
            resolve();
        }, 1000);
    });
}

function verifyOTP() {
    const enteredOTP = document.getElementById('otpInput').value.trim();
    
    if (!enteredOTP) {
        showMessage('Please enter the OTP', 'error');
        return;
    }
    
    const otpData = JSON.parse(sessionStorage.getItem('resetOTP') || '{}');
    
    // Check if OTP exists
    if (!otpData.otp) {
        showMessage('OTP expired. Please request a new one', 'error');
        return;
    }
    
    // Check if OTP is expired (10 minutes)
    const currentTime = Date.now();
    const otpAge = currentTime - otpData.timestamp;
    const tenMinutes = 10 * 60 * 1000;
    
    if (otpAge > tenMinutes) {
        showMessage('OTP expired. Please request a new one', 'error');
        sessionStorage.removeItem('resetOTP');
        return;
    }
    
    // Verify OTP
    if (enteredOTP === otpData.otp) {
        // Store verified email for reset page
        sessionStorage.setItem('verifiedEmail', userEmail);
        sessionStorage.removeItem('resetOTP');
        showMessage('OTP verified! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'reset-password.html';
        }, 1500);
    } else {
        showMessage('Invalid OTP. Please try again', 'error');
    }
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

// Clear any existing session data on page load
window.addEventListener('load', () => {
    const email = sessionStorage.getItem('resetEmail');
    if (email) {
        document.getElementById('emailInput').value = email;
    }
});
