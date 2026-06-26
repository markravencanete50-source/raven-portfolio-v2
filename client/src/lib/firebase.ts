import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQUSHtop2AWmQ8RbKk_dyBhftzzLy529U",
  authDomain: "markportfolio.firebaseapp.com",
  projectId: "markportfolio",
  storageBucket: "markportfolio.firebasestorage.app",
  messagingSenderId: "317154628976",
  appId: "1:317154628976:web:51cbc7c9aa7b0b32e02bb5",
  measurementId: "G-5L6WTLDEN9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface ContactSubmission {
  name: string;
  email: string;
  service: string;
  message: string;
}

export async function submitContactForm(data: ContactSubmission): Promise<void> {
  await addDoc(collection(db, "contact_submissions"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
