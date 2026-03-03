import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyQziVzc3l5VQvVqUAjLJsPl9cZHcZXJE",
  authDomain: "crypto-exchange-iqd-d82b8.firebaseapp.com",
  projectId: "crypto-exchange-iqd-d82b8",
  storageBucket: "crypto-exchange-iqd-d82b8.firebasestorage.app",
  messagingSenderId: "447767305947",
  appId: "1:447767305947:web:25a31bbb8e0d477405b6fe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const confirmPasswordInput = document.getElementById('confirmPassword');
const emailSignInBtn = document.getElementById('emailSignInBtn');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const loginError = document.getElementById('loginError');
const balanceDisplay = document.getElementById('balanceDisplay');
const forgotPasswordLink = document.getElementById('forgotPassword');
const signInTab = document.getElementById('signInTab');
const signUpTab = document.getElementById('signUpTab');

// State for sign in / sign up mode
let isSignUpMode = false;

// Helper to show error
const showError = (msg) => {
  loginError.textContent = msg;
  loginError.classList.add('show');
};
const clearError = () => {
  loginError.textContent = '';
  loginError.classList.remove('show');
};

// Toggle between Sign In and Sign Up tabs
signInTab.addEventListener('click', () => {
  signInTab.classList.add('active');
  signInTab.classList.remove('inactive');
  signUpTab.classList.add('inactive');
  signUpTab.classList.remove('active');
  emailSignInBtn.textContent = 'SIGN IN';
  confirmPasswordGroup.style.display = 'none';
  isSignUpMode = false;
  clearError();
});

signUpTab.addEventListener('click', () => {
  signUpTab.classList.add('active');
  signUpTab.classList.remove('inactive');
  signInTab.classList.add('inactive');
  signInTab.classList.remove('active');
  emailSignInBtn.textContent = 'SIGN UP';
  confirmPasswordGroup.style.display = 'block';
  isSignUpMode = true;
  clearError();
});

// ---------- Email/Password login / sign up ----------
async function handleEmailAuth(email, password, confirmPassword) {
  if (!email || !password) {
    showError('Email and password are required.');
    return false;
  }

  if (isSignUpMode) {
    // Sign up: validate password match
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return false;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters.');
      return false;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        showError('Email already in use. Please sign in.');
      } else if (err.code === 'auth/invalid-email') {
        showError('Invalid email address.');
      } else {
        showError(err.message);
      }
      return false;
    }
  } else {
    // Sign in
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Optionally auto-create (as before) but we want explicit sign up now.
        // We'll keep auto-create for simplicity or show error.
        // Let's show error prompting to sign up.
        showError('Account not found. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        showError('Wrong password.');
      } else if (err.code === 'auth/too-many-requests') {
        showError('Too many attempts. Try later.');
      } else {
        showError(err.message);
      }
      return false;
    }
  }
}

// ---------- Google Sign-In ----------
async function handleGoogleSignIn() {
  clearError();
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') {
      showError('Popup closed. Try again.');
    } else {
      showError(err.message);
    }
  }
}

// ---------- Forgot Password ----------
async function handleForgotPassword() {
  const email = prompt('Enter your email address to reset your password:');
  if (!email) return;
  try {
    await sendPasswordResetEmail(auth, email);
    alert('Password reset email sent! Check your inbox.');
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      alert('No account found with this email.');
    } else {
      alert('Error: ' + err.message);
    }
  }
}

// Event listeners
emailSignInBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  clearError();
  const email = usernameInput.value.trim();
  const password = passwordInput.value;
  const confirm = confirmPasswordInput ? confirmPasswordInput.value : '';
  const success = await handleEmailAuth(email, password, confirm);
  if (success) {
    // Auth state listener will switch view
  }
});

googleSignInBtn.addEventListener('click', (e) => {
  e.preventDefault();
  handleGoogleSignIn();
});

forgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  handleForgotPassword();
});

// Enter key on inputs
[usernameInput, passwordInput, confirmPasswordInput].forEach(input => {
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') emailSignInBtn.click();
    });
  }
});

// ---------- Auth state listener ----------
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginView.classList.remove('active');
    dashboardView.classList.add('active');
    startMiningCounter();
  } else {
    dashboardView.classList.remove('active');
    loginView.classList.add('active');
    clearError();
  }
});

// ---------- Bottom Navigation ----------
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    // Remove active from all
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    // If clicked item is not Home (index 0), show coming soon message
    if (index !== 0) {
      alert('This feature is coming soon!');
    }
  });
});

// ---------- Stats Cards Click ----------
const statCards = document.querySelectorAll('.stat-card');
statCards.forEach(card => {
  card.addEventListener('click', () => {
    alert(`Action triggered: ${card.querySelector('.stat-label').textContent}`);
  });
});

// ---------- Mining counter ----------
let miningInterval = null;

function startMiningCounter() {
  if (miningInterval) return;
  let balance = 0.0;
  const INCREMENT = 0.00000005;

  function updateBalance() {
    balance += INCREMENT;
    balanceDisplay.textContent = balance.toFixed(8);
  }

  updateBalance();
  miningInterval = setInterval(updateBalance, 1000);
}

// Stop counter on logout
onAuthStateChanged(auth, (user) => {
  if (!user && miningInterval) {
    clearInterval(miningInterval);
    miningInterval = null;
  }
});
