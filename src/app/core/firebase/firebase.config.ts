import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCHW06lb79yLtL0BAXoeUA-OO5ssMwXCzs",
  authDomain: "samasante-03.firebaseapp.com",
  projectId: "samasante-03",
  storageBucket: "samasante-03.firebasestorage.app",
  messagingSenderId: "195244005016",
  appId: "1:195244005016:web:fa70ee4b6459e49123e2ed",
  measurementId: "G-RW1YHQKQVW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
