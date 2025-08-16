// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// These variables are loaded from the .env file.
const firebaseConfig = {
  apiKey: "AIzaSyCOWOZC4BKfWjVVPFxX5cqFYInhhXhbcu8",
  authDomain: "bridge-ltd.firebaseapp.com",
  projectId: "bridge-ltd",
  storageBucket: "bridge-ltd.appspot.com",
  messagingSenderId: "525706590713",
  appId: "1:525706590713:web:587d397ee02519ddaa2528"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
