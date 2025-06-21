// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA9S_ZW3P-elf0ZIvs33hm8hG4ElribSTI",
  authDomain: "vibes-scheduler.firebaseapp.com",
  projectId: "vibes-scheduler",
  storageBucket: "vibes-scheduler.firebasestorage.app",
  messagingSenderId: "369580960376",
  appId: "1:369580960376:web:be85d218f3a22c853f5b8d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
