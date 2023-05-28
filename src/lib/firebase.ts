// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhVwwdbW4qsZc0urGiClI_MmGgkHYAAwQ",
  authDomain: "isikol-bstat-2021-services.firebaseapp.com",
  projectId: "isikol-bstat-2021-services",
  storageBucket: "isikol-bstat-2021-services.appspot.com",
  messagingSenderId: "1051899543822",
  appId: "1:1051899543822:web:e4ef0da2843e107bc5575f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider()