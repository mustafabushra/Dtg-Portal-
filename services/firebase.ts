
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// إعدادات مشروع DTG Portal
const config: FirebaseOptions = {
  apiKey: "AIzaSyAqGzm6Tu21DYFiKV7CEobd01DylJKqJG4",
  authDomain: "dtg-portal-56181.firebaseapp.com",
  projectId: "dtg-portal-56181",
  storageBucket: "dtg-portal-56181.firebasestorage.app",
  messagingSenderId: "841782105922",
  appId: "1:841782105922:web:c6b4c8df0f3ed8af5c5adb",
  measurementId: "G-WQGRNRXYQE"
};

// تهيئة التطبيق (تجنب التكرار في حال إعادة التحميل الساخن)
const app = getApps().length === 0 ? initializeApp(config) : getApp();

// تصدير الخدمات
export const auth = getAuth(app);
export const db = getFirestore(app);

// علامة تشير أن النظام مهيأ
export const isConfigured = true;

// دوال مساعدة للتوافق (فارغة لأننا نستخدم الإعدادات الثابتة)
export const saveSystemConfig = (newConfig: FirebaseOptions) => {
  console.log("System is using hardcoded config.");
};

export const resetSystemConfig = () => {
  console.log("System is using hardcoded config.");
};
