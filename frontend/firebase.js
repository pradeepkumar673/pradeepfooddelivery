
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";   


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "pradeepfooddelivery.firebaseapp.com",
  projectId: "pradeepfooddelivery",
  storageBucket: "pradeepfooddelivery.firebasestorage.app",
  messagingSenderId: "530038836276",
  appId: "1:530038836276:web:734181ab49f2da9800ce61"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };
