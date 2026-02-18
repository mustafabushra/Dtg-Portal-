
import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { X, Loader2, CheckCircle2, UserCheck, Clock, LogOut, Coffee, Wrench, Package, ArrowLeft, Image as ImageIcon, Minus } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Staff, InventoryItem, Asset } from '../types';

interface QRScannerModalProps {
  onClose: () => void;
  currentUser: any;
  userType: 'ADMIN' | 'STAFF';
  staffList?: Staff[];
  inventory?: InventoryItem[];
  assets?: Asset[];
  onAttendanceAction?: (id: string, type: 'IN' | 'OUT') => void;
  onWithdrawAction?: (id: string, qty: number) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ 
  onClose, currentUser, userType, staffList, inventory, assets, onAttendanceAction, onWithdrawAction 
}) => {
  const [status, setStatus] = useState<'scanning' | 'processing' | 'success' | 'success-attendance' | 'product-found' | 'error'>('scanning');
  
  // Results State
  const [scannedStaffName, setScannedStaffName] = useState('');
  const [attendanceType, setAttendanceType] = useState<'IN' | 'OUT' | null>(null);
  const [scannedItem, setScannedItem] = useState<InventoryItem | Asset | null>(null);
  const [itemType, setItemType] = useState<'PRODUCT' | 'ASSET' | null>(null);
  
  // Kiosk Mode State
  const [isKioskMode, setIsKioskMode] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isProcessingRef = useRef(false); // Ref to track processing state without re-renders

  useEffect(() => {
    // 1. Initialize Scanner
    if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true,
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true
            },
            /* verbose= */ false
        );
        scannerRef.current = scanner;
        
        scanner.render(onScanSuccess, (error) => {
            // Ignore frame errors to prevent console spam
        });
    }

    // 2. Handle Cleanup
    return () => {
        if (scannerRef.current) {
            try {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
            } catch (e) {
                // Ignore cleanup errors
            }
            scannerRef.current = null;
        }
    };
  }, []); // Empty dependency array ensures run once

  // Helper to safely pause logic
  const pauseScanning = () => {
      isProcessingRef.current = true;
      setStatus('processing');
      // We do NOT clear the scanner here to avoid DOM crashes. We just hide the UI overlay.
  };

  const resumeScanning = () => {
      isProcessingRef.current = false;
      setStatus('scanning');
      setScannedItem(null);
      setItemType(null);
  };

  async function onScanSuccess(decodedText: string, decodedResult: any) {
      if (isProcessingRef.current) return;
      
      console.log("Scanned:", decodedText);
      pauseScanning();

      try {
        // 1. Check Staff (Attendance)
        if (staffList && onAttendanceAction) {
          const staffMember = staffList.find(s => s.id === decodedText);
          if (staffMember) {
             const newType = staffMember.isClockedIn ? 'OUT' : 'IN';
             setScannedStaffName(staffMember.name);
             setAttendanceType(newType);
             
             // Run action safely
             await onAttendanceAction(staffMember.id, newType);
             
             setStatus('success-attendance');
             
             if (isKioskMode) {
               setTimeout(resumeScanning, 3000);
             } else {
               setTimeout(onClose, 2000);
             }
             return;
          }
        }

        // 2. Check Inventory (Product)
        if (inventory) {
          const product = inventory.find(i => i.id === decodedText);
          if (product) {
            setScannedItem(product);
            setItemType('PRODUCT');
            setStatus('product-found');
            return;
          }
        }

        // 3. Check Assets
        if (assets) {
          const asset = assets.find(a => a.id === decodedText);
          if (asset) {
            setScannedItem(asset);
            setItemType('ASSET');
            setStatus('product-found');
            return;
          }
        }

        // 4. Fallback: Device Login
        try {
          const sessionRef = doc(db, 'auth_sessions', decodedText);
          await updateDoc(sessionRef, {
            status: 'authenticated',
            userType: userType,
            user: {
              cafeId: '10101', 
              username: currentUser.username,
              password: currentUser.password 
            }
          });
          setStatus('success');
          setTimeout(onClose, 1500);
        } catch (error) {
          console.error("Login Error:", error);
          setStatus('error');
          if (isKioskMode) setTimeout(resumeScanning, 2000);
        }

      } catch (err) {
        console.error("Scan Logic Error:", err);
        setStatus('error');
        if (isKioskMode) setTimeout(resumeScanning, 2000);
      }
  }

  const handleQuickWithdraw = () => {
    if (itemType === 'PRODUCT' && scannedItem && onWithdrawAction) {
        onWithdrawAction(scannedItem.id, 1);
        alert(`تم خصم 1 ${(scannedItem as InventoryItem).unit} من ${scannedItem.name}`);
        if (!isKioskMode) onClose();
        else resumeScanning();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="p-4 flex justify-between items-center border-b border-slate-100 bg-slate-50">
           <h3 className="text-sm font-black text-slate-900">الماسح الضوئي الذكي</h3>
           <button 
             onClick={onClose} 
             className="p-2 bg-white rounded-full hover:bg-slate-200 transition-colors shadow-sm"
           >
             <X className="w-4 h-4 text-slate-600" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 text-center">
          
          {/* CRITICAL FIX: Always keep #reader in DOM, just hide it with CSS */}
          <div className={status === 'scanning' ? 'block' : 'hidden'}>
             <div className="overflow-hidden rounded-xl bg-black border-2 border-slate-900 relative min-h-[250px]">
                <div id="reader" className="w-full h-full"></div>
                {/* Custom Overlay Line */}
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10 pointer-events-none animate-pulse"></div>
             </div>
             <p className="text-xs text-slate-500 font-bold mt-4">
                وجه الكاميرا نحو: بطاقة موظف، منتج، أو أصل.
             </p>
             <div className="flex items-center justify-center gap-2 mt-4 bg-slate-100 p-2 rounded-xl">
                <input 
                  type="checkbox" 
                  checked={isKioskMode} 
                  onChange={(e) => setIsKioskMode(e.target.checked)}
                  className="w-4 h-4 accent-amber-500" 
                  id="kioskMode"
                />
                <label htmlFor="kioskMode" className="text-[10px] font-black text-slate-600 cursor-pointer">
                   وضع الكشك (مسح مستمر)
                </label>
             </div>
          </div>

          {/* Status: PROCESSING */}
          {status === 'processing' && (
             <div className="py-12 flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-2" />
                <p className="font-bold text-sm">جاري التحقق...</p>
             </div>
          )}

          {/* Status: LOGIN SUCCESS */}
          {status === 'success' && (
             <div className="py-12 flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                <p className="text-sm font-black text-slate-900">تم الربط بنجاح!</p>
             </div>
          )}

          {/* Status: ATTENDANCE SUCCESS */}
          {status === 'success-attendance' && (
             <div className="py-10 flex flex-col items-center animate-in zoom-in">
                <div className={`p-4 rounded-full mb-4 ${attendanceType === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                   {attendanceType === 'IN' ? <UserCheck className="w-12 h-12" /> : <LogOut className="w-12 h-12" />}
                </div>
                <h4 className="text-xl font-black text-slate-900">{scannedStaffName}</h4>
                <div className={`mt-2 px-4 py-1 rounded-full text-xs font-black ${attendanceType === 'IN' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                   {attendanceType === 'IN' ? 'تسجيل دخول (حضور)' : 'تسجيل خروج (انصراف)'}
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-4 flex items-center gap-1">
                   <Clock className="w-3 h-3" /> {new Date().toLocaleTimeString('ar-SA')}
                </p>
                {isKioskMode && <p className="text-[10px] text-amber-500 font-bold mt-6 animate-pulse">جاري الاستعداد للمسح التالي...</p>}
             </div>
          )}

          {/* Status: PRODUCT FOUND */}
          {status === 'product-found' && scannedItem && (
             <div className="py-4 flex flex-col items-center animate-in slide-in-from-bottom-4">
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-md p-1 mb-4">
                   {scannedItem.imageUrl ? (
                      <img src={scannedItem.imageUrl} className="w-full h-full object-cover rounded-xl" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl text-slate-300">
                         {itemType === 'PRODUCT' ? <Coffee className="w-8 h-8" /> : <Wrench className="w-8 h-8" />}
                      </div>
                   )}
                </div>
                <h4 className="text-lg font-black text-slate-900">{scannedItem.name}</h4>
                
                {itemType === 'PRODUCT' ? (
                   <>
                      <p className="text-xs font-bold text-slate-500 mt-1">الرصيد: {(scannedItem as InventoryItem).quantity} {(scannedItem as InventoryItem).unit}</p>
                      <div className="mt-6 w-full space-y-2">
                         <button 
                           onClick={handleQuickWithdraw}
                           className="w-full py-3 bg-rose-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                         >
                            <Minus className="w-4 h-4" /> خصم 1 سريع
                         </button>
                         <button 
                           onClick={() => { onClose(); }}
                           className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-black text-sm hover:bg-slate-50"
                         >
                            إغلاق
                         </button>
                      </div>
                   </>
                ) : (
                   <>
                      <p className="text-xs font-bold text-slate-500 mt-1">الحالة: {(scannedItem as Asset).status}</p>
                      <div className="mt-2 bg-amber-50 px-3 py-1 rounded-lg text-[10px] font-bold text-amber-700 border border-amber-100">
                         آخر صيانة: {(scannedItem as Asset).maintenanceDate}
                      </div>
                   </>
                )}

                <button onClick={resumeScanning} className="mt-6 text-slate-400 text-xs font-bold flex items-center gap-1 hover:text-slate-600">
                   <ArrowLeft className="w-3 h-3" /> مسح عنصر آخر
                </button>
             </div>
          )}

          {/* Status: ERROR */}
          {status === 'error' && (
             <div className="py-12 flex flex-col items-center">
                <X className="w-16 h-16 text-red-500 mb-4" />
                <p className="font-bold text-red-600">كود غير معروف</p>
                <button onClick={resumeScanning} className="mt-4 px-6 py-2 bg-slate-100 rounded-xl text-xs font-black">حاول مرة أخرى</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
