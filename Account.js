document.addEventListener('DOMContentLoaded', main);

function main() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const loginBtn = document.querySelector('.log-in-btn');
    const signUpBtn = document.querySelector('.sign-up-btn');

    // Migrate legacy single-account data into `accounts` map if present
    function loadAccounts() {
        try {
            return JSON.parse(localStorage.getItem('accounts') || '{}');
        } catch (err) {
            return {};
        }
    }

    function saveAccounts(obj) {
        localStorage.setItem('accounts', JSON.stringify(obj));
    }

    const legacyEmail = localStorage.getItem('savedEmail');
    const legacyPass = localStorage.getItem('savedPassword');
    const accountsBefore = loadAccounts();
    if (legacyEmail && legacyPass) {
        const key = legacyEmail.trim().toLowerCase();
        if (!accountsBefore[key]) {
            accountsBefore[key] = legacyPass;
            saveAccounts(accountsBefore);
            // keep savedEmail as session marker
        }
    }

    // Redirect if logged in na
    const savedEmail = localStorage.getItem('savedEmail');
    const params = new URLSearchParams(window.location.search);
    const fromPlanner = params.get('from') === 'planner';
    if (savedEmail && !fromPlanner) {
        window.location.href = 'index.html';
        return;
    }

    if (loginBtn) loginBtn.addEventListener('click', handleAuth('login', emailInput, passwordInput));
    if (signUpBtn) signUpBtn.addEventListener('click', handleAuth('signup', emailInput, passwordInput));
    if (togglePassword && passwordInput) togglePassword.addEventListener('click', togglePasswordVisibility(passwordInput, togglePassword));

    if (loginForm) loginForm.addEventListener('submit', (e) => e.preventDefault());
}

function handleAuth(mode, emailEl, passEl) {
    return function (e) {
        e.preventDefault();
        const email = emailEl ? emailEl.value.trim() : '';
        const password = passEl ? passEl.value.trim() : '';

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }
        // Use an `accounts` map in localStorage to support multiple accounts and prevent duplicates.
        // Structure: { "email_lower": "password" }
        function loadAccounts() {
            try {
                return JSON.parse(localStorage.getItem('accounts') || '{}');
            } catch (err) {
                return {};
            }
        }

        function saveAccounts(obj) {
            localStorage.setItem('accounts', JSON.stringify(obj));
        }

        const accounts = loadAccounts();
        const emailNorm = email.toLowerCase();

        if (mode === 'signup') {
            // If an account with this email already exists (case-insensitive), require login instead
            if (accounts[emailNorm]) {
                alert('An account with this email already exists. Please log in instead.');
                return;
            }

            // create the account
            accounts[emailNorm] = password;
            saveAccounts(accounts);
            // set current session
            localStorage.setItem('savedEmail', email);
            localStorage.setItem('savedPassword', password);
            alert('Sign up successful!');
            window.location.href = 'index.html';
            return;
        }

        if (mode === 'login') {
            // Validate account exists and password matches
            if (!accounts[emailNorm]) {
                alert('No account found for this email. Please sign up first.');
                return;
            }

            if (accounts[emailNorm] !== password) {
                alert('Incorrect password. Please try again.');
                return;
            }

            // success: set current session and proceed
            localStorage.setItem('savedEmail', email);
            localStorage.setItem('savedPassword', password);
            alert('Login successful!');
            window.location.href = 'index.html';
        }
    };
}

function togglePasswordVisibility(passwordInput, toggleEl) {
    return () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        toggleEl.textContent = isPassword ? '🙈' : '👁️';
    };
}