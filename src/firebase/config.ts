import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaT9mgPIUSFqAVdEiWkVWUuUbtjmT-v1g",
  authDomain: "opportunity-ai-be4b0.firebaseapp.com",
  projectId: "opportunity-ai-be4b0",
  storageBucket: "opportunity-ai-be4b0.firebasestorage.app",
  messagingSenderId: "497102185515",
  appId: "1:497102185515:web:3e476749492a5ca51cf66e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
