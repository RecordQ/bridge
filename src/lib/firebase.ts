// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import dotenv from 'dotenv';

dotenv.config();

// Your web app's Firebase configuration
// These variables are loaded from the .env file.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCOWOZC4BKfWjVVPFxX5cqFYInhhXhbcu8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bridge-ltd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bridge-ltd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bridge-ltd.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "525706590713",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:525706590713:web:587d397ee02519ddaa2528"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);


const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
