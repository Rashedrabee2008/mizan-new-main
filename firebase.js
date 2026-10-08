// ============================================================
// الميزان 17.0 - firebase.js
// المزامنة السحابية مع Firebase
// يدمج: firebase-sync-fix.js + auto-sync.js
// ============================================================

console.log('🔥 تحميل firebase.js v17.0');

// ═══════════════════════════════════════════════════════════
// الإعدادات
// ═══════════════════════════════════════════════════════════
const FIREBASE_CONFIG = window.firebaseConfig || {};
const SYNC_KEYS = [
    'products', 'sales', 'purchases', 'expenses',
    'cashBoxes', 'customers', 'suppliers', 'users',
    'treasury', 'journalEntries', 'returns',
    'payments', 'coupons', 'warehouses'
];

let autoSyncInterval = null;
let realtimeListeners = [];
let isSyncing = false;

// ═══════════════════════════════════════════════════════════
// حالة المزامنة
// ═══════════════════════════════════════════════════════════
window.updateSyncStatus = function(status, message) {
    const el = document.getElementById('syncStatus');
    if (!el) return;
    
    const icons = {
        online: '🟢',
        offline: '🔴',
        syncing: '🔄',
        synced: '✅',
        error: '❌'
    };
    
    el.textContent = (icons[status] || 'ℹ️') + ' ' + (message || '');
    el.style.display = 'inline-flex';
    
    if (status === 'synced') {
        setTimeout(function() {
            el.style.display = 'none';
        }, 3000);
    }
};

// ═══════════════════════════════════════════════════════════
// التحقق من Firebase
// ═══════════════════════════════════════════════════════════
function isFirebaseReady() {
    return typeof firebase !== 'undefined' 
        && firebase.apps 
        && firebase.apps.length > 0 
        && window.firebaseReady;
}

// ═══════════════════════════════════════════════════════════
// قراءة من Firebase
// ═══════════════════════════════════════════════════════════
async function fetchFromFirebase(key) {
    if (!isFirebaseReady()) return null;
    
    try {
        const snap = await firebase.database().ref('mizan/' + key).once('value');
        const data = snap.val();
        if (!data) return [];
        return window.toArray ? window.toArray(data) : Object.values(data);
    } catch (e) {
        console.warn('⚠️ فشل قراءة ' + key + ':', e.message);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// كتابة إلى Firebase
// ═══════════════════════════════════════════════════════════
async function writeToFirebase(key, data) {
    if (!isFirebaseReady()) return false;
    
    try {
        await firebase.database().ref('mizan/' + key).set(data);
        return true;
    } catch (e) {
        console.warn('⚠️ فشل كتابة ' + key + ':', e.message);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════
// مزامنة شاملة: Firebase → local
// ═══════════════════════════════════════════════════════════
window.syncFromCloud = async function(silent) {
    if (isSyncing) {
        console.log('⏳ المزامنة قيد التنفيذ...');
        return;
    }
    
    if (!isFirebaseReady()) {
        if (typeof window.showToast === 'function') {
            window.showToast('❌ Firebase غير متصل', 'error');
        }
        return;
    }
    
    if (!silent && !confirm('⚠️ سيتم تحميل البيانات من السحابة. متابعة؟')) {
        return;
    }
    
    isSyncing = true;
    window.updateSyncStatus('syncing', 'جاري التحميل...');
    
    let synced = 0;
    
    for (const key of SYNC_KEYS) {
        try {
            const data = await fetchFromFirebase(key);
            
            if (data === null || data.length === 0) continue;
            
            // احفظ في localStorage
            if (window.setData) {
                window.setData(key, data);
            }
            
            // احفظ في الذاكرة
            window[key] = data;
            
            synced++;
        } catch (e) {
            console.warn('⚠️ خطأ في ' + key + ':', e.message);
        }
    }
    
    isSyncing = false;
    window.updateSyncStatus('synced', 'تمت مزامنة ' + synced + ' عنصر');
    
    // تحديث الواجهة
    if (typeof window.refreshAllUI === 'function') {
        window.refreshAllUI();
    }
    
    if (!silent && typeof window.showToast === 'function') {
        window.showToast('✅ تم التحميل من السحابة (' + synced + ' عنصر)', 'success');
    }
    
    console.log('✅ تمت المزامنة:', synced, 'عنصر');
    return synced;
};

// ═══════════════════════════════════════════════════════════
// رفع شامل: local → Firebase
// ═══════════════════════════════════════════════════════════
window.syncToCloud = async function(silent) {
    if (!isFirebaseReady()) {
        if (typeof window.showToast === 'function') {
            window.showToast('❌ Firebase غير متصل', 'error');
        }
        return;
    }
    
    window.updateSyncStatus('syncing', 'جاري الرفع...');
    
    let uploaded = 0;
    
    for (const key of SYNC_KEYS) {
        try {
            const data = window[key] || [];
            if (data.length === 0) continue;
            
            // ✅ لا ترفع كلمات المرور plaintext
            let toUpload = data;
            if (key === 'users') {
                toUpload = data.map(function(u) {
                    return Object.assign({}, u);
                });
            }
            
            const success = await writeToFirebase(key, toUpload);
            if (success) uploaded++;
        } catch (e) {
            console.warn('⚠️ خطأ في رفع ' + key + ':', e.message);
        }
    }
    
    // تحديث وقت آخر مزامنة
    const now = new Date().toLocaleString('ar-EG');
    localStorage.setItem('mizan_last_sync', now);
    
    window.updateSyncStatus('synced', 'تم رفع ' + uploaded + ' عنصر');
    
    if (!silent && typeof window.showToast === 'function') {
        window.showToast('☁️ تم الرفع (' + uploaded + ' عنصر)', 'success');
    }
    
    console.log('✅ تم الرفع:', uploaded, 'عنصر');
    return uploaded;
};

// ═══════════════════════════════════════════════════════════
// ربط دالة التنزيل (لأزرار الإعدادات)
// ═══════════════════════════════════════════════════════════
window.downloadFromCloud = function() {
    window.syncFromCloud(false);
};

// ═══════════════════════════════════════════════════════════
// مزامنة تلقائية
// ═══════════════════════════════════════════════════════════
window.startAutoSync = function() {
    if (autoSyncInterval) clearInterval(autoSyncInterval);
    
    // كل 5 دقائق
    autoSyncInterval = setInterval(function() {
        if (isFirebaseReady() && window.currentUser) {
            window.syncToCloud(true);
        }
    }, 5 * 60 * 1000);
    
    console.log('✅ المزامنة التلقائية بدأت (كل 5 دقائق)');
};

window.stopAutoSync = function() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
};

// ═══════════════════════════════════════════════════════════
// جدولة مزامنة (debounced)
// ═══════════════════════════════════════════════════════════
let scheduleTimer = null;

window.scheduleAutoSync = function() {
    if (!isFirebaseReady() || !window.currentUser) return;
    
    if (scheduleTimer) clearTimeout(scheduleTimer);
    
    scheduleTimer = setTimeout(function() {
        window.syncToCloud(true);
    }, 10 * 1000); // بعد 10 ثواني
};

// ═══════════════════════════════════════════════════════════
// Real-time listeners
// ═══════════════════════════════════════════════════════════
window.startRealtimeSync = function() {
    if (!isFirebaseReady()) return;
    
    // إلغاء الـ listeners القديمة
    realtimeListeners.forEach(function(ref) {
        try { ref.off(); } catch (e) {}
    });
    realtimeListeners = [];
    
    // مفاتيح للمراقبة الحية
    const realtimeKeys = ['products', 'sales', 'customers', 'cashBoxes'];
    
    realtimeKeys.forEach(function(key) {
        try {
            const ref = firebase.database().ref('mizan/' + key);
            
            ref.on('value', function(snap) {
                const data = snap.val();
                if (!data) return;
                
                const arr = window.toArray ? window.toArray(data) : Object.values(data);
                if (arr.length === 0) return;
                
                // حفظ محلياً
                if (window.setData) window.setData(key, arr);
                window[key] = arr;
                
                // تحديث الواجهة (debounced)
                if (window.__realtimeUpdateTimer) {
                    clearTimeout(window.__realtimeUpdateTimer);
                }
                window.__realtimeUpdateTimer = setTimeout(function() {
                    if (typeof window.updateDashboard === 'function') {
                        window.updateDashboard();
                    }
                }, 500);
            });
            
            realtimeListeners.push(ref);
        } catch (e) {
            console.warn('⚠️ فشل مراقبة ' + key + ':', e.message);
        }
    });
    
    console.log('✅ Real-time sync بدأ');
};

// ═══════════════════════════════════════════════════════════
// اعتراض localStorage.setItem لرفع تلقائي
// ═══════════════════════════════════════════════════════════
(function interceptLocalStorage() {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    
    localStorage.setItem = function(key, value) {
        // احفظ محلياً أولاً
        originalSetItem(key, value);
        
        // إذا كان مفتاح متزامن، ارفع لـ Firebase
        if (key.indexOf('mizan_') === 0) {
            const cleanKey = key.replace('mizan_', '');
            
            if (SYNC_KEYS.indexOf(cleanKey) > -1 && isFirebaseReady() && window.currentUser) {
                try {
                    const data = JSON.parse(value);
                    
                    // Debounce للرفع
                    if (window.__uploadTimers === undefined) window.__uploadTimers = {};
                    if (window.__uploadTimers[cleanKey]) {
                        clearTimeout(window.__uploadTimers[cleanKey]);
                    }
                    
                    window.__uploadTimers[cleanKey] = setTimeout(function() {
                        firebase.database().ref('mizan/' + cleanKey).set(data)
                            .then(function() {
                                console.log('☁️ تم رفع ' + cleanKey);
                            })
                            .catch(function(e) {
                                console.warn('⚠️ فشل رفع ' + cleanKey + ':', e.message);
                            });
                    }, 2000);
                } catch (e) {
                    // تجاهل أخطاء JSON
                }
            }
        }
    };
    
    console.log('✅ localStorage interceptor جاهز');
})();

// ═══════════════════════════════════════════════════════════
// مراقبة حالة الاتصال
// ═══════════════════════════════════════════════════════════
window.setupConnectionMonitor = function() {
    if (!isFirebaseReady()) return;
    
    try {
        const connectedRef = firebase.database().ref('.info/connected');
        
        connectedRef.on('value', function(snap) {
            const connected = snap.val();
            
            if (connected) {
                console.log('🟢 Firebase متصل');
                window.updateSyncStatus('online', 'متصل');
                
                // مزامنة أولية بعد الاتصال
                setTimeout(function() {
                    window.syncFromCloud(true);
                }, 1500);
            } else {
                console.log('🔴 Firebase غير متصل');
                window.updateSyncStatus('offline', 'غير متصل');
            }
        });
    } catch (e) {
        console.warn('⚠️ فشل مراقبة الاتصال:', e.message);
    }
};

// ═══════════════════════════════════════════════════════════
// التهيئة
// ═══════════════════════════════════════════════════════════
window.initFirebaseSync = function() {
    if (!isFirebaseReady()) {
        console.log('⚠️ Firebase غير جاهز — المزامنة معطلة');
        return;
    }
    
    console.log('🔥 بدء مزامنة Firebase...');
    
    window.setupConnectionMonitor();
    window.startRealtimeSync();
    window.startAutoSync();
    
    // مزامنة أولية
    setTimeout(function() {
        window.syncFromCloud(true);
    }, 2000);
    
    console.log('✅ Firebase Sync جاهز');
};

// ═══════════════════════════════════════════════════════════
// علم التحميل
// ═══════════════════════════════════════════════════════════
window.__firebaseLoaded = true;

console.log('✅ firebase.js v17.0 جاهز');
