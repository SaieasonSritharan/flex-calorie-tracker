import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHdIq35TBAC7aIysUe9N8oAuOchmNYg1I",
  authDomain: "flexcalorietracker.firebaseapp.com",
  projectId: "flexcalorietracker",
  storageBucket: "flexcalorietracker.firebasestorage.app",
  messagingSenderId: "266729713472",
  appId: "1:266729713472:android:5eb0a64977f4891e1dd4a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;