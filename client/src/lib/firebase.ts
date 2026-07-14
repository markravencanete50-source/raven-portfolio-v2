import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";

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
export const auth = getAuth(app);

export interface ContactSubmission {
  name: string;
  email: string;
  service: string;
  subject?: string;
  message: string;
}

export async function submitContactForm(data: ContactSubmission): Promise<void> {
  await addDoc(collection(db, "contact_submissions"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export interface StoredSubmission extends ContactSubmission {
  id: string;
  createdAt: Timestamp | null;
}

/** Read all contact submissions for the admin dashboard (newest first). */
export async function fetchSubmissions(): Promise<StoredSubmission[]> {
  const snap = await getDocs(
    query(collection(db, "contact_submissions"), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StoredSubmission, "id">) }));
}

/** Read the `role` for a signed-in user from the `user` collection. */
export async function fetchUserRole(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "user", uid));
  return snap.exists() ? ((snap.data().role as string | undefined) ?? null) : null;
}
