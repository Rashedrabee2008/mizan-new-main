// ============================================================
// الميزان 17.0 - accounting.js
// الحسابات + القيود اليومية + التقارير المالية + تنظيف البيانات
// يدمج: accounts.js + accounting-engine.js + reports-pdf.js + financial-cleaner.js
// ============================================================

console.log('📚 تحميل accounting.js v17.0');

// ═══════════════════════════════════════════════════════════
// الجزء 1: دليل الحسابات الافتراضي (من accounts.js)
// ═══════════════════════════════════════════════════════════
window.DEFAULT_ACCOUNTS = [
    // الأصول
    { id: 1, code: '1000', name: 'الأصول', type: 'asset', parent: null, level: 0 },
    { id: 2, code: '1100', name: 'الأصول المتداولة', type: 'asset', parent: 1, level: 1 },
    { id: 3, code: '1110', name: 'النقدية بالخزينة', type: 'asset', parent: 2, level: 2 },
    { id: 4, code: '1120', name: 'النقدية بالبنك', type: 'asset', parent: 2, level: 2 },
    { id: 5, code: '1130', name: 'محافظ إلكترونية', type: 'asset', parent: 2, level: 2 },
    { id: 6, code: '1200', name: 'العملاء (المدينون)', type: 'asset', parent: 1, level: 1 },
    { id: 7, code: '1300', name: 'المخزون', type: 'asset', parent: 1, level: 1 },
    { id: 8, code: '1400', name: 'مصروفات مدفوعة مقدماً', type: 'asset', parent: 1, level: 1 },
    { id: 9, code: '1500', name: 'الأصول الثابتة', type: 'asset', parent: 1, level: 1 },
    
    // الالتزامات
    { id: 20, code: '2000', name: 'الالتزامات', type: 'liability', parent: null, level: 0 },
    { id: 21, code: '2100', name: 'الالتزامات المتداولة', type: 'liability', parent: 20, level: 1 },
    { id: 22, code: '2110', name: 'الموردون (الدائنون)', type: 'liability', parent: 21, level: 2 },
    { id: 23, code: '2120', name: 'الضرائب المستحقة', type: 'liability', parent: 21, level: 2 },
    { id: 24, code: '2130', name: 'رواتب مستحقة', type: 'liability', parent: 21, level: 2 },
    { id: 25, code: '2200', name: 'قروض طويلة الأجل', type: 'liability', parent: 20, level: 1 },
    
    // حقوق الملكية
    { id: 30, code: '3000', name: 'حقوق الملكية', type: 'equity', parent: null, level: 0 },
    { id: 31, code: '3100', name: 'رأس المال', type: 'equity', parent: 30, level: 1 },
    { id: 32, code: '3200', name: 'الأرباح المحتجزة', type: 'equity', parent: 30, level: 1 },
    { id: 33, code: '3300', name: 'المسحوبات الشخصية', type: 'equity', parent: 30, level: 1 },
    
    // الإيرادات
    { id: 40, code: '4000', name: 'الإيرادات', type: 'revenue', parent: null, level: 0 },
    { id: 41, code: '4100', name: 'المبيعات', type: 'revenue', parent: 40, level: 1 },
    { id: 42, code: '4200', name: 'المرتجعات', type: 'revenue', parent: 40, level: 1 },
    { id: 43, code: '4300', name: 'إيرادات أخرى', type: 'revenue', parent: 40, level: 1 },
    
    // المصروفات
    { id: 50, code: '5000', name: 'المصروفات', type: 'expense', parent: null, level: 0 },
    { id: 51, code: '5100', name: 'تكلفة المبيعات', type: 'expense', parent: 50, level: 1 },
    { id: 52, code: '5200', name: 'الرواتب والأجور', type: 'expense', parent: 50, level: 1 },
    { id: 53, code: '5300', name: 'الإيجارات', type: 'expense', parent: 50, level: 1 },
    { id: 54, code: '5400', name: 'الكهرباء والمياه', type: 'expense', parent: 50, level: 1 },
    { id: 55, code: '5500', name: 'الاتصالات والإنترنت', type: 'expense', parent: 50, level: 1 },
    { id: 56, code: '5600', name: 'المواصلات', type: 'expense', parent: 50, level: 1 },
    { id: 57, code: '5700', name: 'الصيانة', type: 'expense', parent: 50, level: 1 },
    { id: 58, code: '5800', name: 'مصروفات أخرى', type: 'expense', parent: 50, level: 1 }
];

window.ACCOUNT_TYPES = {
    asset:     { name: 'أصول',        icon: '💎', color: '#2D8F5E' },
    liability: { name: 'التزامات',    icon: '📋', color: '#E06060' },
    equity:    { name: 'حقوق ملكية',  icon: '👑', color: '#C9A94E' },
    revenue:   { name: 'إيرادات',     icon: '💰', color: '#4A8AB5' },
    expense:   { name: 'مصروفات',     icon: '💸', color: '#E6A830' }
};

// ═══════════════════════════════════════════════════════════
// الجزء 2: دوال الحسابات
// ═══════════════════════════════════════════════════════════

window.getAccountBalance = function(accountId) {
    let balance = 0;
    (window.journalEntries || []).forEach(function(entry) {
        (entry.lines || []).forEach(function(line) {
            if (line.accountId == accountId) {
                balance += (parseFloat(line.debit) || 0) - (parseFloat(line.credit) || 0);
            }
        });
    });
    return balance;
};

window.getAccountTypeBalance = function(type) {
    let total = 0;
    (window.accounts || []).filter(function(a) { return a.type === type; })
        .forEach(function(acc) {
            total += window.getAccountBalance(acc.id);
        });
    return total;
};

window.getAccountByCode = function(code) {
    return (window.accounts || []).find(function(a) { return a.code === code; });
};

window.getAccountByName = function(name) {
    return (window.accounts || []).find(function(a) { return a.name === name; });
};

// ═══════════════════════════════════════════════════════════
// الجزء 3: القيود اليومية
// ═══════════════════════════════════════════════════════════

window.addJournalEntry = function(date, description, lines, reference) {
    if (!lines || lines.length < 2) {
        console.warn('⚠️ القيد يحتاج سطرين على الأقل');
        return null;
    }

    let totalDebit = 0, totalCredit = 0;
    lines.forEach(function(line) {
        totalDebit += parseFloat(line.debit) || 0;
        totalCredit += parseFloat(line.credit) || 0;
    });

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        console.error('❌ القيد غير متوازن:', totalDebit, '≠', totalCredit);
        return null;
    }

    if (!window.journalEntries) window.journalEntries = [];

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

    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    return entry;
};

window.deleteJournalEntry = function(id) {
    if (!confirm('⚠️ حذف هذا القيد؟')) return;
    window.journalEntries = (window.journalEntries || []).filter(function(e) { return e.id != id; });
    window.setData('journalEntries', window.journalEntries);
    window.renderJournalEntries();
    window.renderAccounts();
    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();
    if (typeof window.showToast === 'function') window.showToast('🗑️ تم حذف القيد', 'info');
};

// ═══════════════════════════════════════════════════════════
// الجزء 4: إدارة الحسابات (CRUD)
// ═══════════════════════════════════════════════════════════

window.saveAccount = function() {
    if (typeof window.canViewAccounts === 'function' && !window.canViewAccounts()) {
        if (typeof window.showToast === 'function') window.showToast('⚠️ لا تملك صلاحية', 'error');
        return;
    }

    const id = document.getElementById('accountId') ? document.getElementById('accountId').value : '';
    const code = document.getElementById('accountCode') ? document.getElementById('accountCode').value.trim() : '';
    const name = document.getElementById('accountName') ? document.getElementById('accountName').value.trim() : '';
    const type = document.getElementById('accountType') ? document.getElementById('accountType').value : 'asset';
    const parent = document.getElementById('accountParent') ? document.getElementById('accountParent').value : '';
    const notes = document.getElementById('accountNotes') ? document.getElementById('accountNotes').value.trim() : '';

    if (!code) { window.showToast('⚠️ أدخل الكود', 'error'); return; }
    if (!name) { window.showToast('⚠️ أدخل الاسم', 'error'); return; }

    if (!window.accounts) window.accounts = [];

    if (id) {
        const idx = window.accounts.findIndex(function(a) { return a.id == id; });
        if (idx > -1) {
            window.accounts[idx] = Object.assign({}, window.accounts[idx], {
                code: code, name: name, type: type,
                parent: parent ? parseInt(parent) : null,
                notes: notes
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        if (window.accounts.find(function(a) { return a.code === code; })) {
            window.showToast('⚠️ الكود موجود', 'warning');
            return;
        }
        window.accounts.push({
            id: Date.now(),
            code: code, name: name, type: type,
            parent: parent ? parseInt(parent) : null,
            level: parent ? 1 : 0,
            notes: notes
        });
        window.showToast('✅ تم الإضافة', 'success');
    }

    window.setData('accounts', window.accounts);
    window.resetAccountForm();
    window.renderAccounts();
    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();
};

window.resetAccountForm = function() {
    ['accountId', 'accountCode', 'accountName', 'accountNotes'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const typeEl = document.getElementById('accountType');
    if (typeEl) typeEl.value = 'asset';
    const parentEl = document.getElementById('accountParent');
    if (parentEl) parentEl.value = '';
    const titleEl = document.getElementById('accountFormTitle');
    if (titleEl) titleEl.textContent = '➕ إضافة حساب';
    const btnEl = document.getElementById('accountSaveBtnText');
    if (btnEl) btnEl.textContent = 'إضافة';
};

window.editAccount = function(id) {
    const acc = (window.accounts || []).find(function(a) { return a.id == id; });
    if (!acc) return;
    
    const setVal = function(elId, val) {
        const el = document.getElementById(elId);
        if (el) el.value = val;
    };
    
    setVal('accountId', acc.id);
    setVal('accountCode', acc.code);
    setVal('accountName', acc.name);
    setVal('accountType', acc.type);
    setVal('accountParent', acc.parent || '');
    setVal('accountNotes', acc.notes || '');
    
    const titleEl = document.getElementById('accountFormTitle');
    if (titleEl) titleEl.textContent = '✏️ تعديل حساب';
    const btnEl = document.getElementById('accountSaveBtnText');
    if (btnEl) btnEl.textContent = 'حفظ';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteAccount = function(id) {
    if (typeof window.canDelete === 'function' && !window.canDelete()) {
        window.showToast('⚠️ لا تملك صلاحية', 'error');
        return;
    }
    const acc = (window.accounts || []).find(function(a) { return a.id == id; });
    if (!acc) return;

    const hasEntries = (window.journalEntries || []).some(function(e) {
        return (e.lines || []).some(function(l) { return l.accountId == id; });
    });
    if (hasEntries) {
        window.showToast('⚠️ لا يمكن الحذف - يوجد قيود', 'error');
        return;
    }

    if (!confirm('⚠️ حذف "' + acc.name + '"؟')) return;
    window.accounts = window.accounts.filter(function(a) { return a.id != id; });
    window.setData('accounts', window.accounts);
    window.renderAccounts();
    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();
    window.showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// الجزء 5: عرض الحسابات
// ═══════════════════════════════════════════════════════════

window.currentAccountFilter = 'all';

window.filterAccounts = function(filter, btn) {
    window.currentAccountFilter = filter;
    document.querySelectorAll('#page-accounts .filter-chip').forEach(function(c) { 
        c.classList.remove('active'); 
    });
    if (btn) btn.classList.add('active');
    window.renderAccounts();
};

window.renderAccounts = function() {
    const c = document.getElementById('accountList');
    if (!c) return;

    if (!window.accounts) window.accounts = [];

    let filtered = window.accounts;
    if (window.currentAccountFilter !== 'all') {
        filtered = window.accounts.filter(function(a) { 
            return a.type === window.currentAccountFilter; 
        });
    }

    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><span>لا توجد حسابات</span></div>';
        return;
    }

    filtered = filtered.slice().sort(function(a, b) { 
        return (a.code || '').localeCompare(b.code || ''); 
    });

    let html = '<div class="table-header" style="grid-template-columns: 0.7fr 1.5fr 0.9fr 1fr 1fr;"><span>الكود</span><span>الحساب</span><span>النوع</span><span>الرصيد</span><span></span></div>';

    filtered.forEach(function(acc) {
        const balance = window.getAccountBalance(acc.id);
        const typeInfo = window.ACCOUNT_TYPES[acc.type] || { name: acc.type, icon: '❓', color: '#5D5D5D' };
        const indent = '&nbsp;&nbsp;&nbsp;'.repeat(acc.level || 0);

        html += '<div class="table-row" style="grid-template-columns: 0.7fr 1.5fr 0.9fr 1fr 1fr;">' +
            '<span style="font-family:monospace;font-weight:700;color:#C9A94E;">' + acc.code + '</span>' +
            '<span>' + indent + '<strong>' + acc.name + '</strong></span>' +
            '<span style="color:' + typeInfo.color + ';font-size:11px;">' + typeInfo.icon + ' ' + typeInfo.name + '</span>' +
            '<span style="color:' + (balance >= 0 ? '#2D8F5E' : '#E06060') + ';font-weight:700;">' + window.formatMoney(balance) + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-warning btn-sm" onclick="editAccount(' + acc.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteAccount(' + acc.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });

    c.innerHTML = html;
    window.updateAccountsStats();
};

window.updateAccountsStats = function() {
    const stats = {
        assets: window.getAccountTypeBalance('asset'),
        liabilities: window.getAccountTypeBalance('liability'),
        equity: window.getAccountTypeBalance('equity'),
        revenue: window.getAccountTypeBalance('revenue'),
        expenses: window.getAccountTypeBalance('expense')
    };

    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('accAssets', window.formatMoney(stats.assets));
    set('accLiabilities', window.formatMoney(-stats.liabilities));
    set('accEquity', window.formatMoney(-stats.equity));
    set('accRevenue', window.formatMoney(-stats.revenue));
    set('accExpenses', window.formatMoney(stats.expenses));
};

// ═══════════════════════════════════════════════════════════
// الجزء 6: عرض القيود اليومية
// ═══════════════════════════════════════════════════════════

window.renderJournalEntries = function() {
    const c = document.getElementById('journalList');
    if (!c) return;

    if (!window.journalEntries) window.journalEntries = [];

    if (window.journalEntries.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-list"></i><span>لا توجد قيود محاسبية</span></div>';
        return;
    }

    const sorted = window.journalEntries.slice().sort(function(a, b) { 
        return b.id - a.id; 
    }).slice(0, 50);

    let html = '';
    sorted.forEach(function(entry) {
        html += '<div class="cash-box-card" style="margin-bottom:10px;border-right:4px solid #C9A94E;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                '<div style="color:#C9A94E;font-weight:900;">📝 قيد #' + entry.number + '</div>' +
                '<div style="color:#A89070;font-size:11px;">📅 ' + entry.date + '</div>' +
            '</div>' +
            '<div style="color:#F5E6C8;font-size:13px;margin-bottom:8px;">' + entry.description + '</div>' +
            '<div style="background:#0D0D0D;border-radius:8px;padding:8px;font-size:11px;">';

        (entry.lines || []).forEach(function(line) {
            const acc = (window.accounts || []).find(function(a) { return a.id == line.accountId; });
            const accName = acc ? acc.code + ' - ' + acc.name : '⚠️ حساب محذوف';

            html += '<div style="display:flex;justify-content:space-between;padding:3px 0;' +
                (line.debit > 0 ? 'color:#2D8F5E;' : 'color:#E06060;') + '">' +
                '<span>' + accName + '</span>' +
                '<span style="font-family:monospace;">' +
                    (line.debit > 0 ? '📥 ' + window.formatMoney(line.debit) : '📤 ' + window.formatMoney(line.credit)) +
                '</span>' +
            '</div>';
        });

        html += '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">' +
                '<div style="color:#A89070;font-size:10px;">' +
                    (entry.createdBy ? 'بواسطة: ' + entry.createdBy : '') +
                '</div>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteJournalEntry(' + entry.id + ')">' +
                    '<i class="fas fa-trash"></i> حذف' +
                '</button>' +
            '</div>' +
        '</div>';
    });

    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الجزء 7: نافذة إضافة قيد يدوي
// ═══════════════════════════════════════════════════════════

window.showAddJournalDialog = function() {
    if (typeof window.canViewAccounts === 'function' && !window.canViewAccounts()) {
        window.showToast('⚠️ لا تملك صلاحية', 'error');
        return;
    }

    let accountOptions = '<option value="">اختر حساب...</option>';
    (window.accounts || []).slice().sort(function(a, b) { 
        return (a.code || '').localeCompare(b.code || ''); 
    }).forEach(function(acc) {
        accountOptions += '<option value="' + acc.id + '">' + acc.code + ' - ' + acc.name + '</option>';
    });

    const today = window.getTodayDate();

    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>📝 إضافة قيد محاسبي</h3>' +
        '<div class="form-group"><label>التاريخ</label><input type="date" id="jeDate" value="' + today + '" /></div>' +
        '<div class="form-group"><label>الوصف *</label><input type="text" id="jeDescription" placeholder="مثال: بيع نقدي" /></div>' +
        '<div id="jeLinesBox">' +
            '<div class="je-line">' +
                '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:6px;margin-bottom:6px;">' +
                    '<select class="jeAccount" style="padding:8px;border-radius:6px;border:1px solid #3D3D3D;background:#1A1A1A;color:#F5E6C8;font-family:inherit;">' + accountOptions + '</select>' +
                    '<input type="number" class="jeDebit" placeholder="مدين" step="0.01" min="0" style="padding:8px;border-radius:6px;border:1px solid #3D3D3D;background:#1A1A1A;color:#2D8F5E;font-family:inherit;" />' +
                    '<input type="number" class="jeCredit" placeholder="دائن" step="0.01" min="0" style="padding:8px;border-radius:6px;border:1px solid #3D3D3D;background:#1A1A1A;color:#E06060;font-family:inherit;" />' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<button onclick="addJeLine()" style="width:100%;padding:10px;background:#4A8AB5;border:none;color:#fff;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;margin-bottom:12px;">➕ إضافة سطر</button>' +
        '<div id="jeBalanceInfo" style="text-align:center;padding:8px;background:#0D0D0D;border-radius:8px;margin-bottom:12px;font-size:12px;color:#A89070;">مجموع المدين: 0.00 | مجموع الدائن: 0.00</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
            '<button class="btn btn-success" onclick="saveJournalEntry()">💾 حفظ</button>' +
            '<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>' +
        '</div>';

    window.openModal(html);

    setTimeout(function() {
        document.querySelectorAll('.jeDebit, .jeCredit').forEach(function(input) {
            input.addEventListener('input', window.updateJeBalance);
        });
    }, 100);
};

window.addJeLine = function() {
    let accountOptions = '<option value="">اختر حساب...</option>';
    (window.accounts || []).slice().sort(function(a, b) { 
        return (a.code || '').localeCompare(b.code || ''); 
    }).forEach(function(acc) {
        accountOptions += '<option value="' + acc.id + '">' + acc.code + ' - ' + acc.name + '</option>';
    });

    const box = document.getElementById('jeLinesBox');
    if (!box) return;

    const line = document.createElement('div');
    line.className = 'je-line';
    line.innerHTML = '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:6px;margin-bottom:6px;">' +
        '<select class="jeAccount" style="padding:8px;border-radius:6px;border:1px solid #3D3D3D;background:#1A1A1A;color:#F5E6C8;font-family:inherit;">' + accountOptions + '</select>' +
        '<input type="number" class="jeDebit" placeholder="مدين" step="0.01" min="0" style="padding:8px;border-radius:6px;border:1px solid #3D3D3D;background:#1A1A1A;color:#2D8F5E;font-family:inherit;" />' +
        '<input type="number" class="jeCredit" placeholder="دائن" step="0.01" min="0" style="padding:8px;border-radius:6px;border:1px solid #3D3D3D;background:#1A1A1A;color:#E06060;font-family:inherit;" />' +
    '</div>';

    box.appendChild(line);

    line.querySelectorAll('.jeDebit, .jeCredit').forEach(function(input) {
        input.addEventListener('input', window.updateJeBalance);
    });
};

window.updateJeBalance = function() {
    let totalDebit = 0, totalCredit = 0;
    document.querySelectorAll('.jeDebit').forEach(function(i) { totalDebit += parseFloat(i.value) || 0; });
    document.querySelectorAll('.jeCredit').forEach(function(i) { totalCredit += parseFloat(i.value) || 0; });

    const info = document.getElementById('jeBalanceInfo');
    if (info) {
        const diff = Math.abs(totalDebit - totalCredit);
        const color = diff < 0.01 ? '#2D8F5E' : '#E06060';
        info.innerHTML = '<span style="color:#2D8F5E;">مدين: ' + window.formatMoney(totalDebit) + '</span> | ' +
            '<span style="color:#E06060;">دائن: ' + window.formatMoney(totalCredit) + '</span> | ' +
            '<span style="color:' + color + ';">الفرق: ' + window.formatMoney(diff) + '</span>';
    }
};

window.saveJournalEntry = function() {
    const date = document.getElementById('jeDate').value;
    const description = document.getElementById('jeDescription').value.trim();

    if (!description) { window.showToast('⚠️ أدخل وصف القيد', 'error'); return; }

    const lines = [];
    document.querySelectorAll('.je-line').forEach(function(lineEl) {
        const accountId = lineEl.querySelector('.jeAccount').value;
        const debit = parseFloat(lineEl.querySelector('.jeDebit').value) || 0;
        const credit = parseFloat(lineEl.querySelector('.jeCredit').value) || 0;

        if (accountId && (debit > 0 || credit > 0)) {
            lines.push({
                accountId: parseInt(accountId),
                debit: debit,
                credit: credit
            });
        }
    });

    if (lines.length < 2) {
        window.showToast('⚠️ يجب إضافة سطرين على الأقل', 'error');
        return;
    }

    const entry = window.addJournalEntry(date, description, lines);
    if (entry) {
        window.showToast('✅ تم حفظ القيد #' + entry.number, 'success');
        window.closeModal();
        window.renderJournalEntries();
        window.renderAccounts();
    } else {
        window.showToast('❌ القيد غير متوازن', 'error');
    }
};

// ═══════════════════════════════════════════════════════════
// الجزء 8: التقارير المحاسبية
// ═══════════════════════════════════════════════════════════

window.showTrialBalance = function() {
    let totalDebit = 0, totalCredit = 0;
    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>⚖️ ميزان المراجعة</h3>' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:10px;max-height:500px;overflow-y:auto;">' +
        '<div class="table-header" style="grid-template-columns: 0.8fr 1.5fr 1fr 1fr;"><span>الكود</span><span>الحساب</span><span>مدين</span><span>دائن</span></div>';

    (window.accounts || []).slice().sort(function(a, b) { 
        return (a.code || '').localeCompare(b.code || ''); 
    }).forEach(function(acc) {
        let accDebit = 0, accCredit = 0;
        (window.journalEntries || []).forEach(function(entry) {
            (entry.lines || []).forEach(function(line) {
                if (line.accountId == acc.id) {
                    accDebit += line.debit || 0;
                    accCredit += line.credit || 0;
                }
            });
        });

        const net = accDebit - accCredit;
        totalDebit += Math.max(net, 0);
        totalCredit += Math.max(-net, 0);

        if (accDebit > 0 || accCredit > 0) {
            html += '<div class="table-row" style="grid-template-columns: 0.8fr 1.5fr 1fr 1fr;font-size:11px;">' +
                '<span style="font-family:monospace;color:#C9A94E;">' + acc.code + '</span>' +
                '<span>' + acc.name + '</span>' +
                '<span style="color:#2D8F5E;">' + (net > 0 ? window.formatMoney(net) : '-') + '</span>' +
                '<span style="color:#E06060;">' + (net < 0 ? window.formatMoney(-net) : '-') + '</span>' +
            '</div>';
        }
    });

    html += '</div>' +
        '<div style="margin-top:12px;padding:12px;background:#1A1A1A;border-radius:8px;">' +
            '<div style="display:flex;justify-content:space-between;color:#2D8F5E;font-weight:900;padding:4px 0;">' +
                '<span>إجمالي المدين:</span><span>' + window.formatMoney(totalDebit) + '</span>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;color:#E06060;font-weight:900;padding:4px 0;">' +
                '<span>إجمالي الدائن:</span><span>' + window.formatMoney(totalCredit) + '</span>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;color:' + (Math.abs(totalDebit - totalCredit) < 0.01 ? '#2D8F5E' : '#E06060') + ';font-weight:900;padding:8px 0;border-top:1px solid #3D3D3D;margin-top:6px;">' +
                '<span>' + (Math.abs(totalDebit - totalCredit) < 0.01 ? '✅ متوازن' : '⚠️ الفرق:') + '</span>' +
                '<span>' + window.formatMoney(Math.abs(totalDebit - totalCredit)) + '</span>' +
            '</div>' +
        '</div>';

    window.openModal(html);
};

window.showIncomeStatement = function() {
    const revenues = window.getAccountTypeBalance('revenue');
    const expenses = window.getAccountTypeBalance('expense');
    const netProfit = -revenues - expenses;

    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>📈 قائمة الدخل</h3>' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">' +
            '<div style="padding:10px 0;border-bottom:1px solid #3D3D3D;">' +
                '<div style="color:#4A8AB5;font-weight:900;margin-bottom:8px;">💰 الإيرادات</div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#2D8F5E;">' +
                    '<span>إجمالي الإيرادات</span>' +
                    '<span style="font-weight:700;">' + window.formatMoney(-revenues) + '</span>' +
                '</div>' +
            '</div>' +
            '<div style="padding:10px 0;border-bottom:1px solid #3D3D3D;">' +
                '<div style="color:#E6A830;font-weight:900;margin-bottom:8px;">💸 المصروفات</div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#E06060;">' +
                    '<span>إجمالي المصروفات</span>' +
                    '<span style="font-weight:700;">' + window.formatMoney(expenses) + '</span>' +
                '</div>' +
            '</div>' +
            '<div style="padding:14px 0;margin-top:8px;border-top:2px solid #C9A94E;">' +
                '<div style="display:flex;justify-content:space-between;color:' + (netProfit >= 0 ? '#2D8F5E' : '#E06060') + ';font-size:18px;font-weight:900;">' +
                    '<span>' + (netProfit >= 0 ? '✅ صافي الربح' : '❌ صافي الخسارة') + '</span>' +
                    '<span>' + window.formatMoney(Math.abs(netProfit)) + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';

    window.openModal(html);
};

window.showBalanceSheet = function() {
    const assets = window.getAccountTypeBalance('asset');
    const liabilities = window.getAccountTypeBalance('liability');
    const equity = window.getAccountTypeBalance('equity');
    const totalLiabEquity = -liabilities - equity;

    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>💼 الميزانية العمومية</h3>' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">' +
            '<div style="padding:10px 0;border-bottom:1px solid #3D3D3D;">' +
                '<div style="color:#2D8F5E;font-weight:900;margin-bottom:8px;">💎 الأصول</div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#2D8F5E;font-weight:700;">' +
                    '<span>إجمالي الأصول</span>' +
                    '<span>' + window.formatMoney(assets) + '</span>' +
                '</div>' +
            '</div>' +
            '<div style="padding:10px 0;border-bottom:1px solid #3D3D3D;">' +
                '<div style="color:#E06060;font-weight:900;margin-bottom:8px;">📋 الالتزامات</div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#E06060;font-weight:700;">' +
                    '<span>إجمالي الالتزامات</span>' +
                    '<span>' + window.formatMoney(-liabilities) + '</span>' +
                '</div>' +
            '</div>' +
            '<div style="padding:10px 0;">' +
                '<div style="color:#C9A94E;font-weight:900;margin-bottom:8px;">👑 حقوق الملكية</div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#C9A94E;font-weight:700;">' +
                    '<span>إجمالي حقوق الملكية</span>' +
                    '<span>' + window.formatMoney(-equity) + '</span>' +
                '</div>' +
            '</div>' +
            '<div style="padding:14px 0;margin-top:8px;border-top:2px solid #C9A94E;">' +
                '<div style="display:flex;justify-content:space-between;color:#F5E6C8;font-size:14px;font-weight:900;">' +
                    '<span>إجمالي الالتزامات + حقوق الملكية</span>' +
                    '<span>' + window.formatMoney(totalLiabEquity) + '</span>' +
                '</div>' +
                '<div style="text-align:center;margin-top:8px;font-size:11px;color:' + (Math.abs(assets - totalLiabEquity) < 0.01 ? '#2D8F5E' : '#E06060') + ';">' +
                    (Math.abs(assets - totalLiabEquity) < 0.01 ? '✅ الميزانية متوازنة' : '⚠️ الميزانية غير متوازنة') +
                '</div>' +
            '</div>' +
        '</div>';

    window.openModal(html);
};

// ═══════════════════════════════════════════════════════════
// الجزء 9: محرك الأرباح والخسائر
// ═══════════════════════════════════════════════════════════

window.calculateCOGS = function(sales) {
    const data = sales || window.sales || [];
    let totalCOGS = 0;
    
    data.forEach(function(sale) {
        if (!sale.items) return;
        sale.items.forEach(function(item) {
            const buyPrice = parseFloat(item.costPrice || item.buyPrice || 0);
            totalCOGS += buyPrice * (parseFloat(item.qty) || 0);
        });
    });
    
    return Math.round(totalCOGS * 100) / 100;
};

window.calculateNetProfit = function(period) {
    period = period || 'all';
    let sales = window.sales || [];
    let expenses = window.expenses || [];
    
    if (period === 'today') {
        const today = window.getTodayDate();
        sales = sales.filter(function(s) { return (s.date || '').startsWith(today); });
        expenses = expenses.filter(function(e) { return (e.date || '').startsWith(today); });
    }
    
    const totalSales = sales.reduce(function(s, x) { return s + (x.total || 0); }, 0);
    const cogs = window.calculateCOGS(sales);
    const totalExpenses = expenses.reduce(function(s, x) { return s + (x.amount || 0); }, 0);
    
    const grossProfit = totalSales - cogs;
    const netProfit = grossProfit - totalExpenses;
    
    return {
        totalSales: totalSales,
        cogs: cogs,
        grossProfit: grossProfit,
        totalExpenses: totalExpenses,
        netProfit: netProfit,
        profitMargin: totalSales > 0 ? (netProfit / totalSales * 100).toFixed(2) : 0
    };
};

// ═══════════════════════════════════════════════════════════
// الجزء 10: تقارير PDF
// ═══════════════════════════════════════════════════════════

window.generateInvoicePDF = function(invoiceId) {
    const invoice = (window.sales || []).find(function(s) { return s.id == invoiceId; });
    if (!invoice) {
        window.showToast('⚠️ الفاتورة غير موجودة', 'error');
        return;
    }

    const company = window.companyData || { name: 'الميزان' };

    let itemsRows = '';
    (invoice.items || []).forEach(function(it, i) {
        itemsRows += '<tr>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + (i+1) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;">' + it.name + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + it.qty + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(it.price) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(it.total) + '</td>' +
        '</tr>';
    });

    const content = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة #' + invoice.number + '</title>' +
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
        '<div class="header"><h1>⚖️ ' + (company.name || 'الميزان') + '</h1>' +
        (company.phone ? '<p>📞 ' + company.phone + '</p>' : '') + '</div>' +
        '<div class="info-box"><div><strong>رقم الفاتورة:</strong> #' + invoice.number + '<br>' +
        '<strong>التاريخ:</strong> ' + invoice.date + '<br><strong>الوقت:</strong> ' + (invoice.time || '') + '</div>' +
        '<div><strong>العميل:</strong> ' + (invoice.customer || 'عميل نقدي') + '<br>' +
        '<strong>البائع:</strong> ' + (invoice.seller || '-') + '<br>' +
        (invoice.warehouseName ? '<strong>المستودع:</strong> ' + invoice.warehouseName : '') + '</div></div>' +
        '<table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>' + itemsRows + '</tbody></table>' +
        '<div class="totals"><div><span>المجموع:</span><span>' + window.formatMoney(invoice.subtotal || invoice.total) + ' ج.م</span></div>' +
        (invoice.vat > 0 ? '<div><span>الضريبة:</span><span>' + window.formatMoney(invoice.vat) + ' ج.م</span></div>' : '') +
        (invoice.discount > 0 ? '<div><span>الخصم:</span><span>- ' + window.formatMoney(invoice.discount) + ' ج.م</span></div>' : '') +
        '<div class="final"><span>الإجمالي:</span><span>' + window.formatMoney(invoice.total) + ' ج.م</span></div></div>' +
        '<div class="footer">' + (company.footer || 'شكراً لتعاملكم معنا 🌟') + '</div>' +
        '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script></body></html>';

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { window.showToast('⚠️ يرجى السماح بالنوافذ المنبثقة', 'warning'); return; }
    w.document.write(content);
    w.document.close();
    window.showToast('🖨️ جاري الطباعة...', 'info');
};

window.generateSalesReportPDF = function(period) {
    period = period || 'daily';
    const company = window.companyData || { name: 'الميزان' };
    
    const totalSales = (window.sales || []).reduce(function(s, x) { return s + (x.total || 0); }, 0);
    const totalCount = (window.sales || []).length;
    const totalProfit = (window.sales || []).reduce(function(s, x) { return s + (x.profit || 0); }, 0);

    let invoiceRows = '';
    (window.sales || []).slice(-50).reverse().forEach(function(inv) {
        invoiceRows += '<tr>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + inv.number + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + inv.date + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;">' + (inv.customer || 'عميل نقدي') + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(inv.total) + ' ج.م</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;color:#2D8F5E;">' + window.formatMoney(inv.profit || 0) + ' ج.م</td>' +
        '</tr>';
    });

    const content = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>تقرير المبيعات</title>' +
        '<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif;}body{padding:20px;background:#fff;color:#000;}' +
        '.header{text-align:center;padding:20px 0;border-bottom:3px solid #C9A94E;margin-bottom:20px;}' +
        '.header h1{color:#C9A94E;font-size:32px;font-weight:900;}' +
        '.stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;margin-bottom:20px;}' +
        '.stat{background:#f9f9f9;padding:15px;border-radius:8px;text-align:center;border-right:4px solid #C9A94E;}' +
        '.stat .num{font-size:24px;font-weight:900;color:#C9A94E;}' +
        '.stat .lbl{font-size:12px;color:#666;margin-top:5px;}' +
        'table{width:100%;border-collapse:collapse;}' +
        'th{background:#C9A94E;color:#fff;padding:12px;border:1px solid #C9A94E;font-size:14px;}' +
        'td{font-size:13px;}' +
        '.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:2px dashed #ddd;font-size:13px;color:#666;}' +
        '</style></head><body>' +
        '<div class="header"><h1>⚖️ ' + (company.name || 'الميزان') + '</h1>' +
        '<p>📊 تقرير المبيعات - ' + period + '</p></div>' +
        '<div class="stats">' +
            '<div class="stat"><div class="num">' + window.formatMoney(totalSales) + '</div><div class="lbl">💰 إجمالي المبيعات</div></div>' +
            '<div class="stat"><div class="num">' + totalCount + '</div><div class="lbl">🧾 عدد الفواتير</div></div>' +
            '<div class="stat"><div class="num">' + window.formatMoney(totalProfit) + '</div><div class="lbl">📈 صافي الربح</div></div>' +
        '</div>' +
        '<table><thead><tr><th>#</th><th>التاريخ</th><th>العميل</th><th>المبلغ</th><th>الربح</th></tr></thead><tbody>' + invoiceRows + '</tbody></table>' +
        '<div class="footer">تم إنشاء التقرير في: ' + new Date().toLocaleString('ar-EG') + '</div>' +
        '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script></body></html>';

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { window.showToast('⚠️ يرجى السماح بالنوافذ المنبثقة', 'warning'); return; }
    w.document.write(content);
    w.document.close();
    window.showToast('📊 جاهز للطباعة', 'success');
};

// ═══════════════════════════════════════════════════════════
// الجزء 11: تنظيف البيانات المالية
// ═══════════════════════════════════════════════════════════

window.financialCleaner = {
    diagnose: function() {
        const report = {
            products: (window.products || []).length,
            sales: (window.sales || []).length,
            purchases: (window.purchases || []).length,
            expenses: (window.expenses || []).length,
            cashBoxes: (window.cashBoxes || []).length,
            customers: (window.customers || []).length,
            suppliers: (window.suppliers || []).length
        };
        console.log('📊 تقرير البيانات:', report);
        return report;
    },

    recalculateCashBoxes: function() {
        console.log('🔧 إعادة حساب الخزائن...');
        let fixed = 0;

        (window.cashBoxes || []).forEach(function(box) {
            const correctBalance = window.getCashBoxBalance(box.id);
            const storedBalance = parseFloat(box.balance) || 0;
            
            if (Math.abs(correctBalance - storedBalance) > 0.01) {
                console.log('🔧 ' + box.name + ': ' + storedBalance + ' → ' + correctBalance);
                box.balance = correctBalance;
                fixed++;
            }
        });

        if (fixed > 0) {
            window.setData('cashBoxes', window.cashBoxes);
            console.log('✅ تم إصلاح ' + fixed + ' خزنة');
        }
        return fixed;
    },

    runAll: function() {
        console.log('🚀 بدء الإصلاحات المالية...');
        this.diagnose();
        this.recalculateCashBoxes();
        if (typeof window.updateDashboard === 'function') {
            setTimeout(window.updateDashboard, 500);
        }
        console.log('✅ اكتملت الإصلاحات');
    }
};

// ═══════════════════════════════════════════════════════════
// الجزء 12: تقارير المبيعات والعملاء والمنتجات
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
    if (typeof window.generateSalesReportPDF === 'function') {
        window.generateSalesReportPDF(window.currentReport);
    } else {
        window.print();
    }
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
// الجزء 13: الإعدادات (باقي الجزء)
// ═══════════════════════════════════════════════════════════

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
            
            if (typeof window.saveAll === 'function') window.saveAll();
            window.showToast('✅ تم الاستيراد', 'success');
            setTimeout(function() { location.reload(); }, 1500);
        } catch (err) { 
            window.showToast('❌ ملف غير صالح', 'error'); 
        }
    };
    reader.readAsText(file);
    event.target.value = '';
};

// ═══════════════════════════════════════════════════════════
// علم التحميل
// ═══════════════════════════════════════════════════════════
window.__accountingLoaded = true;

console.log('✅ accounting.js v17.0 جاهز');
