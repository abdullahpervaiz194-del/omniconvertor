import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  increment,
  type Unsubscribe,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import defaultFirebaseConfig from '../../firebase-applet-config.json';

// Build Firebase configuration prioritizing environment variables (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultFirebaseConfig.measurementId || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || defaultFirebaseConfig.firestoreDatabaseId || '(default)',
};

// Check if a valid API key is present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  typeof firebaseConfig.apiKey === 'string' &&
  firebaseConfig.apiKey.trim() !== '' &&
  !firebaseConfig.apiKey.includes('YOUR_FIREBASE')
);

let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;
let storageInstance: any = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    try {
      setLogLevel('silent');
    } catch {}
    dbInstance = initializeFirestore(
      appInstance,
      {
        experimentalForceLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId
    );
    authInstance = getAuth(appInstance);
    storageInstance = getStorage(appInstance);
  } catch (error) {
    console.warn('[Firebase] Initialization error, running with local/offline fallback mode:', error);
    appInstance = null;
    dbInstance = null;
    authInstance = null;
    storageInstance = null;
  }
} else {
  console.info('[Firebase] Running in offline local mode (VITE_FIREBASE_API_KEY is unconfigured).');
}

// Fallback dummy auth object to prevent null reference errors
const dummyAuth = {
  currentUser: null,
};

export const app = appInstance;
export const db = dbInstance;
export const auth = authInstance || (dummyAuth as any);
export const storage = storageInstance;

// Configure Google Auth Provider safely
let googleProviderInstance: GoogleAuthProvider;
try {
  googleProviderInstance = new GoogleAuthProvider();
  googleProviderInstance.setCustomParameters({
    prompt: 'select_account',
  });
} catch {
  googleProviderInstance = {} as any;
}
export const googleProvider = googleProviderInstance;

// Safe wrapper for onAuthStateChanged that never crashes in unconfigured/offline mode
export const safeOnAuthStateChanged = (
  authObj: any,
  nextOrObserver: any,
  error?: any,
  completed?: any
): Unsubscribe => {
  if (!authInstance) {
    if (typeof nextOrObserver === 'function') {
      setTimeout(() => {
        try {
          nextOrObserver(null);
        } catch (e) {
          console.warn('[Auth] Callback warning in offline mode:', e);
        }
      }, 0);
    }
    return () => {};
  }
  try {
    return onAuthStateChanged(authInstance, nextOrObserver, error, completed);
  } catch (err) {
    console.warn('[Auth] onAuthStateChanged listener fallback:', err);
    if (typeof nextOrObserver === 'function') {
      setTimeout(() => nextOrObserver(null), 0);
    }
    return () => {};
  }
};

// Safe wrapper for signInWithPopup
export const safeSignInWithPopup = async (authObj: any, provider: any) => {
  if (!authInstance) {
    throw new Error('Firebase Auth is not configured. Please add VITE_FIREBASE_API_KEY in your Vercel or environment settings.');
  }
  return signInWithPopup(authInstance, provider);
};

// Safe wrapper for signInWithEmailAndPassword
export const safeSignInWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
  if (!authInstance) {
    const err: any = new Error('Firebase Auth is not configured (auth/operation-not-allowed).');
    err.code = 'auth/operation-not-allowed';
    throw err;
  }
  return signInWithEmailAndPassword(authInstance, email, pass);
};

// Safe wrapper for createUserWithEmailAndPassword
export const safeCreateUserWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
  if (!authInstance) {
    const err: any = new Error('Firebase Auth is not configured (auth/operation-not-allowed).');
    err.code = 'auth/operation-not-allowed';
    throw err;
  }
  return createUserWithEmailAndPassword(authInstance, email, pass);
};

// Safe wrapper for signOut
export const safeSignOut = async (authObj: any) => {
  if (!authInstance) return;
  return signOut(authInstance);
};

// Safe wrapper for sendPasswordResetEmail
export const safeSendPasswordResetEmail = async (authObj: any, email: string) => {
  if (!authInstance) {
    throw new Error('Firebase Auth is not configured.');
  }
  return sendPasswordResetEmail(authInstance, email);
};

// Re-export Auth utilities
export {
  safeOnAuthStateChanged as onAuthStateChanged,
  safeSignInWithPopup as signInWithPopup,
  safeSignInWithEmailAndPassword as signInWithEmailAndPassword,
  safeCreateUserWithEmailAndPassword as createUserWithEmailAndPassword,
  safeSignOut as signOut,
  safeSendPasswordResetEmail as sendPasswordResetEmail,
  updateProfile,
  type User,
};

// Re-export Firestore utilities
export {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  increment,
  type Unsubscribe,
};

// Re-export Storage utilities
export {
  ref,
  uploadBytes,
  getDownloadURL,
};

export default app;
