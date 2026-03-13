import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0jav3haxtGN2-_Fft5hadA5PoBHermxw",
  authDomain: "legiontracker-df41c.firebaseapp.com",
  projectId: "legiontracker-df41c",
  storageBucket: "legiontracker-df41c.firebasestorage.app",
  messagingSenderId: "345035004111",
  appId: "1:345035004111:web:5bda8bdeccc39b590fbfba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, db, storage };