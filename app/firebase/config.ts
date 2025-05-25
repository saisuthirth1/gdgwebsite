import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Add Firestore
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBdE1NAe8Fe-lLWun7A0p3IPQliyVV8YoI",
  authDomain: "voting-system-login-f7036.firebaseapp.com",
  projectId: "voting-system-login-f7036",
  storageBucket: "voting-system-login-f7036.firebasestorage.app",
  messagingSenderId: "872551144562",
  appId: "1:872551144562:web:0c3e3552cf70104c23f6eb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 
export const storage = getStorage(app);// Export Firestore instance