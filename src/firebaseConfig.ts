import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCziRNSKGXjcTWZU1lcpEkaCwVDMhzq2Ng",
  authDomain: "jeureparationvoiture.firebaseapp.com",
  projectId: "jeureparationvoiture",
  storageBucket: "jeureparationvoiture.firebasestorage.app",
  messagingSenderId: "529993899271",
  appId: "1:529993899271:web:150fbdb73273e564bcf9a2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
