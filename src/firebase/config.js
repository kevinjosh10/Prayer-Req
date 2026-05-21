import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCYD1cQ9tsMGRwIepk38mbEs_g2yGh9874",
  authDomain: "prayer-req-1f814.firebaseapp.com",
  projectId: "prayer-req-1f814",
  storageBucket: "prayer-req-1f814.firebasestorage.app",
  messagingSenderId: "914694935058",
  appId: "1:914694935058:web:1a164d5acb48850ab1fecb",
  measurementId: "G-RTYTBXDNSR",
  databaseURL: "https://prayer-req-1f814-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);
