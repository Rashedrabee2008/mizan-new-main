// ============================================================
// الميزان 18.0.0 - app.js
// الجزء 1: الأساسيات + الأدوات + الحالة
// ============================================================

console.log('🚀 تحميل app.js v18.0.0 - الجزء 1');

// ═══════════════════════════════════════════════════════════
// المتغيرات الأساسية
// ═══════════════════════════════════════════════════════════
const STORAGE_KEY = 'mizan_';

window.products = [];
window.warehouses = [];
window.warehouseReceipts = [];
window.warehouseIssues = [];
window.warehouseTransfers = [];
window.warehouseAdjustments = [];
window.openingBalances = [];
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
window.companyData = {
    name: 'الميزان',
    phone: '',
    address: '',
    tax: '',
    footer: 'شكراً لتعاملكم معنا 🌟'
};
window.vatSettings = { defaultVAT: 14 };

window.currentUser = null;
window.currentSaleItems = [];
window.currentPurItems = [];
window.currentRetItems = [];
window.currentWhAddItems = [];
window.currentWhIssueItems = [];
window.currentWhTransferItems = [];
window.currentWhAdjustItems = [];
window.currentWhOpeningItems = [];

// ═══════════════════════════════════════════════════════════
// الأدوار
// ═══════════════════════════════════════════════════════════
window.ROLES = {
    admin:   { name: 'مدير',   icon: '👑' },
    manager: { name: 'مشرف',   icon: '📊' },
    cashier: { name: 'كاشير',  icon: '💰' },
    seller:  { name: 'بائع',   icon: '🛒' },
    viewer:  { name: 'مشاهد',  icon: '👁️' }
};

// ═══════════════════════════════════════════════════════════
// أدوات مساعدة
// ═══════════════════════════════════════════════════════════
window.$ = function(id) {
    return document.getElementById(id);
};

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
        const d = localStorage.getItem(STORAGE_KEY + key);
        return d ? JSON.parse(d) : def;
    } catch (e) {
        return def;
    }
};

window.setData = function(key, data) {
    try {
        localStorage.setItem(STORAGE_KEY + key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('❌ خطأ في حفظ ' + key + ':', e.message);
        return false;
    }
};

// ═══════════════════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════════════════
window.showToast = function(msg, type) {
    type = type || 'info';
    const t = document.getElementById('toast');
    if (!t) {
        console.log('[' + type + '] ' + msg);
        return;
    }
    t.textContent = msg;
    t.className = 'toast show ' + type;
    clearTimeout(t._t);
    t._t = setTimeout(function() {
        t.className = 'toast';
    }, 3000);
};

// ═══════════════════════════════════════════════════════════
// Modal
// ═══════════════════════════════════════════════════════════
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
        if (e.target === overlay) closeModal();
    };
};

window.closeModal = function() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('show');
};

// ═══════════════════════════════════════════════════════════
// الساعة
// ═══════════════════════════════════════════════════════════
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
// الصلاحيات
// ═══════════════════════════════════════════════════════════
window.hasPermission = function(permission) {
    if (!window.currentUser) return false;
    const role = window.currentUser.role;
    const permissions = {
        admin:   ['add', 'edit', 'delete', 'view', 'manage_users', 'settings', 'view_reports', 'clear_data'],
        manager: ['add', 'edit', 'view', 'view_reports', 'settings'],
        cashier: ['add', 'view'],
        seller:  ['add', 'view'],
        viewer:  ['view']
    };
    return (permissions[role] || []).indexOf(permission) > -1;
};

window.isAdmin = function() {
    return window.currentUser && window.currentUser.role === 'admin';
};

window.canAdd = function() {
    return window.hasPermission('add');
};

window.canDelete = function() {
    return window.hasPermission('delete');
};

window.canManageUsers = function() {
    return window.hasPermission('manage_users');
};

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
        'cashier': ['populateSaleProducts', 'populateSaleCustomers', 'populateCashBoxes', 'populateWarehouses', 'renderCashier', 'updateSaleTotals'],
        'purchases': ['populatePurProducts', 'populatePurSuppliers', 'populateCashBoxes', 'populateWarehouses', 'renderPurItems'],
        'customers': ['renderCustomers'],
        'suppliers': ['renderSuppliers'],
        'cashboxes': ['populateCashBoxes', 'renderCashBoxes'],
        'expenses': ['populateCashBoxes', 'renderExpenses', 'updateExpensesStats'],
        'invoices': ['updateInvoiceStats', 'renderInvoices'],
        'payments': ['populateCollectCustomers', 'populatePaySuppliers', 'populateCashBoxes', 'updatePaymentsStats', 'renderPayments'],
        'returns': ['populateReturnParties', 'populateRetProducts', 'populateCashBoxes', 'populateWarehouses', 'updateReturnsStats', 'renderReturns'],
        'warehouses': ['populateWarehouses', 'renderWarehouses'],
        'accounts': ['renderAccounts', 'renderJournalEntries'],
        'reports': ['renderReport'],
        'users': ['renderUsers'],
        'settings': ['renderSettings']
    };

    (pageActions[page] || []).forEach(function(fn) {
        if (typeof window[fn] === 'function') {
            try {
                window[fn]();
            } catch (e) {
                console.warn('⚠️ خطأ في ' + fn + ':', e.message);
            }
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

console.log('✅ app.js - الجزء 1 مكتمل');

// ============================================================
// الميزان 18.0.0 - app.js
// الجزء 2: تسجيل الدخول + المستخدمين + الإعدادات + Dashboard
// ============================================================

console.log('🚀 تحميل app.js v18.0.0 - الجزء 2');

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
            if (stored) {
                users = JSON.parse(stored);
                window.users = users;
            }
        } catch (e) {}
    }

    if (!users || users.length === 0) {
        users = [
            { id: 1, name: 'المدير', password: '123456', role: 'admin', active: true },
            { id: 2, name: 'محمد', password: '123456', role: 'manager', active: true },
            { id: 3, name: 'أحمد', password: '123456', role: 'cashier', active: true },
            { id: 4, name: 'علي', password: '123456', role: 'seller', active: true },
            { id: 5, name: 'زائر', password: '123456', role: 'viewer', active: true }
        ];
        window.users = users;
        localStorage.setItem('mizan_users', JSON.stringify(users));
    }

    let html = '<option value="">اختر المستخدم...</option>';
    users.forEach(function(u) {
        if (u.active !== false) {
            const roleInfo = window.ROLES[u.role] || { icon: '❓', name: u.role };
            html += '<option value="' + u.id + '">' + roleInfo.icon + ' ' + u.name + '</option>';
        }
    });
    sel.innerHTML = html;
};

window.checkLogin = function() {
    const userId = document.getElementById('loginUsername') ? document.getElementById('loginUsername').value : '';
    const password = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '';
    const error = document.getElementById('loginError');

    if (!userId) {
        if (error) { error.textContent = '⚠️ اختر المستخدم'; error.classList.add('show'); }
        return;
    }

    const user = (window.users || []).find(function(u) { return u.id == userId; });
    if (!user) {
        if (error) { error.textContent = '⚠️ المستخدم غير موجود'; error.classList.add('show'); }
        return;
    }

    if (user.password !== password) {
        if (error) { error.textContent = '⚠️ كلمة المرور خاطئة'; error.classList.add('show'); }
        if (document.getElementById('loginPassword')) document.getElementById('loginPassword').value = '';
        setTimeout(function() { if (error) error.classList.remove('show'); }, 3000);
        return;
    }

    // نجح الدخول
    window.currentUser = user;
    localStorage.setItem('mizan_current_user', JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role
    }));

    if (error) error.classList.remove('show');
    if (document.getElementById('loginPassword')) document.getElementById('loginPassword').value = '';

    const loginCont = document.getElementById('loginContainer');
    const appCont = document.getElementById('appContent');
    if (loginCont) loginCont.classList.add('hidden');
    if (appCont) appCont.style.display = 'block';

    window.showToast('🔓 مرحباً ' + user.name + '!', 'success');
    window.navigateTo('dashboard');

    // بدء المزامنة
    if (typeof initFirebaseSync === 'function' && window.firebaseReady) {
        setTimeout(function() {
            initFirebaseSync();
        }, 500);
    }
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

    if (typeof stopAutoSync === 'function') stopAutoSync();

    window.showToast('🔒 تم تسجيل الخروج', 'info');
};

// ═══════════════════════════════════════════════════════════
// المستخدمين
// ═══════════════════════════════════════════════════════════
window.renderUsers = function() {
    const c = document.getElementById('userList');
    if (!c) return;

    if (!window.users || window.users.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-user-cog"></i><span>لا يوجد مستخدمين</span></div>';
        return;
    }

    let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 0.8fr 1.2fr;"><span>الاسم</span><span>الدور</span><span>الحالة</span><span></span></div>';

    window.users.forEach(function(u) {
        const roleInfo = window.ROLES[u.role] || { name: u.role, icon: '❓' };
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 0.8fr 1.2fr;">' +
            '<span><strong>' + u.name + '</strong></span>' +
            '<span>' + roleInfo.icon + ' ' + roleInfo.name + '</span>' +
            '<span style="color:' + (u.active !== false ? '#2D8F5E' : '#E06060') + ';">' +
                (u.active !== false ? '✅ نشط' : '⏸️ موقوف') +
            '</span>' +
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
                name: name,
                password: password,
                role: role
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        if (window.users.find(function(u) { return u.name === name; })) {
            window.showToast('⚠️ الاسم موجود', 'warning');
            return;
        }
        window.users.push({
            id: Date.now(),
            name: name,
            password: password,
            role: role,
            active: true
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
    if (u.id === 1) {
        window.showToast('⚠️ لا يمكن حذف المدير', 'error');
        return;
    }
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
    const c = window.companyData || {};
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
};

window.saveCompanySettings = function() {
    if (!window.isAdmin()) {
        window.showToast('⚠️ لا تملك صلاحية', 'error');
        return;
    }

    const getVal = function(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };

    window.companyData = {
        name: getVal('setCompanyName') || 'الميزان',
        phone: getVal('setCompanyPhone'),
        address: getVal('setCompanyAddress'),
        tax: getVal('setCompanyTax'),
        footer: getVal('setCompanyFooter') || 'شكراً لتعاملكم معنا 🌟'
    };

    window.setData('companyData', window.companyData);

    const headerCompany = document.getElementById('headerCompanyName');
    if (headerCompany) headerCompany.textContent = window.companyData.name;

    window.showToast('✅ تم الحفظ', 'success');
};

window.exportData = function() {
    const data = {
        version: '18.0.0',
        exportDate: new Date().toISOString(),
        products: window.products,
        warehouses: window.warehouses,
        warehouseReceipts: window.warehouseReceipts,
        warehouseIssues: window.warehouseIssues,
        warehouseTransfers: window.warehouseTransfers,
        warehouseAdjustments: window.warehouseAdjustments,
        openingBalances: window.openingBalances,
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
            const keys = [
                'products', 'warehouses', 'warehouseReceipts', 'warehouseIssues',
                'warehouseTransfers', 'warehouseAdjustments', 'openingBalances',
                'sales', 'purchases', 'customers', 'suppliers', 'cashBoxes',
                'expenses', 'treasury', 'payments', 'returns', 'users',
                'accounts', 'journalEntries', 'companyData'
            ];
            keys.forEach(function(k) {
                if (data[k]) {
                    window[k] = Array.isArray(data[k]) ? data[k] : Object.values(data[k]);
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
    const keys = [
        'products', 'warehouses', 'warehouseReceipts', 'warehouseIssues',
        'warehouseTransfers', 'warehouseAdjustments', 'openingBalances',
        'sales', 'purchases', 'customers', 'suppliers', 'cashBoxes',
        'expenses', 'treasury', 'payments', 'returns', 'users',
        'accounts', 'journalEntries', 'companyData'
    ];
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
    if (!confirm('⚠️ تأكيد نهائي!')) return;

    const keys = [
        'products', 'warehouses', 'warehouseReceipts', 'warehouseIssues',
        'warehouseTransfers', 'warehouseAdjustments', 'openingBalances',
        'sales', 'purchases', 'customers', 'suppliers', 'cashBoxes',
        'expenses', 'treasury', 'payments', 'returns',
        'accounts', 'journalEntries', 'companyData'
    ];
    keys.forEach(function(k) {
        localStorage.removeItem(STORAGE_KEY + k);
    });

    window.showToast('✅ جاري المسح...', 'success');
    setTimeout(function() { location.reload(); }, 1500);
};

// ═══════════════════════════════════════════════════════════
// لوحة التحكم (Dashboard)
// ═══════════════════════════════════════════════════════════
window.updateDashboard = function() {
    const products = window.products || [];
    const sales = window.sales || [];
    const purchases = window.purchases || [];
    const expenses = window.expenses || [];
    const customers = window.customers || [];
    const suppliers = window.suppliers || [];

    // المنتجات
    const totalQty = products.reduce(function(s, p) { return s + (p.qty || 0); }, 0);
    const inventoryValue = products.reduce(function(s, p) {
        return s + ((p.qty || 0) * (p.buy || 0));
    }, 0);
    const lowStock = products.filter(function(p) {
        return (p.qty || 0) <= (p.min || 5) && (p.qty || 0) > 0;
    }).length;

    // المبيعات
    const salesTotal = sales.reduce(function(s, x) { return s + (x.total || 0); }, 0);
    const salesCount = sales.length;

    // المشتريات
    const purchasesTotal = purchases.reduce(function(s, x) { return s + (x.total || 0); }, 0);

    // المصروفات
    const expensesTotal = expenses.reduce(function(s, x) { return s + (x.amount || 0); }, 0);

    // الخزائن
    const treasuryTotal = window.getTotalCashBalance ? window.getTotalCashBalance() : 0;

    // الربح
    const grossProfit = sales.reduce(function(s, x) { return s + (x.profit || 0); }, 0);
    const netProfit = grossProfit - expensesTotal;

    // المديونيات
    const custDebt = customers.reduce(function(sum, c) {
        return sum + (window.getCustomerBalance ? window.getCustomerBalance(c.name) : 0);
    }, 0);
    const supDebt = suppliers.reduce(function(sum, s) {
        return sum + (window.getSupplierBalance ? window.getSupplierBalance(s.name) : 0);
    }, 0);

    // تحديث البطاقات
    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('dashProducts', products.length);
    set('dashInventory', totalQty);
    set('dashInventoryValue', window.formatMoney(inventoryValue));
    set('dashLowStock', lowStock);
    set('dashSalesCount', salesCount);
    set('dashSalesTotal', window.formatMoney(salesTotal));
    set('dashPurchasesTotal', window.formatMoney(purchasesTotal));
    set('dashExpensesTotal', window.formatMoney(expensesTotal));
    set('dashTreasury', window.formatMoney(treasuryTotal));
    set('dashProfit', window.formatMoney(netProfit));
    set('dashCustomerDebt', window.formatMoney(custDebt));
    set('dashSupplierDebt', window.formatMoney(supDebt));

    // لون الربح
    const profitEl = document.getElementById('dashProfit');
    if (profitEl) {
        profitEl.style.color = netProfit < 0 ? '#E06060' : netProfit > 0 ? '#2D8F5E' : '#C9A94E';
    }

    // آخر المبيعات
    window.renderLastSales();
};

window.renderLastSales = function() {
    const container = document.getElementById('dashLastSales');
    if (!container) return;

    const sales = window.sales || [];

    if (sales.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><span>لا توجد مبيعات بعد</span></div>';
        return;
    }

    const sorted = sales.slice().sort(function(a, b) { return (b.id || 0) - (a.id || 0); }).slice(0, 5);
    const payIcons = {
        cash: '💵', credit: '📝', wallet: '📱',
        visa: '💳', bank: '🏦', installment: '📅'
    };

    let html = '';
    sorted.forEach(function(sale) {
        const total = parseFloat(sale.total) || 0;
        const profit = parseFloat(sale.profit) || 0;
        const customer = sale.customer || 'عميل نقدي';
        const payIcon = payIcons[sale.paymentMethod] || '💵';
        const profitColor = profit >= 0 ? '#2D8F5E' : '#E06060';

        html += '<div style="background:linear-gradient(135deg,#0D0D0D,#1A1A1A);border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid #2D2D2D;border-right:4px solid #C9A94E;cursor:pointer;" onclick="showInvoiceDetails(' + sale.id + ')">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:10px;border-bottom:1px dashed #2D2D2D;">' +
                '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">' +
                    '<span style="font-size:20px;">' + payIcon + '</span>' +
                    '<span style="font-size:14px;font-weight:900;color:#F5E6C8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + customer + '</span>' +
                '</div>' +
                '<span style="background:linear-gradient(135deg,#C9A94E,#B8953A);color:#0D0D0D;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:900;font-family:monospace;">#' + sale.number + '</span>' +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px;font-size:11px;color:#A89070;font-weight:700;">' +
                '<span>📅 ' + (sale.date || '') + '</span>' +
                '<span>🕐 ' + (sale.time || '') + '</span>' +
                '<span>🛍️ ' + ((sale.items || []).length) + ' صنف</span>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<div style="background:#0D0D0D;border-radius:8px;padding:10px;text-align:center;border-right:3px solid #2D8F5E;">' +
                    '<div style="font-size:10px;color:#A89070;font-weight:700;margin-bottom:4px;">الإجمالي</div>' +
                    '<div style="font-size:16px;font-weight:900;color:#2D8F5E;font-family:monospace;direction:ltr;">' + window.formatMoney(total) + ' <span style="font-size:10px;opacity:0.7;">ج.م</span></div>' +
                '</div>' +
                '<div style="background:#0D0D0D;border-radius:8px;padding:10px;text-align:center;border-right:3px solid #C9A94E;">' +
                    '<div style="font-size:10px;color:#A89070;font-weight:700;margin-bottom:4px;">📈 الربح</div>' +
                    '<div style="font-size:16px;font-weight:900;color:' + profitColor + ';font-family:monospace;direction:ltr;">' + window.formatMoney(profit) + ' <span style="font-size:10px;opacity:0.7;">ج.م</span></div>' +
                '</div>' +
            '</div>' +
        '</div>';
    });

    container.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// تحديث كل الواجهة
// ═══════════════════════════════════════════════════════════
window.refreshAllUI = function() {
    const fns = [
        'renderProducts', 'updateDashboard', 'renderCustomers', 'renderSuppliers',
        'renderCashBoxes', 'renderExpenses', 'renderInvoices', 'renderPayments',
        'renderReturns', 'renderUsers', 'populateLoginUsers',
        'populateSaleProducts', 'populateSaleCustomers', 'populatePurProducts',
        'populatePurSuppliers', 'populateCashBoxes', 'populateWarehouses',
        'populateCollectCustomers', 'populatePaySuppliers', 'populateRetProducts',
        'updateInvoiceStats', 'updateExpensesStats', 'updatePaymentsStats',
        'updateReturnsStats', 'renderSettings'
    ];
    fns.forEach(function(fn) {
        if (typeof window[fn] === 'function') {
            try {
                window[fn]();
            } catch (e) {
                // تجاهل الأخطاء البسيطة
            }
        }
    });
};

console.log('✅ app.js v18.0.0 - الجزء 2 مكتمل');

// ═══════════════════════════════════════════════════════════
// ربط الأزرار (Event Listeners)
// ═══════════════════════════════════════════════════════════
window.bindEventListeners = function() {
    // ─── تسجيل الدخول ───
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.onclick = window.checkLogin;

    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.onkeydown = function(e) {
            if (e.key === 'Enter') window.checkLogin();
        };
    }

    // ─── تسجيل الخروج ───
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.onclick = window.lockApp;

    // ─── التنقل السفلي ───
    document.querySelectorAll('.bottom-nav .nav-item').forEach(function(btn) {
        btn.onclick = function() {
            const page = btn.dataset.page;
            if (page === 'more') {
                window.openMoreMenu();
            } else {
                window.navigateTo(page);
            }
        };
    });

    // ─── الإعدادات ───
    const saveCompanyBtn = document.getElementById('saveCompanyBtn');
    if (saveCompanyBtn) saveCompanyBtn.onclick = window.saveCompanySettings;

    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) exportDataBtn.onclick = window.exportData;

    const importDataBtn = document.getElementById('importDataBtn');
    const importFile = document.getElementById('importFile');
    if (importDataBtn && importFile) {
        importDataBtn.onclick = function() { importFile.click(); };
        importFile.onchange = window.importData;
    }

    const syncToCloudBtn = document.getElementById('syncToCloudBtn');
    if (syncToCloudBtn) {
        syncToCloudBtn.onclick = function() {
            if (typeof syncToCloud === 'function') syncToCloud(false);
        };
    }

    const syncFromCloudBtn = document.getElementById('syncFromCloudBtn');
    if (syncFromCloudBtn) {
        syncFromCloudBtn.onclick = function() {
            if (typeof syncFromCloud === 'function') syncFromCloud(false);
        };
    }

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) clearAllBtn.onclick = window.clearAllData;

    // ─── المستخدمين ───
    const saveUserBtn = document.getElementById('saveUserBtn');
    if (saveUserBtn) saveUserBtn.onclick = window.saveUser;

    const resetUserBtn = document.getElementById('resetUserBtn');
    if (resetUserBtn) resetUserBtn.onclick = window.resetUserForm;

    // ─── الإشعارات ───
    const enableNotifBtn = document.getElementById('enableNotifBtn');
    if (enableNotifBtn) {
        enableNotifBtn.onclick = function() {
            if (typeof requestNotificationPermission === 'function') {
                requestNotificationPermission();
            } else {
                window.showToast('ℹ️ الإشعارات قريباً', 'info');
            }
        };
    }

    const testNotifBtn = document.getElementById('testNotifBtn');
    if (testNotifBtn) {
        testNotifBtn.onclick = function() {
            if (typeof testNotification === 'function') {
                testNotification();
            } else {
                window.showToast('ℹ️ الإشعارات قريباً', 'info');
            }
        };
    }
};

// ═══════════════════════════════════════════════════════════
// قائمة المزيد
// ═══════════════════════════════════════════════════════════
window.openMoreMenu = function() {
    const pages = [
        { page: 'purchases', icon: 'fa-shopping-cart', color: '#E06060', label: 'المشتريات' },
        { page: 'customers', icon: 'fa-users', color: '#4A8AB5', label: 'العملاء' },
        { page: 'suppliers', icon: 'fa-truck', color: '#E6A830', label: 'الموردين' },
        { page: 'cashboxes', icon: 'fa-money-bill-wave', color: '#9B59B6', label: 'الخزائن' },
        { page: 'expenses', icon: 'fa-money-bill-wave', color: '#E6A830', label: 'المصروفات' },
        { page: 'invoices', icon: 'fa-file-invoice', color: '#2D8F5E', label: 'الفواتير' },
        { page: 'payments', icon: 'fa-hand-holding-usd', color: '#2D8F5E', label: 'التحصيل/السداد' },
        { page: 'returns', icon: 'fa-undo-alt', color: '#E6A830', label: 'المرتجعات' },
        { page: 'warehouses', icon: 'fa-warehouse', color: '#4A8AB5', label: 'المخازن' },
        { page: 'accounts', icon: 'fa-book', color: '#C9A94E', label: 'الحسابات' },
        { page: 'users', icon: 'fa-user-cog', color: '#9B59B6', label: 'المستخدمين' },
        { page: 'settings', icon: 'fa-cog', color: '#C9A94E', label: 'الإعدادات' }
    ];

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>📋 المزيد</h3>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';

    pages.forEach(function(p) {
        html += '<button class="btn btn-secondary" style="flex-direction:column;padding:14px 8px;min-height:80px;" ' +
            'onclick="closeModal(); navigateTo(\'' + p.page + '\');">' +
            '<i class="fas ' + p.icon + '" style="font-size:20px;color:' + p.color + ';margin-bottom:6px;"></i>' +
            '<span style="font-size:11px;">' + p.label + '</span>' +
        '</button>';
    });

    html += '</div>';
    window.openModal(html);
};

// ═══════════════════════════════════════════════════════════
// التهيئة
// ═══════════════════════════════════════════════════════════
window.init = function() {
    console.log('🚀 بدء التهيئة v18.0.0...');

    // تحميل البيانات
    window.products = window.toArray(window.getData('products', []));
    window.warehouses = window.toArray(window.getData('warehouses', []));
    window.warehouseReceipts = window.toArray(window.getData('warehouseReceipts', []));
    window.warehouseIssues = window.toArray(window.getData('warehouseIssues', []));
    window.warehouseTransfers = window.toArray(window.getData('warehouseTransfers', []));
    window.warehouseAdjustments = window.toArray(window.getData('warehouseAdjustments', []));
    window.openingBalances = window.toArray(window.getData('openingBalances', []));
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

    window.companyData = window.getData('companyData', {
        name: 'الميزان',
        phone: '',
        address: '',
        tax: '',
        footer: 'شكراً لتعاملكم معنا 🌟'
    });

    // ─── مستودع افتراضي ───
    if (window.warehouses.length === 0) {
        window.warehouses = [
            {
                id: 1,
                name: 'المستودع الرئيسي',
                type: 'main',
                location: 'المقر الرئيسي',
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
        window.setData('warehouses', window.warehouses);
    }

    // ─── خزنة افتراضية ───
    if (window.cashBoxes.length === 0) {
        window.cashBoxes = [
            {
                id: 1,
                name: 'نقدي',