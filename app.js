// ============================================================
// الميزان 19.0.0 - app.js
// الجزء 1: الأساسيات + الأدوات + الحالة
// ============================================================

console.log('🚀 تحميل app.js v19.0.0');

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
    footer: 'شكراً لتعاملكم معنا 🌟',
    logo: ''
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
// ★★★ اللوجو: التحميل والتطبيق ★★★
// ═══════════════════════════════════════════════════════════

window.applyLogoOnLoad = function() {
    const company = window.companyData || {};
    const logoData = company.logo || '';

    const headerLogo = document.getElementById('headerLogo');
    const defaultIcon = document.getElementById('headerDefaultIcon');

    if (headerLogo && defaultIcon) {
        if (logoData) {
            headerLogo.src = logoData;
            headerLogo.style.display = 'block';
            defaultIcon.style.display = 'none';
        } else {
            headerLogo.style.display = 'none';
            defaultIcon.style.display = 'block';
        }
    }

    // اسم الشركة
    const headerCompany = document.getElementById('headerCompanyName');
    if (headerCompany) {
        headerCompany.textContent = company.name || 'الميزان Pro';
    }

    // معاينة في صفحة الشركة
    const preview = document.getElementById('companyLogoPreview');
    const img = document.getElementById('companyLogoImg');
    if (preview && img) {
        if (logoData) {
            img.src = logoData;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }
};

window.loadCompanyData = function() {
    try {
        const saved = localStorage.getItem('mizan_companyData');
        if (saved) {
            window.companyData = JSON.parse(saved);
        }
        // تأكد إن companyData موجودة
        if (!window.companyData) window.companyData = {};
        
        // تطبيق اللوجو
        window.applyLogoOnLoad();

        const c = window.companyData;

        // تعبئة الحقول لو موجودة
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
    } catch (e) {
        console.warn('⚠️ خطأ في تحميل بيانات الشركة:', e);
    }
};

// ═══════════════════════════════════════════════════════════
// ★★★ اللوجو: الرفع والحذف ★★★
// ═══════════════════════════════════════════════════════════

window.uploadCompanyLogo = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('⚠️ الرجاء اختيار صورة (JPG أو PNG)');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert('⚠️ حجم الصورة كبير جداً (أقصى حد 2 ميجا)');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const logoData = e.target.result;

        if (!window.companyData) window.companyData = {};
        window.companyData.logo = logoData;

        // الحفظ في localStorage
        try {
            localStorage.setItem('mizan_companyData', JSON.stringify(window.companyData));
        } catch (err) {
            alert('⚠️ فشل الحفظ: الصورة كبيرة جداً');
            return;
        }

        // تحديث الواجهة
        window.applyLogoOnLoad();

        window.showToast('✅ تم رفع اللوجو بنجاح', 'success');
        event.target.value = '';
    };
    reader.readAsDataURL(file);
};

window.removeCompanyLogo = function() {
    if (!confirm('حذف الشعار؟')) return;

    if (!window.companyData) window.companyData = {};
    window.companyData.logo = '';

    localStorage.setItem('mizan_companyData', JSON.stringify(window.companyData));
    window.applyLogoOnLoad();

    window.showToast('🗑️ تم حذف الشعار', 'info');
};

window.saveCompanyData = function() {
    const getVal = function(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };

    const currentLogo = (window.companyData || {}).logo || '';

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
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('mizan_companyData', JSON.stringify(window.companyData));
    window.applyLogoOnLoad();

    window.showToast('✅ تم حفظ بيانات الشركة', 'success');
};

window.renderCompany = function() {
    window.loadCompanyData();

    const setTxt = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setTxt('companyProductsCount', (window.products || []).length);
    setTxt('companySalesCount', (window.sales || []).length);
    setTxt('companyCustomersCount', (window.customers || []).length);
    setTxt('companySuppliersCount', (window.suppliers || []).length);

    const totalSales = (window.sales || []).reduce(function(s, x) {
        return s + (parseFloat(x.total) || 0);
    }, 0);

    setTxt('companySalesTotal', window.formatMoney(totalSales) + ' ج.م');
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
        'settings': ['renderSettings'],
        'company': ['renderCompany']
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

    // ★★★ تحديث قائمة الإعلانات ★★★
    if (page === 'settings' && typeof window.renderAdsList === 'function') {
        setTimeout(window.renderAdsList, 100);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ═══════════════════════════════════════════════════════════
// قائمة المزيد
// ═══════════════════════════════════════════════════════════
window.toggleMoreMenu = function() {
    const menu = document.getElementById('moreMenu');
    if (!menu) return;
    menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
};

// ═══════════════════════════════════════════════════════════
// التهيئة
// ═══════════════════════════════════════════════════════════
window.init = function() {
    console.log('🚀 بدء التهيئة v19.0.0...');

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
        footer: 'شكراً لتعاملكم معنا 🌟',
        logo: ''
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
                type: 'cash',
                balance: 0,
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
        window.setData('cashBoxes', window.cashBoxes);
    }

    // ★★★ تحميل بيانات الشركة واللوجو ★★★
    window.loadCompanyData();

    // تعبئة المستخدمين
    if (typeof window.populateLoginUsers === 'function') {
        window.populateLoginUsers();
    }

    // إظهار شاشة الدخول
    const loginCont = document.getElementById('loginContainer');
    const appCont = document.getElementById('appContent');
    if (loginCont) loginCont.classList.remove('hidden');
    if (appCont) appCont.style.display = 'none';

    // الساعة
    window.updateClock();
    setInterval(window.updateClock, 1000);

    // قوائم الخزائن والمستودعات
    if (typeof window.populateCashBoxes === 'function') window.populateCashBoxes();
    if (typeof window.populateWarehouses === 'function') window.populateWarehouses();

    console.log('✅ التطبيق جاهز');
};

// تشغيل التطبيق
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.init();
    });
} else {
    window.init();
}

console.log('✅ app.js v19.0.0 كامل جاهز');
