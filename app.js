// ============================================================
// الميزان 17.0 - app.js
// التطبيق الرئيسي الشامل - الجزء 1 من 3
// ============================================================

console.log('🚀 تحميل app.js v17.0 - الجزء 1');

// ═══════════════════════════════════════════════════════════
// Firebase Configuration
// ═══════════════════════════════════════════════════════════
window.firebaseConfig = {
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
window.branches = [];
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
window.vatSettings = { defaultVAT: 14 };
window.LOYALTY_CONFIG = {
    POINTS_PER_100: 1,
    POINT_VALUE: 0.1,
    MIN_REDEEM_POINTS: 50,
    LEVELS: [
        { name: 'عادي',    min: 0,    icon: '🥉', color: '#A89070' },
        { name: 'فضي',     min: 500,  icon: '🥈', color: '#A8A8A8' },
        { name: 'ذهبي',    min: 2000, icon: '🥇', color: '#C9A94E' },
        { name: 'بلاتيني', min: 5000, icon: '💎', color: '#4A8AB5' }
    ]
};

const STORAGE_KEY = 'mizan_';

// ═══════════════════════════════════════════════════════════
// الأدوار
// ═══════════════════════════════════════════════════════════
window.ROLES = {
    admin:   { name: 'مدير',   icon: '👑', color: '#E06060' },
    manager: { name: 'مشرف',   icon: '📊', color: '#C9A94E' },
    cashier: { name: 'كاشير',  icon: '💰', color: '#4A8AB5' },
    seller:  { name: 'بائع',   icon: '🛒', color: '#E6A830' },
    viewer:  { name: 'مشاهد',  icon: '👁️', color: '#5D5D5D' }
};

// ═══════════════════════════════════════════════════════════
// أدوات مساعدة أساسية
// ═══════════════════════════════════════════════════════════
window.$ = function(id) { return document.getElementById(id); };

window.getTodayDate = function() { 
    return new Date().toISOString().split('T')[0]; 
};

window.getNowTime = function() { 
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return hours + ':' + minutes + ' ' + ampm;
};

window.formatMoney = function(n) { 
    const num = parseFloat(n);
    if (!isFinite(num) || isNaN(num)) return '0.00';
    return num.toFixed(2); 
};

window.toArray = function(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Object.values(data).filter(function(item) { 
        return item !== null && item !== undefined; 
    });
};

window.getData = function(key, def) {
    if (def === undefined) def = [];
    try {
        const d = localStorage.getItem('mizan_' + key);
        return d ? JSON.parse(d) : def;
    } catch (e) { return def; }
};

window.setData = function(key, data) {
    try { 
        localStorage.setItem('mizan_' + key, JSON.stringify(data)); 
        return true;
    } catch (e) {
        console.error('❌ خطأ في حفظ ' + key + ':', e.message);
        return false;
    }
};

window.showToast = function(msg, type) {
    type = type || 'info';
    const t = document.getElementById('toast');
    if (!t) { console.log('[' + type + '] ' + msg); return; }
    t.textContent = msg;
    t.className = 'toast show ' + type;
    clearTimeout(t._t);
    t._t = setTimeout(function() { t.className = 'toast'; }, 3000);
};

window.openModal = function(html) {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    let box = overlay.querySelector('.modal-box');
    if (!box) {
        box = document.createElement('div');
        box.className = 'modal-box';
        overlay.appendChild(box);
    }
    box.innerHTML = html;
    overlay.classList.add('show');
    overlay.onclick = function(e) { 
        if (e.target === overlay) window.closeModal(); 
    };
};

window.closeModal = function() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('show');
};

window.getRadioValue = function(name, defaultValue) {
    defaultValue = defaultValue || '';
    const el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : defaultValue;
};

window.setRadioValue = function(name, value) {
    const el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
};

window.getPaymentMethodLabel = function(method) {
    const labels = {
        'cash': '💵 نقدي', 'credit': '📝 آجل', 'wallet': '📱 موبايل',
        'visa': '💳 فيزا', 'bank': '🏦 تحويل', 'installment': '📅 تقسيط'
    };
    return labels[method] || method;
};

window.callIfExists = function(fnName, arg1, arg2) {
    if (typeof window[fnName] === 'function') {
        try {
            if (arg2 !== undefined) return window[fnName](arg1, arg2);
            if (arg1 !== undefined) return window[fnName](arg1);
            return window[fnName]();
        } catch (e) {
            console.error('❌ خطأ في ' + fnName + ':', e.message);
        }
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
        'company': ['renderCompany'],
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
// المستودعات - الحقول
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
    
    let users = window.users;
    
    if (!users || users.length === 0) {
        try {
            const stored = localStorage.getItem('mizan_users');
            if (stored) { users = JSON.parse(stored); window.users = users; }
        } catch (e) {}
    }
    
    if (!users || users.length === 0) {
        users = [
            { id: 1, name: 'المدير',  password: '123456', role: 'admin',   active: true },
            { id: 2, name: 'محمد',   password: '123456', role: 'manager', active: true },
            { id: 3, name: 'أحمد',   password: '123456', role: 'cashier', active: true },
            { id: 4, name: 'علي',    password: '123456', role: 'seller',  active: true },
            { id: 5, name: 'زائر',   password: '123456', role: 'viewer',  active: true }
        ];
        window.users = users;
        try { localStorage.setItem('mizan_users', JSON.stringify(users)); } catch (e) {}
    }
    
    let html = '<option value="">اختر المستخدم...</option>';
    users.forEach(function(u) {
        if (u.active !== false) {
            const roleInfo = window.ROLES[u.role] || { icon: '❓', name: u.role };
            html += '<option value="' + u.id + '">' + roleInfo.icon + ' ' + u.name + ' (' + roleInfo.name + ')</option>';
        }
    });
    sel.innerHTML = html;
};

window.checkLogin = function() {
    const userId = document.getElementById('loginUsername') ? document.getElementById('loginUsername').value : '';
    const password = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '';
    const error = document.getElementById('loginError');

    if (!userId) { if (error) { error.textContent = '⚠️ اختر المستخدم'; error.classList.add('show'); } return; }
    
    const user = (window.users || []).find(function(u) { return u.id == userId; });
    if (!user) { if (error) { error.textContent = '⚠️ المستخدم غير موجود'; error.classList.add('show'); } return; }
    
    if (user.password !== password) {
        if (error) { error.textContent = '⚠️ كلمة المرور خاطئة'; error.classList.add('show'); }
        if (document.getElementById('loginPassword')) document.getElementById('loginPassword').value = '';
        setTimeout(function() { if (error) error.classList.remove('show'); }, 3000);
        return;
    }

    window.currentUser = user;
    localStorage.setItem('mizan_current_user', JSON.stringify({ id: user.id, name: user.name, role: user.role }));

    if (error) error.classList.remove('show');
    if (document.getElementById('loginPassword')) document.getElementById('loginPassword').value = '';

    const loginCont = document.getElementById('loginContainer');
    const appCont = document.getElementById('appContent');
    if (loginCont) loginCont.classList.add('hidden');
    if (appCont) appCont.style.display = 'block';

    if (typeof window.updateUserUI === 'function') window.updateUserUI();
    window.showToast('🔓 مرحباً ' + user.name + '!', 'success');
    window.navigateTo('dashboard');
};

window.lockApp = function() {
    if (!confirm('⚠️ هل تريد تسجيل الخروج؟')) return;
    window.currentUser = null;
    localStorage.removeItem('mizan_current_user');
    
    const loginCont = document.getElementById('loginContainer');
    const appCont = document.getElementById('appContent');
    if (loginCont) loginCont.classList.remove('hidden');
    if (appCont) appCont.style.display = 'none';
    if (document.getElementById('loginPassword')) document.getElementById('loginPassword').value = '';
    if (document.getElementById('loginUsername')) document.getElementById('loginUsername').value = '';
    
    window.populateLoginUsers();
    window.showToast('🔒 تم تسجيل الخروج', 'info');
};

window.updateUserUI = function() {
    if (!window.currentUser) return;
    const el = document.getElementById('currentUserName');
    if (el) {
        const roleInfo = window.ROLES[window.currentUser.role] || { icon: '❓' };
        el.textContent = roleInfo.icon + ' ' + window.currentUser.name;
    }
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

window.saveUser = function() {
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
    
    if (id) {
        const idx = window.users.findIndex(function(u) { return u.id == id; });
        if (idx > -1) { 
            window.users[idx] = Object.assign({}, window.users[idx], { 
                name: name, password: password, role: role 
            }); 
            window.showToast('✅ تم التعديل', 'success'); 
        }
    } else {
        if (window.users.find(function(u) { return u.name === name; })) { 
            window.showToast('⚠️ الاسم موجود', 'warning'); 
            return; 
        }
        window.users.push({ 
            id: Date.now(), name: name, password: password, 
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
// نهاية الجزء 1
// ═══════════════════════════════════════════════════════════
console.log('✅ app.js v17.0 - الجزء 1 مكتمل');


// ═══════════════════════════════════════════════════════════
// الجزء 2: المخزون + الكاشير + المشتريات + العملاء + الخزائن + المصروفات
// ═══════════════════════════════════════════════════════════
console.log('🚀 app.js v17.0 - الجزء 2');

// ═══════════════════════════════════════════════════════════
// المنتجات (المخزون)
// ═══════════════════════════════════════════════════════════
window.saveProduct = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    
    const id = document.getElementById('productId') ? document.getElementById('productId').value : '';
    const name = document.getElementById('productName') ? document.getElementById('productName').value.trim() : '';
    const barcode = document.getElementById('productBarcode') ? document.getElementById('productBarcode').value.trim() : '';
    const buy = parseFloat(document.getElementById('productBuy') ? document.getElementById('productBuy').value : 0) || 0;
    const sell = parseFloat(document.getElementById('productSell') ? document.getElementById('productSell').value : 0) || 0;
    const qty = parseInt(document.getElementById('productQty') ? document.getElementById('productQty').value : 0) || 0;
    const min = parseInt(document.getElementById('productMin') ? document.getElementById('productMin').value : 5) || 5;

    if (!name) { window.showToast('⚠️ أدخل اسم المنتج', 'error'); return; }

    if (id) {
        const idx = (window.products || []).findIndex(function(p) { return p.id == id; });
        if (idx > -1) {
            window.products[idx] = Object.assign({}, window.products[idx], { 
                name: name, barcode: barcode, buy: buy, sell: sell, qty: qty, min: min 
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        if ((window.products || []).find(function(p) { return p.name === name; })) { 
            window.showToast('⚠️ الاسم موجود', 'warning'); 
            return; 
        }
        
        const mainWh = (window.warehouses || []).find(function(w) { return w.type === 'main'; }) 
            || (window.warehouses || [])[0];
        const warehouseStock = {};
        if (mainWh && qty > 0) {
            warehouseStock[mainWh.id] = qty;
        }
        
        window.products.push({ 
            id: Date.now(), 
            name: name, 
            barcode: barcode, 
            buy: buy, 
            sell: sell, 
            qty: qty, 
            min: min, 
            warehouseStock: warehouseStock 
        });
        window.showToast('✅ تم الإضافة', 'success');
    }
    
    window.setData('products', window.products);
    window.resetProductForm();
    window.renderProducts();
    if (typeof window.populateSaleProducts === 'function') window.populateSaleProducts();
    if (typeof window.populatePurProducts === 'function') window.populatePurProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
};

window.resetProductForm = function() {
    ['productId','productName','productBarcode','productBuy','productSell','productQty'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const minEl = document.getElementById('productMin');
    if (minEl) minEl.value = '5';
    const titleEl = document.getElementById('productFormTitle');
    if (titleEl) titleEl.textContent = '➕ إضافة منتج جديد';
    const btnEl = document.getElementById('productSaveBtnText');
    if (btnEl) btnEl.textContent = 'إضافة';
};

window.editProduct = function(id) {
    const p = (window.products || []).find(function(pr) { return pr.id == id; });
    if (!p) return;
    
    const setVal = function(elId, val) {
        const el = document.getElementById(elId);
        if (el) el.value = val;
    };
    
    setVal('productId', p.id);
    setVal('productName', p.name);
    setVal('productBarcode', p.barcode || '');
    setVal('productBuy', p.buy);
    setVal('productSell', p.sell);
    setVal('productQty', p.qty);
    setVal('productMin', p.min || 5);
    
    const titleEl = document.getElementById('productFormTitle');
    if (titleEl) titleEl.textContent = '✏️ تعديل المنتج';
    const btnEl = document.getElementById('productSaveBtnText');
    if (btnEl) btnEl.textContent = 'حفظ';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProduct = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const p = (window.products || []).find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (!confirm('⚠️ حذف "' + p.name + '"؟')) return;
    
    window.products = window.products.filter(function(pr) { return pr.id !== id; });
    window.setData('products', window.products);
    window.renderProducts();
    if (typeof window.populateSaleProducts === 'function') window.populateSaleProducts();
    if (typeof window.populatePurProducts === 'function') window.populatePurProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast('🗑️ تم الحذف', 'info');
};

window.renderProducts = function() {
    const c = document.getElementById('productList');
    if (!c) return;
    
    const searchInput = document.getElementById('inventorySearch');
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let filtered = window.products || [];
    
    if (search) {
        filtered = filtered.filter(function(p) {
            return (p.name || '').toLowerCase().indexOf(search) > -1 || 
                   (p.barcode || '').indexOf(search) > -1;
        });
    }

    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><span>لا توجد منتجات</span></div>';
        return;
    }
    
    let html = '<div class="table-header" style="grid-template-columns: 1.4fr 0.7fr 0.7fr 0.7fr 1.4fr;"><span>الاسم</span><span>الشراء</span><span>البيع</span><span>الكمية</span><span></span></div>';
    
    filtered.forEach(function(p) {
        const qtyColor = p.qty > (p.min || 5) ? '#C9A94E' : '#E06060';
        html += '<div class="table-row" style="grid-template-columns: 1.4fr 0.7fr 0.7fr 0.7fr 1.4fr;">' +
            '<span><strong>' + p.name + '</strong>' +
                (p.barcode ? '<br><small style="color:#A89070;font-size:9px;">' + p.barcode + '</small>' : '') +
            '</span>' +
            '<span style="color:#E06060;">' + window.formatMoney(p.buy) + '</span>' +
            '<span style="color:#2D8F5E;">' + window.formatMoney(p.sell) + '</span>' +
            '<span style="color:' + qtyColor + ';font-weight:900;">' + p.qty + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-warning btn-sm" onclick="editProduct(' + p.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteProduct(' + p.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الكاشير
// ═══════════════════════════════════════════════════════════
window.populateSaleProducts = function() {
    const sel = document.getElementById('saleProduct');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر منتج...</option>';
    (window.products || []).forEach(function(p) {
        sel.innerHTML += '<option value="' + p.id + '">' + p.name + ' (متاح: ' + p.qty + ')</option>';
    });
    sel.value = cv;
};

window.populateSaleCustomers = function() {
    const sel = document.getElementById('saleCustomer');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">عميل نقدي</option>';
    (window.customers || []).forEach(function(c) {
        sel.innerHTML += '<option value="' + c.name + '">' + c.name + '</option>';
    });
    sel.value = cv;
};

window.populateCashBoxDropdowns = function() {
    const ids = ['saleCashBox', 'purCashBox', 'expCashBox', 'manualCashBox', 'collectCashBox', 'payCashBox', 'retCashBox', 'salCashBox'];
    const boxes = (window.cashBoxes || []).filter(function(b) { return b.active !== false; });
    const defaultBox = boxes.find(function(b) { return b.isDefault; }) || boxes[0];

    ids.forEach(function(id) {
        const sel = document.getElementById(id);
        if (!sel) return;
        const cv = sel.value;
        let html = '<option value="">اختر الخزنة...</option>';
        boxes.forEach(function(box) {
            html += '<option value="' + box.id + '">' + (box.icon || '') + ' ' + box.name + (box.isDefault ? ' ⭐' : '') + '</option>';
        });
        sel.innerHTML = html;
        if (cv) {
            const exists = Array.from(sel.options).some(function(opt) { return opt.value == cv; });
            if (exists) sel.value = cv;
        } else if (defaultBox) {
            const exists = Array.from(sel.options).some(function(opt) { return opt.value == defaultBox.id; });
            if (exists) sel.value = defaultBox.id;
        }
    });
};

window.updateSalePrice = function() {
    const id = document.getElementById('saleProduct') ? document.getElementById('saleProduct').value : '';
    const priceInput = document.getElementById('salePrice');
    if (!id) { if (priceInput) priceInput.value = ''; return; }
    const product = (window.products || []).find(function(pr) { return pr.id == id; });
    if (product && priceInput) priceInput.value = product.sell;
};

window.addSaleItem = function() {
    const productSelect = document.getElementById('saleProduct');
    const qtyInput = document.getElementById('saleQty');
    const priceInput = document.getElementById('salePrice');
    const id = productSelect ? productSelect.value : '';
    let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

    if (!id) { window.showToast('⚠️ اختر منتج', 'error'); return; }
    const p = (window.products || []).find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (price <= 0) price = p.sell;
    if (qty <= 0) qty = 1;

    const saleWarehouseId = document.getElementById('saleWarehouse') ? document.getElementById('saleWarehouse').value : '';
    if (saleWarehouseId) {
        const whQty = (p.warehouseStock && p.warehouseStock[saleWarehouseId]) || 0;
        const existingItem = window.currentSaleItems.find(function(i) { return i.productId == id; });
        const totalRequested = qty + (existingItem ? existingItem.qty : 0);
        
        if (totalRequested > whQty) {
            const warehouse = (window.warehouses || []).find(function(w) { return w.id == saleWarehouseId; });
            window.showToast('⚠️ المتاح في ' + (warehouse ? warehouse.name : 'المستودع') + ': ' + whQty, 'error');
            return;
        }
    }

    const ex = window.currentSaleItems.find(function(i) { return i.productId == id; });
    if (ex) {
        ex.qty += qty;
        ex.price = price;
        ex.total = ex.qty * ex.price;
    } else {
        window.currentSaleItems.push({ 
            productId: p.id, name: p.name, qty: qty, price: price, 
            costPrice: p.buy, total: qty * price 
        });
    }

    if (qtyInput) qtyInput.value = 1;
    if (priceInput) priceInput.value = '';
    if (productSelect) productSelect.value = '';

    window.renderCashier();
    window.updateSaleTotals();
    window.showToast('✅ تم إضافة ' + p.name, 'success');
};

window.removeSaleItem = function(i) {
    window.currentSaleItems.splice(i, 1);
    window.renderCashier();
    window.updateSaleTotals();
};

window.renderCashier = function() {
    const c = document.getElementById('saleItemsContainer');
    const tb = document.getElementById('saleTotalBox');
    if (!c) return;
    
    const badge = document.getElementById('itemsCountBadge');
    if (badge) badge.textContent = window.currentSaleItems.length;

    if (window.currentSaleItems.length === 0) {
        c.innerHTML = '<div class="empty-items"><i class="fas fa-shopping-cart"></i><span>لا توجد أصناف</span><small>أضف صنف من الأعلى</small></div>';
        if (tb) tb.style.display = 'none';
        return;
    }

    let html = '<div class="items-header-row"><span>ID</span><span>اسم الصنف</span><span>الوحدة</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span></div>';
    window.currentSaleItems.forEach(function(it, i) {
        html += '<div class="item-row">' +
            '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
            '<span class="item-name">' + it.name + '</span>' +
            '<span class="item-unit">قطعة</span>' +
            '<span class="item-qty">' + it.qty + '</span>' +
            '<span class="item-price">' + window.formatMoney(it.price) + '</span>' +
            '<span class="item-total">' + window.formatMoney(it.qty * it.price) + '</span>' +
            '<button class="item-delete" onclick="removeSaleItem(' + i + ')"><i class="fas fa-times"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
    if (tb) tb.style.display = 'block';
};

window.updateSaleTotals = function() {
    const subtotal = window.currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
    const totalQty = window.currentSaleItems.reduce(function(s, i) { return s + i.qty; }, 0);
    const invoiceType = window.getRadioValue('saleInvoiceType', 'simple');
    const isTax = invoiceType === 'tax';
    const vat = isTax ? (subtotal * (window.vatSettings.defaultVAT / 100)) : 0;

    const discountValue = parseFloat(document.getElementById('saleDiscount') ? document.getElementById('saleDiscount').value : 0) || 0;
    const discountType = document.getElementById('saleDiscountType') ? document.getElementById('saleDiscountType').value : 'fixed';
    let discount = discountType === 'percent' ? (subtotal + vat) * (discountValue / 100) : discountValue;

    const levelDiscountValue = parseFloat(document.getElementById('saleLevelDiscount') ? document.getElementById('saleLevelDiscount').value : 0) || 0;
    const levelDiscountType = document.getElementById('saleLevelDiscountType') ? document.getElementById('saleLevelDiscountType').value : 'fixed';
    let levelDiscount = levelDiscountType === 'percent' ? (subtotal + vat) * (levelDiscountValue / 100) : levelDiscountValue;

    const grandTotal = Math.max(0, subtotal + vat - discount - levelDiscount);

    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('statItemsCount', window.currentSaleItems.length);
    set('statTotalQty', totalQty);
    set('saleSubtotal', window.formatMoney(subtotal));
    set('saleVAT', window.formatMoney(vat));
    set('saleTotal', window.formatMoney(grandTotal) + ' ج.م');
};

window.updateInvoiceHeader = function() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');

    const dateEl = document.getElementById('invDateDisplay');
    const timeEl = document.getElementById('invTimeDisplay');
    const numEl = document.getElementById('invNumberDisplay');
    
    if (dateEl) dateEl.value = day + '/' + month + '/' + year;
    if (timeEl) timeEl.value = hoursStr + ':' + minutes + ' ' + ampm;
    if (numEl) numEl.textContent = '#' + ((window.sales || []).length + 1);
};

window.saveSale = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    if (window.currentSaleItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }

    const saleWarehouseId = document.getElementById('saleWarehouse') ? document.getElementById('saleWarehouse').value : '';
    const saleWarehouse = (window.warehouses || []).find(function(w) { return w.id == saleWarehouseId; });
    
    if (!saleWarehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }

    for (let i = 0; i < window.currentSaleItems.length; i++) {
        const it = window.currentSaleItems[i];
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (!p) { window.showToast('⚠️ المنتج غير موجود', 'error'); return; }
        
        const whQty = (p.warehouseStock && p.warehouseStock[saleWarehouseId]) || 0;
        if (whQty < it.qty) {
            window.showToast('⚠️ الكمية غير كافية: ' + p.name + ' (متاح: ' + whQty + ')', 'error');
            return;
        }
    }

    const customer = document.getElementById('saleCustomer') ? document.getElementById('saleCustomer').value : 'عميل نقدي';
    const seller = document.getElementById('saleSeller') ? document.getElementById('saleSeller').value : '';
    const delivery = document.getElementById('saleDelivery') ? document.getElementById('saleDelivery').value : '';
    const shipping = document.getElementById('saleShipping') ? document.getElementById('saleShipping').value.trim() : '';
    const paymentMethod = window.getRadioValue('salePaymentMethod', 'cash');
    const invoiceType = window.getRadioValue('saleInvoiceType', 'simple');
    const isTax = invoiceType === 'tax';
    const cashBoxId = (document.getElementById('saleCashBox') ? document.getElementById('saleCashBox').value : '') 
        || ((window.cashBoxes || []).find(function(b) { return b.isDefault; }) || {}).id;
    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });

    const subtotal = window.currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
    const vat = isTax ? (subtotal * (window.vatSettings.defaultVAT / 100)) : 0;

    const discountValue = parseFloat(document.getElementById('saleDiscount') ? document.getElementById('saleDiscount').value : 0) || 0;
    const discountType = document.getElementById('saleDiscountType') ? document.getElementById('saleDiscountType').value : 'fixed';
    let discount = discountType === 'percent' ? (subtotal + vat) * (discountValue / 100) : discountValue;

    const levelDiscountValue = parseFloat(document.getElementById('saleLevelDiscount') ? document.getElementById('saleLevelDiscount').value : 0) || 0;
    const levelDiscountType = document.getElementById('saleLevelDiscountType') ? document.getElementById('saleLevelDiscountType').value : 'fixed';
    let levelDiscount = levelDiscountType === 'percent' ? (subtotal + vat) * (levelDiscountValue / 100) : levelDiscountValue;

    const total = Math.max(0, subtotal + vat - discount - levelDiscount);
    const today = window.getTodayDate();
    let cogsTotal = 0;

    window.currentSaleItems.forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) { 
            it.costPrice = p.buy; 
            cogsTotal += p.buy * it.qty; 
            p.qty -= it.qty;
            
            if (!p.warehouseStock) p.warehouseStock = {};
            p.warehouseStock[saleWarehouseId] = Math.max(0, (p.warehouseStock[saleWarehouseId] || 0) - it.qty);
        }
    });

    const isCash = ['cash', 'wallet', 'visa', 'bank'].indexOf(paymentMethod) > -1;
    const inv = {
        id: Date.now(), number: (window.sales || []).length + 1,
        warehouseId: saleWarehouseId,
        warehouseName: saleWarehouse ? saleWarehouse.name : '',
        customer: customer,
        seller: seller, delivery: delivery, shipping: shipping,
        paymentMethod: paymentMethod, invoiceType: invoiceType,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        subtotal: subtotal, vat: vat,
        discount: discount, levelDiscount: levelDiscount,
        total: total,
        cogs: cogsTotal, 
        profit: subtotal - cogsTotal - discount - levelDiscount,
        paidAmount: isCash ? total : 0,
        remainingAmount: isCash ? 0 : total,
        status: isCash ? 'paid' : 'unpaid',
        items: JSON.parse(JSON.stringify(window.currentSaleItems)),
        date: today, time: window.getNowTime(),
        soldBy: window.currentUser ? window.currentUser.name : ''
    };
    
    if (!window.sales) window.sales = [];
    window.sales.push(inv);

    if (isCash && cashBoxId) {
        window.treasury.push({
            id: Date.now() + 1, type: 'deposit', amount: total,
            note: 'فاتورة بيع #' + inv.number + ' - ' + customer,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'sale', refId: inv.id,
            date: today, time: window.getNowTime()
        });
    }

    window.setData('sales', window.sales);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);

    // إعادة تعيين
    window.currentSaleItems = [];
    const resetEls = ['saleCustomer', 'saleDelivery', 'saleShipping'];
    resetEls.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['saleDiscount', 'saleLevelDiscount'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '0';
    });

    window.setRadioValue('salePaymentMethod', 'cash');
    window.setRadioValue('saleInvoiceType', 'simple');

    window.populateWarehouseField();
    window.renderCashier();
    window.updateSaleTotals();
    window.populateSaleProducts();
    window.updateInvoiceHeader();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();

    window.showToast('✅ فاتورة #' + inv.number + ' - ' + window.formatMoney(total), 'success');
};

window.clearSale = function() {
    if (window.currentSaleItems.length === 0) return;
    if (!confirm('⚠️ إلغاء الفاتورة؟')) return;
    window.currentSaleItems = [];
    window.renderCashier();
    window.updateSaleTotals();
    window.showToast('🗑️ تم الإلغاء', 'info');
};

// ═══════════════════════════════════════════════════════════
// المشتريات
// ═══════════════════════════════════════════════════════════
window.populatePurProducts = function() {
    const sel = document.getElementById('purProduct');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر منتج...</option>';
    (window.products || []).forEach(function(p) {
        sel.innerHTML += '<option value="' + p.id + '">' + p.name + ' (شراء: ' + window.formatMoney(p.buy) + ')</option>';
    });
    sel.value = cv;
};

window.populatePurSuppliers = function() {
    const sel = document.getElementById('purSupplier');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر مورد...</option>';
    (window.suppliers || []).forEach(function(s) {
        sel.innerHTML += '<option value="' + s.name + '">' + s.name + '</option>';
    });
    sel.value = cv;
};

window.updatePurPrice = function() {
    const id = document.getElementById('purProduct') ? document.getElementById('purProduct').value : '';
    const priceInput = document.getElementById('purPrice');
    if (!id) { if (priceInput) priceInput.value = ''; return; }
    const product = (window.products || []).find(function(pr) { return pr.id == id; });
    if (product && priceInput) priceInput.value = product.buy;
};

window.addPurItem = function() {
    const productSelect = document.getElementById('purProduct');
    const qtyInput = document.getElementById('purQty');
    const priceInput = document.getElementById('purPrice');
    const id = productSelect ? productSelect.value : '';
    let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

    if (!id) { window.showToast('⚠️ اختر منتج', 'error'); return; }
    const p = (window.products || []).find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (price <= 0) price = p.buy;
    if (qty <= 0) qty = 1;

    const ex = window.currentPurItems.find(function(i) { return i.productId == id; });
    if (ex) {
        ex.qty += qty;
        ex.price = price;
        ex.total = ex.qty * ex.price;
    } else {
        window.currentPurItems.push({ productId: p.id, name: p.name, qty: qty, price: price, total: qty * price });
    }

    if (qtyInput) qtyInput.value = 1;
    if (priceInput) priceInput.value = '';
    if (productSelect) productSelect.value = '';

    window.renderPurItems();
    window.updatePurTotals();
    window.showToast('✅ تم الإضافة', 'success');
};

window.removePurItem = function(i) {
    window.currentPurItems.splice(i, 1);
    window.renderPurItems();
    window.updatePurTotals();
};

window.renderPurItems = function() {
    const c = document.getElementById('purItemsContainer');
    const tb = document.getElementById('purTotalBox');
    if (!c) return;

    if (window.currentPurItems.length === 0) {
        c.innerHTML = '<div class="empty-items"><i class="fas fa-shopping-cart"></i><span>لا توجد أصناف</span></div>';
        if (tb) tb.style.display = 'none';
        return;
    }

    let html = '<div class="items-header-row"><span>ID</span><span>اسم الصنف</span><span>الوحدة</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span></div>';
    window.currentPurItems.forEach(function(it, i) {
        html += '<div class="item-row">' +
            '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
            '<span class="item-name">' + it.name + '</span>' +
            '<span class="item-unit">قطعة</span>' +
            '<span class="item-qty">' + it.qty + '</span>' +
            '<span class="item-price">' + window.formatMoney(it.price) + '</span>' +
            '<span class="item-total" style="color:#E06060;">' + window.formatMoney(it.qty * it.price) + '</span>' +
            '<button class="item-delete" onclick="removePurItem(' + i + ')"><i class="fas fa-times"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
    if (tb) tb.style.display = 'block';
};

window.updatePurTotals = function() {
    const subtotal = window.currentPurItems.reduce(function(s, i) { return s + i.total; }, 0);
    const totalQty = window.currentPurItems.reduce(function(s, i) { return s + i.qty; }, 0);
    
    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    
    set('purStatItemsCount', window.currentPurItems.length);
    set('purStatTotalQty', totalQty);
    set('purSubtotal', window.formatMoney(subtotal));
    set('purTotal', window.formatMoney(subtotal) + ' ج.م');
};

window.savePurchase = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    if (window.currentPurItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }
    
    const supplierName = document.getElementById('purSupplier') ? document.getElementById('purSupplier').value : '';
    if (!supplierName) { window.showToast('⚠️ اختر مورد', 'error'); return; }

    const purWarehouseId = document.getElementById('purWarehouse') ? document.getElementById('purWarehouse').value : '';
    const purWarehouse = (window.warehouses || []).find(function(w) { return w.id == purWarehouseId; });
    
    if (!purWarehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }

    const payment = document.getElementById('purPayment') ? document.getElementById('purPayment').value : 'cash';
    const cashBoxId = (document.getElementById('purCashBox') ? document.getElementById('purCashBox').value : '') 
        || ((window.cashBoxes || []).find(function(b) { return b.isDefault; }) || {}).id;
    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });
    const notes = document.getElementById('purNotes') ? document.getElementById('purNotes').value.trim() : '';
    const subtotal = window.currentPurItems.reduce(function(s, i) { return s + i.total; }, 0);
    const today = window.getTodayDate();

    window.currentPurItems.forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) { 
            p.qty += it.qty; 
            p.buy = it.price;
            
            if (!p.warehouseStock) p.warehouseStock = {};
            p.warehouseStock[purWarehouseId] = (p.warehouseStock[purWarehouseId] || 0) + it.qty;
        }
    });

    const isCash = payment === 'cash';
    const inv = {
        id: Date.now(), number: (window.purchases || []).length + 1,
        warehouseId: purWarehouseId,
        warehouseName: purWarehouse ? purWarehouse.name : '',
        supplierName: supplierName, notes: notes, 
        subtotal: subtotal, total: subtotal,
        payment: payment, cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        paidAmount: isCash ? subtotal : 0,
        remainingAmount: isCash ? 0 : subtotal,
        status: isCash ? 'paid' : 'unpaid',
        items: JSON.parse(JSON.stringify(window.currentPurItems)),
        date: today, time: window.getNowTime(),
        purchasedBy: window.currentUser ? window.currentUser.name : ''
    };
    
    if (!window.purchases) window.purchases = [];
    window.purchases.push(inv);

    if (isCash && cashBoxId) {
        window.treasury.push({
            id: Date.now() + 1, type: 'withdraw', amount: subtotal,
            note: 'فاتورة شراء #' + inv.number + ' - ' + supplierName,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'purchase', refId: inv.id,
            date: today, time: window.getNowTime()
        });
    }

    window.setData('purchases', window.purchases);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);

    window.currentPurItems = [];
    const resetEls = ['purSupplier', 'purNotes'];
    resetEls.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    window.populateWarehouseField();
    window.renderPurItems();
    window.updatePurTotals();
    window.renderPurchases();
    window.updatePurStats();
    window.populatePurProducts();
    window.populateSaleProducts();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();

    window.showToast('✅ فاتورة شراء #' + inv.number, 'success');
};

window.clearPurchase = function() {
    if (window.currentPurItems.length === 0) return;
    if (!confirm('⚠️ إلغاء؟')) return;
    window.currentPurItems = [];
    window.renderPurItems();
    window.updatePurTotals();
    window.showToast('🗑️ تم الإلغاء', 'info');
};

window.updatePurStats = function() {
    const total = (window.purchases || []).reduce(function(s, p) { return s + (p.total || 0); }, 0);
    const today = (window.purchases || []).filter(function(p) { return p.date === window.getTodayDate(); })
        .reduce(function(s, p) { return s + (p.total || 0); }, 0);
    
    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    
    set('purTotalCount', (window.purchases || []).length);
    set('purTotalAmount', window.formatMoney(total));
    set('purTodayAmount', window.formatMoney(today));
};

window.renderPurchases = function() {
    const c = document.getElementById('purchasesList');
    if (!c) return;
    if ((window.purchases || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><span>لا توجد فواتير</span></div>';
        return;
    }
    const sorted = window.purchases.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 30);
    let html = '<div class="table-header" style="grid-template-columns: 0.5fr 1.2fr 1fr 0.8fr 0.8fr 1.2fr;"><span>#</span><span>المورد</span><span>المبلغ</span><span>الدفع</span><span>التاريخ</span><span></span></div>';
    sorted.forEach(function(inv) {
        const statusLabel = inv.status === 'paid' ? '✅ نقدي' : '📝 آجل';
        html += '<div class="table-row" style="grid-template-columns: 0.5fr 1.2fr 1fr 0.8fr 0.8fr 1.2fr;">' +
            '<span>#' + inv.number + '</span>' +
            '<span><strong>' + inv.supplierName + '</strong></span>' +
            '<span style="color:#E06060;font-weight:700;">' + window.formatMoney(inv.total) + '</span>' +
            '<span style="font-size:10px;">' + statusLabel + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + inv.date + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-danger btn-sm" onclick="deletePurchase(' + inv.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.deletePurchase = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const inv = (window.purchases || []).find(function(p) { return p.id == id; });
    if (!inv) return;
    if (!confirm('⚠️ حذف فاتورة #' + inv.number + '؟')) return;
    
    (inv.items || []).forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) {
            p.qty -= it.qty;
            if (inv.warehouseId && p.warehouseStock) {
                p.warehouseStock[inv.warehouseId] = Math.max(0, (p.warehouseStock[inv.warehouseId] || 0) - it.qty);
            }
        }
    });
    
    window.treasury = window.treasury.filter(function(t) { return !(t.refType === 'purchase' && t.refId === id); });
    window.purchases = window.purchases.filter(function(p) { return p.id !== id; });

    window.setData('purchases', window.purchases);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);
    
    window.renderPurchases();
    window.updatePurStats();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    
    window.showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// العملاء
// ═══════════════════════════════════════════════════════════
window.saveCustomer = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    
    const id = document.getElementById('customerId') ? document.getElementById('customerId').value : '';
    const name = document.getElementById('customerName') ? document.getElementById('customerName').value.trim() : '';
    const phone = document.getElementById('customerPhone') ? document.getElementById('customerPhone').value.trim() : '';
    const whatsapp = document.getElementById('customerWhatsapp') ? document.getElementById('customerWhatsapp').value.trim() : '';
    const address = document.getElementById('customerAddress') ? document.getElementById('customerAddress').value.trim() : '';
    
    if (!name) { window.showToast('⚠️ أدخل اسم العميل', 'error'); return; }

    if (id) {
        const idx = (window.customers || []).findIndex(function(c) { return c.id == id; });
        if (idx > -1) {
            window.customers[idx] = Object.assign({}, window.customers[idx], { 
                name: name, phone: phone, whatsapp: whatsapp, address: address 
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        if ((window.customers || []).find(function(c) { return c.name === name; })) { 
            window.showToast('⚠️ الاسم موجود', 'warning'); return; 
        }
        window.customers.push({ id: Date.now(), name: name, phone: phone, whatsapp: whatsapp, address: address });
        window.showToast('✅ تم إضافة العميل', 'success');
    }
    
    window.setData('customers', window.customers);
    window.resetCustomerForm();
    window.renderCustomers();
    if (typeof window.populateSaleCustomers === 'function') window.populateSaleCustomers();
    if (typeof window.populateCollectCustomers === 'function') window.populateCollectCustomers();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
};

window.resetCustomerForm = function() {
    ['customerId','customerName','customerPhone','customerWhatsapp','customerAddress'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const titleEl = document.getElementById('customerFormTitle');
    if (titleEl) titleEl.textContent = '➕ إضافة عميل';
    const btnEl = document.getElementById('customerSaveBtnText');
    if (btnEl) btnEl.textContent = 'إضافة';
};

window.editCustomer = function(id) {
    const c = (window.customers || []).find(function(cu) { return cu.id == id; });
    if (!c) return;
    
    const setVal = function(elId, val) {
        const el = document.getElementById(elId);
        if (el) el.value = val;
    };
    
    setVal('customerId', c.id);
    setVal('customerName', c.name);
    setVal('customerPhone', c.phone || '');
    setVal('customerWhatsapp', c.whatsapp || '');
    setVal('customerAddress', c.address || '');
    
    const titleEl = document.getElementById('customerFormTitle');
    if (titleEl) titleEl.textContent = '✏️ تعديل';
    const btnEl = document.getElementById('customerSaveBtnText');
    if (btnEl) btnEl.textContent = 'حفظ';
};

window.deleteCustomer = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const c = (window.customers || []).find(function(cu) { return cu.id == id; });
    if (!c) return;
    if (!confirm('⚠️ حذف "' + c.name + '"؟')) return;
    
    window.customers = window.customers.filter(function(cu) { return cu.id !== id; });
    window.setData('customers', window.customers);
    window.renderCustomers();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast('🗑️ تم الحذف', 'info');
};

window.renderCustomers = function() {
    const c = document.getElementById('customerList');
    if (!c) return;
    
    const searchInput = document.getElementById('customerSearch');
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let filtered = window.customers || [];
    
    if (search) {
        filtered = filtered.filter(function(cu) { 
            return (cu.name || '').toLowerCase().indexOf(search) > -1; 
        });
    }
    
    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><span>لا يوجد عملاء</span></div>';
        return;
    }
    
    let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;"><span>الاسم</span><span>الهاتف</span><span>المديونية</span><span></span></div>';
    
    filtered.forEach(function(cu) {
        const balance = typeof window.getCustomerBalance === 'function' ? window.getCustomerBalance(cu.name) : 0;
        
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;">' +
            '<span><strong>' + cu.name + '</strong>' +
                (cu.address ? '<br><small style="color:#A89070;font-size:9px;">📍 ' + cu.address + '</small>' : '') +
            '</span>' +
            '<span style="font-size:11px;color:#A89070;">' + (cu.phone || '-') + '</span>' +
            '<span style="color:' + (balance > 0 ? '#E06060' : '#2D8F5E') + ';font-weight:900;">' + window.formatMoney(balance) + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-warning btn-sm" onclick="editCustomer(' + cu.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteCustomer(' + cu.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الموردين
// ═══════════════════════════════════════════════════════════
window.saveSupplier = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    
    const id = document.getElementById('supplierId') ? document.getElementById('supplierId').value : '';
    const name = document.getElementById('supplierName') ? document.getElementById('supplierName').value.trim() : '';
    const phone = document.getElementById('supplierPhone') ? document.getElementById('supplierPhone').value.trim() : '';
    const whatsapp = document.getElementById('supplierWhatsapp') ? document.getElementById('supplierWhatsapp').value.trim() : '';
    const address = document.getElementById('supplierAddress') ? document.getElementById('supplierAddress').value.trim() : '';
    
    if (!name) { window.showToast('⚠️ أدخل اسم المورد', 'error'); return; }

    if (id) {
        const idx = (window.suppliers || []).findIndex(function(s) { return s.id == id; });
        if (idx > -1) {
            window.suppliers[idx] = Object.assign({}, window.suppliers[idx], { 
                name: name, phone: phone, whatsapp: whatsapp, address: address 
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        if ((window.suppliers || []).find(function(s) { return s.name === name; })) { 
            window.showToast('⚠️ الاسم موجود', 'warning'); return; 
        }
        window.suppliers.push({ id: Date.now(), name: name, phone: phone, whatsapp: whatsapp, address: address });
        window.showToast('✅ تم إضافة المورد', 'success');
    }
    
    window.setData('suppliers', window.suppliers);
    window.resetSupplierForm();
    window.renderSuppliers();
    if (typeof window.populatePurSuppliers === 'function') window.populatePurSuppliers();
    if (typeof window.populatePaySuppliers === 'function') window.populatePaySuppliers();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
};

window.resetSupplierForm = function() {
    ['supplierId','supplierName','supplierPhone','supplierWhatsapp','supplierAddress'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const titleEl = document.getElementById('supplierFormTitle');
    if (titleEl) titleEl.textContent = '➕ إضافة مورد';
    const btnEl = document.getElementById('supplierSaveBtnText');
    if (btnEl) btnEl.textContent = 'إضافة';
};

window.editSupplier = function(id) {
    const s = (window.suppliers || []).find(function(su) { return su.id == id; });
    if (!s) return;
    
    const setVal = function(elId, val) {
        const el = document.getElementById(elId);
        if (el) el.value = val;
    };
    
    setVal('supplierId', s.id);
    setVal('supplierName', s.name);
    setVal('supplierPhone', s.phone || '');
    setVal('supplierWhatsapp', s.whatsapp || '');
    setVal('supplierAddress', s.address || '');
    
    const titleEl = document.getElementById('supplierFormTitle');
    if (titleEl) titleEl.textContent = '✏️ تعديل';
    const btnEl = document.getElementById('supplierSaveBtnText');
    if (btnEl) btnEl.textContent = 'حفظ';
};

window.deleteSupplier = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const s = (window.suppliers || []).find(function(su) { return su.id == id; });
    if (!s) return;
    if (!confirm('⚠️ حذف "' + s.name + '"؟')) return;
    
    window.suppliers = window.suppliers.filter(function(su) { return su.id !== id; });
    window.setData('suppliers', window.suppliers);
    window.renderSuppliers();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast('🗑️ تم الحذف', 'info');
};

window.renderSuppliers = function() {
    const c = document.getElementById('supplierList');
    if (!c) return;
    
    const searchInput = document.getElementById('supplierSearch');
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let filtered = window.suppliers || [];
    
    if (search) {
        filtered = filtered.filter(function(s) { 
            return (s.name || '').toLowerCase().indexOf(search) > -1; 
        });
    }
    
    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-truck"></i><span>لا يوجد موردين</span></div>';
        return;
    }
    
    let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;"><span>الاسم</span><span>الهاتف</span><span>المديونية</span><span></span></div>';
    
    filtered.forEach(function(s) {
        const balance = typeof window.getSupplierBalance === 'function' ? window.getSupplierBalance(s.name) : 0;
        
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;">' +
            '<span><strong>' + s.name + '</strong>' +
                (s.address ? '<br><small style="color:#A89070;font-size:9px;">📍 ' + s.address + '</small>' : '') +
            '</span>' +
            '<span style="font-size:11px;color:#A89070;">' + (s.phone || '-') + '</span>' +
            '<span style="color:' + (balance > 0 ? '#E6A830' : '#2D8F5E') + ';font-weight:900;">' + window.formatMoney(balance) + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-warning btn-sm" onclick="editSupplier(' + s.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteSupplier(' + s.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الخزائن
// ═══════════════════════════════════════════════════════════
window.getCashBoxById = function(id) { return (window.cashBoxes || []).find(function(b) { return b.id == id; }); };
window.getDefaultCashBox = function() { return (window.cashBoxes || []).find(function(b) { return b.isDefault; }) || (window.cashBoxes || [])[0]; };

window.getCashBoxBalance = function(boxId) {
    let balance = 0;
    const box = window.getCashBoxById(boxId);
    if (box && box.openingBalance) balance += parseFloat(box.openingBalance) || 0;
    (window.treasury || []).forEach(function(t) {
        if (t.cashBoxId == boxId) {
            if (t.type === 'deposit') balance += (parseFloat(t.amount) || 0);
            else if (t.type === 'withdraw') balance -= (parseFloat(t.amount) || 0);
        }
    });
    return balance;
};

window.getTotalCashBalance = function() {
    return (window.cashBoxes || []).reduce(function(s, box) { return s + window.getCashBoxBalance(box.id); }, 0);
};

window.getBoxTypeName = function(type) {
    const types = { 'cash': '💵 نقدي', 'wallet': '📱 محفظة', 'bank': '🏦 بنكي', 'visa': '💳 فيزا', 'other': '📋 أخرى' };
    return types[type] || type;
};

window.saveCashBox = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    
    const id = document.getElementById('cashBoxId') ? document.getElementById('cashBoxId').value : '';
    const name = document.getElementById('cashBoxName') ? document.getElementById('cashBoxName').value.trim() : '';
    const type = document.getElementById('cashBoxType') ? document.getElementById('cashBoxType').value : 'cash';
    const icon = document.getElementById('cashBoxIcon') ? document.getElementById('cashBoxIcon').value : '💵';
    const details = document.getElementById('cashBoxDetails') ? document.getElementById('cashBoxDetails').value.trim() : '';
    const openingBalance = parseFloat(document.getElementById('cashBoxOpeningBalance') ? document.getElementById('cashBoxOpeningBalance').value : 0) || 0;
    const isDefault = document.getElementById('cashBoxIsDefault') ? document.getElementById('cashBoxIsDefault').checked : false;
    
    if (!name) { window.showToast('⚠️ أدخل اسم الخزنة', 'error'); return; }

    if (id) {
        const idx = (window.cashBoxes || []).findIndex(function(b) { return b.id == id; });
        if (idx > -1) {
            if (isDefault) window.cashBoxes.forEach(function(b) { b.isDefault = false; });
            window.cashBoxes[idx] = Object.assign({}, window.cashBoxes[idx], { 
                name: name, type: type, icon: icon, details: details, 
                openingBalance: openingBalance, isDefault: isDefault || window.cashBoxes[idx].isDefault 
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        if ((window.cashBoxes || []).find(function(b) { return b.name === name; })) { 
            window.showToast('⚠️ الاسم موجود', 'warning'); return; 
        }
        if (isDefault) window.cashBoxes.forEach(function(b) { b.isDefault = false; });
        window.cashBoxes.push({ 
            id: Date.now(), name: name, type: type, icon: icon, 
            details: details, openingBalance: openingBalance, 
            isDefault: isDefault || window.cashBoxes.length === 0, active: true 
        });
        window.showToast('✅ تم الإضافة', 'success');
    }
    
    window.setData('cashBoxes', window.cashBoxes);
    window.resetCashBoxForm();
    window.renderCashBoxes();
    window.populateCashBoxDropdowns();
};

window.resetCashBoxForm = function() {
    ['cashBoxId','cashBoxName','cashBoxDetails'].forEach(function(id) { 
        const el = document.getElementById(id);
        if (el) el.value = ''; 
    });
    if (document.getElementById('cashBoxType')) document.getElementById('cashBoxType').value = 'cash';
    if (document.getElementById('cashBoxIcon')) document.getElementById('cashBoxIcon').value = '💵';
    if (document.getElementById('cashBoxOpeningBalance')) document.getElementById('cashBoxOpeningBalance').value = '0';
    if (document.getElementById('cashBoxIsDefault')) document.getElementById('cashBoxIsDefault').checked = false;
    const titleEl = document.getElementById('cashBoxFormTitle');
    if (titleEl) titleEl.textContent = '➕ إضافة خزنة جديدة';
};

window.editCashBox = function(id) {
    const box = window.getCashBoxById(id);
    if (!box) return;
    
    if (document.getElementById('cashBoxId')) document.getElementById('cashBoxId').value = box.id;
    if (document.getElementById('cashBoxName')) document.getElementById('cashBoxName').value = box.name;
    if (document.getElementById('cashBoxType')) document.getElementById('cashBoxType').value = box.type;
    if (document.getElementById('cashBoxIcon')) document.getElementById('cashBoxIcon').value = box.icon || '💵';
    if (document.getElementById('cashBoxDetails')) document.getElementById('cashBoxDetails').value = box.details || '';
    if (document.getElementById('cashBoxOpeningBalance')) document.getElementById('cashBoxOpeningBalance').value = box.openingBalance || 0;
    if (document.getElementById('cashBoxIsDefault')) document.getElementById('cashBoxIsDefault').checked = box.isDefault || false;
    
    const titleEl = document.getElementById('cashBoxFormTitle');
    if (titleEl) titleEl.textContent = '✏️ تعديل';
    const btnEl = document.getElementById('cashBoxSaveBtnText');
    if (btnEl) btnEl.textContent = 'حفظ';
};

window.deleteCashBox = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const box = window.getCashBoxById(id);
    if (!box) return;
    if (box.isDefault) { window.showToast('⚠️ لا يمكن حذف الافتراضية', 'error'); return; }
    
    const balance = window.getCashBoxBalance(id);
    if (balance !== 0) {
        if (!confirm('⚠️ الخزنة فيها ' + window.formatMoney(balance) + ' ج.م. متابعة؟')) return;
    } else {
        if (!confirm('⚠️ حذف "' + box.name + '"؟')) return;
    }
    
    window.cashBoxes = window.cashBoxes.filter(function(b) { return b.id != id; });
    window.setData('cashBoxes', window.cashBoxes);
    window.renderCashBoxes();
    window.populateCashBoxDropdowns();
    window.showToast('🗑️ تم الحذف', 'info');
};

window.setDefaultCashBox = function(id) {
    window.cashBoxes.forEach(function(b) { b.isDefault = false; });
    const box = window.getCashBoxById(id);
    if (box) box.isDefault = true;
    window.setData('cashBoxes', window.cashBoxes);
    window.renderCashBoxes();
    window.populateCashBoxDropdowns();
    window.showToast('⭐ تم التعيين', 'success');
};

window.renderCashBoxes = function() {
    const c = document.getElementById('cashBoxList');
    if (!c) return;
    
    if ((window.cashBoxes || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-vault"></i><span>لا توجد خزائن</span></div>';
        if (document.getElementById('cbCount')) document.getElementById('cbCount').textContent = '0';
        if (document.getElementById('cbTotal')) document.getElementById('cbTotal').textContent = '0.00';
        return;
    }
    
    const total = window.getTotalCashBalance();
    if (document.getElementById('cbCount')) document.getElementById('cbCount').textContent = window.cashBoxes.length;
    if (document.getElementById('cbTotal')) document.getElementById('cbTotal').textContent = window.formatMoney(total);

    let html = '';
    window.cashBoxes.forEach(function(box) {
        const balance = window.getCashBoxBalance(box.id);
        html += '<div class="cash-box-card ' + (box.isDefault ? 'default' : '') + '" style="margin-bottom:10px;">' +
            '<div class="cash-box-header">' +
                '<div class="cash-box-icon">' + (box.icon || '💵') + '</div>' +
                '<div class="cash-box-info">' +
                    '<div class="cash-box-name">' + box.name + (box.isDefault ? ' ⭐' : '') + '</div>' +
                    '<div class="cash-box-type">' + window.getBoxTypeName(box.type) + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="cash-box-balance">' +
                '<div class="balance-label">الرصيد الحالي</div>' +
                '<div class="balance-value">' + window.formatMoney(balance) + ' ج.م</div>' +
            '</div>' +
            '<div class="cash-box-actions">' +
                (!box.isDefault ? '<button class="btn-icon-sm" onclick="setDefaultCashBox(' + box.id + ')">⭐</button>' : '') +
                '<button class="btn-icon-sm" onclick="editCashBox(' + box.id + ')">✏️</button>' +
                '<button class="btn-icon-sm danger" onclick="deleteCashBox(' + box.id + ')">🗑️</button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// المصروفات
// ═══════════════════════════════════════════════════════════
window.saveExpense = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    
    const note = document.getElementById('expNote') ? document.getElementById('expNote').value.trim() : '';
    const amount = parseFloat(document.getElementById('expAmount') ? document.getElementById('expAmount').value : 0) || 0;
    const category = document.getElementById('expCategory') ? document.getElementById('expCategory').value : 'عام';
    const date = (document.getElementById('expDate') ? document.getElementById('expDate').value : '') || window.getTodayDate();
    const cashBoxId = document.getElementById('expCashBox') ? document.getElementById('expCashBox').value : '';

    if (!note) { window.showToast('⚠️ أدخل البيان', 'error'); return; }
    if (amount <= 0) { window.showToast('⚠️ أدخل مبلغ صحيح', 'error'); return; }
    if (!cashBoxId) { window.showToast('⚠️ اختر الخزنة', 'error'); return; }

    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });
    const exp = {
        id: Date.now(), note: note, amount: amount, category: category, date: date,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        time: window.getNowTime(),
        createdBy: window.currentUser ? window.currentUser.name : ''
    };
    if (!window.expenses) window.expenses = [];
    window.expenses.push(exp);

    if (!window.treasury) window.treasury = [];
    window.treasury.push({
        id: Date.now() + 1, type: 'withdraw', amount: amount,
        note: 'مصروف (' + category + ') - ' + note,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        refType: 'expense', refId: exp.id,
        date: date, time: window.getNowTime()
    });

    window.setData('expenses', window.expenses);
    window.setData('treasury', window.treasury);

    if (document.getElementById('expNote')) document.getElementById('expNote').value = '';
    if (document.getElementById('expAmount')) document.getElementById('expAmount').value = '';

    window.renderExpenses();
    window.updateExpensesStats();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast('✅ تم إضافة ' + window.formatMoney(amount) + ' ج.م', 'success');
};

window.updateExpensesStats = function() {
    const total = (window.expenses || []).reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    const today = (window.expenses || []).filter(function(e) { return e.date === window.getTodayDate(); })
        .reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    const month = (window.expenses || []).filter(function(e) { return (e.date || '').indexOf(window.getTodayDate().substring(0, 7)) === 0; })
        .reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    
    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    set('expTotalCount', (window.expenses || []).length);
    set('expTotalAmount', window.formatMoney(total));
    set('expTodayAmount', window.formatMoney(today));
    set('expMonthAmount', window.formatMoney(month));
};

window.renderExpenses = function() {
    const c = document.getElementById('expensesList');
    if (!c) return;
    if ((window.expenses || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-money-bill-wave"></i><span>لا توجد مصروفات</span></div>';
        return;
    }
    const sorted = window.expenses.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 50);
    let html = '<div class="table-header" style="grid-template-columns: 1.3fr 0.8fr 0.8fr 0.8fr 0.6fr;"><span>البيان</span><span>المبلغ</span><span>التصنيف</span><span>التاريخ</span><span></span></div>';
    sorted.forEach(function(e) {
        html += '<div class="table-row" style="grid-template-columns: 1.3fr 0.8fr 0.8fr 0.8fr 0.6fr;">' +
            '<span><strong>' + e.note + '</strong></span>' +
            '<span style="color:#E06060;font-weight:700;">' + window.formatMoney(e.amount) + '</span>' +
            '<span style="font-size:11px;color:#A89070;">' + (e.category || 'عام') + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + e.date + '</span>' +
            '<button class="btn btn-danger btn-sm" onclick="deleteExpense(' + e.id + ')"><i class="fas fa-trash"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.deleteExpense = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const e = (window.expenses || []).find(function(x) { return x.id == id; });
    if (!e) return;
    if (!confirm('⚠️ حذف "' + e.note + '"؟')) return;
    window.treasury = window.treasury.filter(function(t) { return !(t.refType === 'expense' && t.refId === id); });
    window.expenses = window.expenses.filter(function(x) { return x.id !== id; });
    window.setData('expenses', window.expenses);
    window.setData('treasury', window.treasury);
    window.renderExpenses();
    window.updateExpensesStats();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// نهاية الجزء 2
// ═══════════════════════════════════════════════════════════
console.log('✅ app.js v17.0 - الجزء 2 مكتمل');

// ═══════════════════════════════════════════════════════════
// الجزء 3: الفواتير + التحصيل + المرتجعات + التقارير + الإضافات
// ═══════════════════════════════════════════════════════════
console.log('🚀 app.js v17.0 - الجزء 3');

// ═══════════════════════════════════════════════════════════
// الفواتير
// ═══════════════════════════════════════════════════════════
window.updateInvoiceStats = function() {
    const total = (window.sales || []).reduce(function(s, i) { return s + (i.total || 0); }, 0);
    const today = (window.sales || []).filter(function(s) { return s.date === window.getTodayDate(); })
        .reduce(function(s, i) { return s + (i.total || 0); }, 0);
    const pending = (window.sales || []).filter(function(s) { return s.status === 'unpaid' || s.status === 'partial'; })
        .reduce(function(s, i) { return s + (i.remainingAmount || 0); }, 0);
    
    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    
    set('invTotalCount', (window.sales || []).length);
    set('invTotalAmount', window.formatMoney(total));
    set('invTodayAmount', window.formatMoney(today));
    set('invPendingAmount', window.formatMoney(pending));
};

window.filterInvoices = function(filter, btn) {
    window.currentInvoiceFilter = filter;
    document.querySelectorAll('#page-invoices .filter-chip').forEach(function(c) { c.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    window.renderInvoices();
};

window.renderInvoices = function() {
    const filter = window.currentInvoiceFilter || 'all';
    const c = document.getElementById('invoiceList');
    if (!c) return;
    const searchInput = document.getElementById('invoiceSearch');
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let filtered = window.sales || [];
    if (filter === 'paid') filtered = filtered.filter(function(i) { return i.status === 'paid'; });
    if (filter === 'unpaid') filtered = filtered.filter(function(i) { return i.status === 'unpaid'; });
    if (filter === 'partial') filtered = filtered.filter(function(i) { return i.status === 'partial'; });
    if (search) filtered = filtered.filter(function(i) {
        return (i.customer || '').toLowerCase().indexOf(search) > -1 || String(i.number).indexOf(search) > -1;
    });

    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-file-invoice"></i><span>لا توجد فواتير</span></div>';
        return;
    }

    const sorted = filtered.slice().sort(function(a, b) { return b.id - a.id; });
    let html = '<div class="table-header" style="grid-template-columns: 0.5fr 1.3fr 1fr 0.8fr 0.7fr 1.5fr;"><span>#</span><span>العميل</span><span>المبلغ</span><span>الدفع</span><span>الحالة</span><span></span></div>';
    sorted.forEach(function(inv) {
        const statusLabel = inv.status === 'paid' ? '✅' : inv.status === 'partial' ? '⚠️' : '❌';
        const payIcons = { 'cash': '💵', 'credit': '📝', 'wallet': '📱', 'visa': '💳', 'bank': '🏦', 'installment': '📅' };
        html += '<div class="table-row" style="grid-template-columns: 0.5fr 1.3fr 1fr 0.8fr 0.7fr 1.5fr;">' +
            '<span>#' + inv.number + '</span>' +
            '<span>' + (inv.customer || 'عميل نقدي') + 
                (inv.warehouseName ? '<br><small style="color:#A89070;font-size:9px;">🏭 ' + inv.warehouseName + '</small>' : '') +
            '</span>' +
            '<span style="color:#2D8F5E;font-weight:700;">' + window.formatMoney(inv.total) + '</span>' +
            '<span>' + (payIcons[inv.paymentMethod] || '💵') + '</span>' +
            '<span style="font-size:14px;">' + statusLabel + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-info btn-sm" onclick="showInvoiceDetails(' + inv.id + ')"><i class="fas fa-eye"></i></button>' +
                '<button class="btn btn-success btn-sm" onclick="printInvoice(' + inv.id + ')"><i class="fas fa-print"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteInvoice(' + inv.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.showInvoiceDetails = function(id) {
    const inv = (window.sales || []).find(function(s) { return s.id === id; });
    if (!inv) return;

    let itemsHtml = '';
    (inv.items || []).forEach(function(it, i) {
        itemsHtml += '<tr>' +
            '<td style="padding:6px;border-bottom:1px solid #2D2D2D;">' + (i + 1) + '</td>' +
            '<td style="padding:6px;border-bottom:1px solid #2D2D2D;">' + it.name + '</td>' +
            '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;">' + it.qty + '</td>' +
            '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;">' + window.formatMoney(it.price) + '</td>' +
            '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;color:#2D8F5E;">' + window.formatMoney(it.total) + '</td>' +
        '</tr>';
    });

    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>📄 فاتورة #' + inv.number + '</h3>' +
        '<div style="background:#0D0D0D;padding:14px;border-radius:10px;border:1px solid #2D2D2D;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:12px;">' +
                '<div><span style="color:#A89070;">العميل:</span> <strong>' + (inv.customer || 'عميل نقدي') + '</strong></div>' +
                '<div><span style="color:#A89070;">التاريخ:</span> ' + inv.date + ' ' + (inv.time || '') + '</div>' +
                '<div><span style="color:#A89070;">الحالة:</span> ' + (inv.status === 'paid' ? '✅ مدفوعة' : inv.status === 'partial' ? '⚠️ جزئية' : '❌ غير مدفوعة') + '</div>' +
                (inv.warehouseName ? '<div style="grid-column:1/-1;color:#4A8AB5;">🏭 ' + inv.warehouseName + '</div>' : '') +
            '</div>' +
            '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="background:#C9A94E;color:#0D0D0D;">' +
                    '<th style="padding:6px;">#</th>' +
                    '<th style="padding:6px;">الصنف</th>' +
                    '<th style="padding:6px;">الكمية</th>' +
                    '<th style="padding:6px;">السعر</th>' +
                    '<th style="padding:6px;">الإجمالي</th>' +
                '</tr></thead>' +
                '<tbody>' + itemsHtml + '</tbody>' +
            '</table>' +
            '<div style="margin-top:12px;padding:10px;background:#1A1A1A;border-radius:8px;">' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">' +
                    '<span>المجموع:</span><span>' + window.formatMoney(inv.subtotal || inv.total) + ' ج.م</span>' +
                '</div>' +
                (inv.vat > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#9B59B6;"><span>الضريبة:</span><span>' + window.formatMoney(inv.vat) + ' ج.م</span></div>' : '') +
                (inv.discount > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#E6A830;"><span>الخصم:</span><span>' + window.formatMoney(inv.discount) + ' ج.م</span></div>' : '') +
                '<div style="display:flex;justify-content:space-between;padding:6px 0;border-top:2px solid #C9A94E;margin-top:6px;font-size:16px;font-weight:900;color:#C9A94E;">' +
                    '<span>الإجمالي:</span><span>' + window.formatMoney(inv.total) + ' ج.م</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

window.printInvoice = function(id) {
    const inv = (window.sales || []).find(function(s) { return s.id === id; });
    if (!inv) { window.showToast('⚠️ الفاتورة غير موجودة', 'error'); return; }

    const company = window.companyData || { name: 'الميزان', phone: '', address: '', footer: 'شكراً لتعاملكم معنا 🌟' };
    let itemsRows = '';
    (inv.items || []).forEach(function(it, i) {
        itemsRows += '<tr>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + (i+1) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;">' + it.name + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + it.qty + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(it.price) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(it.total) + '</td>' +
        '</tr>';
    });

    const content = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة #' + inv.number + '</title>' +
        '<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif;}body{padding:20px;background:#fff;color:#000;}' +
        '.header{text-align:center;padding-bottom:15px;border-bottom:3px solid #C9A94E;margin-bottom:20px;}' +
        '.header h1{color:#C9A94E;font-size:28px;margin-bottom:5px;}' +
        '.info-box{display:grid;grid-template-columns:1fr 1fr;gap:15px;background:#f9f9f9;padding:15px;border-radius:8px;margin-bottom:20px;}' +
        '.info-box div{font-size:13px;line-height:1.8;}table{width:100%;border-collapse:collapse;margin-bottom:20px;}' +
        'th{background:#C9A94E;color:#fff;padding:10px;border:1px solid #C9A94E;font-size:13px;}td{font-size:13px;}' +
        '.totals{background:#f9f9f9;padding:15px;border-radius:8px;margin-top:10px;}' +
        '.totals div{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;}' +
        '.totals .final{border-top:2px solid #C9A94E;margin-top:8px;padding-top:8px;font-size:18px;font-weight:900;color:#C9A94E;}' +
        '.footer{text-align:center;margin-top:20px;padding-top:15px;border-top:2px dashed #ddd;font-size:12px;color:#666;}' +
        '</style></head><body>' +
        '<div class="header"><h1>' + (company.name || 'الميزان') + '</h1>' +
        (company.phone ? '<p>📞 ' + company.phone + '</p>' : '') + '</div>' +
        '<div class="info-box"><div><strong>رقم الفاتورة:</strong> #' + inv.number + '<br>' +
        '<strong>التاريخ:</strong> ' + inv.date + '<br><strong>الوقت:</strong> ' + (inv.time || '') + '</div>' +
        '<div><strong>العميل:</strong> ' + (inv.customer || 'عميل نقدي') + '<br>' +
        '<strong>البائع:</strong> ' + (inv.seller || '-') + '<br>' +
        (inv.warehouseName ? '<strong>المستودع:</strong> ' + inv.warehouseName : '') + '</div></div>' +
        '<table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>' + itemsRows + '</tbody></table>' +
        '<div class="totals"><div><span>المجموع:</span><span>' + window.formatMoney(inv.subtotal || inv.total) + ' ج.م</span></div>' +
        (inv.vat > 0 ? '<div><span>الضريبة:</span><span>' + window.formatMoney(inv.vat) + ' ج.م</span></div>' : '') +
        (inv.discount > 0 ? '<div><span>الخصم:</span><span>- ' + window.formatMoney(inv.discount) + ' ج.م</span></div>' : '') +
        '<div class="final"><span>الإجمالي:</span><span>' + window.formatMoney(inv.total) + ' ج.م</span></div></div>' +
        '<div class="footer">' + (company.footer || 'شكراً لتعاملكم معنا 🌟') + '</div>' +
        '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script></body></html>';

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { window.showToast('⚠️ يرجى السماح بالنوافذ المنبثقة', 'warning'); return; }
    w.document.write(content);
    w.document.close();
    window.showToast('🖨️ جاري الطباعة...', 'info');
};

window.deleteInvoice = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const inv = (window.sales || []).find(function(s) { return s.id === id; });
    if (!inv) return;
    if (!confirm('⚠️ حذف فاتورة #' + inv.number + '؟')) return;

    (inv.items || []).forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) { 
            p.qty += it.qty;
            if (inv.warehouseId && p.warehouseStock) {
                p.warehouseStock[inv.warehouseId] = (p.warehouseStock[inv.warehouseId] || 0) + it.qty;
            }
        }
    });

    window.treasury = treasury.filter(function(t) { return !(t.refType === 'sale' && t.refId === id); });
    window.sales = sales.filter(function(s) { return s.id !== id; });

    window.setData('sales', window.sales);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);

    window.renderInvoices();
    window.updateInvoiceStats();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// التحصيل والسداد
// ═══════════════════════════════════════════════════════════
window.getCustomerBalance = function(name) {
    if (!name || name === 'عميل نقدي') return 0;
    return Math.max(0, (window.sales || []).filter(function(s) { 
        return s.customer === name && s.paymentMethod === 'credit'; 
    }).reduce(function(sum, s) { 
        return sum + (s.remainingAmount !== undefined ? s.remainingAmount : s.total); 
    }, 0));
};

window.getSupplierBalance = function(name) {
    if (!name) return 0;
    return Math.max(0, (window.purchases || []).filter(function(p) { 
        return p.supplierName === name && p.payment === 'credit'; 
    }).reduce(function(sum, p) { 
        return sum + (p.remainingAmount !== undefined ? p.remainingAmount : p.total); 
    }, 0));
};

window.switchPayTab = function(tab, btn) {
    window.currentPayTab = tab;
    document.querySelectorAll('#page-payments .tab-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    const collect = document.getElementById('payTabCollect');
    const pay = document.getElementById('payTabPay');
    if (collect) collect.style.display = tab === 'collect' ? 'block' : 'none';
    if (pay) pay.style.display = tab === 'pay' ? 'block' : 'none';
};

window.populateCollectCustomers = function() {
    const sel = document.getElementById('collectCustomer');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر عميل...</option>';
    (window.customers || []).forEach(function(c) {
        const bal = window.getCustomerBalance(c.name);
        const text = c.name + (bal > 0 ? ' (مديونية: ' + window.formatMoney(bal) + ')' : '');
        sel.innerHTML += '<option value="' + c.name + '">' + text + '</option>';
    });
    sel.value = cv;
};

window.populatePaySuppliers = function() {
    const sel = document.getElementById('paySupplier');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر مورد...</option>';
    (window.suppliers || []).forEach(function(s) {
        const bal = window.getSupplierBalance(s.name);
        const text = s.name + (bal > 0 ? ' (مديونية: ' + window.formatMoney(bal) + ')' : '');
        sel.innerHTML += '<option value="' + s.name + '">' + text + '</option>';
    });
    sel.value = cv;
};

window.updateCollectInfo = function() {
    const name = document.getElementById('collectCustomer') ? document.getElementById('collectCustomer').value : '';
    const box = document.getElementById('collectInfoBox');
    if (!box) return;
    if (!name) { box.style.display = 'none'; return; }
    const balance = window.getCustomerBalance(name);
    box.style.display = 'block';
    if (document.getElementById('collectCurrentDebt')) document.getElementById('collectCurrentDebt').textContent = window.formatMoney(balance);
    const amountInput = document.getElementById('collectAmount');
    if (amountInput) { amountInput.max = balance; if (balance > 0) amountInput.value = balance.toFixed(2); }
};

window.updatePayInfo = function() {
    const name = document.getElementById('paySupplier') ? document.getElementById('paySupplier').value : '';
    const box = document.getElementById('payInfoBox');
    if (!box) return;
    if (!name) { box.style.display = 'none'; return; }
    const balance = window.getSupplierBalance(name);
    box.style.display = 'block';
    if (document.getElementById('payCurrentDebt')) document.getElementById('payCurrentDebt').textContent = window.formatMoney(balance);
    const amountInput = document.getElementById('payAmount');
    if (amountInput) { amountInput.max = balance; if (balance > 0) amountInput.value = balance.toFixed(2); }
};

window.distributePayment = function(customerName, amount) {
    const relatedInvoices = [];
    let remaining = amount;
    const customerInvoices = (window.sales || []).filter(function(s) {
        return s.customer === customerName && (s.status === 'unpaid' || s.status === 'partial');
    }).sort(function(a, b) { return a.id - b.id; });

    customerInvoices.forEach(function(inv) {
        if (remaining <= 0.01) return;
        const invRemaining = inv.remainingAmount !== undefined ? inv.remainingAmount : inv.total;
        if (invRemaining <= 0.01) return;
        const pay = Math.min(remaining, invRemaining);
        inv.paidAmount = (inv.paidAmount || 0) + pay;
        inv.remainingAmount = invRemaining - pay;
        inv.status = inv.remainingAmount <= 0.01 ? 'paid' : 'partial';
        if (inv.remainingAmount <= 0.01) inv.remainingAmount = 0;
        relatedInvoices.push({ invoiceId: inv.id, invoiceNumber: inv.number, amount: pay });
        remaining -= pay;
    });
    return relatedInvoices;
};

window.distributePay = function(supplierName, amount) {
    const relatedInvoices = [];
    let remaining = amount;
    const supplierInvoices = (window.purchases || []).filter(function(p) {
        return p.supplierName === supplierName && p.payment === 'credit' && (p.status === 'unpaid' || p.status === 'partial');
    }).sort(function(a, b) { return a.id - b.id; });

    supplierInvoices.forEach(function(inv) {
        if (remaining <= 0.01) return;
        const invRemaining = inv.remainingAmount !== undefined ? inv.remainingAmount : inv.total;
        if (invRemaining <= 0.01) return;
        const pay = Math.min(remaining, invRemaining);
        inv.paidAmount = (inv.paidAmount || 0) + pay;
        inv.remainingAmount = invRemaining - pay;
        inv.status = inv.remainingAmount <= 0.01 ? 'paid' : 'partial';
        if (inv.remainingAmount <= 0.01) inv.remainingAmount = 0;
        relatedInvoices.push({ invoiceId: inv.id, invoiceNumber: inv.number, amount: pay });
        remaining -= pay;
    });
    return relatedInvoices;
};

window.saveCollect = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const party = document.getElementById('collectCustomer') ? document.getElementById('collectCustomer').value : '';
    const amount = parseFloat(document.getElementById('collectAmount') ? document.getElementById('collectAmount').value : 0) || 0;
    const date = (document.getElementById('collectDate') ? document.getElementById('collectDate').value : '') || window.getTodayDate();
    const cashBoxId = document.getElementById('collectCashBox') ? document.getElementById('collectCashBox').value : '';
    const note = document.getElementById('collectNote') ? document.getElementById('collectNote').value.trim() : '';

    if (!party) { window.showToast('⚠️ اختر عميل', 'error'); return; }
    if (amount <= 0) { window.showToast('⚠️ أدخل مبلغ صحيح', 'error'); return; }
    if (!cashBoxId) { window.showToast('⚠️ اختر الخزنة', 'error'); return; }

    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });
    const pay = {
        id: Date.now(), type: 'collect', party: party, amount: amount, date: date,
        time: window.getNowTime(), note: note, cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        relatedInvoices: [],
        createdBy: window.currentUser ? window.currentUser.name : ''
    };
    pay.relatedInvoices = window.distributePayment(party, amount);
    if (!window.payments) window.payments = [];
    window.payments.push(pay);

    if (!window.treasury) window.treasury = [];
    window.treasury.push({
        id: Date.now() + 1, type: 'deposit', amount: amount,
        note: 'تحصيل من ' + party,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        refType: 'collect', refId: pay.id,
        date: date, time: window.getNowTime()
    });

    window.setData('payments', window.payments);
    window.setData('treasury', window.treasury);
    window.setData('sales', window.sales);

    if (document.getElementById('collectAmount')) document.getElementById('collectAmount').value = '';
    if (document.getElementById('collectNote')) document.getElementById('collectNote').value = '';
    if (document.getElementById('collectCustomer')) document.getElementById('collectCustomer').value = '';
    const info = document.getElementById('collectInfoBox'); if (info) info.style.display = 'none';

    window.updatePaymentsStats();
    window.renderPayments();
    if (typeof window.renderTreasury === 'function') window.renderTreasury();
    if (typeof window.renderCustomers === 'function') window.renderCustomers();
    if (typeof window.renderInvoices === 'function') window.renderInvoices();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast('✅ تم تحصيل ' + window.formatMoney(amount) + ' ج.م', 'success');
};

window.savePay = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const party = document.getElementById('paySupplier') ? document.getElementById('paySupplier').value : '';
    const amount = parseFloat(document.getElementById('payAmount') ? document.getElementById('payAmount').value : 0) || 0;
    const date = (document.getElementById('payDate') ? document.getElementById('payDate').value : '') || window.getTodayDate();
    const cashBoxId = document.getElementById('payCashBox') ? document.getElementById('payCashBox').value : '';
    const note = document.getElementById('payNote') ? document.getElementById('payNote').value.trim() : '';

    if (!party) { window.showToast('⚠️ اختر مورد', 'error'); return; }
    if (amount <= 0) { window.showToast('⚠️ أدخل مبلغ صحيح', 'error'); return; }
    if (!cashBoxId) { window.showToast('⚠️ اختر الخزنة', 'error'); return; }

    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });
    const pay = {
        id: Date.now(), type: 'pay', party: party, amount: amount, date: date,
        time: window.getNowTime(), note: note, cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        relatedInvoices: [],
        createdBy: window.currentUser ? window.currentUser.name : ''
    };
    pay.relatedInvoices = window.distributePay(party, amount);
    if (!window.payments) window.payments = [];
    window.payments.push(pay);

    if (!window.treasury) window.treasury = [];
    window.treasury.push({
        id: Date.now() + 1, type: 'withdraw', amount: amount,
        note: 'سداد لـ ' + party,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        refType: 'pay', refId: pay.id,
        date: date, time: window.getNowTime()
    });

    window.setData('payments', window.payments);
    window.setData('treasury', window.treasury);
    window.setData('purchases', window.purchases);

    if (document.getElementById('payAmount')) document.getElementById('payAmount').value = '';
    if (document.getElementById('payNote')) document.getElementById('payNote').value = '';
    if (document.getElementById('paySupplier')) document.getElementById('paySupplier').value = '';
    const info = document.getElementById('payInfoBox'); if (info) info.style.display = 'none';

    window.updatePaymentsStats();
    window.renderPayments();
    if (typeof window.renderTreasury === 'function') window.renderTreasury();
    if (typeof window.renderSuppliers === 'function') window.renderSuppliers();
    if (typeof window.renderPurchases === 'function') window.renderPurchases();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast('✅ تم سداد ' + window.formatMoney(amount) + ' ج.م', 'success');
};

window.updatePaymentsStats = function() {
    const collected = (window.payments || []).filter(function(p) { return p.type === 'collect'; })
        .reduce(function(s, p) { return s + (p.amount || 0); }, 0);
    const paid = (window.payments || []).filter(function(p) { return p.type === 'pay'; })
        .reduce(function(s, p) { return s + (p.amount || 0); }, 0);
    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = window.formatMoney(val);
    };
    set('payTotalCollected', collected);
    set('payTotalPaid', paid);
};

window.renderPayments = function() {
    const c = document.getElementById('paymentsList');
    if (!c) return;
    if ((window.payments || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-hand-holding-usd"></i><span>لا توجد عمليات</span></div>';
        return;
    }
    const sorted = window.payments.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 50);
    let html = '<div class="table-header" style="grid-template-columns: 0.7fr 1.5fr 1fr 1fr 0.7fr;"><span>النوع</span><span>الجهة</span><span>المبلغ</span><span>التاريخ</span><span></span></div>';
    sorted.forEach(function(p) {
        const isCollect = p.type === 'collect';
        const color = isCollect ? '#2D8F5E' : '#E06060';
        html += '<div class="table-row" style="grid-template-columns: 0.7fr 1.5fr 1fr 1fr 0.7fr;">' +
            '<span style="color:' + color + ';font-size:11px;font-weight:700;">' + (isCollect ? '💰 تحصيل' : '💸 سداد') + '</span>' +
            '<span>' + p.party + '</span>' +
            '<span style="color:' + color + ';font-weight:700;">' + window.formatMoney(p.amount) + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + p.date + '</span>' +
            '<button class="btn btn-info btn-sm" onclick="showReceipt(' + p.id + ')"><i class="fas fa-receipt"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.showReceipt = function(id) {
    const pay = (window.payments || []).find(function(p) { return p.id === id; });
    if (!pay) return;
    const isCollect = pay.type === 'collect';
    const label = isCollect ? 'إيصال استلام نقدية' : 'إيصال دفع نقدية';
    const color = isCollect ? '#2D8F5E' : '#E06060';
    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3 style="color:' + color + ';">🧾 ' + label + '</h3>' +
        '<div style="background:#fff;color:#000;padding:20px;border-radius:8px;border:2px solid ' + color + ';">' +
            '<div style="text-align:center;padding-bottom:12px;border-bottom:2px dashed #333;margin-bottom:12px;">' +
                '<h2 style="color:' + color + ';font-size:20px;">' + (window.companyData.name || 'الميزان') + '</h2>' +
                '<p style="font-size:12px;">' + label + '</p>' +
            '</div>' +
            '<div style="padding:10px 0;border-bottom:1px dashed #333;margin-bottom:12px;">' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;"><span>رقم الإيصال:</span><span>#' + String(pay.id).slice(-6) + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;"><span>التاريخ:</span><span>' + pay.date + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;"><span>' + (isCollect ? 'العميل' : 'المورد') + ':</span><span>' + pay.party + '</span></div>' +
            '</div>' +
            '<div style="text-align:center;padding:15px;border:2px solid ' + color + ';border-radius:8px;margin:12px 0;background:#f9f9f9;">' +
                '<div style="font-size:12px;color:#555;margin-bottom:6px;">' + (isCollect ? 'المبلغ المستلم' : 'المبلغ المدفوع') + '</div>' +
                '<div style="font-size:26px;font-weight:900;color:' + color + ';">' + window.formatMoney(pay.amount) + ' ج.م</div>' +
            '</div>' +
            '<div style="text-align:center;margin-top:12px;padding-top:10px;border-top:2px dashed #333;font-size:11px;color:#666;">' + (window.companyData.footer || 'شكراً لتعاملكم معنا 🌟') + '</div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

window.printReceipt = function(id) {
    const pay = (window.payments || []).find(function(p) { return p.id === id; });
    if (!pay) return;
    const isCollect = pay.type === 'collect';
    const label = isCollect ? 'إيصال استلام نقدية' : 'إيصال دفع نقدية';
    
    const content = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>' + label + '</title>' +
        '<style>body{font-family:Arial;padding:20px;max-width:600px;margin:0 auto;}' +
        '.header{text-align:center;border-bottom:2px solid #2D8F5E;padding-bottom:15px;margin-bottom:20px;}' +
        '.header h1{color:#2D8F5E;}.info{background:#f9f9f9;padding:15px;border-radius:8px;margin-bottom:15px;}' +
        '.info div{padding:5px 0;}.amount{text-align:center;font-size:28px;font-weight:900;color:#2D8F5E;padding:20px;border:2px solid #2D8F5E;border-radius:8px;}' +
        '</style></head><body><div class="header"><h1>' + (window.companyData.name || 'الميزان') + '</h1><p>' + label + '</p></div>' +
        '<div class="info"><div><strong>رقم الإيصال:</strong> #' + String(pay.id).slice(-6) + '</div>' +
        '<div><strong>التاريخ:</strong> ' + pay.date + '</div>' +
        '<div><strong>' + (isCollect ? 'العميل' : 'المورد') + ':</strong> ' + pay.party + '</div></div>' +
        '<div class="amount">' + window.formatMoney(pay.amount) + ' ج.م</div>' +
        '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script></body></html>';
    
    const w = window.open('', '_blank');
    if (w) { w.document.write(content); w.document.close(); }
};

// ═══════════════════════════════════════════════════════════
// المرتجعات
// ═══════════════════════════════════════════════════════════
window.toggleReturnParty = function() {
    const type = document.getElementById('retType') ? document.getElementById('retType').value : 'sale';
    const label = document.getElementById('retPartyLabel');
    const sel = document.getElementById('retParty');
    if (label) label.textContent = type === 'sale' ? 'العميل' : 'المورد';
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر...</option>';
    if (type === 'sale') {
        (window.customers || []).forEach(function(c) { sel.innerHTML += '<option value="' + c.name + '">' + c.name + '</option>'; });
    } else {
        (window.suppliers || []).forEach(function(s) { sel.innerHTML += '<option value="' + s.name + '">' + s.name + '</option>'; });
    }
    sel.value = cv;
};

window.populateRetProducts = function() {
    const sel = document.getElementById('retProduct');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر منتج...</option>';
    (window.products || []).forEach(function(p) {
        sel.innerHTML += '<option value="' + p.id + '">' + p.name + ' (متاح: ' + p.qty + ')</option>';
    });
    sel.value = cv;
};

window.updateRetPrice = function() {
    const id = document.getElementById('retProduct') ? document.getElementById('retProduct').value : '';
    const priceInput = document.getElementById('retPrice');
    if (!id) { if (priceInput) priceInput.value = ''; return; }
    const product = (window.products || []).find(function(pr) { return pr.id == id; });
    if (product && priceInput) priceInput.value = product.sell;
};

window.addRetItem = function() {
    const productSelect = document.getElementById('retProduct');
    const qtyInput = document.getElementById('retQty');
    const priceInput = document.getElementById('retPrice');
    const id = productSelect ? productSelect.value : '';
    let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

    if (!id) { window.showToast('⚠️ اختر منتج', 'error'); return; }
    const p = (window.products || []).find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (price <= 0) price = p.sell;
    if (qty <= 0) qty = 1;

    const ex = window.currentRetItems.find(function(i) { return i.productId == id; });
    if (ex) {
        ex.qty += qty;
        ex.price = price;
        ex.total = ex.qty * ex.price;
    } else {
        window.currentRetItems.push({ 
            productId: p.id, name: p.name, qty: qty, price: price, 
            costPrice: p.buy, total: qty * price 
        });
    }

    if (qtyInput) qtyInput.value = 1;
    if (priceInput) priceInput.value = '';
    if (productSelect) productSelect.value = '';

    window.renderRetItems();
    window.showToast('✅ تم الإضافة', 'success');
};

window.removeRetItem = function(i) {
    window.currentRetItems.splice(i, 1);
    window.renderRetItems();
};

window.renderRetItems = function() {
    const c = document.getElementById('retItemsContainer');
    const tb = document.getElementById('retTotalBox');
    if (!c) return;
    
    if (window.currentRetItems.length === 0) {
        c.innerHTML = '<div class="empty-items"><i class="fas fa-undo-alt"></i><span>لا توجد أصناف</span></div>';
        if (tb) tb.style.display = 'none';
        return;
    }
    
    let html = '<div class="items-header-row"><span>ID</span><span>اسم الصنف</span><span>الوحدة</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span></div>';
    window.currentRetItems.forEach(function(it, i) {
        html += '<div class="item-row">' +
            '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
            '<span class="item-name">' + it.name + '</span>' +
            '<span class="item-unit">قطعة</span>' +
            '<span class="item-qty">' + it.qty + '</span>' +
            '<span class="item-price">' + window.formatMoney(it.price) + '</span>' +
            '<span class="item-total" style="color:#E6A830;">' + window.formatMoney(it.qty * it.price) + '</span>' +
            '<button class="item-delete" onclick="removeRetItem(' + i + ')"><i class="fas fa-times"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
    const total = window.currentRetItems.reduce(function(s, i) { return s + i.total; }, 0);
    if (document.getElementById('retTotal')) document.getElementById('retTotal').textContent = window.formatMoney(total) + ' ج.م';
    if (tb) tb.style.display = 'block';
};

window.saveReturn = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    if (window.currentRetItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }
    
    const type = document.getElementById('retType') ? document.getElementById('retType').value : 'sale';
    const party = document.getElementById('retParty') ? document.getElementById('retParty').value : '';
    if (!party) { window.showToast('⚠️ اختر الجهة', 'error'); return; }
    
    const cashBoxId = document.getElementById('retCashBox') ? document.getElementById('retCashBox').value : '';
    if (!cashBoxId) { window.showToast('⚠️ اختر الخزنة', 'error'); return; }

    const retWarehouseId = document.getElementById('retWarehouse') ? document.getElementById('retWarehouse').value : '';
    const retWarehouse = (window.warehouses || []).find(function(w) { return w.id == retWarehouseId; });
    
    if (!retWarehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }

    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });
    const notes = document.getElementById('retNotes') ? document.getElementById('retNotes').value.trim() : '';
    const total = window.currentRetItems.reduce(function(s, i) { return s + i.total; }, 0);
    const today = window.getTodayDate();

    window.currentRetItems.forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) {
            if (type === 'sale') {
                p.qty += it.qty;
                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[retWarehouseId] = (p.warehouseStock[retWarehouseId] || 0) + it.qty;
            } else {
                p.qty = Math.max(0, p.qty - it.qty);
                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[retWarehouseId] = Math.max(0, (p.warehouseStock[retWarehouseId] || 0) - it.qty);
            }
        }
    });

    const ret = {
        id: Date.now(), number: (window.returns || []).length + 1,
        type: type, party: party,
        warehouseId: retWarehouseId,
        warehouseName: retWarehouse ? retWarehouse.name : '',
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        notes: notes, total: total, 
        items: JSON.parse(JSON.stringify(window.currentRetItems)),
        date: today, time: window.getNowTime(),
        createdBy: window.currentUser ? window.currentUser.name : ''
    };
    
    if (!window.returns) window.returns = [];
    window.returns.push(ret);

    if (!window.treasury) window.treasury = [];
    if (type === 'sale') {
        window.treasury.push({
            id: Date.now() + 1, type: 'withdraw', amount: total,
            note: 'مرتجع بيع #' + ret.number + ' - ' + party,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'return', refId: ret.id,
            date: today, time: window.getNowTime()
        });
    } else {
        window.treasury.push({
            id: Date.now() + 1, type: 'deposit', amount: total,
            note: 'مرتجع شراء #' + ret.number + ' - ' + party,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'return', refId: ret.id,
            date: today, time: window.getNowTime()
        });
    }

    window.setData('returns', window.returns);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);

    window.currentRetItems = [];
    if (document.getElementById('retParty')) document.getElementById('retParty').value = '';
    if (document.getElementById('retNotes')) document.getElementById('retNotes').value = '';

    window.populateWarehouseField();
    window.renderRetItems();
    window.renderReturns();
    window.updateReturnsStats();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();

    window.showToast('✅ مرتجع #' + ret.number, 'success');
};

window.clearReturn = function() {
    if (window.currentRetItems.length === 0) return;
    if (!confirm('⚠️ إلغاء المرتجع؟')) return;
    window.currentRetItems = [];
    if (document.getElementById('retParty')) document.getElementById('retParty').value = '';
    if (document.getElementById('retNotes')) document.getElementById('retNotes').value = '';
    window.renderRetItems();
    window.showToast('🗑️ تم الإلغاء', 'info');
};

window.updateReturnsStats = function() {
    const total = (window.returns || []).reduce(function(s, r) { return s + (r.total || 0); }, 0);
    if (document.getElementById('retTotalCount')) document.getElementById('retTotalCount').textContent = (window.returns || []).length;
    if (document.getElementById('retTotalAmount')) document.getElementById('retTotalAmount').textContent = window.formatMoney(total);
};

window.renderReturns = function() {
    const c = document.getElementById('returnsList');
    if (!c) return;
    if ((window.returns || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-undo-alt"></i><span>لا توجد مرتجعات</span></div>';
        return;
    }
    const sorted = window.returns.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 50);
    let html = '<div class="table-header" style="grid-template-columns: 0.5fr 0.8fr 1.3fr 1fr 1fr 1.2fr;"><span>#</span><span>النوع</span><span>الجهة</span><span>المبلغ</span><span>التاريخ</span><span></span></div>';
    sorted.forEach(function(r) {
        const isSale = r.type === 'sale';
        const color = isSale ? '#E6A830' : '#4A8AB5';
        html += '<div class="table-row" style="grid-template-columns: 0.5fr 0.8fr 1.3fr 1fr 1fr 1.2fr;">' +
            '<span>#' + r.number + '</span>' +
            '<span style="color:' + color + ';font-size:11px;font-weight:700;">' + (isSale ? '🔄 بيع' : '🔄 شراء') + '</span>' +
            '<span>' + r.party + '</span>' +
            '<span style="color:' + color + ';font-weight:700;">' + window.formatMoney(r.total) + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + r.date + '</span>' +
            '<button class="btn btn-danger btn-sm" onclick="deleteReturn(' + r.id + ')"><i class="fas fa-trash"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.deleteReturn = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const ret = (window.returns || []).find(function(r) { return r.id == id; });
    if (!ret) return;
    if (!confirm('⚠️ حذف مرتجع #' + ret.number + '؟')) return;
    
    (ret.items || []).forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) {
            if (ret.type === 'sale') {
                p.qty -= it.qty;
                if (ret.warehouseId && p.warehouseStock) {
                    p.warehouseStock[ret.warehouseId] = Math.max(0, (p.warehouseStock[ret.warehouseId] || 0) - it.qty);
                }
            } else {
                p.qty += it.qty;
                if (ret.warehouseId && p.warehouseStock) {
                    p.warehouseStock[ret.warehouseId] = (p.warehouseStock[ret.warehouseId] || 0) + it.qty;
                }
            }
        }
    });
    
    window.treasury = window.treasury.filter(function(t) { return !(t.refType === 'return' && t.refId === id); });
    window.returns = window.returns.filter(function(r) { return r.id !== id; });
    window.setData('returns', window.returns);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);
    window.renderReturns();
    window.updateReturnsStats();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// حركات الخزنة
// ═══════════════════════════════════════════════════════════
window.filterTreasury = function(filter, btn) {
    window.currentTreasuryFilter = filter;
    document.querySelectorAll('#page-treasury .filter-chip').forEach(function(c) { c.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    window.renderTreasury();
};

window.addTreasuryTransaction = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const type = document.getElementById('treasuryType') ? document.getElementById('treasuryType').value : 'deposit';
    const amount = parseFloat(document.getElementById('treasuryAmount') ? document.getElementById('treasuryAmount').value : 0) || 0;
    const note = (document.getElementById('treasuryNote') ? document.getElementById('treasuryNote').value.trim() : '') || (type === 'deposit' ? 'إيداع' : 'سحب');
    const cashBoxId = document.getElementById('manualCashBox') ? document.getElementById('manualCashBox').value : '';

    if (amount <= 0) { window.showToast('⚠️ أدخل مبلغ صحيح', 'error'); return; }
    if (!cashBoxId) { window.showToast('⚠️ اختر الخزنة', 'error'); return; }

    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });
    if (!window.treasury) window.treasury = [];
    window.treasury.push({
        id: Date.now(), type: type, amount: amount, note: note,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        refType: 'manual', refId: null,
        date: window.getTodayDate(), time: window.getNowTime()
    });

    window.setData('treasury', window.treasury);
    if (document.getElementById('treasuryAmount')) document.getElementById('treasuryAmount').value = '';
    if (document.getElementById('treasuryNote')) document.getElementById('treasuryNote').value = '';

    window.renderTreasury();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast((type === 'deposit' ? '✅ إيداع ' : '✅ سحب ') + window.formatMoney(amount), 'success');
};

window.renderTreasury = function() {
    const filter = window.currentTreasuryFilter || 'all';
    const totalBalance = window.getTotalCashBalance();
    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    set('treasuryBalance', window.formatMoney(totalBalance) + ' 🇪🇬');

    const deposits = (window.treasury || []).filter(function(t) { return t.type === 'deposit'; })
        .reduce(function(s, t) { return s + (t.amount || 0); }, 0);
    const withdrawals = (window.treasury || []).filter(function(t) { return t.type === 'withdraw'; })
        .reduce(function(s, t) { return s + (t.amount || 0); }, 0);
    set('treasuryDeposits', window.formatMoney(deposits));
    set('treasuryWithdrawals', window.formatMoney(withdrawals));

    const c = document.getElementById('treasuryList');
    if (!c) return;

    let filtered = window.treasury || [];
    if (filter === 'sale') filtered = filtered.filter(function(t) { return t.refType === 'sale'; });
    else if (filter === 'purchase') filtered = filtered.filter(function(t) { return t.refType === 'purchase'; });
    else if (filter === 'expense') filtered = filtered.filter(function(t) { return t.refType === 'expense'; });
    else if (filter === 'collect') filtered = filtered.filter(function(t) { return t.refType === 'collect'; });
    else if (filter === 'pay') filtered = filtered.filter(function(t) { return t.refType === 'pay'; });
    else if (filter === 'manual') filtered = filtered.filter(function(t) { return t.refType === 'manual'; });

    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-vault"></i><span>لا توجد حركات</span></div>';
        return;
    }

    const sorted = filtered.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 100);
    let html = '<div class="table-header" style="grid-template-columns: 1.5fr 0.8fr 0.7fr 0.8fr;"><span>البيان</span><span>المبلغ</span><span>النوع</span><span>التاريخ</span></div>';
    sorted.forEach(function(t) {
        const isDep = t.type === 'deposit';
        const color = isDep ? '#2D8F5E' : '#E06060';
        const refIcons = { 'sale': '💰', 'purchase': '🛒', 'expense': '💸', 'collect': '💵', 'pay': '💳', 'manual': '✋', 'return': '🔄' };
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 0.8fr 0.7fr 0.8fr;">' +
            '<span style="font-size:11px;">' + (refIcons[t.refType] || '📋') + ' ' + t.note + '</span>' +
            '<span style="color:' + color + ';font-weight:700;font-size:12px;">' + (isDep ? '+' : '-') + window.formatMoney(t.amount) + '</span>' +
            '<span style="color:' + color + ';font-size:10px;">' + (isDep ? '💚 إيداع' : '❤️ سحب') + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + t.date + '</span>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// التقارير
// ═══════════════════════════════════════════════════════════
window.getDateRange = function(period) {
    const now = new Date();
    if (period === 'daily') {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                date: d.toISOString().split('T')[0],
                label: ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1)
            });
        }
        return days;
    }
    if (period === 'monthly') {
        const months = [];
        const names = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
                label: names[d.getMonth()] + ' ' + d.getFullYear()
            });
        }
        return months;
    }
    if (period === 'yearly') {
        const years = [];
        for (let i = 2; i >= 0; i--) {
            const year = now.getFullYear() - i;
            years.push({ date: String(year), label: 'سنة ' + year });
        }
        return years;
    }
    return [];
};

window.getReportData = function(period, dateStr) {
    const filterFn = function(date) {
        if (!date) return false;
        if (period === 'daily') return date === dateStr;
        if (period === 'monthly') return (date || '').indexOf(dateStr) === 0;
        if (period === 'yearly') return (date || '').indexOf(dateStr) === 0;
        return false;
    };

    const daySales = (window.sales || []).filter(function(s) { return filterFn(s.date); });
    const dayPurchases = (window.purchases || []).filter(function(p) { return filterFn(p.date); });
    const dayExpenses = (window.expenses || []).filter(function(e) { return filterFn(e.date); });

    const salesAmount = daySales.reduce(function(s, x) { return s + (x.total || 0); }, 0);
    const purchasesAmount = dayPurchases.reduce(function(s, x) { return s + (x.total || 0); }, 0);
    const expensesAmount = dayExpenses.reduce(function(s, x) { return s + (x.amount || 0); }, 0);
    const cogsAmount = daySales.reduce(function(s, x) { return s + (x.cogs || 0); }, 0);

    const grossProfit = salesAmount - cogsAmount;
    const netProfit = grossProfit - expensesAmount;

    return {
        salesCount: daySales.length, salesAmount: salesAmount,
        purchasesCount: dayPurchases.length, purchasesAmount: purchasesAmount,
        expensesCount: dayExpenses.length, expensesAmount: expensesAmount,
        cogs: cogsAmount, grossProfit: grossProfit, netProfit: netProfit
    };
};

window.switchReport = function(type, btn) {
    window.currentReport = type;
    document.querySelectorAll('.report-tab').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    window.renderReport(type);
};

window.renderReport = function(type) {
    const container = document.getElementById('reportContent');
    if (!container) return;

    if (type === 'daily' || type === 'monthly' || type === 'yearly') {
        const periods = window.getDateRange(type);
        const dataList = periods.map(function(p) { 
            return Object.assign({}, p, window.getReportData(type, p.date)); 
        });

        let totals = { 
            salesAmount: 0, salesCount: 0, purchasesAmount: 0, 
            expensesAmount: 0, grossProfit: 0, netProfit: 0 
        };
        
        dataList.forEach(function(d) {
            totals.salesAmount += d.salesAmount;
            totals.salesCount += d.salesCount;
            totals.purchasesAmount += d.purchasesAmount;
            totals.expensesAmount += d.expensesAmount;
            totals.grossProfit += d.grossProfit;
            totals.netProfit += d.netProfit;
        });

        window.currentReportData = { type: type, dataList: dataList, totals: totals };

        let tableHtml = '';
        dataList.forEach(function(d) {
            tableHtml += '<div class="report-table-row" style="grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr;">' +
                '<span>' + d.label + '</span>' +
                '<span class="green">' + window.formatMoney(d.salesAmount) + '</span>' +
                '<span class="red">' + window.formatMoney(d.purchasesAmount) + '</span>' +
                '<span class="orange">' + window.formatMoney(d.expensesAmount) + '</span>' +
                '<span class="gold">' + window.formatMoney(d.grossProfit) + '</span>' +
                '<span class="' + (d.netProfit >= 0 ? 'green' : 'red') + '">' + window.formatMoney(d.netProfit) + '</span>' +
            '</div>';
        });

        container.innerHTML =
            '<div class="report-summary">' +
                '<div class="report-stat green"><div class="num">' + window.formatMoney(totals.salesAmount) + '</div><div class="lbl">💰 إجمالي المبيعات</div></div>' +
                '<div class="report-stat red"><div class="num">' + window.formatMoney(totals.purchasesAmount) + '</div><div class="lbl">🛒 إجمالي المشتريات</div></div>' +
                '<div class="report-stat orange"><div class="num">' + window.formatMoney(totals.expensesAmount) + '</div><div class="lbl">💸 إجمالي المصروفات</div></div>' +
                '<div class="report-stat gold"><div class="num">' + window.formatMoney(totals.grossProfit) + '</div><div class="lbl">📈 إجمالي الربح</div></div>' +
                '<div class="report-stat ' + (totals.netProfit >= 0 ? 'green' : 'red') + '"><div class="num">' + window.formatMoney(totals.netProfit) + '</div><div class="lbl">💵 صافي الربح</div></div>' +
                '<div class="report-stat blue"><div class="num">' + totals.salesCount + '</div><div class="lbl">🧾 عدد الفواتير</div></div>' +
            '</div>' +
            '<h3 style="color:#C9A94E;font-size:14px;margin:14px 0 8px;">📋 التفاصيل</h3>' +
            '<div class="report-table-header" style="grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr;">' +
                '<span>الفترة</span><span>مبيعات</span><span>مشتريات</span><span>مصروفات</span><span>إجمالي ربح</span><span>صافي ربح</span>' +
            '</div>' + tableHtml;
    } else if (type === 'sellers') {
        const sellerStats = {};
        (window.sales || []).forEach(function(s) {
            const seller = s.seller || 'غير محدد';
            if (!sellerStats[seller]) sellerStats[seller] = { name: seller, total: 0, count: 0, profit: 0 };
            sellerStats[seller].total += s.total || 0;
            sellerStats[seller].count++;
            sellerStats[seller].profit += s.profit || 0;
        });
        const list = Object.values(sellerStats).sort(function(a, b) { return b.total - a.total; });
        
        let html = '<div class="report-summary"><div class="report-stat green"><div class="num">' + list.length + '</div><div class="lbl">عدد البائعين</div></div></div>';
        html += '<div class="report-table-header" style="grid-template-columns: 0.5fr 1.5fr 1fr 0.8fr 1fr;"><span>#</span><span>البائع</span><span>المبيعات</span><span>الفواتير</span><span>الربح</span></div>';
        list.forEach(function(s, i) {
            html += '<div class="report-table-row" style="grid-template-columns: 0.5fr 1.5fr 1fr 0.8fr 1fr;">' +
                '<span>' + (i + 1) + '</span>' +
                '<span><strong>' + s.name + '</strong></span>' +
                '<span class="green">' + window.formatMoney(s.total) + '</span>' +
                '<span class="blue">' + s.count + '</span>' +
                '<span class="gold">' + window.formatMoney(s.profit) + '</span>' +
            '</div>';
        });
        container.innerHTML = html;
    } else if (type === 'products') {
        const productStats = {};
        (window.sales || []).forEach(function(s) {
            (s.items || []).forEach(function(it) {
                if (!productStats[it.productId]) {
                    productStats[it.productId] = { name: it.name, qty: 0, total: 0, profit: 0 };
                }
                productStats[it.productId].qty += it.qty;
                productStats[it.productId].total += it.total;
                productStats[it.productId].profit += (it.price - (it.costPrice || 0)) * it.qty;
            });
        });
        const list = Object.values(productStats).sort(function(a, b) { return b.total - a.total; });
        
        let html = '<div class="report-summary"><div class="report-stat green"><div class="num">' + list.length + '</div><div class="lbl">منتجات مباعة</div></div></div>';
        html += '<div class="report-table-header" style="grid-template-columns: 0.5fr 1.8fr 0.8fr 1fr 1fr;"><span>#</span><span>المنتج</span><span>الكمية</span><span>المبيعات</span><span>الربح</span></div>';
        list.forEach(function(p, i) {
            html += '<div class="report-table-row" style="grid-template-columns: 0.5fr 1.8fr 0.8fr 1fr 1fr;">' +
                '<span>' + (i + 1) + '</span>' +
                '<span><strong>' + p.name + '</strong></span>' +
                '<span class="blue">' + p.qty + '</span>' +
                '<span class="green">' + window.formatMoney(p.total) + '</span>' +
                '<span class="gold">' + window.formatMoney(p.profit) + '</span>' +
            '</div>';
        });
        container.innerHTML = html;
    } else if (type === 'customers') {
        const customerStats = {};
        (window.sales || []).forEach(function(s) {
            const c = s.customer || 'عميل نقدي';
            if (!customerStats[c]) customerStats[c] = { name: c, total: 0, count: 0 };
            customerStats[c].total += s.total || 0;
            customerStats[c].count++;
        });
        const list = Object.values(customerStats).sort(function(a, b) { return b.total - a.total; });
        
        let html = '<div class="report-summary"><div class="report-stat green"><div class="num">' + list.length + '</div><div class="lbl">عدد العملاء</div></div></div>';
        html += '<div class="report-table-header" style="grid-template-columns: 0.5fr 1.8fr 1fr 1fr;"><span>#</span><span>العميل</span><span>المشتريات</span><span>الفواتير</span></div>';
        list.forEach(function(c, i) {
            html += '<div class="report-table-row" style="grid-template-columns: 0.5fr 1.8fr 1fr 1fr;">' +
                '<span>' + (i + 1) + '</span>' +
                '<span><strong>' + c.name + '</strong></span>' +
                '<span class="green">' + window.formatMoney(c.total) + '</span>' +
                '<span class="blue">' + c.count + '</span>' +
            '</div>';
        });
        container.innerHTML = html;
    }
};

window.printCurrentReport = function() {
    window.print();
};

window.exportReportCSV = function() {
    if (!window.currentReportData || !window.currentReportData.dataList) {
        window.showToast('⚠️ لا توجد بيانات', 'warning');
        return;
    }
    let csv = '\uFEFF';
    csv += 'الفترة,المبيعات,المشتريات,المصروفات,إجمالي الربح,صافي الربح\n';
    window.currentReportData.dataList.forEach(function(d) {
        csv += '"' + d.label + '",' + d.salesAmount.toFixed(2) + ',' + d.purchasesAmount.toFixed(2) + ',' + 
               d.expensesAmount.toFixed(2) + ',' + d.grossProfit.toFixed(2) + ',' + d.netProfit.toFixed(2) + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'report-' + window.currentReport + '-' + window.getTodayDate() + '.csv';
    a.click();
    window.showToast('✅ تم التصدير', 'success');
};

// ═══════════════════════════════════════════════════════════
// بيانات الشركة (مع الشعار)
// ═══════════════════════════════════════════════════════════
window.renderCompany = function() {
    const c = window.companyData || {};
    
    const setVal = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };
    
    setVal('companyName', c.name);
    setVal('companyTradeName', c.tradeName);
    setVal('companyPhone', c.phone);
    setVal('companyPhone2', c.phone2);
    setVal('companyEmail', c.email);
    setVal('companyWebsite', c.website);
    setVal('companyAddress', c.address);
    setVal('companyCity', c.city);
    setVal('companyCountry', c.country || 'مصر');
    setVal('companyTax', c.tax);
    setVal('companyCommercial', c.commercial);
    setVal('companyTaxCard', c.taxCard);
    setVal('companyNationalId', c.nationalId);
    setVal('companyFooter', c.footer);
    
    const colorEl = document.getElementById('companyPrimaryColor');
    if (colorEl) colorEl.value = c.primaryColor || '#C9A94E';
    
    const curEl = document.getElementById('companyCurrency');
    if (curEl) curEl.value = c.currency || 'ج.م';
    
    // الشعار
    const logoPreview = document.getElementById('companyLogoPreview');
    const logoImg = document.getElementById('companyLogoImg');
    if (c.logo && logoPreview && logoImg) {
        logoImg.src = c.logo;
        logoPreview.style.display = 'block';
    } else if (logoPreview) {
        logoPreview.style.display = 'none';
    }
    
    const setTxt = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    
    setTxt('companyProductsCount', (window.products || []).length);
    setTxt('companySalesCount', (window.sales || []).length);
    setTxt('companyCustomersCount', (window.customers || []).length);
    setTxt('companySuppliersCount', (window.suppliers || []).length);
    
    const totalSales = (window.sales || []).reduce(function(s, x) { return s + (x.total || 0); }, 0);
    setTxt('companySalesTotal', window.formatMoney(totalSales) + ' ج.م');
};

window.saveCompanyFullData = function() {
    if (!window.isAdmin()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    
    const getVal = function(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };
    
    // حافظ على الشعار الحالي
    const currentLogo = window.companyData.logo || '';
    
    window.companyData = {
        name: getVal('companyName') || 'الميزان',
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
        logo: currentLogo,
        updatedAt: new Date().toISOString(),
        updatedBy: window.currentUser ? window.currentUser.name : ''
    };
    
    window.setData('companyData', window.companyData);
    
    const headerCompany = document.getElementById('headerCompanyName');
    if (headerCompany) headerCompany.textContent = window.companyData.name;
    
    window.showToast('✅ تم حفظ بيانات الشركة', 'success');
};

// رفع الشعار
window.uploadCompanyLogo = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 500000) {
        window.showToast('⚠️ الصورة كبيرة جداً (الحد 500KB)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const logoData = e.target.result;
        window.companyData.logo = logoData;
        window.setData('companyData', window.companyData);
        
        const preview = document.getElementById('companyLogoPreview');
        const img = document.getElementById('companyLogoImg');
        if (preview && img) {
            img.src = logoData;
            preview.style.display = 'block';
        }
        
        window.showToast('✅ تم رفع الشعار', 'success');
    };
    reader.readAsDataURL(file);
};

window.removeCompanyLogo = function() {
    if (!confirm('⚠️ حذف الشعار؟')) return;
    window.companyData.logo = '';
    window.setData('companyData', window.companyData);
    
    const preview = document.getElementById('companyLogoPreview');
    if (preview) preview.style.display = 'none';
    
    window.showToast('🗑️ تم حذف الشعار', 'info');
};

window.resetCompanyForm = function() {
    if (!confirm('⚠️ إلغاء التعديلات؟')) return;
    window.renderCompany();
    window.showToast('🔄 تم الاسترجاع', 'info');
};

window.printCompanyData = function() {
    window.print();
};

// ═══════════════════════════════════════════════════════════
// ERP — المستودعات والفروع والعملات
// ═══════════════════════════════════════════════════════════
window.showERPTab = function(tab, btn) {
    if (!tab || typeof tab !== 'string') tab = 'warehouses';
    
    ['warehouses', 'branches', 'currencies'].forEach(function(t) {
        const el = document.getElementById('erpTab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (el) el.style.display = 'none';
    });
    
    const target = document.getElementById('erpTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (target) target.style.display = 'block';
    
    document.querySelectorAll('#page-erp .tab-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    
    if (tab === 'warehouses') window.renderWarehouses();
    if (tab === 'branches') window.renderBranches();
    if (tab === 'currencies') window.renderCurrencies();
};

window.WAREHOUSE_TYPES = {
    'main':     { name: 'رئيسي',   icon: '🏭' },
    'branch':   { name: 'فرع',     icon: '🏪' },
    'storage':  { name: 'مخزن',    icon: '📦' },
    'returns':  { name: 'مرتجعات', icon: '🔄' }
};

window.saveWarehouse = function() {
    const nameEl = document.getElementById('warehouseName');
    const name = nameEl ? nameEl.value.trim() : '';
    if (!name) { window.showToast('⚠️ أدخل اسم المستودع', 'error'); return; }
    
    const id = document.getElementById('warehouseId') ? document.getElementById('warehouseId').value : '';
    const type = document.getElementById('warehouseType') ? document.getElementById('warehouseType').value : 'storage';
    const location = document.getElementById('warehouseLocation') ? document.getElementById('warehouseLocation').value.trim() : '';
    const manager = document.getElementById('warehouseManager') ? document.getElementById('warehouseManager').value.trim() : '';
    
    if (!window.warehouses) window.warehouses = [];
    
    if (id) {
        const idx = window.warehouses.findIndex(function(w) { return w.id == id; });
        if (idx > -1) {
            window.warehouses[idx] = Object.assign({}, window.warehouses[idx], {
                name: name, type: type, location: location, manager: manager
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        if (window.warehouses.find(function(w) { return w.name === name; })) { 
            window.showToast('⚠️ الاسم موجود', 'warning'); return; 
        }
        window.warehouses.push({
            id: Date.now(), name: name, type: type,
            location: location, manager: manager,
            active: true, createdAt: new Date().toISOString()
        });
        window.showToast('✅ تم إضافة المستودع', 'success');
    }
    
    window.setData('warehouses', window.warehouses);
    window.resetWarehouseForm();
    window.renderWarehouses();
    window.populateWarehouseField();
};

window.resetWarehouseForm = function() {
    ['warehouseId', 'warehouseName', 'warehouseLocation', 'warehouseManager'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const typeEl = document.getElementById('warehouseType');
    if (typeEl) typeEl.value = 'storage';
    const titleEl = document.getElementById('warehouseFormTitle');
    if (titleEl) titleEl.textContent = '➕ إضافة مستودع جديد';
};

window.editWarehouse = function(id) {
    const w = (window.warehouses || []).find(function(x) { return x.id == id; });
    if (!w) return;
    
    const setVal = function(elId, val) {
        const el = document.getElementById(elId);
        if (el) el.value = val;
    };
    
    setVal('warehouseId', w.id);
    setVal('warehouseName', w.name);
    setVal('warehouseLocation', w.location || '');
    setVal('warehouseManager', w.manager || '');
    const typeEl = document.getElementById('warehouseType');
    if (typeEl) typeEl.value = w.type;
    const titleEl = document.getElementById('warehouseFormTitle');
    if (titleEl) titleEl.textContent = '✏️ تعديل المستودع';
};

window.deleteWarehouse = function(id) {
    if (!confirm('⚠️ حذف هذا المستودع؟')) return;
    window.warehouses = (window.warehouses || []).filter(function(w) { return w.id != id; });
    window.setData('warehouses', window.warehouses);
    window.renderWarehouses();
    window.populateWarehouseField();
    window.showToast('🗑️ تم الحذف', 'info');
};

window.renderWarehouses = function() {
    const c = document.getElementById('warehouseList');
    if (!c) return;
    
    if ((window.warehouses || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-warehouse"></i><span>لا توجد مستودعات</span></div>';
        return;
    }
    
    let html = '';
    window.warehouses.forEach(function(w) {
        const typeInfo = window.WAREHOUSE_TYPES[w.type] || { name: w.type, icon: '📦' };
        html += '<div class="cash-box-card" style="margin-bottom:10px;border-right:4px solid #4A8AB5;padding:14px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                    '<span style="font-size:24px;">' + typeInfo.icon + '</span>' +
                    '<div>' +
                        '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + w.name + '</div>' +
                        '<div style="color:#A89070;font-size:10px;">' + typeInfo.name + (w.location ? ' - ' + w.location : '') + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            (w.manager ? '<div style="font-size:11px;color:#A89070;margin-top:4px;">👤 ' + w.manager + '</div>' : '') +
            '<div style="display:flex;gap:6px;margin-top:10px;">' +
                '<button onclick="showWarehouseStock(' + w.id + ')" style="flex:1;background:#4A8AB5;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">📊 المخزون</button>' +
                '<button onclick="editWarehouse(' + w.id + ')" style="flex:1;background:#E6A830;border:none;color:#0D0D0D;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">✏️</button>' +
                '<button onclick="deleteWarehouse(' + w.id + ')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️</button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.showWarehouseStock = function(warehouseId) {
    const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });
    if (!warehouse) return;
    
    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>🏭 مخزون ' + warehouse.name + '</h3>';
    
    const warehouseProducts = [];
    (window.products || []).forEach(function(p) {
        let qty = 0;
        if (p.warehouseStock && p.warehouseStock[warehouseId] !== undefined) {
            qty = p.warehouseStock[warehouseId];
        } else if (warehouse.type === 'main') {
            qty = p.qty || 0;
        }
        if (qty > 0) {
            warehouseProducts.push({ product: p, qty: qty, value: qty * (p.buy || 0) });
        }
    });
    
    const totalValue = warehouseProducts.reduce(function(s, i) { return s + i.value; }, 0);
    const totalQty = warehouseProducts.reduce(function(s, i) { return s + i.qty; }, 0);
    
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:12px;border-right:4px solid #C9A94E;">' +
            '<div style="color:#A89070;font-size:11px;">الأصناف</div>' +
            '<div style="color:#C9A94E;font-size:20px;font-weight:900;">' + warehouseProducts.length + '</div>' +
        '</div>' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:12px;border-right:4px solid #4A8AB5;">' +
            '<div style="color:#A89070;font-size:11px;">الكمية</div>' +
            '<div style="color:#4A8AB5;font-size:20px;font-weight:900;">' + totalQty + '</div>' +
        '</div>' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:12px;border-right:4px solid #2D8F5E;">' +
            '<div style="color:#A89070;font-size:11px;">القيمة</div>' +
            '<div style="color:#2D8F5E;font-size:18px;font-weight:900;">' + window.formatMoney(totalValue) + '</div>' +
        '</div>' +
    '</div>';
    
    html += '<div style="max-height:400px;overflow-y:auto;">';
    if (warehouseProducts.length === 0) {
        html += '<div style="text-align:center;padding:40px;color:#5D5D5D;">لا يوجد مخزون</div>';
    } else {
        warehouseProducts.sort(function(a, b) { return b.value - a.value; }).forEach(function(item) {
            const color = item.qty <= (item.product.min || 5) ? '#E06060' : '#2D8F5E';
            html += '<div style="background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid ' + color + ';">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<strong style="color:#C9A94E;font-size:13px;">' + item.product.name + '</strong>' +
                    '<span style="color:' + color + ';font-weight:900;font-size:15px;">' + item.qty + '</span>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;font-size:11px;color:#A89070;margin-top:4px;">' +
                    '<span>شراء: ' + window.formatMoney(item.product.buy) + '</span>' +
                    '<span>قيمة: ' + window.formatMoney(item.value) + ' ج.م</span>' +
                '</div>' +
            '</div>';
        });
    }
    html += '</div>';
    html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    
    window.openModal(html);
};

window.saveBranch = function() {
    const nameEl = document.getElementById('branchName');
    const name = nameEl ? nameEl.value.trim() : '';
    if (!name) { window.showToast('⚠️ أدخل اسم الفرع', 'error'); return; }
    
    if (!window.branches) window.branches = [];
    window.branches.push({
        id: Date.now(), name: name,
        code: document.getElementById('branchCode') ? document.getElementById('branchCode').value.trim() : '',
        address: document.getElementById('branchAddress') ? document.getElementById('branchAddress').value.trim() : '',
        phone: document.getElementById('branchPhone') ? document.getElementById('branchPhone').value.trim() : '',
        active: true
    });
    
    window.setData('branches', window.branches);
    ['branchName','branchCode','branchAddress','branchPhone'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    window.renderBranches();
    window.showToast('✅ تم إضافة الفرع', 'success');
};

window.renderBranches = function() {
    const c = document.getElementById('branchList');
    if (!c) return;
    
    if (!window.branches || window.branches.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i><span>لا توجد فروع</span></div>';
        return;
    }
    
    let html = '';
    window.branches.forEach(function(b) {
        html += '<div class="cash-box-card" style="margin-bottom:10px;border-right:4px solid #9B59B6;padding:14px;">' +
            '<div style="color:#C9A94E;font-weight:900;font-size:14px;">🏢 ' + b.name + '</div>' +
            (b.address ? '<div style="font-size:11px;color:#A89070;margin-top:4px;">📍 ' + b.address + '</div>' : '') +
            (b.phone ? '<div style="font-size:11px;color:#A89070;">📞 ' + b.phone + '</div>' : '') +
            '<div style="display:flex;gap:6px;margin-top:10px;">' +
                '<button onclick="deleteBranch(' + b.id + ')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️ حذف</button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.deleteBranch = function(id) {
    if (!confirm('⚠️ حذف هذا الفرع؟')) return;
    window.branches = (window.branches || []).filter(function(b) { return b.id != id; });
    window.setData('branches', window.branches);
    window.renderBranches();
    window.showToast('🗑️ تم الحذف', 'info');
};

window.renderCurrencies = function() {
    const c = document.getElementById('currencyList');
    if (!c) return;
    
    const currencies = [
        { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', rate: 1, isDefault: true },
        { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 50.00 },
        { code: 'EUR', name: 'يورو', symbol: '€', rate: 54.00 },
        { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 13.33 },
        { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 13.60 }
    ];
    
    let html = '<div style="background:#1A1A1A;border-radius:10px;padding:12px;margin-bottom:12px;color:#A89070;font-size:11px;text-align:center;">' +
        '💱 أسعار الصرف مقابل الجنيه المصري' +
    '</div>';
    
    currencies.forEach(function(curr) {
        html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid ' + (curr.isDefault ? '#C9A94E' : '#4A8AB5') + ';padding:12px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<div>' +
                    '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + curr.symbol + ' ' + curr.name + '</div>' +
                    '<div style="color:#A89070;font-size:10px;">' + curr.code + (curr.isDefault ? ' ⭐' : '') + '</div>' +
                '</div>' +
                '<div style="text-align:left;">' +
                    '<div style="color:#2D8F5E;font-weight:900;font-size:15px;">' + curr.rate.toFixed(2) + '</div>' +
                    '<div style="color:#A89070;font-size:9px;">ج.م لكل وحدة</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// لوحة التحكم
// ═══════════════════════════════════════════════════════════
window.updateDashboard = function() {
    const totalProducts = (window.products || []).length;
    const totalQty = (window.products || []).reduce(function(s, p) { return s + (p.qty || 0); }, 0);
    const totalValue = (window.products || []).reduce(function(s, p) { return s + ((p.qty || 0) * (p.buy || 0)); }, 0);
    const lowStock = (window.products || []).filter(function(p) { return p.qty <= (p.min || 5); }).length;
    const totalSalesCount = (window.sales || []).length;
    const totalSalesAmount = (window.sales || []).reduce(function(s, sale) { return s + (sale.total || 0); }, 0);
    const totalPurchasesAmount = (window.purchases || []).reduce(function(s, pur) { return s + (pur.total || 0); }, 0);
    const totalExpensesAmount = (window.expenses || []).reduce(function(s, exp) { return s + (exp.amount || 0); }, 0);
    const totalProfit = (window.sales || []).reduce(function(s, sale) { return s + (sale.profit || 0); }, 0) - totalExpensesAmount;
    const totalTreasury = window.getTotalCashBalance();
    let custDebt = 0; 
    (window.customers || []).forEach(function(c) { custDebt += window.getCustomerBalance(c.name); });
    let supDebt = 0; 
    (window.suppliers || []).forEach(function(s) { supDebt += window.getSupplierBalance(s.name); });

    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('dashProducts', totalProducts);
    set('dashInventory', totalQty);
    set('dashInventoryValue', window.formatMoney(totalValue));
    set('dashLowStock', lowStock);
    set('dashSalesCount', totalSalesCount);
    set('dashSalesTotal', window.formatMoney(totalSalesAmount));
    set('dashPurchasesTotal', window.formatMoney(totalPurchasesAmount));
    set('dashExpensesTotal', window.formatMoney(totalExpensesAmount));
    set('dashTreasury', window.formatMoney(totalTreasury));
    set('dashProfit', window.formatMoney(totalProfit));
    set('dashCustomerDebt', window.formatMoney(custDebt));
    set('dashSupplierDebt', window.formatMoney(supDebt));

    // آخر المبيعات
    const container = document.getElementById('dashLastSales');
    if (!container) return;
    if ((window.sales || []).length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><span>لا توجد مبيعات</span></div>';
        return;
    }
    const last5 = window.sales.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 5);
    let html = '<div class="table-header" style="grid-template-columns: 0.5fr 1.3fr 1fr 1fr;"><span>#</span><span>العميل</span><span>المبلغ</span><span>الربح</span></div>';
    last5.forEach(function(inv) {
        html += '<div class="table-row" style="grid-template-columns: 0.5fr 1.3fr 1fr 1fr;">' +
            '<span>#' + inv.number + '</span>' +
            '<span style="font-size:11px;">' + (inv.customer || 'عميل نقدي') + '</span>' +
            '<span style="color:#2D8F5E;font-weight:700;">' + window.formatMoney(inv.total) + '</span>' +
            '<span style="color:#C9A94E;font-weight:700;">' + window.formatMoney(inv.profit || 0) + '</span>' +
        '</div>';
    });
    container.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الإعدادات العامة
// ═══════════════════════════════════════════════════════════
window.renderSettings = function() {
    const setTxt = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    setTxt('setProductsCount', (window.products || []).length);
    setTxt('setSalesCount', (window.sales || []).length);
    setTxt('setCustomersCount', (window.customers || []).length);
    setTxt('setSuppliersCount', (window.suppliers || []).length);
};

window.exportData = function() {
    const data = {
        version: '17.0',
        exportDate: new Date().toISOString(),
        products: window.products,
        sales: window.sales,
        purchases: window.purchases,
        customers: window.customers,
        suppliers: window.suppliers,
        cashBoxes: window.cashBoxes,
        expenses: window.expenses,
        treasury: window.treasury,
        payments: window.payments,
        returns: window.returns,
        users: window.users,
        accounts: window.accounts,
        journalEntries: window.journalEntries,
        warehouses: window.warehouses,
        branches: window.branches,
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
    if (!window.isAdmin()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm('⚠️ سيتم استبدال البيانات. متابعة؟')) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            const keys = ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','accounts','journalEntries','warehouses','branches','companyData'];
            keys.forEach(function(k) {
                if (data[k]) {
                    window[k] = Array.isArray(data[k]) ? data[k] : Object.values(data[k]);
                }
            });
            window.saveAll();
            window.showToast('✅ تم الاستيراد', 'success');
            setTimeout(function() { location.reload(); }, 1500);
        } catch (err) { window.showToast('❌ ملف غير صالح', 'error'); }
    };
    reader.readAsText(file);
    event.target.value = '';
};

window.saveAll = function() {
    const keys = ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','accounts','journalEntries','warehouses','branches','companyData'];
    keys.forEach(function(k) { window.setData(k, window[k]); });
};

// ═══════════════════════════════════════════════════════════
// الحسابات (بسيطة)
// ═══════════════════════════════════════════════════════════
window.renderAccounts = function() {
    const c = document.getElementById('accountList');
    if (!c) {
        console.log('accountList element not found');
        return;
    }
    c.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><span>جاري التحميل...</span></div>';
};

window.renderJournalEntries = function() {
    const c = document.getElementById('journalList');
    if (!c) return;
    if ((window.journalEntries || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-list"></i><span>لا توجد قيود محاسبية</span></div>';
        return;
    }
    let html = '';
    (window.journalEntries || []).slice(0, 50).forEach(function(entry) {
        html += '<div class="cash-box-card" style="margin-bottom:10px;border-right:4px solid #C9A94E;padding:12px;">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
                '<strong style="color:#C9A94E;font-size:12px;">📝 قيد #' + entry.number + '</strong>' +
                '<span style="color:#A89070;font-size:10px;">' + entry.date + '</span>' +
            '</div>' +
            '<div style="color:#F5E6C8;font-size:12px;margin-bottom:8px;">' + entry.description + '</div>' +
            '<div style="background:#0D0D0D;border-radius:6px;padding:8px;font-size:11px;">' +
                (entry.lines || []).map(function(line) {
                    return '<div style="display:flex;justify-content:space-between;padding:2px 0;' + 
                        (line.debit > 0 ? 'color:#2D8F5E;' : 'color:#E06060;') + '">' +
                        '<span>حساب #' + line.accountId + '</span>' +
                        '<span>' + (line.debit > 0 ? '+' + window.formatMoney(line.debit) : '-' + window.formatMoney(line.credit)) + '</span>' +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.showTrialBalance = function() {
    let totalDebit = 0, totalCredit = 0;
    (window.journalEntries || []).forEach(function(entry) {
        (entry.lines || []).forEach(function(line) {
            totalDebit += parseFloat(line.debit) || 0;
            totalCredit += parseFloat(line.credit) || 0;
        });
    });
    
    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>⚖️ ميزان المراجعة</h3>' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">' +
            '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#2D8F5E;">إجمالي المدين:</span><strong style="color:#2D8F5E;">' + window.formatMoney(totalDebit) + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#E06060;">إجمالي الدائن:</span><strong style="color:#E06060;">' + window.formatMoney(totalCredit) + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #C9A94E;margin-top:6px;">' +
                '<strong>' + (Math.abs(totalDebit - totalCredit) < 0.01 ? '✅ متوازن' : '⚠️ الفرق') + '</strong>' +
                '<strong>' + window.formatMoney(Math.abs(totalDebit - totalCredit)) + '</strong>' +
            '</div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

window.showIncomeStatement = function() {
    const totalSales = (window.sales || []).reduce(function(s, x) { return s + (x.total || 0); }, 0);
    const totalExpenses = (window.expenses || []).reduce(function(s, x) { return s + (x.amount || 0); }, 0);
    const netProfit = totalSales - totalExpenses;
    
    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>📈 قائمة الدخل</h3>' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">' +
            '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#4A8AB5;">💰 الإيرادات:</span><strong style="color:#2D8F5E;">' + window.formatMoney(totalSales) + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#E6A830;">💸 المصروفات:</span><strong style="color:#E06060;">' + window.formatMoney(totalExpenses) + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #C9A94E;margin-top:6px;font-size:16px;">' +
                '<strong>' + (netProfit >= 0 ? '✅ صافي الربح' : '❌ صافي الخسارة') + '</strong>' +
                '<strong style="color:' + (netProfit >= 0 ? '#2D8F5E' : '#E06060') + ';">' + window.formatMoney(Math.abs(netProfit)) + '</strong>' +
            '</div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

window.showBalanceSheet = function() {
    const totalValue = (window.products || []).reduce(function(s, p) { return s + ((p.qty || 0) * (p.buy || 0)); }, 0);
    const totalCash = window.getTotalCashBalance();
    const assets = totalValue + totalCash;
    const liabilities = (window.suppliers || []).reduce(function(s, sup) { return s + window.getSupplierBalance(sup.name); }, 0);
    const equity = assets - liabilities;
    
    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>💼 الميزانية العمومية</h3>' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">' +
            '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#2D8F5E;">💎 الأصول:</span><strong style="color:#2D8F5E;">' + window.formatMoney(assets) + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#E06060;">📋 الالتزامات:</span><strong style="color:#E06060;">' + window.formatMoney(liabilities) + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #C9A94E;margin-top:6px;">' +
                '<strong style="color:#C9A94E;">👑 حقوق الملكية:</strong>' +
                '<strong style="color:#C9A94E;">' + window.formatMoney(equity) + '</strong>' +
            '</div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

window.showAddJournalDialog = function() {
    window.showToast('ℹ️ ميزة القيد اليدوي قريباً', 'info');
};

// ═══════════════════════════════════════════════════════════
// تهيئة عامة وتحديث
// ═══════════════════════════════════════════════════════════
window.refreshAllUI = function() {
    const fns = [
        'renderProducts', 'updateDashboard', 'renderCustomers', 'renderSuppliers',
        'renderCashBoxes', 'renderExpenses', 'renderTreasury', 'renderInvoices',
        'renderPayments', 'renderReturns', 'renderUsers', 'populateLoginUsers',
        'populateSaleProducts', 'populateSaleCustomers', 'populatePurProducts',
        'populatePurSuppliers', 'populateCashBoxDropdowns', 'populateWarehouseField',
        'populateCollectCustomers', 'populatePaySuppliers', 'populateRetProducts',
        'renderWarehouses', 'renderBranches', 'renderCurrencies',
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
    window.warehouses = window.toArray(window.getData('warehouses', []));
    window.branches = window.toArray(window.getData('branches', []));
    window.companyData = window.getData('companyData', window.companyData);

    // بيانات تجريبية
    if (window.products.length === 0 && !localStorage.getItem('mizan_seeded_v4')) {
        window.products = [
            { id: 1, name: 'قلم جاف', barcode: '1001', buy: 2, sell: 5, qty: 50, min: 10, warehouseStock: {} },
            { id: 2, name: 'كشكول 60 ورقة', barcode: '1002', buy: 8, sell: 15, qty: 30, min: 5, warehouseStock: {} },
            { id: 3, name: 'مسطرة 30 سم', barcode: '1003', buy: 3, sell: 7, qty: 40, min: 10, warehouseStock: {} }
        ];
        window.setData('products', window.products);
        localStorage.setItem('mizan_seeded_v4', 'true');
    }

    if (window.cashBoxes.length === 0) {
        window.cashBoxes = [
            { id: 1, name: 'نقدي', type: 'cash', icon: '💵', isDefault: true, active: true, openingBalance: 0 },
            { id: 2, name: 'فودافون كاش', type: 'wallet', icon: '📱', active: true, openingBalance: 0 },
            { id: 3, name: 'انستاباي', type: 'wallet', icon: '💳', active: true, openingBalance: 0 },
            { id: 4, name: 'بنك', type: 'bank', icon: '🏦', active: true, openingBalance: 0 }
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
    setTimeout(window.populateLoginUsers, 500);
    setTimeout(window.populateLoginUsers, 1500);

    const loginCont = document.getElementById('loginContainer');
    const appCont = document.getElementById('appContent');
    if (loginCont) loginCont.classList.remove('hidden');
    if (appCont) appCont.style.display = 'none';

    window.updateClock();
    window.refreshAllUI();

    console.log('✅ التطبيق جاهز!');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.init();
        setInterval(window.updateClock, 1000);
        console.log('✅ app.js v17.0 كامل');
    });
} else {
    window.init();
    setInterval(window.updateClock, 1000);
}

window.__appLoaded = true;

