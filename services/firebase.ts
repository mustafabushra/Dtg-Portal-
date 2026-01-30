import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ملاحظة هامة: هذه القيم تجريبية. لاستخدام النظام بشكل فعلي، يرجى استبدالها ببيانات مشروعك من Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyAs-DEMO-KEY-REPLACE-ME",
  authDomain: "cafe-pro-cloud.firebaseapp.com",
  projectId: "cafe-pro-cloud",
  storageBucket: "cafe-pro-cloud.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// تهيئة التطبيق بنمط Singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// تصدير الخدمات
export const auth = getAuth(app);
export const db = getFirestore(app);