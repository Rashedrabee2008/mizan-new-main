// ============================================================
// الميزان 17.0 - app.js
// التطبيق الرئيسي: التنقل + تسجيل الدخول + الصلاحيات + بيانات الشركة + ERP
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
window.branches = [];
window.currencies = [];
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
// أدوات مساعدة
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

    // ✅ تم إزالة showERPTab من هنا (لإصلاح التحذير)
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
// ERP — المستودعات
// ═══════════════════════════════════════════════════════════

window.showERPTab = function(tab, btn) {
    if (!tab || typeof tab !== 'string') tab = 'warehouses';
    
    ['warehouses', 'branches', 'currencies'].forEach(function(t) {
        const el = document.getElementById('erpTab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (el) el.style.display = 'none';
    });

    const target = document.getElementById('erpTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (target) target.style.display = 'block';

    document.querySelectorAll('#page-erp .tab-btn').forEach(function(b) {
        b.classList.remove('active');
    });
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
    const idEl = document.getElementById('warehouseId');
    const nameEl = document.getElementById('warehouseName');
    const typeEl = document.getElementById('warehouseType');
    const locationEl = document.getElementById('warehouseLocation');
    const managerEl = document.getElementById('warehouseManager');

    const id = idEl ? idEl.value : '';
    const name = nameEl ? nameEl.value.trim() : '';
    const type = typeEl ? typeEl.value : 'storage';
    const location = locationEl ? locationEl.value.trim() : '';
    const manager = managerEl ? managerEl.value.trim() : '';

    if (!name) { window.showToast('⚠️ أدخل اسم المستودع', 'error'); return; }

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
            window.showToast('⚠️ الاسم موجود', 'warning');
            return;
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
    if (typeof window.populateWarehouseDropdowns === 'function') window.populateWarehouseDropdowns();
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
                '<span style="color:' + (w.active !== false ? '#2D8F5E' : '#E06060') + ';font-size:11px;">' +
                    (w.active !== false ? '✅ نشط' : '⏸️ موقوف') +
                '</span>' +
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
            warehouseProducts.push({
                product: p, qty: qty, value: qty * (p.buy || 0)
            });
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

// ═══════════════════════════════════════════════════════════
// الفروع
// ═══════════════════════════════════════════════════════════

window.saveBranch = function() {
    const idEl = document.getElementById('branchId');
    const nameEl = document.getElementById('branchName');
    const codeEl = document.getElementById('branchCode');
    const addressEl = document.getElementById('branchAddress');
    const phoneEl = document.getElementById('branchPhone');

    const id = idEl ? idEl.value : '';
    const name = nameEl ? nameEl.value.trim() : '';
    const code = codeEl ? codeEl.value.trim() : '';
    const address = addressEl ? addressEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';

    if (!name) { window.showToast('⚠️ أدخل اسم الفرع', 'error'); return; }

    if (!window.branches) window.branches = [];

    if (id) {
        const idx = window.branches.findIndex(function(b) { return b.id == id; });
        if (idx > -1) {
            window.branches[idx] = Object.assign({}, window.branches[idx], {
                name: name, code: code, address: address, phone: phone
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        window.branches.push({
            id: Date.now(), name: name,
            code: code || 'BR-' + String(window.branches.length + 1).padStart(3, '0'),
            address: address, phone: phone, manager: '',
            active: true, createdAt: new Date().toISOString()
        });
        window.showToast('✅ تم الإضافة', 'success');
    }

    window.setData('branches', window.branches);
    ['branchId', 'branchName', 'branchCode', 'branchAddress', 'branchPhone'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    window.renderBranches();
};

window.renderBranches = function() {
    const c = document.getElementById('branchList');
    if (!c) return;

    if (!window.branches) window.branches = [];

    if (window.branches.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i><span>لا توجد فروع</span></div>';
        return;
    }

    let html = '';
    window.branches.forEach(function(b) {
        html += '<div class="cash-box-card" style="margin-bottom:10px;border-right:4px solid #9B59B6;padding:14px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                    '<span style="font-size:24px;">🏢</span>' +
                    '<div>' +
                        '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + b.name + '</div>' +
                        '<div style="color:#A89070;font-size:10px;">كود: ' + b.code + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            (b.address ? '<div style="font-size:11px;color:#A89070;">📍 ' + b.address + '</div>' : '') +
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

// ═══════════════════════════════════════════════════════════
// العملات
// ═══════════════════════════════════════════════════════════

window.loadCurrencies = function() {
    if (!window.currencies || window.currencies.length === 0) {
        window.currencies = [
            { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', rate: 1, isDefault: true },
            { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 50.00, isDefault: false },
            { code: 'EUR', name: 'يورو', symbol: '€', rate: 54.00, isDefault: false },
            { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 13.33, isDefault: false },
            { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 13.60, isDefault: false }
        ];
    }
};

window.renderCurrencies = function() {
    const c = document.getElementById('currencyList');
    if (!c) return;

    window.loadCurrencies();

    let html = '<div style="background:#1A1A1A;border-radius:10px;padding:12px;margin-bottom:12px;color:#A89070;font-size:11px;text-align:center;">' +
        '💱 أسعار الصرف مقابل الجنيه المصري' +
    '</div>';

    window.currencies.forEach(function(curr) {
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
        '.section{background:#f9f9f9;padding:20px;border-radius:10px;margin-bottom:20px;border-right:5px solid #C9A94E;}' +
        '.section h2{color:#C9A94E;font-size:18px;margin-bottom:15px;}' +
        '.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;}' +
        '.info-item{padding:10px;background:#fff;border-radius:8px;border:1px solid #eee;}' +
        '.info-label{color:#666;font-size:12px;margin-bottom:4px;}' +
        '.info-value{color:#000;font-size:14px;font-weight:700;}' +
        '@media print{@page{size:A4;margin:15mm;}}' +
        '</style></head><body>' +
        '<div class="header"><h1>⚖️ ' + (c.name || 'الميزان') + '</h1></div>' +
        '<div class="section"><h2>📋 المعلومات الأساسية</h2>' +
        '<div class="info-grid">' +
        '<div class="info-item"><div class="info-label">اسم الشركة</div><div class="info-value">' + (c.name || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">الهاتف</div><div class="info-value">' + (c.phone || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">البريد</div><div class="info-value">' + (c.email || '-') + '</div></div>' +
        '<div class="info-item"><div class="info-label">العنوان</div><div class="info-value">' + (c.address || '-') + '</div></div>' +
        '</div></div>' +
        '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script>' +
        '</body></html>';
    
    const w = window.open('', '_blank');
    if (w) { w.document.write(content); w.document.close(); }
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
            if (stored) {
                users = JSON.parse(stored);
                window.users = users;
            }
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

window.checkLogin = async function() {
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

    let isValid = false;

    if (user.password && user.password.startsWith('pbkdf2_')) {
        try {
            if (typeof window.verifyPasswordPBKDF2 === 'function') {
                isValid = await window.verifyPasswordPBKDF2(password, user.password);
            }
        } catch (e) { isValid = false; }
    }

    if (!isValid) {
        isValid = (user.password === password);
    }

    if (!isValid) {
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

    window.currentUser = user;
    localStorage.setItem('mizan_current_user', JSON.stringify({
        id: user.id, name: user.name, role: user.role
    }));

    if (error) error.classList.remove('show');
    if (document.getElementById('loginPassword')) document.getElementById('loginPassword').value = '';

    const loginCont = document.getElementById('loginContainer');
    const appCont = document.getElementById('appContent');
    if (loginCont) loginCont.classList.add('hidden');
    if (appCont) appCont.style.display = 'block';

    if (typeof window.updateUserUI === 'function') window.updateUserUI();
    if (typeof window.showToast === 'function') window.showToast('🔓 مرحباً ' + user.name + '!', 'success');
    
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
            const keys = ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','accounts','journalEntries','coupons','warehouses','branches','companyData'];
            
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
    const keys = ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','accounts','journalEntries','coupons','warehouses','branches','companyData'];
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
    window.coupons = window.toArray(window.getData('coupons', []));
    window.warehouses = window.toArray(window.getData('warehouses', []));
    window.branches = window.toArray(window.getData('branches', []));
    
    window.companyData = window.getData('companyData', {
        name: 'الميزان', tradeName: '', phone: '', phone2: '',
        email: '', website: '', address: '', city: '', country: 'مصر',
        tax: '', commercial: '', taxCard: '', nationalId: '',
        footer: 'شكراً لتعاملكم معنا 🌟',
        primaryColor: '#C9A94E', currency: 'ج.م'
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
    
    setTimeout(window.populateLoginUsers, 500);
    setTimeout(window.populateLoginUsers, 1500);
    setTimeout(window.populateLoginUsers, 3000);

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

window.addEventListener('load', function() {
    setTimeout(function() {
        if (typeof window.populateLoginUsers === 'function') {
            window.populateLoginUsers();
        }
    }, 1000);
});

window.__appLoaded = true;
