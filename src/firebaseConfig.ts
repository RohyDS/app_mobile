import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAojADuWjbYDirCnroKStd7IaURQFmiTWA",
  authDomain: "garage-c0a05.firebaseapp.com",
  projectId: "garage-c0a05",
  storageBucket: "garage-c0a05.firebasestorage.app",
  messagingSenderId: "1007908643963",
  appId: "1:1007908643963:web:baa725e900d5d442612ede"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Utilisation de initializeFirestore pour forcer le long polling si nécessaire
// et activer le cache local pour une meilleure réactivité
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true // Force la connexion via HTTP au lieu de WebSockets
});

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
