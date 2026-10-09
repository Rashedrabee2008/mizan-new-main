// ============================================================
// الميزان 17.0 - app.js
// التطبيق الرئيسي الشامل - كل الدوال
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
window.currencies = [];
window.currentSaleItems = [];
window.currentPurItems = [];
window.currentRetItems = [];
window.currentTreasuryFilter = 'all';
window.currentInvoiceFilter = 'all';
window.currentPayTab = 'collect';
window.currentUser = null;
window.companyData = {
    name: 'الميزان', tradeName: '', phone: '', phone2: '',
    email: '', website: '', address: '', city: '', country: 'مصر',
    tax: '', commercial: '', taxCard: '', nationalId: '',
    footer: 'شكراً لتعاملكم معنا 🌟',
    primaryColor: '#C9A94E', currency: 'ج.م'
};
window.vatSettings = { defaultVAT: 14 };

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
// أدوات مساعدة
// ═══════════════════════════════════════════════════════════
window.$ = window.$ || function(id) { return document.getElementById(id); };

window.getTodayDate = window.getTodayDate || function() { 
    return new Date().toISOString().split('T')[0]; 
};

window.getNowTime = window.getNowTime || function() { 
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return hours + ':' + minutes + ' ' + ampm;
};

window.formatMoney = window.formatMoney || function(n) { 
    const num = parseFloat(n);
    if (!isFinite(num) || isNaN(num)) return '0.00';
    return num.toFixed(2); 
};

window.toArray = window.toArray || function(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Object.values(data).filter(function(item) { 
        return item !== null && item !== undefined; 
    });
};

window.getData = window.getData || function(key, def) {
    if (def === undefined) def = [];
    try {
        const d = localStorage.getItem('mizan_' + key);
        return d ? JSON.parse(d) : def;
    } catch (e) { return def; }
};

window.setData = window.setData || function(key, data) {
    try { 
        localStorage.setItem('mizan_' + key, JSON.stringify(data)); 
        return true;
    } catch (e) { return false; }
};

window.showToast = window.showToast || function(msg, type) {
    type = type || 'info';
    const t = document.getElementById('toast');
    if (!t) { console.log('[' + type + '] ' + msg); return; }
    t.textContent = msg;
    t.className = 'toast show ' + type;
    clearTimeout(t._t);
    t._t = setTimeout(function() { t.className = 'toast'; }, 3000);
};

window.openModal = window.openModal || function(html) {
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

window.closeModal = window.closeModal || function() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('show');
};

window.getRadioValue = window.getRadioValue || function(name, defaultValue) {
    defaultValue = defaultValue || '';
    const el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : defaultValue;
};

window.setRadioValue = window.setRadioValue || function(name, value) {
    const el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
};

// ═══════════════════════════════════════════════════════════
// Firebase
// ═══════════════════════════════════════════════════════════
window.initFirebase = function() {
    try {
        if (typeof firebase === 'undefined') return false;
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(window.firebaseConfig);
        }
        window.firebaseReady = true;
        console.log('✅ Firebase جاهز');
        return true;
    } catch (e) {
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

window.createJournalEntry = function(date, description, lines, reference) {
    try {
        if (!window.journalEntries) window.journalEntries = [];
        let totalDebit = 0, totalCredit = 0;
        lines.forEach(function(line) {
            totalDebit += parseFloat(line.debit) || 0;
            totalCredit += parseFloat(line.credit) || 0;
        });
        if (Math.abs(totalDebit - totalCredit) > 0.01) return null;
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
    } catch (e) { return null; }
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
            try { window[fn](); } catch (e) {}
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
            window.customers[idx] = Object.assign({}, window.customers[idx], { name: name, phone: phone, whatsapp: whatsapp, address: address });
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
    ['customerId','customerName','customerPhone','customerWhatsapp','customerAddress'].forEach(function(field, i) {
        const el = document.getElementById(field);
        if (el) el.value = c[['id','name','phone','whatsapp','address'][i]] || '';
    });
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
    const search = document.getElementById('customerSearch') ? document.getElementById('customerSearch').value.trim().toLowerCase() : '';
    let filtered = window.customers || [];
    if (search) filtered = filtered.filter(function(cu) { return (cu.name || '').toLowerCase().indexOf(search) > -1; });
    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><span>لا يوجد عملاء</span></div>';
        return;
    }
    let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;"><span>الاسم</span><span>الهاتف</span><span>المديونية</span><span></span></div>';
    filtered.forEach(function(cu) {
        const balance = typeof window.getCustomerBalance === 'function' ? window.getCustomerBalance(cu.name) : 0;
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;">' +
            '<span><strong>' + cu.name + '</strong></span>' +
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
            window.suppliers[idx] = Object.assign({}, window.suppliers[idx], { name: name, phone: phone, whatsapp: whatsapp, address: address });
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
    ['supplierId','supplierName','supplierPhone','supplierWhatsapp','supplierAddress'].forEach(function(field, i) {
        const el = document.getElementById(field);
        if (el) el.value = s[['id','name','phone','whatsapp','address'][i]] || '';
    });
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
    const search = document.getElementById('supplierSearch') ? document.getElementById('supplierSearch').value.trim().toLowerCase() : '';
    let filtered = window.suppliers || [];
    if (search) filtered = filtered.filter(function(s) { return (s.name || '').toLowerCase().indexOf(search) > -1; });
    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-truck"></i><span>لا يوجد موردين</span></div>';
        return;
    }
    let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;"><span>الاسم</span><span>الهاتف</span><span>المديونية</span><span></span></div>';
    filtered.forEach(function(s) {
        const balance = typeof window.getSupplierBalance === 'function' ? window.getSupplierBalance(s.name) : 0;
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;">' +
            '<span><strong>' + s.name + '</strong></span>' +
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
    const search = document.getElementById('invoiceSearch') ? document.getElementById('invoiceSearch').value.trim().toLowerCase() : '';
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
            '<span>' + (inv.customer || 'عميل نقدي') + '</span>' +
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
            '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="background:#C9A94E;color:#0D0D0D;">' +
                    '<th style="padding:6px;">#</th><th style="padding:6px;">الصنف</th><th style="padding:6px;">الكمية</th><th style="padding:6px;">السعر</th><th style="padding:6px;">الإجمالي</th>' +
                '</tr></thead><tbody>' + itemsHtml + '</tbody>' +
            '</table>' +
            '<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #C9A94E;margin-top:6px;font-size:16px;font-weight:900;color:#C9A94E;">' +
                '<span>الإجمالي:</span><span>' + window.formatMoney(inv.total) + ' ج.م</span>' +
            '</div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

window.printInvoice = function(id) {
    const inv = (window.sales || []).find(function(s) { return s.id === id; });
    if (!inv) { window.showToast('⚠️ الفاتورة غير موجودة', 'error'); return; }
    const company = window.companyData || { name: 'الميزان' };
    let itemsRows = '';
    (inv.items || []).forEach(function(it, i) {
        itemsRows += '<tr><td style="padding:8px;border:1px solid #ddd;text-align:center;">' + (i+1) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;">' + it.name + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + it.qty + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(it.price) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(it.total) + '</td></tr>';
    });
    const content = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة</title>' +
        '<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial;}body{padding:20px;}table{width:100%;border-collapse:collapse;margin-bottom:20px;}th{background:#C9A94E;color:#fff;padding:10px;}td{font-size:13px;}</style></head><body>' +
        '<h1 style="text-align:center;color:#C9A94E;">' + (company.name || 'الميزان') + '</h1>' +
        '<table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>' + itemsRows + '</tbody></table>' +
        '<h2 style="text-align:center;color:#C9A94E;">الإجمالي: ' + window.formatMoney(inv.total) + ' ج.م</h2>' +
        '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script></body></html>';
    const w = window.open('', '_blank');
    if (w) { w.document.write(content); w.document.close(); }
};

window.deleteInvoice = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const inv = (window.sales || []).find(function(s) { return s.id === id; });
    if (!inv) return;
    if (!confirm('⚠️ حذف فاتورة #' + inv.number + '؟')) return;
    (inv.items || []).forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) p.qty += it.qty;
    });
    window.treasury = window.treasury.filter(function(t) { return !(t.refType === 'sale' && t.refId === id); });
    window.sales = window.sales.filter(function(s) { return s.id !== id; });
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
        const bal = typeof window.getCustomerBalance === 'function' ? window.getCustomerBalance(c.name) : 0;
        sel.innerHTML += '<option value="' + c.name + '">' + c.name + (bal > 0 ? ' (' + window.formatMoney(bal) + ')' : '') + '</option>';
    });
    sel.value = cv;
};

window.populatePaySuppliers = function() {
    const sel = document.getElementById('paySupplier');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر مورد...</option>';
    (window.suppliers || []).forEach(function(s) {
        const bal = typeof window.getSupplierBalance === 'function' ? window.getSupplierBalance(s.name) : 0;
        sel.innerHTML += '<option value="' + s.name + '">' + s.name + (bal > 0 ? ' (' + window.formatMoney(bal) + ')' : '') + '</option>';
    });
    sel.value = cv;
};

window.updateCollectInfo = function() {
    const name = document.getElementById('collectCustomer') ? document.getElementById('collectCustomer').value : '';
    const box = document.getElementById('collectInfoBox');
    if (!box) return;
    if (!name) { box.style.display = 'none'; return; }
    const balance = typeof window.getCustomerBalance === 'function' ? window.getCustomerBalance(name) : 0;
    box.style.display = 'block';
    const debtEl = document.getElementById('collectCurrentDebt');
    if (debtEl) debtEl.textContent = window.formatMoney(balance);
    const amountInput = document.getElementById('collectAmount');
    if (amountInput && balance > 0) amountInput.value = balance.toFixed(2);
};

window.updatePayInfo = function() {
    const name = document.getElementById('paySupplier') ? document.getElementById('paySupplier').value : '';
    const box = document.getElementById('payInfoBox');
    if (!box) return;
    if (!name) { box.style.display = 'none'; return; }
    const balance = typeof window.getSupplierBalance === 'function' ? window.getSupplierBalance(name) : 0;
    box.style.display = 'block';
    const debtEl = document.getElementById('payCurrentDebt');
    if (debtEl) debtEl.textContent = window.formatMoney(balance);
    const amountInput = document.getElementById('payAmount');
    if (amountInput && balance > 0) amountInput.value = balance.toFixed(2);
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
        createdBy: window.currentUser ? window.currentUser.name : ''
    };
    if (!window.payments) window.payments = [];
    window.payments.push(pay);
    window.treasury.push({
        id: Date.now() + 1, type: 'deposit', amount: amount,
        note: 'تحصيل من ' + party,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        refType: 'collect', refId: pay.id,
        date: date, time: window.getNowTime()
    });
    window.setData('payments', window.payments);
    window.setData('treasury', window.treasury);
    if (document.getElementById('collectAmount')) document.getElementById('collectAmount').value = '';
    if (document.getElementById('collectNote')) document.getElementById('collectNote').value = '';
    if (document.getElementById('collectCustomer')) document.getElementById('collectCustomer').value = '';
    const info = document.getElementById('collectInfoBox'); if (info) info.style.display = 'none';
    window.updatePaymentsStats();
    window.renderPayments();
    if (typeof window.renderTreasury === 'function') window.renderTreasury();
    if (typeof window.renderCustomers === 'function') window.renderCustomers();
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
        createdBy: window.currentUser ? window.currentUser.name : ''
    };
    if (!window.payments) window.payments = [];
    window.payments.push(pay);
    window.treasury.push({
        id: Date.now() + 1, type: 'withdraw', amount: amount,
        note: 'سداد لـ ' + party,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        refType: 'pay', refId: pay.id,
        date: date, time: window.getNowTime()
    });
    window.setData('payments', window.payments);
    window.setData('treasury', window.treasury);
    if (document.getElementById('payAmount')) document.getElementById('payAmount').value = '';
    if (document.getElementById('payNote')) document.getElementById('payNote').value = '';
    if (document.getElementById('paySupplier')) document.getElementById('paySupplier').value = '';
    const info = document.getElementById('payInfoBox'); if (info) info.style.display = 'none';
    window.updatePaymentsStats();
    window.renderPayments();
    if (typeof window.renderTreasury === 'function') window.renderTreasury();
    if (typeof window.renderSuppliers === 'function') window.renderSuppliers();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    window.showToast('✅ تم سداد ' + window.formatMoney(amount) + ' ج.م', 'success');
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
                '<h2 style="color:' + color + ';">' + (window.companyData.name || 'الميزان') + '</h2>' +
            '</div>' +
            '<div style="padding:10px 0;">' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;"><span>رقم الإيصال:</span><span>#' + String(pay.id).slice(-6) + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;"><span>التاريخ:</span><span>' + pay.date + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;"><span>' + (isCollect ? 'العميل' : 'المورد') + ':</span><span>' + pay.party + '</span></div>' +
            '</div>' +
            '<div style="text-align:center;padding:15px;border:2px solid ' + color + ';border-radius:8px;margin:12px 0;background:#f9f9f9;">' +
                '<div style="font-size:26px;font-weight:900;color:' + color + ';">' + window.formatMoney(pay.amount) + ' ج.م</div>' +
            '</div>' +
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
        '.amount{text-align:center;font-size:28px;font-weight:900;color:#2D8F5E;padding:20px;border:2px solid #2D8F5E;}' +
        '</style></head><body><div class="header"><h1>' + (window.companyData.name || 'الميزان') + '</h1><p>' + label + '</p></div>' +
        '<div class="amount">' + window.formatMoney(pay.amount) + ' ج.م</div>' +
        '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script></body></html>';
    const w = window.open('', '_blank');
    if (w) { w.document.write(content); w.document.close(); }
};

// ═══════════════════════════════════════════════════════════
// الخزنة
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
    const totalBalance = typeof window.getTotalCashBalance === 'function' ? window.getTotalCashBalance() : 0;
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
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 0.8fr 0.7fr 0.8fr;">' +
            '<span style="font-size:11px;">' + (t.note || 'حركة') + '</span>' +
            '<span style="color:' + color + ';font-weight:700;font-size:12px;">' + (isDep ? '+' : '-') + window.formatMoney(t.amount) + '</span>' +
            '<span style="color:' + color + ';font-size:10px;">' + (isDep ? '💚 إيداع' : '❤️ سحب') + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + t.date + '</span>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// المستخدمين
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
            { id: 1, name: 'المدير', password: '123456', role: 'admin', active: true },
            { id: 2, name: 'محمد', password: '123456', role: 'manager', active: true },
            { id: 3, name: 'أحمد', password: '123456', role: 'cashier', active: true },
            { id: 4, name: 'علي', password: '123456', role: 'seller', active: true },
            { id: 5, name: 'زائر', password: '123456', role: 'viewer', active: true }
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
    if (!window.canManageUsers()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const id = document.getElementById('userId') ? document.getElementById('userId').value : '';
    const name = document.getElementById('userName') ? document.getElementById('userName').value.trim() : '';
    const password = document.getElementById('userPassword') ? document.getElementById('userPassword').value.trim() : '';
    const role = document.getElementById('userRole') ? document.getElementById('userRole').value : 'cashier';
    if (!name || !password) { window.showToast('⚠️ أدخل البيانات', 'error'); return; }
    if (id) {
        const idx = window.users.findIndex(function(u) { return u.id == id; });
        if (idx > -1) { 
            window.users[idx] = Object.assign({}, window.users[idx], { name: name, password: password, role: role }); 
            window.showToast('✅ تم التعديل', 'success'); 
        }
    } else {
        if (window.users.find(function(u) { return u.name === name; })) { 
            window.showToast('⚠️ الاسم موجود', 'warning'); return; 
        }
        window.users.push({ id: Date.now(), name: name, password: password, role: role, active: true });
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
    if (!window.canManageUsers()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
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
};

window.deleteUser = function(id) {
    if (!window.canManageUsers()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
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
    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    set('setProductsCount', (window.products || []).length);
    set('setSalesCount', (window.sales || []).length);
    set('setCustomersCount', (window.customers || []).length);
    set('setSuppliersCount', (window.suppliers || []).length);
};

window.exportData = function() {
    const data = {
        version: '17.0', exportDate: new Date().toISOString(),
        products: window.products, sales: window.sales, purchases: window.purchases,
        customers: window.customers, suppliers: window.suppliers, cashBoxes: window.cashBoxes,
        expenses: window.expenses, treasury: window.treasury, payments: window.payments,
        returns: window.returns, users: window.users, accounts: window.accounts,
        journalEntries: window.journalEntries, coupons: window.coupons,
        warehouses: window.warehouses, branches: window.branches, companyData: window.companyData
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mizan_backup_' + window.getTodayDate() + '.json';
    a.click();
    window.showToast('✅ تم التصدير', 'success');
};

window.saveAll = function() {
    const keys = ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','accounts','journalEntries','coupons','warehouses','branches','companyData'];
    keys.forEach(function(k) { window.setData(k, window[k]); });
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
        currency: getVal('companyCurrency') || 'ج.م'
    };
    window.setData('companyData', window.companyData);
    const headerCompany = document.getElementById('headerCompanyName');
    if (headerCompany) headerCompany.textContent = window.companyData.name;
    window.showToast('✅ تم حفظ بيانات الشركة', 'success');
};

window.resetCompanyForm = function() {
    if (!confirm('⚠️ إلغاء التعديلات؟')) return;
    window.renderCompany();
};

window.printCompanyData = function() {
    window.showToast('🖨️ جاري الطباعة...', 'info');
    window.print();
};

// ═══════════════════════════════════════════════════════════
// ERP
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
    'main': { name: 'رئيسي', icon: '🏭' },
    'branch': { name: 'فرع', icon: '🏪' },
    'storage': { name: 'مخزن', icon: '📦' },
    'returns': { name: 'مرتجعات', icon: '🔄' }
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
            window.warehouses[idx] = Object.assign({}, window.warehouses[idx], { name: name, type: type, location: location, manager: manager });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        if (window.warehouses.find(function(w) { return w.name === name; })) { 
            window.showToast('⚠️ الاسم موجود', 'warning'); return; 
        }
        window.warehouses.push({ id: Date.now(), name: name, type: type, location: location, manager: manager, active: true });
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
};

window.editWarehouse = function(id) {
    const w = (window.warehouses || []).find(function(x) { return x.id == id; });
    if (!w) return;
    if (document.getElementById('warehouseId')) document.getElementById('warehouseId').value = w.id;
    if (document.getElementById('warehouseName')) document.getElementById('warehouseName').value = w.name;
    if (document.getElementById('warehouseLocation')) document.getElementById('warehouseLocation').value = w.location || '';
    if (document.getElementById('warehouseManager')) document.getElementById('warehouseManager').value = w.manager || '';
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
                '<button onclick="editWarehouse(' + w.id + ')" style="flex:1;background:#E6A830;border:none;color:#0D0D0D;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">✏️ تعديل</button>' +
                '<button onclick="deleteWarehouse(' + w.id + ')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️ حذف</button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
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
        '</div>';
    });
    c.innerHTML = html;
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
    let html = '<div style="background:#1A1A1A;border-radius:10px;padding:12px;margin-bottom:12px;color:#A89070;font-size:11px;text-align:center;">💱 أسعار الصرف مقابل الجنيه المصري</div>';
    currencies.forEach(function(curr) {
        html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid ' + (curr.isDefault ? '#C9A94E' : '#4A8AB5') + ';padding:12px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<div>' +
                    '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + curr.symbol + ' ' + curr.name + '</div>' +
                    '<div style="color:#A89070;font-size:10px;">' + curr.code + '</div>' +
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
// التهيئة النهائية
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
            try { window[fn](); } catch (e) {}
        }
    });
};

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
    window.companyData = window.getData('companyData', window.companyData);

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
            { id: 2, name: 'فودافون كاش', type: 'wallet', icon: '📱', active: true, openingBalance: 0 },
            { id: 3, name: 'انستاباي', type: 'wallet', icon: '💳', active: true, openingBalance: 0 },
            { id: 4, name: 'بنك', type: 'bank', icon: '🏦', active: true, openingBalance: 0 }
        ];
        window.setData('cashBoxes', window.cashBoxes);
    }

    if (window.users.length === 0) {
        window.users = [
            { id: 1, name: 'المدير', password: '123456', role: 'admin', active: true },
            { id: 2, name: 'محمد', password: '123456', role: 'manager', active: true },
            { id: 3, name: 'أحمد', password: '123456', role: 'cashier', active: true },
            { id: 4, name: 'علي', password: '123456', role: 'seller', active: true },
            { id: 5, name: 'زائر', password: '123456', role: 'viewer', active: true }
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
