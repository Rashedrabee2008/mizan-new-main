// ============================================================
// firebase.js - المزامنة السحابية
// ============================================================

console.log('🔥 تحميل firebase.js');

const SYNC_KEYS = [
    'products', 'sales', 'purchases', 'expenses',
    'cashBoxes', 'customers', 'suppliers', 'users',
    'treasury', 'journalEntries', 'returns',
    'payments', 'warehouses', 'branches', 'companyData'
];

let autoSyncInterval = null;
let realtimeListeners = [];

function isFirebaseReady() {
    return typeof firebase !== 'undefined' 
        && firebase.apps 
        && firebase.apps.length > 0 
        && window.firebaseReady;
}

// ═══════════════════════════════════════════════════════════
// رفع البيانات للسحابة
// ═══════════════════════════════════════════════════════════
window.syncToCloud = async function(silent) {
    if (!isFirebaseReady()) {
        if (!silent && typeof window.showToast === 'function') {
            window.showToast('❌ Firebase غير متصل', 'error');
        }
        return 0;
    }
    
    let uploaded = 0;
    
    for (const key of SYNC_KEYS) {
        try {
            const data = window[key];
            if (!data || (Array.isArray(data) && data.length === 0)) continue;
            
            await firebase.database().ref('mizan/' + key).set(data);
            uploaded++;
            console.log('☁️ تم رفع ' + key);
        } catch (e) {
            console.warn('⚠️ فشل رفع ' + key + ':', e.message);
        }
    }
    
    const now = new Date().toLocaleString('ar-EG');
    localStorage.setItem('mizan_last_sync', now);
    
    if (!silent && typeof window.showToast === 'function') {
        window.showToast('☁️ تم الرفع (' + uploaded + ' عنصر)', 'success');
    }
    
    return uploaded;
};

// ═══════════════════════════════════════════════════════════
// تنزيل البيانات من السحابة
// ═══════════════════════════════════════════════════════════
window.syncFromCloud = async function(silent) {
    if (!isFirebaseReady()) {
        if (!silent && typeof window.showToast === 'function') {
            window.showToast('❌ Firebase غير متصل', 'error');
        }
        return 0;
    }
    
    let synced = 0;
    
    for (const key of SYNC_KEYS) {
        try {
            const snap = await firebase.database().ref('mizan/' + key).once('value');
            const data = snap.val();
            
            if (!data) continue;
            
            const arr = Array.isArray(data) ? data : Object.values(data);
            if (arr.length === 0) continue;
            
            window[key] = arr;
            localStorage.setItem('mizan_' + key, JSON.stringify(arr));
            synced++;
            console.log('📥 تم تنزيل ' + key + ' (' + arr.length + ')');
        } catch (e) {
            console.warn('⚠️ فشل تنزيل ' + key + ':', e.message);
        }
    }
    
    if (typeof window.refreshAllUI === 'function') {
        window.refreshAllUI();
    }
    
    if (!silent && typeof window.showToast === 'function') {
        window.showToast('✅ تم التنزيل (' + synced + ' عنصر)', 'success');
    }
    
    return synced;
};

window.downloadFromCloud = function() { 
    window.syncFromCloud(false); 
};

// ═══════════════════════════════════════════════════════════
// المزامنة الحية (Real-time)
// ═══════════════════════════════════════════════════════════
window.startRealtimeSync = function() {
    if (!isFirebaseReady()) {
        console.warn('⚠️ Firebase غير متاح للمزامنة الحية');
        return;
    }
    
    // إلغاء listeners قديمة
    realtimeListeners.forEach(function(ref) {
        try { ref.off(); } catch (e) {}
    });
    realtimeListeners = [];
    
    // مراقبة كل البيانات
    SYNC_KEYS.forEach(function(key) {
        try {
            const ref = firebase.database().ref('mizan/' + key);
            
            ref.on('value', function(snap) {
                const data = snap.val();
                if (!data) return;
                
                const arr = Array.isArray(data) ? data : Object.values(data);
                if (arr.length === 0) return;
                
                // حفظ محلياً
                window[key] = arr;
                localStorage.setItem('mizan_' + key, JSON.stringify(arr));
                
                // تحديث الواجهة
                if (typeof window.refreshAllUI === 'function') {
                    window.refreshAllUI();
                }
            });
            
            realtimeListeners.push(ref);
        } catch (e) {
            console.warn('⚠️ فشل مراقبة ' + key + ':', e.message);
        }
    });
    
    console.log('✅ Real-time Sync بدأ لـ ' + SYNC_KEYS.length + ' مجموعة بيانات');
};

// ═══════════════════════════════════════════════════════════
// المزامنة التلقائية كل 5 دقائق
// ═══════════════════════════════════════════════════════════
window.startAutoSync = function() {
    if (autoSyncInterval) clearInterval(autoSyncInterval);
    
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
// اعتراض localStorage - أي تغيير يرفع فوراً للسحابة
// ═══════════════════════════════════════════════════════════
(function interceptLocalStorage() {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    
    localStorage.setItem = function(key, value) {
        // احفظ محلياً أولاً
        originalSetItem(key, value);
        
        // إذا كان مفتاح متزامن، ارفع للسحابة
        if (key.indexOf('mizan_') === 0) {
            const cleanKey = key.replace('mizan_', '');
            
            if (SYNC_KEYS.indexOf(cleanKey) > -1 && isFirebaseReady() && window.currentUser) {
                try {
                    const data = JSON.parse(value);
                    
                    // debounce للرفع
                    if (!window.__uploadTimers) window.__uploadTimers = {};
                    if (window.__uploadTimers[cleanKey]) {
                        clearTimeout(window.__uploadTimers[cleanKey]);
                    }
                    
                    window.__uploadTimers[cleanKey] = setTimeout(function() {
                        firebase.database().ref('mizan/' + cleanKey).set(data)
                            .then(function() {
                                console.log('☁️ تم رفع ' + cleanKey + ' تلقائياً');
                            })
                            .catch(function(e) {
                                console.warn('⚠️ فشل رفع ' + cleanKey + ':', e.message);
                            });
                    }, 1000);
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
            
            const statusEl = document.getElementById('cloudStatusText');
            if (statusEl) {
                statusEl.textContent = connected ? '✅ متصل' : '❌ غير متصل';
                statusEl.style.color = connected ? '#2D8F5E' : '#E06060';
            }
            
            if (connected && window.currentUser) {
                console.log('🟢 Firebase متصل - جاري المزامنة...');
                setTimeout(window.syncFromCloud, 1500);
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
        console.log('⚠️ Firebase غير جاهز');
        return;
    }
    
    console.log('🔥 بدء المزامنة السحابية...');
    
    window.setupConnectionMonitor();
    window.startRealtimeSync();
    window.startAutoSync();
    
    // ⚡ الأهم: تحميل البيانات من Firebase عند بدء التطبيق
    setTimeout(function() {
        console.log('📥 جاري تحميل البيانات من السحابة...');
        window.syncFromCloud(true);
    }, 2000);
    
    // ⚡ إعادة تحميل كل 3 ثواني (في حالة تغييرات)
    setInterval(function() {
        if (isFirebaseReady() && window.currentUser) {
            // مزامنة خفيفة - بس للـ treasury
            firebase.database().ref('mizan/treasury').once('value').then(function(snap) {
                const data = snap.val();
                if (!data) return;
                const arr = Array.isArray(data) ? data : Object.values(data);
                if (arr.length !== (window.treasury || []).length) {
                    window.treasury = arr;
                    localStorage.setItem('mizan_treasury', JSON.stringify(arr));
                    if (typeof window.renderTreasury === 'function') {
                        window.renderTreasury();
                    }
                }
            });
        }
    }, 3000);
    
    console.log('✅ Firebase Sync جاهز');
};
