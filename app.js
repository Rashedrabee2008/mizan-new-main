// ============================================================
// الميزان 17.0 - app.js
// التطبيق الرئيسي: التنقل + تسجيل الدخول + الترجمة + الصلاحيات
// ============================================================

console.log('🚀 تحميل app.js v17.0');

// ═══════════════════════════════════════════════════════════
// Firebase Configuration
// ═══════════════════════════════════════════════════════════
window.firebaseConfig = {
    apiKey: "AIzaSyCP7vpqviR6A11gPkC7cO6MQJBGKWcnVWE",
    authDomain: "accounting-balance-ab9d3.firebaseapp.com",
    databaseURL: "https://accounting-balance-ab9d3-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "accounting-balance-ab9d3",
    storageBucket: "accounting-balance-ab9d3.firebasestorage.app",
    messagingSenderId: "564321427560",
    appId: "1:564321427560:web:ae44d18b626ad2e5771bdd"
};

window.firebaseReady = false;

// ═══════════════════════════════════════════════════════════
// المتغيرات الأساسية
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
window.employees = [];
window.attendance = [];
window.salaries = [];
window.currentSaleItems = [];
window.currentPurItems = [];
window.currentRetItems = [];
window.currentTreasuryFilter = 'all';
window.currentInvoiceFilter = 'all';
window.currentPayTab = 'collect';
window.currentUser = null;
window.currentReport = 'daily';
window.currentReportData = null;
window.currentCoupon = null;
window.currentPointsToRedeem = 0;
window.currentCustomerName = '';
window.companyData = { name: 'الميزان', phone: '', address: '', tax: '', footer: 'شكراً لتعاملكم معنا 🌟' };
window.vatSettings = { defaultVAT: 14 };

const STORAGE_KEY = 'mizan_';

// ═══════════════════════════════════════════════════════════
// أدوار المستخدمين
// ═══════════════════════════════════════════════════════════
window.ROLES = {
    admin:   { name: 'مدير',   icon: '👑', color: '#E06060' },
    manager: { name: 'مشرف',   icon: '📊', color: '#C9A94E' },
    cashier: { name: 'كاشير',  icon: '💰', color: '#4A8AB5' },
    seller:  { name: 'بائع',   icon: '🛒', color: '#E6A830' },
    viewer:  { name: 'مشاهد',  icon: '👁️', color: '#5D5D5D' }
};

// ═══════════════════════════════════════════════════════════
// الترجمة
// ═══════════════════════════════════════════════════════════
window.currentLang = localStorage.getItem('mizan_lang') || 'ar';

const TRANSLATIONS = {
    ar: {
        'app_name': 'الميزان',
        'nav_dashboard': 'الرئيسية',
        'nav_inventory': 'المخزون',
        'nav_cashier': 'الكاشير',
        'nav_reports': 'التقارير',
        'nav_more': 'المزيد'
    },
    en: {
        'app_name': 'Mizan',
        'nav_dashboard': 'Home',
        'nav_inventory': 'Inventory',
        'nav_cashier': 'Cashier',
        'nav_reports': 'Reports',
        'nav_more': 'More'
    }
};

window.t = function(key) {
    return (TRANSLATIONS[window.currentLang] && TRANSLATIONS[window.currentLang][key]) 
        || TRANSLATIONS.ar[key] 
        || key;
};

window.toggleLanguage = function() {
    window.currentLang = window.currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('mizan_lang', window.currentLang);
    document.documentElement.setAttribute('dir', window.currentLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', window.currentLang);
    if (typeof window.showToast === 'function') {
        window.showToast(window.currentLang === 'ar' ? '🌍 تم التحويل للعربية' : '🌍 Switched to English', 'info');
    }
};

// ═══════════════════════════════════════════════════════════
// Firebase
// ═══════════════════════════════════════════════════════════
window.initFirebase = function() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK غير محمّل');
            return false;
        }
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(window.firebaseConfig);
        }
        window.firebaseReady = true;
        console.log('✅ Firebase جاهز');
        return true;
    } catch (e) {
        console.error('❌ Firebase:', e.message);
        window.firebaseReady = false;
        return false;
    }
};

// ═══════════════════════════════════════════════════════════
// UI Helpers
// ═══════════════════════════════════════════════════════════
window.toggleMoreMenu = function() {
    const menu = document.getElementById('moreMenu');
    if (!menu) return;
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
};

window.updateClock = function() {
    const el = document.getElementById('liveDateTime');
    if (!el) return;
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');
    el.textContent = day + '/' + month + '/' + year + ' ' + hoursStr + ':' + minutes + ' ' + ampm;
    
    const invDateEl = document.getElementById('invDateDisplay');
    const invTimeEl = document.getElementById('invTimeDisplay');
    if (invDateEl) invDateEl.value = day + '/' + month + '/' + year;
    if (invTimeEl) invTimeEl.value = hoursStr + ':' + minutes + ' ' + ampm;
};

// ═══════════════════════════════════════════════════════════
// القيد المحاسبي
// ═══════════════════════════════════════════════════════════
window.createJournalEntry = function(date, description, lines, reference) {
    try {
        if (!window.journalEntries) window.journalEntries = [];
        
        let totalDebit = 0, totalCredit = 0;
        lines.forEach(function(line) {
            totalDebit += parseFloat(line.debit) || 0;
            totalCredit += parseFloat(line.credit) || 0;
        });
        
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            console.warn('⚠️ القيد غير متوازن');
            return null;
        }
        
        const entry = {
            id: Date.now() + Math.random(),
            number: window.journalEntries.length + 1,
            date: date || window.getTodayDate(),
            description: description,
            lines: lines,
            reference: reference || '',
            totalDebit: totalDebit,
            totalCredit: totalCredit,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUser ? window.currentUser.name : 'system'
        };
        
        window.journalEntries.push(entry);
        window.setData('journalEntries', window.journalEntries);
        return entry;
    } catch (e) {
        console.error('❌ فشل القيد:', e);
        return null;
    }
};

// ═══════════════════════════════════════════════════════════
// الصلاحيات
// ═══════════════════════════════════════════════════════════
window.hasPermission = function(permission) {
    if (!window.currentUser) return false;
    const role = window.currentUser.role;
    const permissions = {
        admin:   ['add', 'edit', 'delete', 'view', 'manage_users', 'settings', 'view_reports', 'clear_data', 'view_accounts'],
        manager: ['add', 'edit', 'view', 'view_reports', 'settings', 'view_accounts'],
        cashier: ['add', 'view', 'add_sale'],
        seller:  ['add_sale', 'view'],
        viewer:  ['view']
    };
    return (permissions[role] || []).indexOf(permission) > -1;
};

window.isAdmin = function() { return window.currentUser && window.currentUser.role === 'admin'; };
window.canAdd = function() { return window.hasPermission('add') || window.hasPermission('add_sale'); };
window.canEdit = function() { return window.hasPermission('edit'); };
window.canDelete = function() { return window.hasPermission('delete'); };
window.canManageUsers = function() { return window.hasPermission('manage_users'); };
window.canViewAccounts = function() { return window.hasPermission('view_accounts'); };

// ═══════════════════════════════════════════════════════════
// التنقل
// ═══════════════════════════════════════════════════════════
window.navigateTo = function(page) {
    document.querySelectorAll('.page-container').forEach(function(el) { 
        el.classList.remove('active'); 
    });
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(function(el) {
        el.classList.toggle('active', el.dataset.page === page);
    });

    const pageActions = {
        'dashboard': ['updateDashboard'],
        'inventory': ['renderProducts'],
        'cashier': ['populateSaleProducts', 'populateSaleCustomers', 'populateCashBoxDropdowns', 'populateWarehouseField', 'renderCashier', 'updateSaleTotals', 'updateSalePrice'],
        'purchases': ['populatePurProducts', 'populatePurSuppliers', 'populateCashBoxDropdowns', 'populateWarehouseField', 'renderPurItems', 'updatePurTotals', 'renderPurchases', 'updatePurStats'],
        'customers': ['renderCustomers'],
        'suppliers': ['renderSuppliers'],
        'cash-boxes': ['populateCashBoxDropdowns', 'renderCashBoxes'],
        'expenses': ['populateCashBoxDropdowns', 'renderExpenses', 'updateExpensesStats'],
        'treasury': ['populateCashBoxDropdowns', 'renderTreasury'],
        'invoices': ['updateInvoiceStats', 'renderInvoices'],
        'payments': ['populateCollectCustomers', 'populatePaySuppliers', 'populateCashBoxDropdowns', 'updatePaymentsStats', 'renderPayments'],
        'returns': ['toggleReturnParty', 'populateRetProducts', 'populateCashBoxDropdowns', 'populateWarehouseField', 'updateReturnsStats', 'renderReturns'],
        'accounts': ['renderAccounts', 'renderJournalEntries'],
        'erp': ['renderWarehouses', 'renderBranches', 'renderCurrencies'],
        'warehouses': ['populateWarehouseDropdowns', 'renderWarehouseReceipts', 'renderWarehouseIssues', 'renderWarehouseTransfers', 'renderWarehouseAdjustments', 'renderOpeningBalances'],
        'employees': ['renderEmployees'],
        'reports': ['renderReport'],
        'users': ['renderUsers'],
        'settings': ['renderSettings']
    };

    (pageActions[page] || []).forEach(function(fn) {
        if (typeof window[fn] === 'function') {
            try { window[fn](); } catch (e) {
                console.warn('⚠️ خطأ في ' + fn + ':', e.message);
            }
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ═══════════════════════════════════════════════════════════
// المستودعات
// ═══════════════════════════════════════════════════════════
window.populateWarehouseField = function() {
    const warehouses = window.warehouses || [];
    const ids = ['saleWarehouse', 'purWarehouse', 'retWarehouse'];
    
    ids.forEach(function(id) {
        const sel = document.getElementById(id);
        if (!sel) return;
        const cv = sel.value;
        let html = '<option value="">اختر المستودع...</option>';
        warehouses.forEach(function(w) {
            if (w.active !== false) {
                html += '<option value="' + w.id + '">' + w.name + '</option>';
            }
        });
        sel.innerHTML = html;
        
        if (cv) {
            sel.value = cv;
        } else {
            const mainWh = warehouses.find(function(w) { return w.type === 'main'; }) || warehouses[0];
            if (mainWh) sel.value = mainWh.id;
        }
    });
};

// ═══════════════════════════════════════════════════════════
// تسجيل الدخول
// ═══════════════════════════════════════════════════════════
window.populateLoginUsers = function() {
    const sel = document.getElementById('loginUsername');
    if (!sel) return;
    sel.innerHTML = '<option value="">اختر المستخدم...</option>';
    (window.users || []).forEach(function(u) {
        if (u.active !== false) {
            const roleInfo = window.ROLES[u.role] || { icon: '❓', name: u.role };
            sel.innerHTML += '<option value="' + u.id + '">' + roleInfo.icon + ' ' + u.name + ' (' + roleInfo.name + ')</option>';
        }
    });
};

window.checkLogin = async function() {
    const userId = document.getElementById('loginUsername') ? document.getElementById('loginUsername').value : '';
    const password = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '';
    const error = document.getElementById('loginError');

    if (typeof window.isAccountLocked === 'function') {
        const lockStatus = window.isAccountLocked();
        if (lockStatus.locked) {
            if (error) {
                error.textContent = '🚫 الحساب مقفل. حاول بعد ' + lockStatus.remaining + ' دقيقة';
                error.classList.add('show');
            }
            return;
        }
    }

    if (!userId) {
        if (error) { error.textContent = '⚠️ اختر المستخدم'; error.classList.add('show'); }
        return;
    }

    const user = (window.users || []).find(function(u) { return u.id == userId; });
    if (!user) {
        if (error) { error.textContent = '⚠️ المستخدم غير موجود'; error.classList.add('show'); }
        return;
    }

    let isValid = false;

    if (user.password && user.password.startsWith('pbkdf2_')) {
        try {
            if (typeof window.verifyPasswordPBKDF2 === 'function') {
                isValid = await window.verifyPasswordPBKDF2(password, user.password);
            }
        } catch (e) {
            console.warn('⚠️ PBKDF2 failed:', e.message);
            isValid = false;
        }
    }

    if (!isValid) {
        isValid = (user.password === password);
        
        if (isValid && typeof window.hashPasswordPBKDF2 === 'function' && typeof window.generateSalt === 'function') {
            try {
                const salt = window.generateSalt();
                user.password = await window.hashPasswordPBKDF2(password, salt);
                window.setData('users', window.users);
                console.log('🔐 تم ترقية كلمة المرور');
            } catch (e) {
                console.warn('⚠️ فشل التشفير:', e.message);
            }
        }
    }

    if (!isValid) {
        if (typeof window.recordFailedLogin === 'function') window.recordFailedLogin();
        if (error) { 
            error.textContent = '⚠️ كلمة المرور خاطئة'; 
            error.classList.add('show'); 
        }
        if (document.getElementById('loginPassword')) {
            document.getElementById('loginPassword').value = '';
        }
        setTimeout(function() { 
            if (error) error.classList.remove('show'); 
        }, 3000);
        return;
    }

    if (typeof window.recordSuccessfulLogin === 'function') {
        window.recordSuccessfulLogin();
    }

    window.currentUser = user;
    if (typeof window.saveSession === 'function') window.saveSession(user);
    localStorage.setItem('mizan_current_user', JSON.stringify({
        id: user.id, 
        name: user.name, 
        role: user.role
    }));

    if (error) error.classList.remove('show');
    if (document.getElementById('loginPassword')) {
        document.getElementById('loginPassword').value = '';
    }

    const loginCont = document.getElementById('loginContainer');
    const appCont = document.getElementById('appContent');
    if (loginCont) loginCont.classList.add('hidden');
    if (appCont) appCont.style.display = 'block';

    if (typeof window.updateUserUI === 'function') window.updateUserUI();
    if (typeof window.applyPermissions === 'function') window.applyPermissions();
    if (typeof window.showToast === 'function') {
        window.showToast('🔓 مرحباً ' + user.name + '!', 'success');
    }
    
    window.navigateTo('dashboard');
};

window.lockApp = function() {
    if (!confirm('⚠️ هل تريد تسجيل الخروج؟')) return;
    
    window.currentUser = null;
    localStorage.removeItem('mizan_current_user');
    if (typeof window.clearSession === 'function') window.clearSession();
    
    const loginCont = document.getElementById('loginContainer');
    const appCont = document.getElementById('appContent');
    if (loginCont) loginCont.classList.remove('hidden');
    if (appCont) appCont.style.display = 'none';
    
    if (document.getElementById('loginPassword')) {
        document.getElementById('loginPassword').value = '';
    }
    if (document.getElementById('loginUsername')) {
        document.getElementById('loginUsername').value = '';
    }
    
    window.populateLoginUsers();
    if (typeof window.showToast === 'function') window.showToast('🔒 تم تسجيل الخروج', 'info');
};

window.updateUserUI = function() {
    if (!window.currentUser) return;
    const el = document.getElementById('currentUserName');
    if (el) {
        const roleInfo = window.ROLES[window.currentUser.role] || { icon: '❓' };
        el.textContent = roleInfo.icon + ' ' + window.currentUser.name;
    }
};

window.applyPermissions = function() {
    if (!window.currentUser) return;
    document.querySelectorAll('[data-permission]').forEach(function(el) {
        const perm = el.dataset.permission;
        el.style.display = window.hasPermission(perm) ? '' : 'none';
    });
};

// ═══════════════════════════════════════════════════════════
// إدارة المستخدمين
// ═══════════════════════════════════════════════════════════
window.renderUsers = function() {
    const c = document.getElementById('userList');
    if (!c) return;
    
    if ((window.users || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-user-cog"></i><span>لا يوجد مستخدمين</span></div>';
        return;
    }
    
    let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 0.8fr 1.2fr;"><span>الاسم</span><span>الدور</span><span>الحالة</span><span></span></div>';
    
    window.users.forEach(function(u) {
        const roleInfo = window.ROLES[u.role] || { name: u.role, icon: '❓' };
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 0.8fr 1.2fr;">' +
            '<span><strong>' + u.name + '</strong></span>' +
            '<span>' + roleInfo.icon + ' ' + roleInfo.name + '</span>' +
            '<span style="color:' + (u.active !== false ? '#2D8F5E' : '#E06060') + ';">' + (u.active !== false ? '✅' : '⏸️') + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-warning btn-sm" onclick="editUser(' + u.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteUser(' + u.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    
    c.innerHTML = html;
};

window.saveUser = async function() {
    if (!window.canManageUsers()) { 
        window.showToast('⚠️ لا تملك صلاحية', 'error'); 
        return; 
    }
    
    const id = document.getElementById('userId') ? document.getElementById('userId').value : '';
    const name = document.getElementById('userName') ? document.getElementById('userName').value.trim() : '';
    const password = document.getElementById('userPassword') ? document.getElementById('userPassword').value.trim() : '';
    const role = document.getElementById('userRole') ? document.getElementById('userRole').value : 'cashier';
    
    if (!name || !password) { 
        window.showToast('⚠️ أدخل البيانات', 'error'); 
        return; 
    }
    
    let hashedPassword = password;
    try {
        if (typeof window.hashPasswordPBKDF2 === 'function') {
            const salt = window.generateSalt();
            hashedPassword = await window.hashPasswordPBKDF2(password, salt);
        }
    } catch (e) {}
    
    if (id) {
        const idx = window.users.findIndex(function(u) { return u.id == id; });
        if (idx > -1) { 
            window.users[idx] = Object.assign({}, window.users[idx], { 
                name: name, password: hashedPassword, role: role 
            }); 
            window.showToast('✅ تم التعديل', 'success'); 
        }
    } else {
        if (window.users.find(function(u) { return u.name === name; })) { 
            window.showToast('⚠️ الاسم موجود', 'warning'); 
            return; 
        }
        window.users.push({ 
            id: Date.now(), name: name, password: hashedPassword, 
            role: role, active: true 
        });
        window.showToast('✅ تم الإضافة', 'success');
    }
    
    window.setData('users', window.users);
    window.resetUserForm();
    window.renderUsers();
    window.populateLoginUsers();
};

window.resetUserForm = function() {
    ['userId','userName','userPassword'].forEach(function(id) { 
        const el = document.getElementById(id);
        if (el) el.value = ''; 
    });
    const roleEl = document.getElementById('userRole');
    if (roleEl) roleEl.value = 'cashier';
    const titleEl = document.getElementById('userFormTitle');
    if (titleEl) titleEl.textContent = '➕ إضافة مستخدم';
    const btnEl = document.getElementById('userSaveBtnText');
    if (btnEl) btnEl.textContent = 'إضافة';
};

window.editUser = function(id) {
    if (!window.canManageUsers()) { 
        window.showToast('⚠️ لا تملك صلاحية', 'error'); 
        return; 
    }
    const u = window.users.find(function(us) { return us.id == id; });
    if (!u) return;
    
    if (document.getElementById('userId')) document.getElementById('userId').value = u.id;
    if (document.getElementById('userName')) document.getElementById('userName').value = u.name;
    if (document.getElementById('userPassword')) document.getElementById('userPassword').value = '';
    if (document.getElementById('userRole')) document.getElementById('userRole').value = u.role;
    
    const titleEl = document.getElementById('userFormTitle');
    if (titleEl) titleEl.textContent = '✏️ تعديل';
    const btnEl = document.getElementById('userSaveBtnText');
    if (btnEl) btnEl.textContent = 'حفظ';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteUser = function(id) {
    if (!window.canManageUsers()) { 
        window.showToast('⚠️ لا تملك صلاحية', 'error'); 
        return; 
    }
    const u = window.users.find(function(us) { return us.id == id; });
    if (!u) return;
    if (!confirm('⚠️ حذف "' + u.name + '"؟')) return;
    
    window.users = window.users.filter(function(us) { return us.id !== id; });
    window.setData('users', window.users);
    window.renderUsers();
    window.populateLoginUsers();
    window.showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// الإعدادات
// ═══════════════════════════════════════════════════════════
window.renderSettings = function() {
    const c = window.companyData;
    const setVal = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };
    const setTxt = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    
    setVal('setCompanyName', c.name);
    setVal('setCompanyPhone', c.phone);
    setVal('setCompanyAddress', c.address);
    setVal('setCompanyTax', c.tax);
    setVal('setCompanyFooter', c.footer);
    
    setTxt('setProductsCount', (window.products || []).length);
    setTxt('setSalesCount', (window.sales || []).length);
    setTxt('setCustomersCount', (window.customers || []).length);
    setTxt('setSuppliersCount', (window.suppliers || []).length);
};

window.saveCompanySettings = function() {
    if (!window.isAdmin()) { 
        window.showToast('⚠️ لا تملك صلاحية', 'error'); 
        return; 
    }
    
    window.companyData.name = document.getElementById('setCompanyName') ? document.getElementById('setCompanyName').value.trim() : 'الميزان';
    window.companyData.phone = document.getElementById('setCompanyPhone') ? document.getElementById('setCompanyPhone').value.trim() : '';
    window.companyData.address = document.getElementById('setCompanyAddress') ? document.getElementById('setCompanyAddress').value.trim() : '';
    window.companyData.tax = document.getElementById('setCompanyTax') ? document.getElementById('setCompanyTax').value.trim() : '';
    window.companyData.footer = document.getElementById('setCompanyFooter') ? document.getElementById('setCompanyFooter').value.trim() : 'شكراً لتعاملكم معنا 🌟';
    
    window.setData('companyData', window.companyData);
    
    const headerCompany = document.getElementById('headerCompanyName');
    if (headerCompany) headerCompany.textContent = window.companyData.name;
    
    window.showToast('✅ تم الحفظ', 'success');
};

window.exportData = function() {
    const data = {
        version: '17.0',
        exportDate: new Date().toISOString(),
        products: window.products, sales: window.sales, purchases: window.purchases,
        customers: window.customers, suppliers: window.suppliers, cashBoxes: window.cashBoxes,
        expenses: window.expenses, treasury: window.treasury, payments: window.payments,
        returns: window.returns, users: window.users, accounts: window.accounts,
        journalEntries: window.journalEntries, coupons: window.coupons,
        companyData: window.companyData
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mizan_backup_' + window.getTodayDate() + '.json';
    a.click();
    window.showToast('✅ تم التصدير', 'success');
};

window.importData = function(event) {
    if (!window.isAdmin()) { 
        window.showToast('⚠️ لا تملك صلاحية', 'error'); 
        return; 
    }
    
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm('⚠️ سيتم استبدال البيانات. متابعة؟')) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            const keys = ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','accounts','journalEntries','coupons','companyData'];
            
            keys.forEach(function(k) {
                if (data[k]) {
                    if (Array.isArray(data[k])) {
                        window[k] = data[k];
                    } else {
                        window[k] = Object.values(data[k]);
                    }
                }
            });
            
            window.saveAll();
            window.showToast('✅ تم الاستيراد', 'success');
            setTimeout(function() { location.reload(); }, 1500);
        } catch (err) { 
            window.showToast('❌ ملف غير صالح', 'error'); 
        }
    };
    reader.readAsText(file);
    event.target.value = '';
};

window.saveAll = function() {
    const keys = ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','accounts','journalEntries','coupons','companyData'];
    keys.forEach(function(k) {
        window.setData(k, window[k]);
    });
};

window.clearAllData = function() {
    if (!window.isAdmin()) { 
        window.showToast('⚠️ لا تملك صلاحية', 'error'); 
        return; 
    }
    if (!confirm('⚠️ مسح جميع البيانات؟')) return;
    if (!confirm('⚠️ تأكيد نهائي؟')) return;
    
    const keys = ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','accounts','journalEntries','coupons','companyData'];
    keys.forEach(function(k) {
        localStorage.removeItem(STORAGE_KEY + k);
    });
    localStorage.removeItem('mizan_seeded_v3');
    location.reload();
};

// ═══════════════════════════════════════════════════════════
// تحديث كل الواجهة
// ═══════════════════════════════════════════════════════════
window.refreshAllUI = function() {
    const fns = [
        'renderProducts', 'updateDashboard', 'renderCustomers', 'renderSuppliers',
        'renderCashBoxes', 'renderExpenses', 'renderTreasury', 'renderInvoices',
        'renderPayments', 'renderReturns', 'renderUsers', 'populateLoginUsers',
        'populateSaleProducts', 'populateSaleCustomers', 'populatePurProducts',
        'populatePurSuppliers', 'populateCashBoxDropdowns', 'populateWarehouseField',
        'populateCollectCustomers', 'populatePaySuppliers', 'populateRetProducts',
        'updateInvoiceHeader', 'updatePurStats', 'updateExpensesStats',
        'updateInvoiceStats', 'updatePaymentsStats', 'updateReturnsStats',
        'renderSettings'
    ];
    
    fns.forEach(function(fn) {
        if (typeof window[fn] === 'function') {
            try { window[fn](); } catch (e) {
                console.warn('⚠️ خطأ في ' + fn + ':', e.message);
            }
        }
    });
};

// ═══════════════════════════════════════════════════════════
// التهيئة النهائية
// ═══════════════════════════════════════════════════════════
window.init = function() {
    console.log('🚀 بدء التهيئة v17.0...');

    window.products = window.toArray(window.getData('products', []));
    window.sales = window.toArray(window.getData('sales', []));
    window.purchases = window.toArray(window.getData('purchases', []));
    window.customers = window.toArray(window.getData('customers', []));
    window.suppliers = window.toArray(window.getData('suppliers', []));
    window.cashBoxes = window.toArray(window.getData('cashBoxes', []));
    window.expenses = window.toArray(window.getData('expenses', []));
    window.treasury = window.toArray(window.getData('treasury', []));
    window.payments = window.toArray(window.getData('payments', []));
    window.returns = window.toArray(window.getData('returns', []));
    window.users = window.toArray(window.getData('users', []));
    window.accounts = window.toArray(window.getData('accounts', []));
    window.journalEntries = window.toArray(window.getData('journalEntries', []));
    window.coupons = window.toArray(window.getData('coupons', []));
    window.warehouses = window.toArray(window.getData('warehouses', []));
    
    window.companyData = window.getData('companyData', { 
        name: 'الميزان', phone: '', address: '', tax: '', 
        footer: 'شكراً لتعاملكم معنا 🌟' 
    });

    if (window.products.length === 0 && !localStorage.getItem('mizan_seeded_v3')) {
        window.products = [
            { id: 1, name: 'قلم جاف', barcode: '1001', buy: 2, sell: 5, qty: 50, min: 10, warehouseStock: {} },
            { id: 2, name: 'كشكول 60 ورقة', barcode: '1002', buy: 8, sell: 15, qty: 30, min: 5, warehouseStock: {} },
            { id: 3, name: 'مسطرة 30 سم', barcode: '1003', buy: 3, sell: 7, qty: 40, min: 10, warehouseStock: {} }
        ];
        window.setData('products', window.products);
        localStorage.setItem('mizan_seeded_v3', 'true');
    }

    if (window.cashBoxes.length === 0) {
        window.cashBoxes = [
            { id: 1, name: 'نقدي', type: 'cash', icon: '💵', isDefault: true, active: true, openingBalance: 0 },
            { id: 2, name: 'فودافون كاش', type: 'wallet', icon: '📱', isDefault: false, active: true, openingBalance: 0 },
            { id: 3, name: 'انستاباي', type: 'wallet', icon: '💳', isDefault: false, active: true, openingBalance: 0 },
            { id: 4, name: 'بنك', type: 'bank', icon: '🏦', isDefault: false, active: true, openingBalance: 0 }
        ];
        window.setData('cashBoxes', window.cashBoxes);
    }

    if (window.users.length === 0) {
        window.users = [
            { id: 1, name: 'المدير',  password: '123456', role: 'admin',   active: true },
            { id: 2, name: 'محمد',   password: '123456', role: 'manager', active: true },
            { id: 3, name: 'أحمد',   password: '123456', role: 'cashier', active: true },
            { id: 4, name: 'علي',    password: '123456', role: 'seller',  active: true },
            { id: 5, name: 'زائر',   password: '123456', role: 'viewer',  active: true }
        ];
        window.setData('users', window.users);
    }

    if (window.warehouses.length === 0) {
        window.warehouses = [
            { id: 1, name: 'المستودع الرئيسي', type: 'main', location: 'المقر الرئيسي', manager: 'المدير', active: true }
        ];
        window.setData('warehouses', window.warehouses);
    }

    if (document.getElementById('expDate')) document.getElementById('expDate').value = window.getTodayDate();
    if (document.getElementById('collectDate')) document.getElementById('collectDate').value = window.getTodayDate();
    if (document.getElementById('payDate')) document.getElementById('payDate').value = window.getTodayDate();
    if (document.getElementById('headerCompanyName')) document.getElementById('headerCompanyName').textContent = window.companyData.name || 'الميزان';

    window.initFirebase();
    window.populateLoginUsers();

    const loginCont = document.getElementById('loginContainer');
    const appCont = document.getElementById('appContent');
    if (loginCont) loginCont.classList.remove('hidden');
    if (appCont) appCont.style.display = 'none';

    window.updateClock();
    window.refreshAllUI();

    console.log('✅ التطبيق جاهز!');
};

// ═══════════════════════════════════════════════════════════
// التشغيل التلقائي
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
    window.init();
    setInterval(window.updateClock, 1000);
    console.log('✅ app.js v17.0 كامل');
});

window.__appLoaded = true;
