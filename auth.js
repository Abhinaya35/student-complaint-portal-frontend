// Authentication System for Raise & Resolve Portal
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthentication();
});

// Demo credentials (in real app, this would be handled by backend)
const DEMO_CREDENTIALS = {
    student: {
        username: 'student',
        password: 'student123',
        name: 'Abhinaya',
        role: 'student'
    },
    admin: {
        username: 'admin',
        password: 'admin123',
        name: 'Admin',
        role: 'admin'
    }
};

// Initialize authentication system
function initializeAuthentication() {
    const studentForm = document.getElementById('studentLoginForm');
    const adminForm = document.getElementById('adminLoginForm');

    // Student login form handler
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin('student');
        });
    }

    // Admin login form handler
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin('admin');
        });
    }

    // Add enter key support for inputs
    addEnterKeySupport();
    
    // Add input validation
    addInputValidation();
}

// Handle login process
function handleLogin(userType) {
    const username = document.getElementById(`${userType}-username`).value.trim();
    const password = document.getElementById(`${userType}-password`).value;
    const loginBtn = document.getElementById(`${userType}LoginBtn`);

    // Validate inputs
    if (!username || !password) {
        showError('Please fill in all fields.');
        return;
    }

    // Show loading state
    showLoadingState(loginBtn, true);

    // Simulate authentication delay
    setTimeout(() => {
        const isValid = validateCredentials(userType, username, password);
        
        if (isValid) {
            // Store user session
            storeUserSession(userType, username);
            
            // Show success message
            showLoadingText('Login successful! Redirecting...');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                redirectToDashboard(userType);
            }, 1000);
        } else {
            // Show error and reset loading state
            showLoadingState(loginBtn, false);
            showError('Invalid username or password. Please try again.');
        }
    }, 1500);
}

// Validate credentials
function validateCredentials(userType, username, password) {
    const credentials = DEMO_CREDENTIALS[userType];
    
    if (!credentials) {
        return false;
    }
    
    return username === credentials.username && password === credentials.password;
}

// Store user session
function storeUserSession(userType, username) {
    const userData = {
        username: username,
        role: userType,
        name: DEMO_CREDENTIALS[userType].name,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('userSession', JSON.stringify(userData));
}

// Redirect to appropriate dashboard
function redirectToDashboard(userType) {
    if (userType === 'student') {
        window.location.href = 'student_dashboard.html';
    } else if (userType === 'admin') {
        window.location.href = 'admin_dashboard.html';
    }
}

// Show loading state
function showLoadingState(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
        button.disabled = true;
        showLoadingOverlay();
    } else {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        button.disabled = false;
        hideLoadingOverlay();
    }
}

// Show loading overlay
function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Show loading text
function showLoadingText(text) {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

// Show error modal
function showError(message) {
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorModal && errorMessage) {
        errorMessage.textContent = message;
        errorModal.style.display = 'flex';
    }
}

// Close error modal
function closeErrorModal() {
    const errorModal = document.getElementById('errorModal');
    if (errorModal) {
        errorModal.style.display = 'none';
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentElement.querySelector('.password-toggle');
    const icon = toggleBtn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Add enter key support
function addEnterKeySupport() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                // Find the form this input belongs to
                const form = input.closest('form');
                if (form) {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn && !submitBtn.disabled) {
                        submitBtn.click();
                    }
                }
            }
        });
    });
}

// Add input validation
function addInputValidation() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('input', function() {
            validateInput(this);
        });
        
        // Blur validation
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
}

// Validate individual input
function validateInput(input) {
    const value = input.value.trim();
    const inputGroup = input.closest('.input-group');
    
    // Remove existing validation classes
    input.classList.remove('valid', 'invalid');
    if (inputGroup) {
        inputGroup.classList.remove('has-error');
    }
    
    // Check if required field is empty
    if (input.hasAttribute('required') && !value) {
        input.classList.add('invalid');
        if (inputGroup) {
            inputGroup.classList.add('has-error');
        }
        return false;
    }
    
    // Add valid class if field has content
    if (value) {
        input.classList.add('valid');
    }
    
    return true;
}

// Check if user is already logged in
function checkExistingSession() {
    const session = localStorage.getItem('userSession');
    
    if (session) {
        try {
            const userData = JSON.parse(session);
            const currentTime = new Date();
            const loginTime = new Date(userData.loginTime);
            const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
            
            // Session expires after 8 hours
            if (hoursDiff < 8) {
                redirectToDashboard(userData.role);
                return true;
            } else {
                // Clear expired session
                localStorage.removeItem('userSession');
            }
        } catch (error) {
            localStorage.removeItem('userSession');
        }
    }
    
    return false;
}

// Logout function (can be called from dashboards)
function logout() {
    localStorage.removeItem('userSession');
    window.location.href = 'index.html';
}

// Get current user data
function getCurrentUser() {
    const session = localStorage.getItem('userSession');
    if (session) {
        try {
            return JSON.parse(session);
        } catch (error) {
            return null;
        }
    }
    return null;
}

// Auto-fill demo credentials for testing
function autoFillDemo(userType) {
    const credentials = DEMO_CREDENTIALS[userType];
    if (credentials) {
        const usernameInput = document.getElementById(`${userType}-username`);
        const passwordInput = document.getElementById(`${userType}-password`);
        
        if (usernameInput && passwordInput) {
            usernameInput.value = credentials.username;
            passwordInput.value = credentials.password;
            
            // Trigger validation
            validateInput(usernameInput);
            validateInput(passwordInput);
        }
    }
}

// Add demo credential click handlers
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for demo credentials
    const demoCredentialElements = document.querySelectorAll('.demo-credentials code');
    
    demoCredentialElements.forEach(element => {
        element.style.cursor = 'pointer';
        element.title = 'Click to copy';
        
        element.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                // Show temporary feedback
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                this.style.background = '#28a745';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '#e9ecef';
                    this.style.color = '#495057';
                }, 1000);
            });
        });
    });
});

// Add smooth animations
function addSmoothAnimations() {
    // Add fade-in animation to login containers
    const containers = document.querySelectorAll('.login-container');
    
    containers.forEach((container, index) => {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        container.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    addSmoothAnimations();
});

// Add form submission prevention for demo
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Prevent default form submission
            e.preventDefault();
        });
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to submit focused form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('form')) {
            const form = activeElement.closest('form');
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        closeErrorModal();
    }
});

// Add input focus effects
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});

// Export functions for use in other files
window.authSystem = {
    logout,
    getCurrentUser,
    checkExistingSession,
    autoFillDemo
}; 