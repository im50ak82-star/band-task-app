import { initializeApp } from "firebase/app";

import {
 getFirestore,
} from "firebase/firestore";

import {
 getAuth,
} from "firebase/auth";

const firebaseConfig = {
 apiKey: "AIzaSyBrDKn38T-0fFSpds5PSY7BSV0JxJa5h0M",
 authDomain: "fpwe-tasks.firebaseapp.com",
 projectId: "fpwe-tasks",
 storageBucket: "fpwe-tasks.firebasestorage.app",
 messagingSenderId: "959333591854",
 appId: "1:959333591854:web:f35c049f9d2fcd620328bf",
 measurementId: "G-KSMJSGLG37"
};

const app =
 initializeApp(firebaseConfig);

export const db =
 getFirestore(app);

export const auth =
 getAuth(app);