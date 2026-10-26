// ============================================================
// الميزان Pro - data.js v4.0 (الحل النهائي للبيانات)
// ============================================================

(function() {
    'use strict';

    window.FIREBASE_CONFIG = {
        apiKey: "AIzaSyB3cnrETONbcrH1d_94w3TzeUEQIF0MSXw",
        authDomain: "mizan-new-main.firebaseapp.com",
        databaseURL: "https://mizan-new-main-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "mizan-new-main",
        storageBucket: "mizan-new-main.firebasestorage.app",
        messagingSenderId: "442192802804",
        appId: "1:442192802804:web:8035c27ab7dcf38a547fa1"
    };

    window.firebaseReady = false;

    window.SYNC_KEYS = [
        'products', 'sales', 'purchases', 'expenses',
        'cashBoxes', 'customers', 'suppliers', 'users',
        'treasury', 'journalEntries', 'returns',
        'payments', 'warehouses', 'branches', 'companyData',
        'accounts', 'coupons', 'employees', 'attendance',
        'salaries', 'leaves', 'warehouseReceipts', 'warehouseIssues',
        'warehouseTransfers', 'warehouseAdjustments', 'openingBalances'
    ];

    const STORE_KEY = 'mizan_store_id_v18';

    window.getStoreId = function() {
        try {
            let storeId = localStorage.getItem(STORE_KEY);
            if (!storeId) {
                storeId = sessionStorage.getItem(STORE_KEY);
                if (storeId) localStorage.setItem(STORE_KEY, storeId);
            }
            if (!storeId) {
                storeId = 'store_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
                localStorage.setItem(STORE_KEY, storeId);
            }
            sessionStorage.setItem(STORE_KEY, storeId);
            return storeId;
        } catch (e) {
            return 'store_default';
        }
    };

    window.setStoreId = function(storeId) {
        try {
            localStorage.setItem(STORE_KEY, storeId);
            sessionStorage.setItem(STORE_KEY, storeId);
            return true;
        } catch (e) { return false; }
    };

    window.getStorePath = function() { return 'stores/' + window.getStoreId(); };

    window.products = [];
    window.sales = [];
    window.purchases = [];
    window.customers = [];
    window.suppliers = [];
    window.cashBoxes = [];
    window.expenses = [];
    window.treasury = [];
    window.payments = [];
    window.returns = [];
    window.users = [];
    window.accounts = [];
    window.journalEntries = [];
    window.coupons = [];
    window.warehouses = [];
    window.branches = [];
    window.employees = [];
    window.attendance = [];
    window.salaries = [];
    window.leaves = [];
    window.warehouseReceipts = [];
    window.warehouseIssues = [];
    window.warehouseTransfers = [];
    window.warehouseAdjustments = [];
    window.openingBalances = [];
    window.currencies = window.DEFAULT_CURRENCIES || [];

    window.companyData = {
        name: 'الميزان', tradeName: '', phone: '', phone2: '', email: '', website: '',
        address: '', city: '', country: 'مصر', tax: '', commercial: '', taxCard: '', nationalId: '',
        footer: 'شكراً لتعاملكم معنا 🌟', primaryColor: '#C9A94E', currency: 'ج.م', logo: ''
    };

    const STORAGE_PREFIX = 'mizan_v18_';

    window.DataStore = {
        get: function(key) { return window[key] || []; },
        set: function(key, data) {
            window[key] = data;
            try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data)); } catch (e) {}
            if (window.EventBus) {
                window.EventBus.emit('data:' + key + ':changed', data);
                window.EventBus.emit('data:changed', { key: key, data: data });
            }
            if (window.CloudSync && window.CloudSync.isReady()) { window.CloudSync.push(key, data); }
            return true;
        },
        add: function(key, item) {
            const arr = window[key] || [];
            if (!item.id) item.id = window.generateId();
            if (!item.createdAt) item.createdAt = new Date().toISOString();
            arr.push(item);
            window.DataStore.set(key, arr);
            return item;
        },
        remove: function(key, id) {
            const arr = window[key] || [];
            const filtered = arr.filter(function(i) { return String(i.id) !== String(id); });
            window.DataStore.set(key, filtered);
        },
        loadAll: function() {
            window.SYNC_KEYS.forEach(function(key) {
                try {
                    const stored = localStorage.getItem(STORAGE_PREFIX + key);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) window[key] = parsed;
                        else if (key === 'companyData' && typeof parsed === 'object') window.companyData = Object.assign({}, window.companyData, parsed);
                    }
                } catch (e) {}
            });
        },
        clearAll: function() {
            window.SYNC_KEYS.forEach(function(key) {
                try { localStorage.removeItem(STORAGE_PREFIX + key); } catch (e) {}
            });
        }
    };

    window.CloudSync = {
        isReady: function() { return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && window.firebaseReady; },
        init: function() {
            try {
                if (!firebase.apps || firebase.apps.length === 0) firebase.initializeApp(window.FIREBASE_CONFIG);
                window.firebaseReady = true;
                window.CloudSync.startRealtime();
                window.CloudSync.pullAll(true);
                return true;
            } catch (e) { return false; }
        },
        push: function(key, data) {
            if (!window.CloudSync.isReady()) return;
            try {
                firebase.database().ref(window.getStorePath() + '/' + key).set(data);
            } catch (e) {}
        },
        pullAll: async function() {
            if (!window.CloudSync.isReady()) return;
            for (const key of window.SYNC_KEYS) {
                try {
                    const snap = await firebase.database().ref(window.getStorePath() + '/' + key).once('value');
                    const data = snap.val();
                    if (data) {
                        const arr = Array.isArray(data) ? data : Object.values(data);
                        if (arr.length > 0) {
                            window[key] = arr;
                            if (window.EventBus) window.EventBus.emit('data:' + key + ':changed', arr);
                        }
                    }
                } catch (e) {}
            }
        },
        startRealtime: function() {
            window.SYNC_KEYS.forEach(function(key) {
                try {
                    firebase.database().ref(window.getStorePath() + '/' + key).on('value', function(snap) {
                        const data = snap.val();
                        if (data) {
                            const arr = Array.isArray(data) ? data : Object.values(data);
                            if (arr.length > 0 && window.EventBus) window.EventBus.emit('data:' + key + ':changed', arr);
                        }
                    });
                } catch (e) {}
            });
        }
    };

    // ═══════════════════════════════════════════════════════════
    // ⚡ إصلاح جذري: دالة حفظ اللوجو
    // ═══════════════════════════════════════════════════════════
    
    window.saveCompanyData = function() {
        const getVal = function(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        const currentLogo = (window.companyData || {}).logo || '';
        const newName = getVal('companyName') || 'الميزان';

        window.companyData = {
            name: newName,
            tradeName: getVal('companyTradeName'),
            phone: getVal('companyPhone'),
            phone2: getVal('companyPhone2'),
            email: getVal('companyEmail'),
            website: getVal('companyWebsite'),
            address: getVal('companyAddress'),
            city: getVal('companyCity'),
            country: getVal('companyCountry') || 'مصر',
            tax: getVal('companyTax'),
            commercial: getVal('companyCommercial'),
            taxCard: getVal('companyTaxCard'),
            nationalId: getVal('companyNationalId'),
            footer: getVal('companyFooter') || 'شكراً لتعاملكم معنا 🌟',
            primaryColor: getVal('companyPrimaryColor') || '#C9A94E',
            currency: getVal('companyCurrency') || 'ج.م',
            logo: currentLogo
        };

        // 1. الحفظ في الذاكرة المحلية
        window.DataStore.set('companyData', window.companyData);
        
        // 2. الحفظ القوي في localStorage
        try { localStorage.setItem('mizan_companyData', JSON.stringify(window.companyData)); } catch(e) {}

        // 3. تحديث الواجهة
        if (typeof window.applyLogoOnLoad === 'function') window.applyLogoOnLoad();
        
        // 4. تحديث الاسم في الهيدر
        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany) headerCompany.textContent = newName;

        // 5. رفع للسحابة فوراً
        if (window.CloudSync && window.CloudSync.isReady()) {
            firebase.database().ref(window.getStorePath() + '/companyData').set(window.companyData);
        }

        if (typeof window.showToast === 'function') {
            window.showToast('✅ تم حفظ بيانات الشركة بنجاح', 'success');
        }
    };

    window.addEventListener('online', function() {});
    window.DataStore.loadAll();
})();
