import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  signOut
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
const emailSignInBtn = document.getElementById('emailSignInBtn');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const loginError = document.getElementById('loginError');
const balanceDisplay = document.getElementById('balanceDisplay');
const forgotPasswordLink = document.getElementById('forgotPassword');

// Helper to show error
const showError = (msg) => {
  loginError.textContent = msg;
  loginError.classList.add('show');
};
const clearError = () => {
  loginError.textContent = '';
  loginError.classList.remove('show');
};

// ---------- Auth state listener ----------
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User logged in → switch to dashboard
    loginView.classList.remove('active');
    dashboardView.classList.add('active');
    // Start mining counter (if not already running)
    startMiningCounter();
  } else {
    // No user → show login
    dashboardView.classList.remove('active');
    loginView.classList.add('active');
    clearError();
  }
});

// ---------- Email/Password login with auto-create ----------
async function handleEmailLogin(email, password) {
  if (!email || !password) {
    showError('Email and password are required.');
    return;
  }
  clearError();

  try {
    // Try to sign in
    await signInWithEmailAndPassword(auth, email, password);
  } catch (signInErr) {
    // If user not found or invalid credential, attempt to create account
    if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        // creation successful → user is now signed in (onAuthStateChanged will update UI)
      } catch (createErr) {
        // Handle creation errors
        if (createErr.code === 'auth/weak-password') {
          showError('Password must be at least 6 characters.');
        } else if (createErr.code === 'auth/invalid-email') {
          showError('Invalid email address.');
        } else if (createErr.code === 'auth/email-already-in-use') {
          showError('Email already in use. Please try signing in.');
        } else {
          showError(createErr.message);
        }
      }
    } else {
      // Other sign-in errors
      if (signInErr.code === 'auth/wrong-password') {
        showError('Wrong password.');
      } else if (signInErr.code === 'auth/too-many-requests') {
        showError('Too many attempts. Try later.');
      } else {
        showError(signInErr.message);
      }
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

// ---------- Logout (optional, not directly used but can be added) ----------
// (We don't have a logout button in the design, but you can add one later)

// Event listeners
emailSignInBtn.addEventListener('click', (e) => {
  e.preventDefault();
  handleEmailLogin(usernameInput.value.trim(), passwordInput.value);
});

googleSignInBtn.addEventListener('click', (e) => {
  e.preventDefault();
  handleGoogleSignIn();
});

// Enter key on inputs
[usernameInput, passwordInput].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') emailSignInBtn.click();
  });
});

forgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  alert('Password reset can be implemented with sendPasswordResetEmail().');
});

// ---------- Mining counter (only runs when dashboard is active) ----------
let miningInterval = null;

function startMiningCounter() {
  if (miningInterval) return; // already running
  let balance = 0.0;
  const INCREMENT = 0.00000005;

  function updateBalance() {
    balance += INCREMENT;
    balanceDisplay.textContent = balance.toFixed(8);
  }

  // Update immediately and then every second
  updateBalance();
  miningInterval = setInterval(updateBalance, 1000);
}

// Stop counter when user logs out (optional, but good practice)
onAuthStateChanged(auth, (user) => {
  if (!user && miningInterval) {
    clearInterval(miningInterval);
    miningInterval = null;
  }
});
