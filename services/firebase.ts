
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const STORAGE_KEY = 'CAFE_PRO_CLOUD_CONFIG';

// 1. محاولة جلب الإعدادات من التخزين المحلي للمتصفح (في حال أراد المستخدم تغييرها لاحقاً)
const getStoredConfig = (): FirebaseOptions | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing firebase config", e);
  }
  return null;
};

// 2. الإعدادات الافتراضية للنظام (مشروع DTG Portal)
const defaultConfig: FirebaseOptions = {
  apiKey: "AIzaSyAqGzm6Tu21DYFiKV7CEobd01DylJKqJG4",
  authDomain: "dtg-portal-56181.firebaseapp.com",
  projectId: "dtg-portal-56181",
  storageBucket: "dtg-portal-56181.firebasestorage.app",
  messagingSenderId: "841782105922",
  appId: "1:841782105922:web:c6b4c8df0f3ed8af5c5adb",
  measurementId: "G-WQGRNRXYQE"
};

const savedConfig = getStoredConfig();
// الأولوية للإعدادات المحفوظة يدوياً، وإلا نستخدم الإعدادات الافتراضية المدمجة
const config = savedConfig || defaultConfig;

// 3. تهيئة التطبيق
const app = getApps().length === 0 ? initializeApp(config) : getApp();

// 4. تصدير الخدمات
export const auth = getAuth(app);
export const db = getFirestore(app);

// 5. هل النظام متصل بمشروع حقيقي؟ (دائماً صحيح الآن لوجود إعدادات افتراضية صالحة)
export const isConfigured = true;

// 6. دالة لحفظ الإعدادات الجديدة (تستدعى من واجهة المستخدم)
export const saveSystemConfig = (newConfig: FirebaseOptions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  window.location.reload(); // إعادة تحميل لتطبيق الإعدادات
};

export const resetSystemConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};
