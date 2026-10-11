// ============================================================
// الميزان Pro - accounting.js
// المحاسبة + القيود + التقارير المالية + PDF
// ============================================================

(function() {
    'use strict';

    console.log('📚 accounting.js v18.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: عرض الحسابات
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

        if (!window.accounts || window.accounts.length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><span>لا توجد حسابات</span></div>';
            return;
        }

        let filtered = window.accounts;
        if (window.currentAccountFilter !== 'all') {
            filtered = window.accounts.filter(function(a) {
                return a.type === window.currentAccountFilter;
            });
        }

        if (filtered.length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><span>لا توجد حسابات في هذا التصنيف</span></div>';
            return;
        }

        filtered = filtered.slice().sort(function(a, b) {
            return (a.code || '').localeCompare(b.code || '');
        });

        let html = '<div class="table-header" style="grid-template-columns: 0.7fr 1.5fr 0.9fr 1fr 1fr;">' +
            '<span>الكود</span><span>الحساب</span><span>النوع</span><span>الرصيد</span><span></span>' +
        '</div>';

        filtered.forEach(function(acc) {
            const balance = window.Balance.account(acc.id);
            const typeInfo = window.ACCOUNT_TYPES[acc.type] || { name: acc.type, icon: '❓', color: '#5D5D5D' };
            const indent = '&nbsp;&nbsp;&nbsp;'.repeat(acc.level || 0);

            html += '<div class="table-row" style="grid-template-columns: 0.7fr 1.5fr 0.9fr 1fr 1fr;">' +
                '<span style="font-family:monospace;font-weight:700;color:#C9A94E;">' + acc.code + '</span>' +
                '<span>' + indent + '<strong>' + window.escapeHtml(acc.name) + '</strong></span>' +
                '<span style="color:' + typeInfo.color + ';font-size:11px;">' +
                    typeInfo.icon + ' ' + typeInfo.name + '</span>' +
                '<span style="color:' + (balance >= 0 ? '#2D8F5E' : '#E06060') + ';font-weight:700;">' +
                    window.formatMoney(Math.abs(balance)) + '</span>' +
                '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                    '<button class="btn btn-info btn-sm" onclick="showAccountLedger(' + acc.id + ')"><i class="fas fa-list"></i></button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
        window.updateAccountsStats();
    };

    window.updateAccountsStats = function() {
        const stats = {
            assets: window.Balance.accountType('asset'),
            liabilities: window.Balance.accountType('liability'),
            equity: window.Balance.accountType('equity'),
            revenue: window.Balance.accountType('revenue'),
            expenses: window.Balance.accountType('expense')
        };

        const set = function(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        set('accAssets', window.formatMoney(stats.assets));
        set('accLiabilities', window.formatMoney(Math.abs(stats.liabilities)));
        set('accEquity', window.formatMoney(Math.abs(stats.equity)));
        set('accRevenue', window.formatMoney(Math.abs(stats.revenue)));
        set('accExpenses', window.formatMoney(stats.expenses));
    };

    window.showAccountLedger = function(accountId) {
        const acc = (window.accounts || []).find(function(a) { return a.id == accountId; });
        if (!acc) return;

        const entries = [];
        (window.journalEntries || []).forEach(function(entry) {
            (entry.lines || []).forEach(function(line) {
                if (line.accountId == accountId) {
                    entries.push({
                        date: entry.date,
                        description: entry.description,
                        reference: entry.reference,
                        debit: parseFloat(line.debit) || 0,
                        credit: parseFloat(line.credit) || 0
                    });
                }
            });
        });

        entries.sort(function(a, b) { return (a.date || '').localeCompare(b.date || ''); });

        let runningBalance = 0;
        let entriesHtml = '';

        entries.forEach(function(e) {
            runningBalance += e.debit - e.credit;
            entriesHtml += '<tr>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;font-size:11px;">' + (e.date || '') + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;font-size:11px;">' + window.escapeHtml(e.description) + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;color:#2D8F5E;font-size:11px;">' +
                    (e.debit > 0 ? window.formatMoney(e.debit) : '-') + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;color:#E06060;font-size:11px;">' +
                    (e.credit > 0 ? window.formatMoney(e.credit) : '-') + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;font-size:11px;font-weight:700;color:#C9A94E;">' +
                    window.formatMoney(runningBalance) + '</td>' +
            '</tr>';
        });

        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>📋 كشف حساب: ' + window.escapeHtml(acc.name) + '</h3>' +
            '<div style="background:#0D0D0D;padding:14px;border-radius:10px;border:1px solid #2D2D2D;">' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:2px solid #C9A94E;margin-bottom:10px;">' +
                    '<span style="color:#A89070;font-size:12px;">الكود:</span>' +
                    '<strong style="color:#C9A94E;font-family:monospace;">' + acc.code + '</strong>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:2px solid #C9A94E;margin-bottom:10px;">' +
                    '<span style="color:#A89070;font-size:12px;">الرصيد الحالي:</span>' +
                    '<strong style="color:' + (runningBalance >= 0 ? '#2D8F5E' : '#E06060') + ';font-size:16px;">' +
                        window.formatMoney(Math.abs(runningBalance)) + '</strong>' +
                '</div>' +
                (entries.length === 0 ?
                    '<div style="text-align:center;padding:30px;color:#5D5D5D;">لا توجد حركات</div>' :
                    '<div style="max-height:400px;overflow-y:auto;">' +
                        '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                            '<thead><tr style="background:#1A1A1A;">' +
                                '<th style="padding:6px;color:#C9A94E;">التاريخ</th>' +
                                '<th style="padding:6px;color:#C9A94E;">البيان</th>' +
                                '<th style="padding:6px;color:#2D8F5E;">مدين</th>' +
                                '<th style="padding:6px;color:#E06060;">دائن</th>' +
                                '<th style="padding:6px;color:#C9A94E;">الرصيد</th>' +
                            '</tr></thead>' +
                            '<tbody>' + entriesHtml + '</tbody>' +
                        '</table>' +
                    '</div>') +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

        window.openModal(html);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: عرض القيود اليومية
    // ═══════════════════════════════════════════════════════════

    window.renderJournalEntries = function() {
        const c = document.getElementById('journalList');
        if (!c) return;

        if ((window.journalEntries || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-list"></i><span>لا توجد قيود محاسبية</span></div>';
            return;
        }

        const sorted = window.journalEntries.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 50);

        let html = '';
        sorted.forEach(function(entry) {
            html += '<div class="cash-box-card" style="margin-bottom:10px;border-right:4px solid #C9A94E;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<div style="color:#C9A94E;font-weight:900;">📝 قيد #' + entry.number + '</div>' +
                    '<div style="color:#A89070;font-size:11px;">📅 ' + (entry.date || '') + '</div>' +
                '</div>' +
                '<div style="color:#F5E6C8;font-size:13px;margin-bottom:8px;">' +
                    window.escapeHtml(entry.description) + '</div>' +
                '<div style="background:#0D0D0D;border-radius:8px;padding:8px;font-size:11px;">';

            (entry.lines || []).forEach(function(line) {
                const acc = (window.accounts || []).find(function(a) { return a.id == line.accountId; });
                const accName = acc ? acc.code + ' - ' + acc.name : '⚠️ حساب محذوف';

                html += '<div style="display:flex;justify-content:space-between;padding:3px 0;' +
                    (line.debit > 0 ? 'color:#2D8F5E;' : 'color:#E06060;') + '">' +
                    '<span>' + window.escapeHtml(accName) + '</span>' +
                    '<span style="font-family:monospace;">' +
                        (line.debit > 0 ? '📥 ' + window.formatMoney(line.debit) : '📤 ' + window.formatMoney(line.credit)) +
                    '</span>' +
                '</div>';
            });

            html += '</div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">' +
                    '<div style="color:#A89070;font-size:10px;">' +
                        (entry.createdBy ? 'بواسطة: ' + window.escapeHtml(entry.createdBy) : '') +
                    '</div>' +
                    '<button class="btn btn-danger btn-sm" onclick="deleteJournalEntry(\'' + entry.id + '\')">' +
                        '<i class="fas fa-trash"></i> حذف' +
                    '</button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.deleteJournalEntry = async function(id) {
        if (!window.canViewAccounts()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const confirmed = await window.confirmDialog('حذف هذا القيد؟');
        if (!confirmed) return;

        window.DataStore.remove('journalEntries', id);
        window.showToast('🗑️ تم حذف القيد', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: القيد اليدوي
    // ═══════════════════════════════════════════════════════════

    window.showAddJournalDialog = function() {
        if (!window.canViewAccounts()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        let accountOptions = '<option value="">اختر حساب...</option>';
        (window.accounts || []).slice().sort(function(a, b) {
            return (a.code || '').localeCompare(b.code || '');
        }).forEach(function(acc) {
            accountOptions += '<option value="' + acc.id + '">' + acc.code + ' - ' + window.escapeHtml(acc.name) + '</option>';
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
            accountOptions += '<option value="' + acc.id + '">' + acc.code + ' - ' + window.escapeHtml(acc.name) + '</option>';
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

        if (!description) {
            window.showToast('⚠️ أدخل وصف القيد', 'error');
            return;
        }

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

        const entry = window.Accounting.createEntry(date, description, lines);
        if (entry) {
            window.showToast('✅ تم حفظ القيد #' + entry.number, 'success');
            window.closeModal();
        } else {
            window.showToast('❌ القيد غير متوازن', 'error');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: التقارير المحاسبية
    // ═══════════════════════════════════════════════════════════

    window.showTrialBalance = function() {
        let totalDebit = 0, totalCredit = 0;
        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>⚖️ ميزان المراجعة</h3>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:10px;max-height:500px;overflow-y:auto;">' +
            '<div class="table-header" style="grid-template-columns: 0.8fr 1.5fr 1fr 1fr;">' +
                '<span>الكود</span><span>الحساب</span><span>مدين</span><span>دائن</span>' +
            '</div>';

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
                    '<span>' + window.escapeHtml(acc.name) + '</span>' +
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
                '<div style="display:flex;justify-content:space-between;color:' +
                    (Math.abs(totalDebit - totalCredit) < 0.01 ? '#2D8F5E' : '#E06060') +
                    ';font-weight:900;padding:8px 0;border-top:1px solid #3D3D3D;margin-top:6px;">' +
                    '<span>' + (Math.abs(totalDebit - totalCredit) < 0.01 ? '✅ متوازن' : '⚠️ الفرق:') + '</span>' +
                    '<span>' + window.formatMoney(Math.abs(totalDebit - totalCredit)) + '</span>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

        window.openModal(html);
    };

    window.showIncomeStatement = function() {
        const revenues = window.Balance.accountType('revenue');
        const expenses = window.Balance.accountType('expense');
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
                    '<div style="display:flex;justify-content:space-between;color:' +
                        (netProfit >= 0 ? '#2D8F5E' : '#E06060') + ';font-size:18px;font-weight:900;">' +
                        '<span>' + (netProfit >= 0 ? '✅ صافي الربح' : '❌ صافي الخسارة') + '</span>' +
                        '<span>' + window.formatMoney(Math.abs(netProfit)) + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

        window.openModal(html);
    };

    window.showBalanceSheet = function() {
        const assets = window.Balance.accountType('asset');
        const liabilities = window.Balance.accountType('liability');
        const equity = window.Balance.accountType('equity');
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
                    '<div style="text-align:center;margin-top:8px;font-size:11px;color:' +
                        (Math.abs(assets - totalLiabEquity) < 0.01 ? '#2D8F5E' : '#E06060') + ';">' +
                        (Math.abs(assets - totalLiabEquity) < 0.01 ? '✅ الميزانية متوازنة' : '⚠️ الميزانية غير متوازنة') +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

        window.openModal(html);
    };

    window.__accountingLoaded = true;
    console.log('✅ accounting.js v18.0 جاهز');

})();
