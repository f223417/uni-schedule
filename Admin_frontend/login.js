// Optimized Login System JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-form');
    
    // Get navigation links
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const forgotLink = document.getElementById('forgot-link');
    const backToLogin = document.getElementById('back-to-login');
    
    // Get message elements
    const loginMessage = document.getElementById('login-message');
    const signupMessage = document.getElementById('signup-message');
    const forgotMessage = document.getElementById('forgot-message');
    
    // Get password toggle buttons
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    // Form navigation functions
    function showForm(form) {
        // Hide all forms
        document.querySelectorAll('.form').forEach(f => {
            f.classList.remove('active');
        });
        
        // Show selected form
        form.classList.add('active');
    }
    
    // Add event listeners for form navigation
    showSignup.addEventListener('click', function(e) {
        e.preventDefault();
        showForm(signupForm);
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showForm(loginForm);
    });
    
    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        showForm(forgotForm);
    });
    
    backToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showForm(loginForm);
    });
    
    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const inputField = this.previousElementSibling;
            if (inputField.type === 'password') {
                inputField.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                inputField.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });
    
    // Login form submission
    loginForm.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const remember = document.getElementById('remember').checked;
        
        // Input validation
        if (!username || !password) {
            showMessage(loginMessage, 'Please enter both username and password', 'error');
            return;
        }
        
        // Check credentials against stored admin accounts
        const admins = JSON.parse(localStorage.getItem('admins')) || [];
        const admin = admins.find(admin => admin.username === username && admin.password === password);
        
        if (!admin) {
            showMessage(loginMessage, 'Invalid username or password', 'error');
            return;
        }
        
        // Set session
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUsername', username);
        
        // Set persistent login if remember me is checked
        if (remember) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
        }
        
        showMessage(loginMessage, 'Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
    });
    
    // Signup form submission
    signupForm.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validation
        if (!username || !email || !password || !confirmPassword) {
            showMessage(signupMessage, 'Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage(signupMessage, 'Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage(signupMessage, 'Password must be at least 6 characters', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage(signupMessage, 'Please enter a valid email address', 'error');
            return;
        }
        
        // Check if username already exists
        const admins = JSON.parse(localStorage.getItem('admins')) || [];
        if (admins.some(admin => admin.username === username)) {
            showMessage(signupMessage, 'Username already exists', 'error');
            return;
        }
        
        // Check if email already exists
        if (admins.some(admin => admin.email === email)) {
            showMessage(signupMessage, 'Email already exists', 'error');
            return;
        }
        
        // Create new admin account
        const newAdmin = {
            username,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        admins.push(newAdmin);
        localStorage.setItem('admins', JSON.stringify(admins));
        
        showMessage(signupMessage, 'Account created successfully!', 'success');
        setTimeout(() => {
            showForm(loginForm);
            document.getElementById('login-username').value = username;
        }, 1500);
    });
    
    // Forgot password form submission
    forgotForm.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value;
        
        if (!email) {
            showMessage(forgotMessage, 'Please enter your email address', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage(forgotMessage, 'Please enter a valid email address', 'error');
            return;
        }
        
        // Check if email exists
        const admins = JSON.parse(localStorage.getItem('admins')) || [];
        const admin = admins.find(admin => admin.email === email);
        
        if (!admin) {
            showMessage(forgotMessage, 'No account found with this email', 'error');
            return;
        }
        
        // Generate a temporary password
        const tempPassword = generateTempPassword();
        
        // Update the admin's password
        admin.password = tempPassword;
        localStorage.setItem('admins', JSON.stringify(admins));
        
        showMessage(forgotMessage, `Password reset! Your temporary password is: ${tempPassword}`, 'success');
    });
    
    // Helper function to show messages
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'message ' + type;
        
        // Hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                element.className = 'message';
                element.textContent = '';
            }, 5000);
        }
    }
    
    // Helper function to validate email
    function isValidEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }
    
    // Helper function to generate temporary password
    function generateTempPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Check if user is already logged in
    function checkLoggedIn() {
        if (sessionStorage.getItem('adminLoggedIn') === 'true' || 
            localStorage.getItem('adminLoggedIn') === 'true') {
            window.location.href = 'admin.html';
        }
    }
    
    // Run on page load
    checkLoggedIn();
});