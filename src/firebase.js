import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAdgvIvx2Ac4GB6vt7JKExguWU6FHNTzWw",
  authDomain: "therapy-sytem.firebaseapp.com",
  projectId: "therapy-sytem",
  storageBucket: "therapy-sytem.firebasestorage.app",
  messagingSenderId: "50293009493",
  appId: "1:50293009493:web:9d85f1d13feb27562c38dc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;