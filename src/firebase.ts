import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC_jMXyYd5DX4kVw4NQcwRhlg77iVAQVRg",
    authDomain: "pantrypulse-ef7e9.firebaseapp.com",
    projectId: "pantrypulse-ef7e9",
    storageBucket: "pantrypulse-ef7e9.appspot.com",
    messagingSenderId: "543508240578",
    appId: "1:543508240578:web:f04fa2351e3e45c621035b",
    measurementId: "G-Q3JPPW5DWC"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let analytics;
(async () => {
  if (typeof window !== "undefined") {
    const isFirebaseAnalyticsSupported = await isSupported();
    if (isFirebaseAnalyticsSupported) {
      analytics = getAnalytics(app);
    }
  }
})();

export const auth = getAuth(app);
export { analytics, db };