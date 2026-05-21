import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const reqRef = push(ref(db, 'prayerRequests'));

set(reqRef, {test: true})
  .then(() => {
    console.log('SUCCESS');
    process.exit(0);
  })
  .catch(e => {
    console.error('FIREBASE ERROR:', e.message);
    process.exit(1);
  });

setTimeout(() => {
  console.error('TIMEOUT');
  process.exit(1);
}, 5000);
