// ============================================================
// الميزان Pro - data.js v5.0 (كامل ومُصلَّح)
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
        'products', 'sales', 'purchases', 'expenses', 'cashBoxes', 'customers', 
        'suppliers', 'users', 'treasury', 'journalEntries', 'returns', 'payments', 
        'warehouses', 'branches', 'companyData', 'accounts', 'coupons', 'employees', 
        'attendance', 'salaries', 'leaves', 'warehouseReceipts', 'warehouseIssues', 
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
        } catch (e) { return 'store_default'; }
    };
    window.setStoreId = function(id) { localStorage.setItem(STORE_KEY, id); sessionStorage.setItem(STORE_KEY, id); };
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
    window.warehouseReceipts = [];
    window.warehouseIssues = [];
    window.warehouseTransfers = [];
    window.warehouseAdjustments = [];
    window.openingBalances = [];

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
            if (!item.id) item.id = window.generateId ? window.generateId() : Date.now().toString();
            if (!item.createdAt) item.createdAt = new Date().toISOString();
            arr.push(item);
            window.DataStore.set(key, arr);
            return item;
        },
        remove: function(key, id) {
            const arr = window[key] || [];
            window.DataStore.set(key, arr.filter(i => String(i.id) !== String(id)));
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
            window.SYNC_KEYS.forEach(key => { try { localStorage.removeItem(STORAGE_PREFIX + key); } catch(e){} });
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
            try { firebase.database().ref(window.getStorePath() + '/' + key).set(data); } catch (e) {}
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

    window.seedInitialData = function() {
        if (!window.users || window.users.length === 0) {
            window.users = [{ id: 'user_admin', name: 'المدير', password: '123456', role: 'admin', active: true }];
            try { localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(window.users)); } catch (e) {}
        }
        if (!window.cashBoxes || window.cashBoxes.length === 0) {
            window.cashBoxes = [
                { id: 1, name: 'نقدي', type: 'cash', icon: '💵', isDefault: true, active: true, openingBalance: 0 },
                { id: 2, name: 'فودافون كاش', type: 'wallet', icon: '📱', active: true, openingBalance: 0 }
            ];
            try { localStorage.setItem(STORAGE_PREFIX + 'cashBoxes', JSON.stringify(window.cashBoxes)); } catch (e) {}
        }
        if (!window.warehouses || window.warehouses.length === 0) {
            window.warehouses = [{ id: 1, name: 'المستودع الرئيسي', type: 'main', active: true }];
            try { localStorage.setItem(STORAGE_PREFIX + 'warehouses', JSON.stringify(window.warehouses)); } catch (e) {}
        }
    };

    window.DataStore.loadAll();
})();
