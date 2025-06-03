import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB9GdTcVp-paI3XuehsJft1qMJnH21nJx8",
  authDomain: "book-f01fa.firebaseapp.com",
  projectId: "book-f01fa",
  storageBucket: "book-f01fa.firebasestorage.app",
  messagingSenderId: "133307978956",
  appId: "1:133307978956:web:9995aaac826d2822af5e69",
  measurementId: "G-22GR5GBFND"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };