// ============================================================
// الميزان Pro - data.js v2.0
// طبقة البيانات + Firebase Sync + Multi-Tenant
// ============================================================

(function() {
    'use strict';

    console.log('💾 data.js v2.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: Firebase Config
    // ═══════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: المفاتيح المتزامنة
    // ═══════════════════════════════════════════════════════════

    window.SYNC_KEYS = [
        'products', 'sales', 'purchases', 'expenses',
        'cashBoxes', 'customers', 'suppliers', 'users',
        'treasury', 'journalEntries', 'returns',
        'payments', 'warehouses', 'branches', 'companyData',
        'accounts', 'coupons', 'employees', 'attendance',
        'salaries', 'leaves',
        'warehouseReceipts', 'warehouseIssues',
        'warehouseTransfers', 'warehouseAdjustments',
        'openingBalances'
    ];

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: Store ID (Multi-Tenant)
    // ═══════════════════════════════════════════════════════════

    const STORE_KEY = 'mizan_store_id_v18';

    window.getStoreId = function() {
        try {
            let storeId = localStorage.getItem(STORE_KEY);
            if (!storeId) {
                storeId = 'store_' + window.generateId();
                localStorage.setItem(STORE_KEY, storeId);
            }
            return storeId;
        } catch (e) {
            return 'store_default';
        }
    };

    window.setStoreId = function(storeId) {
        try {
            localStorage.setItem(STORE_KEY, storeId);
            return true;
        } catch (e) {
            return false;
        }
    };

    window.getStorePath = function() {
        return 'stores/' + window.getStoreId();
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: المتغيرات العامة
    // ═══════════════════════════════════════════════════════════

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

    window.companyData = {
        name: 'الميزان',
        tradeName: '',
        phone: '',
        phone2: '',
        email: '',
        website: '',
        address: '',
        city: '',
        country: 'مصر',
        tax: '',
        commercial: '',
        taxCard: '',
        nationalId: '',
        footer: 'شكراً لتعاملكم معنا 🌟',
        primaryColor: '#C9A94E',
        currency: 'ج.م',
        logo: ''
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: DataStore API
    // ═══════════════════════════════════════════════════════════

    const STORAGE_PREFIX = 'mizan_v18_';

    window.DataStore = {
        get: function(key) {
            return window[key] || [];
        },

        set: function(key, data) {
            window[key] = data;

            try {
                localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
            } catch (e) {
                console.error('❌ خطأ في حفظ ' + key + ':', e.message);
            }

            if (window.EventBus) {
                window.EventBus.emit('data:' + key + ':changed', data);
                window.EventBus.emit('data:changed', { key: key, data: data });
            }

            if (window.CloudSync && window.CloudSync.isReady()) {
                window.CloudSync.push(key, data);
            }

            return true;
        },

        add: function(key, item) {
            const arr = window[key] || [];
            if (!item.id) item.id = window.generateId();
            if (!item.createdAt) item.createdAt = new Date().toISOString();
            arr.push(item);
            window.DataStore.set(key, arr);
            if (window.EventBus) window.EventBus.emit(key + ':added', item);
            return item;
        },

        update: function(key, id, updates) {
            const arr = window[key] || [];
            const idx = arr.findIndex(function(item) { return String(item.id) === String(id); });
            if (idx === -1) return null;

            arr[idx] = Object.assign({}, arr[idx], updates);
            arr[idx].updatedAt = new Date().toISOString();
            window.DataStore.set(key, arr);
            if (window.EventBus) window.EventBus.emit(key + ':updated', arr[idx]);
            return arr[idx];
        },

        remove: function(key, id) {
            const arr = window[key] || [];
            const item = arr.find(function(i) { return String(i.id) === String(id); });
            const filtered = arr.filter(function(i) { return String(i.id) !== String(id); });
            window.DataStore.set(key, filtered);
            if (window.EventBus) window.EventBus.emit(key + ':removed', item);
            return item;
        },

        find: function(key, id) {
            return (window[key] || []).find(function(item) { return String(item.id) === String(id); });
        },

        filter: function(key, predicate) {
            return (window[key] || []).filter(predicate);
        },

        sum: function(key, field) {
            return (window[key] || []).reduce(function(total, item) {
                return total + (parseFloat(item[field]) || 0);
            }, 0);
        },

        loadAll: function() {
            window.SYNC_KEYS.forEach(function(key) {
                try {
                    const stored = localStorage.getItem(STORAGE_PREFIX + key);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) {
                            window[key] = parsed;
                        } else if (key === 'companyData' && typeof parsed === 'object') {
                            window.companyData = Object.assign({}, window.companyData, parsed);
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ فشل تحميل ' + key);
                }
            });
        },

        saveAll: function() {
            window.SYNC_KEYS.forEach(function(key) {
                try {
                    const data = window[key];
                    if (data !== undefined) {
                        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
                    }
                } catch (e) {}
            });
            if (window.EventBus) window.EventBus.emit('data:saved:all');
            return true;
        },

        clearAll: function() {
            window.SYNC_KEYS.forEach(function(key) {
                try {
                    localStorage.removeItem(STORAGE_PREFIX + key);
                } catch (e) {}
            });
        },

        export: function() {
            const data = {};
            window.SYNC_KEYS.forEach(function(key) {
                data[key] = window[key];
            });
            return {
                version: '2.0',
                storeId: window.getStoreId(),
                exportDate: new Date().toISOString(),
                data: data
            };
        },

        import: function(json) {
            if (!json || !json.data) return false;
            Object.keys(json.data).forEach(function(key) {
                if (window.SYNC_KEYS.indexOf(key) > -1) {
                    window[key] = json.data[key];
                    try {
                        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(json.data[key]));
                    } catch (e) {}
                }
            });
            window.DataStore.saveAll();
            if (window.EventBus) window.EventBus.emit('data:imported', json);
            return true;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: CloudSync — Firebase
    // ═══════════════════════════════════════════════════════════

    let firebaseListeners = [];
    let autoSyncTimer = null;
    let uploadTimers = {};
    let syncInProgress = false;

    window.CloudSync = {
        isReady: function() {
            return typeof firebase !== 'undefined'
                && firebase.apps
                && firebase.apps.length > 0
                && window.firebaseReady;
        },

        init: function() {
            try {
                if (typeof firebase === 'undefined') {
                    console.warn('⚠️ Firebase SDK غير محمّل');
                    return false;
                }

                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(window.FIREBASE_CONFIG);
                }

                window.firebaseReady = true;
                console.log('✅ Firebase جاهز');

                window.CloudSync.setupConnectionMonitor();
                window.CloudSync.startRealtime();
                window.CloudSync.startAutoPush();
                window.CloudSync.pullAll(true);

                return true;
            } catch (e) {
                console.error('❌ Firebase init:', e.message);
                window.firebaseReady = false;
                return false;
            }
        },

        setupConnectionMonitor: function() {
            if (!window.CloudSync.isReady()) return;

            try {
                const connectedRef = firebase.database().ref('.info/connected');
                connectedRef.on('value', function(snap) {
                    const connected = snap.val();
                    const statusEl = document.getElementById('cloudStatusText');
                    if (statusEl) {
                        statusEl.textContent = connected ? '✅ متصل' : '❌ غير متصل';
                        statusEl.style.color = connected ? '#2D8F5E' : '#E06060';
                    }

                    // لو اتصل، ارفع كل البيانات المتأخرة
                    if (connected && !syncInProgress) {
                        setTimeout(function() {
                            window.CloudSync.pushAll(true);
                        }, 2000);
                    }
                });
            } catch (e) {
                console.warn('⚠️ فشل مراقبة الاتصال');
            }
        },

        push: function(key, data) {
            if (!window.CloudSync.isReady()) return;

            if (uploadTimers[key]) {
                clearTimeout(uploadTimers[key]);
            }

            uploadTimers[key] = setTimeout(function() {
                try {
                    const path = window.getStorePath() + '/' + key;
                    firebase.database().ref(path).set(data)
                        .then(function() {
                            console.log('☁️ تم رفع ' + key);
                        })
                        .catch(function(e) {
                            console.warn('⚠️ فشل رفع ' + key + ':', e.message);
                        });
                } catch (e) {}
            }, 800);
        },

        pushAll: async function(silent) {
            if (!window.CloudSync.isReady()) return 0;
            if (syncInProgress) return 0;

            syncInProgress = true;
            let uploaded = 0;

            for (const key of window.SYNC_KEYS) {
                try {
                    const data = window[key];
                    if (!data) continue;
                    if (Array.isArray(data) && data.length === 0) continue;

                    const path = window.getStorePath() + '/' + key;
                    await firebase.database().ref(path).set(data);
                    uploaded++;
                } catch (e) {
                    console.warn('⚠️ فشل رفع ' + key);
                }
            }

            syncInProgress = false;

            const now = new Date().toLocaleString('ar-EG');
            localStorage.setItem('mizan_last_sync', now);

            if (!silent && typeof window.showToast === 'function') {
                window.showToast('☁️ تم رفع ' + uploaded + ' عنصر', 'success');
            }

            return uploaded;
        },

        pull: async function(key) {
            if (!window.CloudSync.isReady()) return null;

            try {
                const path = window.getStorePath() + '/' + key;
                const snap = await firebase.database().ref(path).once('value');
                const data = snap.val();
                if (!data) return null;

                const arr = Array.isArray(data) ? data : Object.values(data);
                return arr;
            } catch (e) {
                return null;
            }
        },

        pullAll: async function(silent) {
            if (!window.CloudSync.isReady()) return 0;

            let pulled = 0;

            for (const key of window.SYNC_KEYS) {
                try {
                    const arr = await window.CloudSync.pull(key);

                    if (arr && arr.length > 0) {
                        const localArr = window[key] || [];

                        // ⚡ الدمج الذكي — نختار الأكبر
                        if (arr.length >= localArr.length) {
                            window[key] = arr;
                            try {
                                localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(arr));
                            } catch (e) {}
                            pulled++;
                        }
                    }
                } catch (e) {}
            }

            if (pulled > 0) {
                if (window.EventBus) window.EventBus.emit('cloud:pulled', pulled);
                if (typeof window.refreshAllUI === 'function') {
                    window.refreshAllUI();
                }
            }

            if (!silent && typeof window.showToast === 'function') {
                window.showToast('📥 تم سحب ' + pulled + ' عنصر', 'success');
            }

            return pulled;
        },

        startRealtime: function() {
            if (!window.CloudSync.isReady()) return;

            firebaseListeners.forEach(function(ref) {
                try { ref.off(); } catch (e) {}
            });
            firebaseListeners = [];

            window.SYNC_KEYS.forEach(function(key) {
                try {
                    const path = window.getStorePath() + '/' + key;
                    const ref = firebase.database().ref(path);

                    ref.on('value', function(snap) {
                        const data = snap.val();
                        if (!data) return;

                        const arr = Array.isArray(data) ? data : Object.values(data);
                        if (arr.length === 0) return;

                        const currentStr = JSON.stringify(window[key] || []);
                        const newStr = JSON.stringify(arr);

                        if (currentStr !== newStr) {
                            window[key] = arr;
                            try {
                                localStorage.setItem(STORAGE_PREFIX + key, newStr);
                            } catch (e) {}

                            if (window.EventBus) {
                                window.EventBus.emit('data:' + key + ':changed', arr);
                            }
                        }
                    });

                    firebaseListeners.push(ref);
                } catch (e) {}
            });

            console.log('✅ Real-time sync بدأ');
        },

        startAutoPush: function() {
            if (autoSyncTimer) clearInterval(autoSyncTimer);

            autoSyncTimer = setInterval(function() {
                if (window.CloudSync.isReady() && window.currentUser) {
                    window.CloudSync.pushAll(true);
                }
            }, 30000);

            console.log('✅ Auto push كل 30 ثانية');
        },

        // ⚡ رفع فوري لكل شيء
        forcePushAll: async function() {
            if (!window.CloudSync.isReady()) {
                if (typeof window.showToast === 'function') {
                    window.showToast('⚠️ Firebase غير متصل', 'error');
                }
                return 0;
            }

            syncInProgress = false; // reset
            return await window.CloudSync.pushAll(false);
        },

        stop: function() {
            firebaseListeners.forEach(function(ref) {
                try { ref.off(); } catch (e) {}
            });
            firebaseListeners = [];

            if (autoSyncTimer) {
                clearInterval(autoSyncTimer);
                autoSyncTimer = null;
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: البيانات الأولية
    // ═══════════════════════════════════════════════════════════

    window.seedInitialData = function() {
        let changed = false;

        if (!window.users || window.users.length === 0) {
            window.users = [
                { id: 1, name: 'المدير',  password: '123456', role: 'admin',   active: true, storeId: window.getStoreId() },
                { id: 2, name: 'محمد',   password: '123456', role: 'manager', active: true, storeId: window.getStoreId() },
                { id: 3, name: 'أحمد',   password: '123456', role: 'cashier', active: true, storeId: window.getStoreId() },
                { id: 4, name: 'علي',    password: '123456', role: 'seller',  active: true, storeId: window.getStoreId() },
                { id: 5, name: 'زائر',   password: '123456', role: 'viewer',  active: true, storeId: window.getStoreId() }
            ];
            try {
                localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(window.users));
            } catch (e) {}
            changed = true;
        }

        if (!window.cashBoxes || window.cashBoxes.length === 0) {
            window.cashBoxes = [
                { id: 1, name: 'نقدي', type: 'cash', icon: '💵', isDefault: true, active: true, openingBalance: 0 },
                { id: 2, name: 'فودافون كاش', type: 'wallet', icon: '📱', active: true, openingBalance: 0 },
                { id: 3, name: 'انستاباي', type: 'wallet', icon: '💳', active: true, openingBalance: 0 },
                { id: 4, name: 'بنك', type: 'bank', icon: '🏦', active: true, openingBalance: 0 }
            ];
            try {
                localStorage.setItem(STORAGE_PREFIX + 'cashBoxes', JSON.stringify(window.cashBoxes));
            } catch (e) {}
            changed = true;
        }

        if (!window.warehouses || window.warehouses.length === 0) {
            window.warehouses = [
                { id: 1, name: 'المستودع الرئيسي', type: 'main', location: 'المقر الرئيسي', manager: 'المدير', active: true }
            ];
            try {
                localStorage.setItem(STORAGE_PREFIX + 'warehouses', JSON.stringify(window.warehouses));
            } catch (e) {}
            changed = true;
        }

        if (!window.accounts || window.accounts.length === 0) {
            window.accounts = [
                { id: 1, code: '1000', name: 'الأصول', type: 'asset', parent: null, level: 0 },
                { id: 2, code: '1100', name: 'الأصول المتداولة', type: 'asset', parent: 1, level: 1 },
                { id: 3, code: '1110', name: 'النقدية بالخزينة', type: 'asset', parent: 2, level: 2 },
                { id: 4, code: '1120', name: 'النقدية بالبنك', type: 'asset', parent: 2, level: 2 },
                { id: 5, code: '1130', name: 'محافظ إلكترونية', type: 'asset', parent: 2, level: 2 },
                { id: 6, code: '1200', name: 'العملاء (المدينون)', type: 'asset', parent: 1, level: 1 },
                { id: 7, code: '1300', name: 'المخزون', type: 'asset', parent: 1, level: 1 },
                { id: 20, code: '2000', name: 'الالتزامات', type: 'liability', parent: null, level: 0 },
                { id: 21, code: '2100', name: 'الالتزامات المتداولة', type: 'liability', parent: 20, level: 1 },
                { id: 22, code: '2110', name: 'الموردون (الدائنون)', type: 'liability', parent: 21, level: 2 },
                { id: 30, code: '3000', name: 'حقوق الملكية', type: 'equity', parent: null, level: 0 },
                { id: 31, code: '3100', name: 'رأس المال', type: 'equity', parent: 30, level: 1 },
                { id: 32, code: '3200', name: 'الأرباح المحتجزة', type: 'equity', parent: 30, level: 1 },
                { id: 40, code: '4000', name: 'الإيرادات', type: 'revenue', parent: null, level: 0 },
                { id: 41, code: '4100', name: 'المبيعات', type: 'revenue', parent: 40, level: 1 },
                { id: 42, code: '4200', name: 'المرتجعات', type: 'revenue', parent: 40, level: 1 },
                { id: 50, code: '5000', name: 'المصروفات', type: 'expense', parent: null, level: 0 },
                { id: 51, code: '5100', name: 'تكلفة المبيعات', type: 'expense', parent: 50, level: 1 },
                { id: 52, code: '5200', name: 'الرواتب والأجور', type: 'expense', parent: 50, level: 1 },
                { id: 53, code: '5300', name: 'الإيجارات', type: 'expense', parent: 50, level: 1 },
                { id: 54, code: '5400', name: 'الكهرباء والمياه', type: 'expense', parent: 50, level: 1 },
                { id: 55, code: '5500', name: 'الاتصالات', type: 'expense', parent: 50, level: 1 },
                { id: 56, code: '5600', name: 'المواصلات', type: 'expense', parent: 50, level: 1 },
                { id: 57, code: '5700', name: 'الصيانة', type: 'expense', parent: 50, level: 1 },
                { id: 58, code: '5800', name: 'مصروفات أخرى', type: 'expense', parent: 50, level: 1 }
            ];
            try {
                localStorage.setItem(STORAGE_PREFIX + 'accounts', JSON.stringify(window.accounts));
            } catch (e) {}
            changed = true;
        }

        if (changed) {
            console.log('✅ تم إنشاء البيانات الأولية');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: Balance API
    // ═══════════════════════════════════════════════════════════

    window.Balance = {
        cashBox: function(boxId) {
            const box = (window.cashBoxes || []).find(function(b) { return String(b.id) === String(boxId); });
            if (!box) return 0;

            let balance = parseFloat(box.openingBalance) || 0;

            (window.treasury || []).forEach(function(t) {
                if (String(t.cashBoxId) === String(boxId)) {
                    const amt = parseFloat(t.amount) || 0;
                    if (t.type === 'deposit') balance += amt;
                    else if (t.type === 'withdraw') balance -= amt;
                }
            });

            return Math.round(balance * 100) / 100;
        },

        totalCash: function() {
            return (window.cashBoxes || []).reduce(function(sum, box) {
                return sum + window.Balance.cashBox(box.id);
            }, 0);
        },

        customer: function(customerName) {
            if (!customerName || customerName === 'عميل نقدي') return 0;

            return (window.sales || [])
                .filter(function(s) {
                    return s.customer === customerName && s.paymentMethod === 'credit';
                })
                .reduce(function(sum, s) {
                    const remaining = s.remainingAmount !== undefined
                        ? s.remainingAmount
                        : (s.total || 0);
                    return sum + (parseFloat(remaining) || 0);
                }, 0);
        },

        supplier: function(supplierName) {
            if (!supplierName) return 0;

            return (window.purchases || [])
                .filter(function(p) {
                    return p.supplierName === supplierName && p.payment === 'credit';
                })
                .reduce(function(sum, p) {
                    const remaining = p.remainingAmount !== undefined
                        ? p.remainingAmount
                        : (p.total || 0);
                    return sum + (parseFloat(remaining) || 0);
                }, 0);
        },

        inventory: function() {
            return (window.products || []).reduce(function(sum, p) {
                const qty = parseFloat(p.qty) || 0;
                const buy = parseFloat(p.buy) || 0;
                return sum + (qty * buy);
            }, 0);
        },

        account: function(accountId) {
            let balance = 0;
            (window.journalEntries || []).forEach(function(entry) {
                (entry.lines || []).forEach(function(line) {
                    if (String(line.accountId) === String(accountId)) {
                        balance += (parseFloat(line.debit) || 0) - (parseFloat(line.credit) || 0);
                    }
                });
            });
            return balance;
        },

        accountType: function(type) {
            return (window.accounts || [])
                .filter(function(a) { return a.type === type; })
                .reduce(function(sum, acc) {
                    return sum + window.Balance.account(acc.id);
                }, 0);
        },

        customerPoints: function(customerName) {
            if (!customerName || customerName === 'عميل نقدي') return 0;

            let points = 0;
            (window.sales || []).forEach(function(s) {
                if (s.customer === customerName) {
                    points += Math.floor((s.total || 0) / 100) * window.LOYALTY_CONFIG.POINTS_PER_100;
                    if (s.redeemedPoints) points -= s.redeemedPoints;
                }
            });

            return Math.max(0, points);
        },

        customerLevel: function(customerName) {
            const total = (window.sales || [])
                .filter(function(s) { return s.customer === customerName; })
                .reduce(function(sum, s) { return sum + (s.total || 0); }, 0);

            const levels = window.LOYALTY_CONFIG.LEVELS;
            for (let i = levels.length - 1; i >= 0; i--) {
                if (total >= levels[i].min) return levels[i];
            }
            return levels[0];
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: Accounting
    // ═══════════════════════════════════════════════════════════

    window.Accounting = {
        createEntry: function(date, description, lines, reference) {
            if (!lines || lines.length < 2) return null;

            let totalDebit = 0, totalCredit = 0;
            lines.forEach(function(line) {
                totalDebit += parseFloat(line.debit) || 0;
                totalCredit += parseFloat(line.credit) || 0;
            });

            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                console.warn('⚠️ القيد غير متوازن:', totalDebit, '≠', totalCredit);
                return null;
            }

            const entry = {
                id: window.generateId('je_'),
                number: (window.journalEntries || []).length + 1,
                date: date || window.getTodayDate(),
                description: description,
                lines: lines,
                reference: reference || '',
                totalDebit: totalDebit,
                totalCredit: totalCredit,
                createdAt: new Date().toISOString(),
                createdBy: window.currentUser ? window.currentUser.name : 'system'
            };

            window.DataStore.add('journalEntries', entry);
            if (window.EventBus) window.EventBus.emit('accounting:entry:created', entry);

            return entry;
        },

        findByCode: function(code) {
            return (window.accounts || []).find(function(a) { return a.code === code; });
        },

        entrySale: function(invoice, isCash) {
            const salesAcc = window.Accounting.findByCode('4100');
            const cashAcc = window.Accounting.findByCode('1110');
            const customerAcc = window.Accounting.findByCode('1200');
            const cogsAcc = window.Accounting.findByCode('5100');
            const inventoryAcc = window.Accounting.findByCode('1300');

            if (!salesAcc) return;

            if (isCash && cashAcc) {
                window.Accounting.createEntry(invoice.date,
                    'فاتورة بيع نقدية #' + invoice.number,
                    [
                        { accountId: cashAcc.id, debit: invoice.total, credit: 0 },
                        { accountId: salesAcc.id, debit: 0, credit: invoice.total }
                    ], 'INV-' + invoice.number);
            } else if (customerAcc) {
                window.Accounting.createEntry(invoice.date,
                    'فاتورة بيع آجل #' + invoice.number,
                    [
                        { accountId: customerAcc.id, debit: invoice.total, credit: 0 },
                        { accountId: salesAcc.id, debit: 0, credit: invoice.total }
                    ], 'INV-' + invoice.number);
            }

            if (invoice.cogs > 0 && cogsAcc && inventoryAcc) {
                window.Accounting.createEntry(invoice.date,
                    'تكلفة مبيعات #' + invoice.number,
                    [
                        { accountId: cogsAcc.id, debit: invoice.cogs, credit: 0 },
                        { accountId: inventoryAcc.id, debit: 0, credit: invoice.cogs }
                    ], 'INV-' + invoice.number + '-COGS');
            }
        },

        entryPurchase: function(invoice, isCash) {
            const purchaseAcc = window.Accounting.findByCode('1300');
            const cashAcc = window.Accounting.findByCode('1110');
            const supplierAcc = window.Accounting.findByCode('2110');

            if (!purchaseAcc) return;

            if (isCash && cashAcc) {
                window.Accounting.createEntry(invoice.date,
                    'فاتورة شراء نقدية #' + invoice.number,
                    [
                        { accountId: purchaseAcc.id, debit: invoice.total, credit: 0 },
                        { accountId: cashAcc.id, debit: 0, credit: invoice.total }
                    ], 'PUR-' + invoice.number);
            } else if (supplierAcc) {
                window.Accounting.createEntry(invoice.date,
                    'فاتورة شراء آجل #' + invoice.number,
                    [
                        { accountId: purchaseAcc.id, debit: invoice.total, credit: 0 },
                        { accountId: supplierAcc.id, debit: 0, credit: invoice.total }
                    ], 'PUR-' + invoice.number);
            }
        },

        entryExpense: function(expense) {
            const expenseAcc = window.Accounting.findByCode('5800');
            const cashAcc = window.Accounting.findByCode('1110');

            if (!expenseAcc || !cashAcc) return;

            window.Accounting.createEntry(expense.date,
                'مصروف: ' + expense.note,
                [
                    { accountId: expenseAcc.id, debit: expense.amount, credit: 0 },
                    { accountId: cashAcc.id, debit: 0, credit: expense.amount }
                ], 'EXP-' + expense.id);
        },

        entryCollect: function(payment) {
            const cashAcc = window.Accounting.findByCode('1110');
            const customerAcc = window.Accounting.findByCode('1200');

            if (!cashAcc || !customerAcc) return;

            window.Accounting.createEntry(payment.date,
                'تحصيل من ' + payment.party,
                [
                    { accountId: cashAcc.id, debit: payment.amount, credit: 0 },
                    { accountId: customerAcc.id, debit: 0, credit: payment.amount }
                ], 'COL-' + payment.id);
        },

        entryPay: function(payment) {
            const supplierAcc = window.Accounting.findByCode('2110');
            const cashAcc = window.Accounting.findByCode('1110');

            if (!supplierAcc || !cashAcc) return;

            window.Accounting.createEntry(payment.date,
                'سداد لـ ' + payment.party,
                [
                    { accountId: supplierAcc.id, debit: payment.amount, credit: 0 },
                    { accountId: cashAcc.id, debit: 0, credit: payment.amount }
                ], 'PAY-' + payment.id);
        },

        removeByReference: function(reference) {
            const filtered = (window.journalEntries || []).filter(function(e) {
                return e.reference !== reference;
            });
            window.DataStore.set('journalEntries', filtered);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 10: مراقبة الاتصال
    // ═══════════════════════════════════════════════════════════

    window.addEventListener('online', function() {
        console.log('🟢 عاد الاتصال');
        if (window.CloudSync && window.CloudSync.isReady()) {
            setTimeout(function() {
                window.CloudSync.pushAll(true);
            }, 1500);
        }
    });

    window.addEventListener('offline', function() {
        console.log('🔴 انقطع الاتصال');
    });

    // ═══════════════════════════════════════════════════════════
    // الجزء 11: التهيئة
    // ═══════════════════════════════════════════════════════════

    window.DataStore.loadAll();
    console.log('✅ تم تحميل البيانات من localStorage');

    window.seedInitialData();

    window.__dataLoaded = true;
    console.log('✅ data.js v2.0 جاهز');

})();
