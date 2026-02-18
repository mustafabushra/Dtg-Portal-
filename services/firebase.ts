
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// إعدادات مشروع DTG Portal الجديد
const config: FirebaseOptions = {
  apiKey: "AIzaSyD-xq80bIRqExF6TR6Q69CQ7Q63RlAd-mE",
  authDomain: "dtgportal-d9117.firebaseapp.com",
  projectId: "dtgportal-d9117",
  storageBucket: "dtgportal-d9117.firebasestorage.app",
  messagingSenderId: "1015675876635",
  appId: "1:1015675876635:web:c0d301898dfb6f8abacfbe",
  measurementId: "G-LHHY6YGMPT"
};

// تهيئة التطبيق (تجنب التكرار في حال إعادة التحميل الساخن)
const app = getApps().length === 0 ? initializeApp(config) : getApp();

// تصدير الخدمات
export const auth = getAuth(app);

// استخدام initializeFirestore بدلاً من getFirestore لفرض إعدادات الاتصال
// experimentalForceLongPolling يحل مشكلة [code=unavailable] في الشبكات التي تحظر WebSockets
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// علامة تشير أن النظام مهيأ
export const isConfigured = true;

// دوال مساعدة للتوافق (فارغة لأننا نستخدم الإعدادات الثابتة)
export const saveSystemConfig = (newConfig: FirebaseOptions) => {
  console.log("System is using hardcoded config.");
};

export const resetSystemConfig = () => {
  console.log("System is using hardcoded config.");
};
