import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDyQziVzc3l5VQvVqUAjLJsPl9cZHcZXJE",
    authDomain: "crypto-exchange-iqd-d82b8.firebaseapp.com",
    projectId: "crypto-exchange-iqd-d82b8",
    storageBucket: "crypto-exchange-iqd-d82b8.firebasestorage.app",
    messagingSenderId: "447767305947",
    appId: "1:447767305947:web:25a31bbb8e0d477405b6fe"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let currentMode = 'login';

// گۆڕینی تاتەکان
window.switchTab = (mode) => {
    currentMode = mode;
    document.getElementById('tab-login').classList.toggle('active', mode === 'login');
    document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
    document.getElementById('main-btn').innerText = mode === 'login' ? 'SIGN IN' : 'SIGN UP';
};

// فەنکشنی لۆگین و ساین ئەپی پێکەوەیی
window.handleAuth = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    try {
        if (currentMode === 'login') {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            await createUserWithEmailAndPassword(auth, email, pass);
        }
    } catch (error) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            // ئەگەر ئەکاونتی نەبوو، یەکسەر بۆی دروست دەکات
            await createUserWithEmailAndPassword(auth, email, pass);
        } else { alert(error.message); }
    }
};

window.googleLogin = () => signInWithPopup(auth, provider);
window.logout = () => signOut(auth);
window.forgotPassword = () => {
    const email = document.getElementById('email').value;
    if(email) { sendPasswordResetEmail(auth, email).then(() => alert("لینکی گۆڕینی پاسۆرد نێردرا!")); }
    else { alert("سەرەتا ئیمەیڵەکەت بنووسە"); }
};

// گۆڕینی لاپەڕەکان بەپێی دۆخی بەکارهێنەر
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('dashboard-container').classList.remove('hidden');
        startMining();
    } else {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('dashboard-container').classList.add('hidden');
    }
});

function startMining() {
    let balance = 0.00000000;
    setInterval(() => {
        balance += 0.00000005;
        document.getElementById('btc-balance').innerText = balance.toFixed(8);
    }, 1000);
}
