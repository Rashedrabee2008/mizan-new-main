// ============================================================
// الميزان 17.0 - app.js
// التطبيق الرئيسي: التنقل + تسجيل الدخول + الترجمة + الصلاحيات + بيانات الشركة
// ============================================================

console.log('🚀 تحميل app.js v17.0');

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
    appId: "1:442192802804:web:8035c27ab7dcf38a547fa1",
    measurementId: "G-5Q1X7KZ2C2"
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
    currency: 'ج.م'
};
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
window.currentLang = 'ar';

const TRANSLATIONS = {
    ar: {
        'app_name': 'الميزان',
        'nav_dashboard': 'الرئيسية',
        'nav_inventory': 'المخزون',
        'nav_cashier': 'الكاشير',
        'nav_reports': 'التقارير',
        'nav_more': 'المزيد'
    }
};

window.t = function(key) {
    return (TRANSLATIONS[window.currentLang] && TRANSLATIONS[window.currentLang][key]) 
        || TRANSLATIONS.ar[key] 
        || key;
};

// ═══════════════════════════════════════════════════════════
// أدوات مساعدة محلية (لو مفيش core.js)
// ═══════════════════════════════════════════════════════════
if (typeof window.$ !== 'function') {
    window.$ = function(id) { return document.getElementById(id); };
}

if (typeof window.getTodayDate !== 'function') {
    window.getTodayDate = function() { 
        return new Date().toISOString().split('T')[0]; 
    };
}

if (typeof window.getNowTime !== 'function') {
    window.getNowTime = function() { 
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12 || 12;
        return hours + ':' + minutes + ' ' + ampm;
    };
}

if (typeof window.formatMoney !== 'function') {
    window.formatMoney = function(n) { 
        const num = parseFloat(n);
        if (!isFinite(num) || isNaN(num)) return '0.00';
        return num.toFixed(2); 
    };
}

if (typeof window.toArray !== 'function') {
    window.toArray = function(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        return Object.values(data).filter(function(item) { 
            return item !== null && item !== undefined; 
        });
    };
}

if (typeof window.getData !== 'function') {
    window.getData = function(key, def) {
        if (def === undefined) def = [];
        try {
            const d = localStorage.getItem('mizan_' + key);
            return d ? JSON.parse(d) : def;
        } catch (e) { return def; }
    };
}

if (typeof window.setData !== 'function') {
    window.setData = function(key, data) {
        try { 
            localStorage.setItem('mizan_' + key, JSON.stringify(data)); 
            return true;
        } catch (e) {
            console.error('❌ خطأ في حفظ ' + key + ':', e.message);
            return false;
        }
    };
}

if (typeof window.showToast !== 'function') {
    window.showToast = function(msg, type) {
        type = type || 'info';
        const t = document.getElementById('toast');
        if (!t) { console.log('[' + type + '] ' + msg); return; }
        t.textContent = msg;
        t.className = 'toast show ' + type;
        clearTimeout(t._t);
        t._t = setTimeout(function() { t.className = 'toast'; }, 3000);
    };
}

if (typeof window.openModal !== 'function') {
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
}

if (typeof window.closeModal !== 'function') {
    window.closeModal = function() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) overlay.classList.remove('show');
    };
}

if (typeof window.getRadioValue !== 'function') {
    window.getRadioValue = function(name, defaultValue) {
        defaultValue = defaultValue || '';
        const el = document.querySelector('input[name="' + name + '"]:checked');
        return el ? el.value : defaultValue;
    };
}

if (typeof window.setRadioValue !== 'function') {
    window.setRadioValue = function(name, value) {
        const el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
        if (el) el.checked = true;
    };
}

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
// بيانات الشركة
// ═══════════════════════════════════════════════════════════
window.renderCompany = function() {
    const c = window.companyData || {};
    
    const setVal = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };
    
    setVal('companyName', c.name || '');
    setVal('companyTradeName', c.tradeName || '');
    setVal('companyPhone', c.phone || '');
    setVal('companyPhone2', c.phone2 || '');
    setVal('companyEmail', c.email || '');
    setVal('companyWebsite', c.website || '');
    setVal('companyAddress', c.address || '');
    setVal('companyCity', c.city || '');
    setVal('companyCountry', c.country || 'مصر');
    setVal('companyTax', c.tax || '');
    setVal('companyCommercial', c.commercial || '');
    setVal('companyTaxCard', c.taxCard || '');
    setVal('companyNationalId', c.nationalId || '');
    setVal('companyFooter', c.footer || 'شكراً لتعاملكم معنا 🌟');
    
    const colorEl = document.getElementById('companyPrimaryColor');
    if (colorEl) colorEl.value = c.primaryColor || '#C9A94E';
    
    const currencyEl = document.getElementById('companyCurrency');
    if (currencyEl) currencyEl.value = c.currency || 'ج.م';
    
    const setTxt = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    
    setTxt('companyProductsCount', (window.products || []).length);
    setTxt('companySalesCount', (window.sales || []).length);
    setTxt('companyCustomersCount', (window.customers || []).length);
    setTxt('companySuppliersCount', (window.suppliers || []).length);
    
    const totalSales = (window.sales || []).reduce(function(s, x) { 
        return s + (x.total || 0); 
    }, 0);
    setTxt('companySalesTotal', window.formatMoney(totalSales) + ' ج.م');
};

window.saveCompanyFullData = function() {
    if (!window.isAdmin()) { 
        window.showToast('⚠️ لا تملك صلاحية', 'error'); 
        return; 
    }
    
    const getVal = function(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };
    
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
        updatedAt: new Date().toISOString(),
        updatedBy: window.currentUser ? window.currentUser.name : ''
    };
    
    window.setData('companyData', window.companyData);
    
    const headerCompany = document.getElementById('headerCompanyName');
    if (headerCompany) headerCompany.textContent = window.companyData.name;
    
    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();
    
    window.showToast('✅ تم حفظ بيانات الشركة', 'success');
};

window.resetCompanyForm = function() {
    if (!confirm('⚠️ هل تريد إلغاء التعديلات؟')) return;
    window.renderCompany();
    window.showToast('🔄 تم استرجاع البيانات الأصلية', 'info');
};

window.printCompanyData = function() {
    const c = window.companyData || {};
    
    const content = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">' +
        '<title>بيانات الشركة - ' + (c.name || 'الميزان') + '</title>' +
        '<style>' +
        '*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif;}' +
        'body{padding:30px;background:#fff;color:#000;}' +
        '.header{text-align:center;padding-bottom:20px;border-bottom:3px solid #C9A94E;margin-bottom:25px;}' +
        '.header h1{color:#C9A94E;font-size:32px;margin-bottom:8px;font-weight:900;}' +
        '.header p{color:#666;font-size:14px;}' +
        '.section{background:#f9f9f9;padding:20px;border-radius:10px;margin-bottom:20px;border-right:5px solid #C9A94E;}' +
        '.section h2{color:#C9A94E;font-size:18px;margin-bottom:15px;}' +
        '.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;}' +
        '.info-item{padding:10px;background:#fff;border-radius:8px;border:1px solid #eee;}' +
        '.info-label{color:#666;font-size:12px;margin-bottom:4px;}' +
        '.info-value{color:#000;font-size:14px;font-weight:700;}' +
        '.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:2px dashed #ccc;color:#666;font-size:12px;}' +
        '@media print{@page{size:A4;margin:15mm;}}' +
        '</style></head><body>' +
        '<div class="header">' +
        '<h1>⚖️ ' + (c.name || 'الميزان') + '</h1>' +
        '<p>' + (c.address || '') + (c.phone ? ' | 📞 ' + c.phone : '') + '</p>' +
        '</div>' +
        '<div class="section">' +
        '<h2>📋 المعلومات الأساسية</h2>' +
        '<div class="info-grid">' +
        '<div class="info-item"><div class="info-label">اسم الشركة</div><div class="info-value">' + (c.name || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">الاسم التجاري</div><div class="info-value">' + (c.tradeName || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">الهاتف</div><div class="info-value">' + (c.phone || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">الهاتف الثاني</div><div class="info-value">' + (c.phone2 || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">البريد الإلكتروني</div><div class="info-value">' + (c.email || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">الموقع الإلكتروني</div><div class="info-value">' + (c.website || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">العنوان</div><div class="info-value">' + (c.address || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">المدينة</div><div class="info-value">' + (c.city || '-') + '</div></div>' +
        '</div></div>' +
        '<div class="section">' +
        '<h2>📋 البيانات القانونية</h2>' +
        '<div class="info-grid">' +
        '<div class="info-item"><div class="info-label">الرقم الضريبي</div><div class="info-value">' + (c.tax || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">السجل التجاري</div><div class="info-value">' + (c.commercial || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">البطاقة الضريبية</div><div class="info-value">' + (c.taxCard || '-') + '</div></div>' +
        '</div></div>' +
        '<div class="footer">' +
        'طُبع في: ' + new Date().toLocaleString('ar-EG') +
        '</div>' +
        '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script>' +
        '</body></html>';
    
    const w = window.open('', '_blank');
    if (w) { 
        w.document.write(content); 
        w.document.close(); 
    }
};

// ═══════════════════════════════════════════════════════════
// ⚡ تسجيل الدخول — النسخة المحسّنة
// ═══════════════════════════════════════════════════════════
window.populateLoginUsers = function() {
    const sel = document.getElementById('loginUsername');
    if (!sel) {
        console.warn('⚠️ loginUsername غير موجود');
        return;
    }
    
    // 1. حاول تحمّل من الذاكرة
    let users = window.users;
    
    // 2. لو فاضي، حاول من localStorage
    if (!users || users.length === 0) {
        try {
            const stored = localStorage.getItem('mizan_users');
            if (stored) {
                users = JSON.parse(stored);
                window.users = users;
                console.log('✅ تم تحميل', users.length, 'مستخدم من localStorage');
            }
        } catch (e) {
            console.warn('⚠️ خطأ قراءة users:', e.message);
        }
    }
    
    // 3. لو لسه فاضي، أنشئ المستخدمين الافتراضيين
    if (!users || users.length === 0) {
        users = [
            { id: 1, name: 'المدير',  password: '123456', role: 'admin',   active: true },
            { id: 2, name: 'محمد',   password: '123456', role: 'manager', active: true },
            { id: 3, name: 'أحمد',   password: '123456', role: 'cashier', active: true },
            { id: 4, name: 'علي',    password: '123456', role: 'seller',  active: true },
            { id: 5, name: 'زائر',   password: '123456', role: 'viewer',  active: true }
        ];
        window.users = users;
        try {
            localStorage.setItem('mizan_users', JSON.stringify(users));
        } catch (e) {}
        console.log('✅ تم إنشاء المستخدمين الافتراضيين');
    }
    
    // 4. املأ القائمة
    let html = '<option value="">اختر المستخدم...</option>';
    users.forEach(function(u) {
        if (u.active !== false) {
            const roleInfo = window.ROLES[u.role] || { icon: '❓', name: u.role };
            html += '<option value="' + u.id + '">' + roleInfo.icon + ' ' + u.name + ' (' + roleInfo.name + ')</option>';
        }
    });
    sel.innerHTML = html;
    
    console.log('✅ تم تحميل قائمة المستخدمين:', users.length);
};

window.checkLogin = async function() {
    const userId = document.getElementById('loginUsername') ? document.getElementById('loginUsername').value : '';
    const password = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '';
    const error = document.getElementById('loginError');

    // التحقق من قفل الحساب
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

    // محاولة التحقق المشفر أولاً
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

    // Fallback: مقارنة مباشرة
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

    // ✅ نجح
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
    const setTxt = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    
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
    
    const nameEl = document.getElementById('setCompanyName');
    const phoneEl = document.getElementById('setCompanyPhone');
    const addressEl = document.getElementById('setCompanyAddress');
    const taxEl = document.getElementById('setCompanyTax');
    const footerEl = document.getElementById('setCompanyFooter');
    
    if (nameEl) window.companyData.name = nameEl.value.trim() || 'الميزان';
    if (phoneEl) window.companyData.phone = phoneEl.value.trim();
    if (addressEl) window.companyData.address = addressEl.value.trim();
    if (taxEl) window.companyData.tax = taxEl.value.trim();
    if (footerEl) window.companyData.footer = footerEl.value.trim() || 'شكراً لتعاملكم معنا 🌟';
    
    window.setData('companyData', window.companyData);
    
    const headerCompany = document.getElementById('headerCompanyName');
    if (headerCompany) headerCompany.textContent = window.companyData.name;
    
    window.showToast('✅ تم الحفظ', 'success');
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
        coupons: window.coupons,
        warehouses: window.warehouses,
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
            const keys = ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','accounts','journalEntries','coupons','warehouses','companyData'];
            
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
    const keys = ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','accounts','journalEntries','coupons','warehouses','companyData'];
    keys.forEach(function(k) {
        window.setData(k, window[k]);
    });
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

    // تحميل البيانات
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
        currency: 'ج.م'
    });

    // ═══ بيانات افتراضية ═══
    
    // منتجات
    if (window.products.length === 0 && !localStorage.getItem('mizan_seeded_v3')) {
        window.products = [
            { id: 1, name: 'قلم جاف', barcode: '1001', buy: 2, sell: 5, qty: 50, min: 10, warehouseStock: {} },
            { id: 2, name: 'كشكول 60 ورقة', barcode: '1002', buy: 8, sell: 15, qty: 30, min: 5, warehouseStock: {} },
            { id: 3, name: 'مسطرة 30 سم', barcode: '1003', buy: 3, sell: 7, qty: 40, min: 10, warehouseStock: {} }
        ];
        window.setData('products', window.products);
        localStorage.setItem('mizan_seeded_v3', 'true');
    }

    // خزائن
    if (window.cashBoxes.length === 0) {
        window.cashBoxes = [
            { id: 1, name: 'نقدي', type: 'cash', icon: '💵', isDefault: true, active: true, openingBalance: 0 },
            { id: 2, name: 'فودافون كاش', type: 'wallet', icon: '📱', isDefault: false, active: true, openingBalance: 0 },
            { id: 3, name: 'انستاباي', type: 'wallet', icon: '💳', isDefault: false, active: true, openingBalance: 0 },
            { id: 4, name: 'بنك', type: 'bank', icon: '🏦', isDefault: false, active: true, openingBalance: 0 }
        ];
        window.setData('cashBoxes', window.cashBoxes);
    }

    // مستخدمين
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

    // مستودعات
    if (window.warehouses.length === 0) {
        window.warehouses = [
            { id: 1, name: 'المستودع الرئيسي', type: 'main', location: 'المقر الرئيسي', manager: 'المدير', active: true }
        ];
        window.setData('warehouses', window.warehouses);
    }

    // تواريخ
    if (document.getElementById('expDate')) document.getElementById('expDate').value = window.getTodayDate();
    if (document.getElementById('collectDate')) document.getElementById('collectDate').value = window.getTodayDate();
    if (document.getElementById('payDate')) document.getElementById('payDate').value = window.getTodayDate();
    if (document.getElementById('headerCompanyName')) document.getElementById('headerCompanyName').textContent = window.companyData.name || 'الميزان';

    // Firebase
    window.initFirebase();
    
    // ⚡⚡⚡ الأهم: تحميل المستخدمين (مع محاولات متعددة) ⚡⚡⚡
    window.populateLoginUsers();
    
    // محاولات إضافية للتأكد
    setTimeout(window.populateLoginUsers, 100);
    setTimeout(window.populateLoginUsers, 500);
    setTimeout(window.populateLoginUsers, 1500);
    setTimeout(window.populateLoginUsers, 3000);

    // إظهار شاشة الدخول
    const loginCont = document.getElementById('loginContainer');
    const appCont = document.getElementById('appContent');
    if (loginCont) loginCont.classList.remove('hidden');
    if (appCont) appCont.style.display = 'none';

    // الساعة
    window.updateClock();

    // تحديث الواجهة
    window.refreshAllUI();

    console.log('✅ التطبيق جاهز!');
    console.log('📊 المستخدمين:', window.users.length);
};

// ═══════════════════════════════════════════════════════════
// التشغيل التلقائي
// ═══════════════════════════════════════════════════════════
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.init();
        setInterval(window.updateClock, 1000);
        console.log('✅ app.js v17.0 كامل');
    });
} else {
    window.init();
    setInterval(window.updateClock, 1000);
    console.log('✅ app.js v17.0 كامل');
}

// ═══════════════════════════════════════════════════════════
// حماية إضافية: تأكد من تحميل المستخدمين بعد كل حاجة
// ═══════════════════════════════════════════════════════════
window.addEventListener('load', function() {
    setTimeout(function() {
        if (typeof window.populateLoginUsers === 'function') {
            window.populateLoginUsers();
        }
    }, 500);
    
    setTimeout(function() {
        if (typeof window.populateLoginUsers === 'function') {
            window.populateLoginUsers();
        }
    }, 2000);
    
    setTimeout(function() {
        const sel = document.getElementById('loginUsername');
        if (sel && sel.innerHTML.indexOf('جاري التحميل') > -1) {
            console.warn('⚠️ القائمة لسه "جاري التحميل" - إعادة المحاولة...');
            if (typeof window.populateLoginUsers === 'function') {
                window.populateLoginUsers();
            }
        }
    }, 5000);
});

window.__appLoaded = true;
