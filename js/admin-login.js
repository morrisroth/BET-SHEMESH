// Admin Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    
    // Simple demo credentials (in real app, this would be server-side)
    const DEMO_CREDENTIALS = {
        username: 'admin',
        password: 'beitshemeshtech2023'
    };
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Clear previous errors
            hideError();
            
            // Validate inputs
            if (!validateInputs(username, password)) {
                return;
            }
            
            // Show loading state
            showLoading();
            
            // Simulate API call
            setTimeout(() => {
                if (authenticate(username, password)) {
                    // Store login state
                    localStorage.setItem('adminLoggedIn', 'true');
                    localStorage.setItem('loginTime', new Date().toISOString());
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    showError('שם משתמש או סיסמה שגויים. נסו שוב.');
                }
                hideLoading();
            }, 1000);
        });
    }
    
    // Check if already logged in
    checkLoginStatus();
    
    // Add input event listeners for real-time validation
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            clearFieldError(this);
            hideError();
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            clearFieldError(this);
            hideError();
        });
    }
    
    // Remember me functionality
    const rememberCheckbox = document.getElementById('remember');
    if (rememberCheckbox) {
        // Load remembered username if exists
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            usernameInput.value = rememberedUsername;
            rememberCheckbox.checked = true;
        }
        
        rememberCheckbox.addEventListener('change', function() {
            if (this.checked) {
                localStorage.setItem('rememberedUsername', usernameInput.value);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
        });
    }
    
    // Forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPasswordDialog();
        });
    }
});

function validateInputs(username, password) {
    let isValid = true;
    
    if (!username || username.trim() === '') {
        showFieldError(document.getElementById('username'), 'שדה שם משתמש הוא חובה');
        isValid = false;
    } else if (username.length < 3) {
        showFieldError(document.getElementById('username'), 'שם משתמש חייב להכיל לפחות 3 תווים');
        isValid = false;
    }
    
    if (!password || password.trim() === '') {
        showFieldError(document.getElementById('password'), 'שדה סיסמה הוא חובה');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError(document.getElementById('password'), 'סיסמה חייבת להכיל לפחות 6 תווים');
        isValid = false;
    }
    
    return isValid;
}

function authenticate(username, password) {
    // In a real application, this would be an API call to the server
    // For demo purposes, we'll use simple credential checking
    return username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password;
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.classList.add('shake');
        
        // Remove shake animation after it completes
        setTimeout(() => {
            errorMessage.classList.remove('shake');
        }, 500);
    }
}

function hideError() {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }
}

function showFieldError(input, message) {
    const formGroup = input.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('error');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
}

function clearFieldError(input) {
    const formGroup = input.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}

function showLoading() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מתחבר...';
    }
}

function hideLoading() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'התחבר';
    }
}

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginTime = localStorage.getItem('loginTime');
    
    if (isLoggedIn === 'true' && loginTime) {
        // Check if session is still valid (24 hours)
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            // Redirect to dashboard if already logged in
            window.location.href = 'dashboard.html';
        } else {
            // Clear expired session
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('loginTime');
        }
    }
}

function showForgotPasswordDialog() {
    // Create modal for forgot password
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>שחזור סיסמה</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>הזינו את כתובת הדוא"ל שלכם ונשלח לכם הוראות לשחזור הסיסמה.</p>
                <form id="forgotPasswordForm">
                    <div class="form-group">
                        <label for="resetEmail">דוא"ל</label>
                        <input type="email" id="resetEmail" name="resetEmail" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary modal-cancel">ביטול</button>
                        <button type="submit" class="btn btn-primary">שלח הוראות</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Handle modal close
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');
    
    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Handle form submission
    const forgotForm = modal.querySelector('#forgotPasswordForm');
    forgotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        
        // Simulate sending reset email
        const submitBtn = forgotForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שולח...';
        
        setTimeout(() => {
            alert('הוראות לשחזור סיסמה נשלחו לכתובת הדוא"ל שלכם');
            closeModal();
        }, 1500);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Add CSS for modal and animations
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        align-items: center;
        justify-content: center;
    }
    
    .modal.active {
        display: flex;
    }
    
    .modal-content {
        background-color: white;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.9);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .modal.active .modal-content {
        transform: scale(1);
        opacity: 1;
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #1a1a1a;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        transition: color 0.3s ease;
    }
    
    .modal-close:hover {
        color: #333;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-body p {
        margin-bottom: 20px;
        color: #666;
    }
    
    .shake {
        animation: shake 0.5s;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .form-group.error input {
        border-color: #dc3545;
    }
    
    .form-group .error-message {
        color: #dc3545;
        font-size: 0.85rem;
        margin-top: 5px;
        display: none;
    }
    
    .form-group.error .error-message {
        display: block;
    }
`;
document.head.appendChild(modalStyles);