// ── auth.js — Firebase Phone OTP authentication ──────────────
import { auth }                  from './firebase-config.js';
import { RecaptchaVerifier,
         signInWithPhoneNumber,
         PhoneAuthProvider,
         signInWithCredential }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { db }                    from './firebase-config.js';
import { doc, getDoc, setDoc }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { saveUser }              from './app.js';

let confirmationResult = null;

// ── Init invisible reCAPTCHA ──────────────────────────────────
export function initRecaptcha() {
  if (window.recaptchaVerifier) return;
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: () => {},
  });
}

// ── Send OTP ──────────────────────────────────────────────────
export async function sendOTP(phone) {
  initRecaptcha();
  const fullPhone = '+91' + phone;
  confirmationResult = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier);
  return confirmationResult;
}

// ── Verify OTP ────────────────────────────────────────────────
export async function verifyOTP(otp) {
  if (!confirmationResult) throw new Error('No OTP sent');
  const result = await confirmationResult.confirm(otp);
  const user   = result.user;

  // Load profile from Firestore
  const snap = await getDoc(doc(db, 'users', user.uid));
  const profile = snap.exists() ? snap.data() : null;

  const userData = {
    uid:   user.uid,
    phone: user.phoneNumber,
    name:  profile?.name  || '',
    email: profile?.email || '',
  };
  saveUser(userData);
  return { user, profile };
}

// ── Save profile after registration ───────────────────────────
export async function saveProfile(uid, name, email, vehicle) {
  await setDoc(doc(db, 'users', uid), {
    name, email, vehicle,
    phone:     auth.currentUser?.phoneNumber || '',
    createdAt: new Date().toISOString(),
  }, { merge: true });
}
