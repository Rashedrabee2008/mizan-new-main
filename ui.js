// ============================================================
// الميزان Pro - ui.js v19.0 (مُصلَّح)
// التنقل + Modal + Toast + القوائم + تحديث الواجهات
// ============================================================

(function() {
    'use strict';

    console.log('🎨 ui.js v19.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: Toast
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
    // الجزء 2: Modal
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
            if (e.target === overlay) window.closeModal();
        };
    };

    window.closeModal = function() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) overlay.classList.remove('show');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: التنقل — النسخة الوحيدة (محسّنة)
    // ═══════════════════════════════════════════════════════════

    const PAGE_REFRESHERS = {
        'dashboard':    ['updateDashboard'],
        'company':      ['renderCompany'],
        'inventory':    ['renderProducts', 'populateSaleProducts', 'populatePurProducts'],
        'cashier':      ['populateSaleProducts', 'populateSaleCustomers',
                         'populateCashBoxDropdowns', 'populateWarehouseField',
                         'renderCashier', 'updateSaleTotals', 'updateSalePrice',
                         'updateInvoiceHeader'],
        'purchases':    ['populatePurProducts', 'populatePurSuppliers',
                         'populateCashBoxDropdowns', 'populateWarehouseField',
                         'renderPurItems', 'updatePurTotals',
                         'renderPurchases', 'updatePurStats'],
        'customers':    ['renderCustomers'],
        'suppliers':    ['renderSuppliers'],
        'cash-boxes':   ['populateCashBoxDropdowns', 'renderCashBoxes'],
        'expenses':     ['populateCashBoxDropdowns', 'renderExpenses', 'updateExpensesStats'],
        'treasury':     ['populateCashBoxDropdowns', 'renderTreasury'],
        'invoices':     ['updateInvoiceStats', 'renderInvoices'],
        'payments':     ['populateCollectCustomers', 'populatePaySuppliers',
                         'populateCashBoxDropdowns', 'updatePaymentsStats', 'renderPayments'],
        'returns':      ['toggleReturnParty', 'populateRetProducts',
                         'populateCashBoxDropdowns', 'populateWarehouseField',
                         'updateReturnsStats', 'renderReturns'],
        'accounts':     ['renderAccounts', 'renderJournalEntries', 'updateAccountsStats'],
        'erp':          ['renderWarehouses', 'renderBranches'],  // ✅ شيلنا renderCurrencies
        'warehouses':   ['populateWarehouseDropdowns',
                         'renderWarehouseReceipts', 'renderWarehouseIssues',
                         'renderWarehouseTransfers', 'renderWarehouseAdjustments',
                         'renderOpeningBalances', 'renderWarehouseReportsList'],
        'employees':    ['renderEmployees'],
        'reports':      ['renderReport'],
        'users':        ['renderUsers'],
        'settings':     ['renderSettings']
    };

    window.navigateTo = function(page) {
        // ⚡ فحص الصلاحية
        if (window.currentUser && typeof window.canAccessPage === 'function') {
            if (!window.canAccessPage(page)) {
                if (typeof window.showToast === 'function') {
                    window.showToast('🚫 ليس لديك صلاحية الوصول لهذه الصفحة', 'error');
                }
                return;
            }
        }

        // إخفاء كل الصفحات
        document.querySelectorAll('.page-container').forEach(function(el) {
            el.classList.remove('active');
        });

        // إظهار الصفحة المطلوبة
        const target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');

        // تفعيل زر التنقل
        document.querySelectorAll('.nav-item').forEach(function(el) {
            el.classList.toggle('active', el.dataset.page === page);
        });

        // استدعاء دوال التحديث
        const refreshers = PAGE_REFRESHERS[page] || [];
        refreshers.forEach(function(fn) {
            if (typeof window[fn] === 'function') {
                try { window[fn](); } catch (e) {
                    console.warn('⚠️ خطأ في ' + fn + ':', e.message);
                }
            }
        });

        // إغلاق قائمة المزيد
        const moreMenu = document.getElementById('moreMenu');
        if (moreMenu && moreMenu.style.display !== 'none') {
            moreMenu.style.display = 'none';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (window.EventBus) window.EventBus.emit('page:navigated', page);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: قائمة المزيد
    // ═══════════════════════════════════════════════════════════

    window.toggleMoreMenu = function() {
        const menu = document.getElementById('moreMenu');
        if (!menu) return;
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    };

    document.addEventListener('click', function(e) {
        const menu = document.getElementById('moreMenu');
        if (!menu || menu.style.display === 'none') return;

        const nav = document.getElementById('bottomNav');
        const isNavClick = nav && nav.contains(e.target);
        const isMenuClick = menu.contains(e.target);
        const isMoreBtn = e.target.closest('[data-page="more"]');

        if (!isNavClick && !isMenuClick && !isMoreBtn) {
            menu.style.display = 'none';
        }
    });

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: الساعة والتاريخ
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
    // الجزء 6: تحديث كل الواجهات
    // ═══════════════════════════════════════════════════════════

    window.refreshAllUI = function() {
        const currentPage = document.querySelector('.page-container.active');
        const pageId = currentPage ? currentPage.id.replace('page-', '') : 'dashboard';

        const refreshers = PAGE_REFRESHERS[pageId] || [];
        refreshers.forEach(function(fn) {
            if (typeof window[fn] === 'function') {
                try { window[fn](); } catch (e) {}
            }
        });

        if (typeof window.updateDashboard === 'function') {
            try { window.updateDashboard(); } catch (e) {}
        }
        if (typeof window.populateCashBoxDropdowns === 'function') {
            try { window.populateCashBoxDropdowns(); } catch (e) {}
        }
        if (typeof window.populateSaleProducts === 'function') {
            try { window.populateSaleProducts(); } catch (e) {}
        }
        if (typeof window.populateWarehouseField === 'function') {
            try { window.populateWarehouseField(); } catch (e) {}
        }
        if (typeof window.populateWarehouseDropdowns === 'function') {
            try { window.populateWarehouseDropdowns(); } catch (e) {}
        }
        if (typeof window.updateInvoiceHeader === 'function') {
            try { window.updateInvoiceHeader(); } catch (e) {}
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: updateUserUI — ⚡ محذوفة (موجودة في core.js)
    // ═══════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    window.EventBus.on('data:changed', function(evt) {
        const key = evt.key;

        const UI_MAP = {
            'sales':              ['renderInvoices', 'updateInvoiceStats', 'updateDashboard'],
            'purchases':          ['renderPurchases', 'updatePurStats', 'updateDashboard'],
            'products':           ['renderProducts', 'populateSaleProducts', 'populatePurProducts',
                                   'populateWarehouseDropdowns', 'updateDashboard'],
            'customers':          ['renderCustomers', 'populateSaleCustomers', 'populateCollectCustomers', 'updateDashboard'],
            'suppliers':          ['renderSuppliers', 'populatePurSuppliers', 'populatePaySuppliers', 'updateDashboard'],
            'expenses':           ['renderExpenses', 'updateExpensesStats', 'updateDashboard'],
            'treasury':           ['renderTreasury', 'renderCashBoxes', 'updateDashboard'],
            'cashBoxes':          ['renderCashBoxes', 'populateCashBoxDropdowns', 'updateDashboard'],
            'returns':            ['renderReturns', 'updateReturnsStats', 'updateDashboard'],
            'payments':           ['renderPayments', 'updatePaymentsStats'],
            'journalEntries':     ['renderJournalEntries', 'renderAccounts', 'updateAccountsStats'],
            'accounts':           ['renderAccounts', 'updateAccountsStats'],
            'users':              ['renderUsers', 'populateLoginUsers'],
            'warehouses':         ['renderWarehouses', 'populateWarehouseField', 'populateWarehouseDropdowns'],
            'branches':           ['renderBranches'],
            'employees':          ['renderEmployees'],
            'warehouseReceipts':  ['renderWarehouseReceipts'],
            'warehouseIssues':    ['renderWarehouseIssues'],
            'warehouseTransfers': ['renderWarehouseTransfers'],
            'warehouseAdjustments': ['renderWarehouseAdjustments'],
            'openingBalances':    ['renderOpeningBalances']
        };

        const toRefresh = UI_MAP[key] || [];

        toRefresh.forEach(function(fn) {
            if (typeof window[fn] === 'function') {
                try { window[fn](); } catch (e) {}
            }
        });
    });

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: أدوات إضافية
    // ═══════════════════════════════════════════════════════════

    window.setButtonLoading = function(btn, isLoading, loadingText) {
        if (!btn) return;

        if (isLoading) {
            btn._originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (loadingText || 'جاري...');
        } else {
            btn.disabled = false;
            if (btn._originalText) {
                btn.innerHTML = btn._originalText;
                delete btn._originalText;
            }
        }
    };

    window.confirmDialog = function(message) {
        return new Promise(function(resolve) {
            const overlay = document.getElementById('modalOverlay');
            if (!overlay) {
                resolve(confirm(message));
                return;
            }

            const box = document.createElement('div');
            box.className = 'modal-box';
            box.style.maxWidth = '420px';
            box.style.textAlign = 'center';
            box.innerHTML =
                '<div style="font-size:52px;margin-bottom:12px;">⚠️</div>' +
                '<h3 style="color:#E06060;margin-bottom:14px;">تأكيد</h3>' +
                '<p style="color:#F5E6C8;margin-bottom:20px;line-height:1.7;white-space:pre-line;">' + message + '</p>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<button class="btn btn-secondary" id="confirmNo">❌ إلغاء</button>' +
                    '<button class="btn btn-danger" id="confirmYes">✅ نعم</button>' +
                '</div>';

            overlay.innerHTML = '';
            overlay.appendChild(box);
            overlay.classList.add('show');

            document.getElementById('confirmNo').onclick = function() {
                overlay.classList.remove('show');
                resolve(false);
            };

            document.getElementById('confirmYes').onclick = function() {
                overlay.classList.remove('show');
                resolve(true);
            };
        });
    };

    window.promptDialog = function(message, defaultValue) {
        return new Promise(function(resolve) {
            const overlay = document.getElementById('modalOverlay');
            if (!overlay) {
                resolve(prompt(message, defaultValue));
                return;
            }

            const box = document.createElement('div');
            box.className = 'modal-box';
            box.style.maxWidth = '420px';
            box.innerHTML =
                '<button class="modal-close" onclick="document.getElementById(\'modalOverlay\').classList.remove(\'show\')">&times;</button>' +
                '<h3>' + message + '</h3>' +
                '<input type="text" id="promptInput" value="' + (defaultValue || '') + '" style="width:100%;padding:11px;border-radius:10px;border:2px solid #3D3D3D;background:#0D0D0D;color:#F5E6C8;font-family:inherit;font-size:15px;box-sizing:border-box;margin-bottom:12px;" />' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<button class="btn btn-secondary" id="promptNo">إلغاء</button>' +
                    '<button class="btn btn-primary" id="promptYes">موافق</button>' +
                '</div>';

            overlay.innerHTML = '';
            overlay.appendChild(box);
            overlay.classList.add('show');

            setTimeout(function() {
                const input = document.getElementById('promptInput');
                if (input) input.focus();
            }, 100);

            document.getElementById('promptNo').onclick = function() {
                overlay.classList.remove('show');
                resolve(null);
            };

            document.getElementById('promptYes').onclick = function() {
                const input = document.getElementById('promptInput');
                const value = input ? input.value : '';
                overlay.classList.remove('show');
                resolve(value);
            };
        });
    };

    window.__uiLoaded = true;
    console.log('✅ ui.js v19.0 جاهز');

    // ═══════════════════════════════════════════════════════════
    // ربط الصلاحيات
    // ═══════════════════════════════════════════════════════════

    if (window.EventBus) {
        window.EventBus.on('app:ready', function() {
            if (typeof window.applyPagePermissions === 'function') {
                setTimeout(window.applyPagePermissions, 500);
            }
        });

        window.EventBus.on('page:navigated', function() {
            if (typeof window.applyPagePermissions === 'function') {
                setTimeout(window.applyPagePermissions, 100);
            }
        });
    }

    // تحديث قائمة الإعلانات
    document.addEventListener('click', function(e) {
        if (e.target.closest('.nav-item[data-page="settings"]') ||
            e.target.closest('button[onclick*="settings"]') ||
            e.target.closest('.more-item[onclick*="settings"]')) {

            setTimeout(function() {
                if (typeof window.renderAdsList === 'function') {
                    window.renderAdsList();
                }
            }, 200);
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.renderAdsList === 'function') {
            window.renderAdsList();
        }
    });
// ═══════════════════════════════════════════════════════════
// عرض الخزائن (renderCashBoxes) - جديدة
// ═══════════════════════════════════════════════════════════

window.renderCashBoxes = function() {
    const container = document.getElementById('cashBoxesList');
    if (!container) {
        console.warn('⚠️ cashBoxesList مش موجود في الصفحة');
        return;
    }

    const boxes = window.cashBoxes || [];

    if (boxes.length === 0) {
        container.innerHTML = '<div class="empty-state">' +
            '<i class="fas fa-money-bill-wave"></i>' +
            '<span>لا توجد خزائن</span>' +
            '<p style="font-size:11px;color:#5D5D5D;margin-top:8px;">أضف خزنة جديدة من الإعدادات</p>' +
        '</div>';
        return;
    }

    // حساب الإجمالي
    let totalBalance = 0;
    boxes.forEach(function(box) {
        totalBalance += window.Balance.cashBox(box.id);
    });

    // بطاقة الإجمالي
    let html = '<div class="cash-boxes-summary">' +
        '<div class="summary-item">' +
            '<div class="summary-label">💰 إجمالي الخزائن</div>' +
            '<div class="summary-value">' + window.formatMoney(totalBalance) + '</div>' +
        '</div>' +
        '<div class="summary-item">' +
            '<div class="summary-label">📊 عدد الخزائن</div>' +
            '<div class="summary-value">' + boxes.length + '</div>' +
        '</div>' +
    '</div>';

    // كل خزنة
    boxes.forEach(function(box) {
        if (box.active === false) return;

        const balance = window.Balance.cashBox(box.id);
        const isNegative = balance < 0;
        const icon = box.icon || (box.type === 'cash' ? '💵' : box.type === 'wallet' ? '📱' : box.type === 'bank' ? '🏦' : '💰');
        const typeName = box.type === 'cash' ? 'نقدي' : box.type === 'wallet' ? 'محفظة إلكترونية' : box.type === 'bank' ? 'بنك' : 'أخرى';

        html += '<div class="cash-box-card' + (box.isDefault ? ' default' : '') + '" style="margin-bottom:12px;">' +
            '<div class="cash-box-header">' +
                '<div class="cash-box-icon">' + icon + '</div>' +
                '<div class="cash-box-info">' +
                    '<div class="cash-box-name">' + window.escapeHtml(box.name) +
                        (box.isDefault ? ' ⭐' : '') +
                    '</div>' +
                    '<div class="cash-box-type">' + typeName + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="cash-box-balance">' +
                '<div class="balance-label">💰 الرصيد الحالي</div>' +
                '<div class="balance-value' + (isNegative ? ' negative' : '') + '">' +
                    window.formatMoney(balance) + ' ج.م' +
                '</div>' +
            '</div>' +
            '<div class="cash-box-actions">' +
                '<button class="btn btn-info btn-sm" onclick="showCashBoxHistory(\'' + box.id + '\')" style="flex:1;">' +
                    '<i class="fas fa-history"></i> الحركات' +
                '</button>' +
                '<button class="btn btn-success btn-sm" onclick="showAddCashBoxTransaction(\'' + box.id + '\')" style="flex:1;">' +
                    '<i class="fas fa-plus"></i> إضافة' +
                '</button>' +
            '</div>' +
        '</div>';
    });

    container.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// عرض حركات خزنة معينة
// ═══════════════════════════════════════════════════════════

window.showCashBoxHistory = function(boxId) {
    const box = (window.cashBoxes || []).find(function(b) { return String(b.id) === String(boxId); });
    if (!box) return;

    const transactions = (window.treasury || []).filter(function(t) {
        return String(t.cashBoxId) === String(boxId);
    }).sort(function(a, b) {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
    }).slice(0, 50);

    const balance = window.Balance.cashBox(boxId);
    const icon = box.icon || '💰';

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>' + icon + ' حركات ' + window.escapeHtml(box.name) + '</h3>' +
        '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:10px;padding:14px;text-align:center;color:#0D0D0D;margin-bottom:12px;">' +
            '<div style="font-size:11px;">الرصيد الحالي</div>' +
            '<div style="font-size:24px;font-weight:900;font-family:monospace;">' + window.formatMoney(balance) + ' ج.م</div>' +
        '</div>';

    if (transactions.length === 0) {
        html += '<div class="empty-state"><i class="fas fa-history"></i><span>لا توجد حركات</span></div>';
    } else {
        html += '<div style="max-height:400px;overflow-y:auto;">';
        transactions.forEach(function(t) {
            const isDep = t.type === 'deposit';
            const color = isDep ? '#2D8F5E' : '#E06060';
            const icons = {
                'sale': '💰', 'purchase': '🛒', 'expense': '💸',
                'collect': '💵', 'pay': '💳', 'manual': '✋',
                'return': '🔄', 'salary': '👤'
            };
            const refIcon = icons[t.refType] || '📋';

            html += '<div style="background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid ' + color + ';">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                    '<span style="color:#F5E6C8;font-size:12px;">' + refIcon + ' ' + window.escapeHtml(t.note || '') + '</span>' +
                    '<span style="color:' + color + ';font-weight:900;font-size:13px;font-family:monospace;">' +
                        (isDep ? '+' : '-') + window.formatMoney(t.amount) +
                    '</span>' +
                '</div>' +
                '<div style="color:#A89070;font-size:10px;">📅 ' + (t.date || '') + ' • 🕐 ' + (t.time || '') + '</div>' +
            '</div>';
        });
        html += '</div>';
    }

    html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

// ═══════════════════════════════════════════════════════════
// نافذة إضافة حركة لخزنة
// ═══════════════════════════════════════════════════════════

window.showAddCashBoxTransaction = function(boxId) {
    const box = (window.cashBoxes || []).find(function(b) { return String(b.id) === String(boxId); });
    if (!box) return;

    const icon = box.icon || '💰';

    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>' + icon + ' إضافة حركة - ' + window.escapeHtml(box.name) + '</h3>' +
        '<div class="form-group">' +
            '<label>النوع</label>' +
            '<select id="cbTransType" class="pos-select">' +
                '<option value="deposit">💚 إيداع</option>' +
                '<option value="withdraw">❤️ سحب</option>' +
            '</select>' +
        '</div>' +
        '<div class="form-group">' +
            '<label>المبلغ *</label>' +
            '<input type="number" id="cbTransAmount" step="0.01" min="0" placeholder="0.00" />' +
        '</div>' +
        '<div class="form-group">' +
            '<label>البيان *</label>' +
            '<input type="text" id="cbTransNote" placeholder="البيان..." />' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
            '<button class="btn btn-success" onclick="saveCashBoxTransaction(\'' + boxId + '\')">' +
                '<i class="fas fa-check"></i> حفظ' +
            '</button>' +
            '<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>' +
        '</div>';

    window.openModal(html);
};

window.saveCashBoxTransaction = function(boxId) {
    const type = document.getElementById('cbTransType') ? document.getElementById('cbTransType').value : 'deposit';
    const amount = parseFloat(document.getElementById('cbTransAmount') ? document.getElementById('cbTransAmount').value : 0) || 0;
    const note = document.getElementById('cbTransNote') ? document.getElementById('cbTransNote').value.trim() : '';

    if (amount <= 0) {
        window.showToast('⚠️ أدخل مبلغ صحيح', 'error');
        return;
    }
    if (!note) {
        window.showToast('⚠️ أدخل البيان', 'error');
        return;
    }

    const box = (window.cashBoxes || []).find(function(b) { return String(b.id) === String(boxId); });

    // فحص الرصيد لو سحب
    if (type === 'withdraw') {
        const balance = window.Balance.cashBox(boxId);
        if (balance < amount) {
            window.showToast('⚠️ رصيد الخزنة غير كافٍ (المتاح: ' + window.formatMoney(balance) + ' ج.م)', 'error');
            return;
        }
    }

    window.DataStore.add('treasury', {
        id: window.generateId('tr_'),
        type: type,
        amount: amount,
        note: note,
        cashBoxId: boxId,
        cashBoxName: box ? box.name : '',
        refType: 'manual',
        refId: null,
        date: window.getTodayDate(),
        time: window.getNowTime()
    });

    window.showToast('✅ تم تسجيل الحركة', 'success');
    window.closeModal();

    setTimeout(function() {
        window.renderCashBoxes();
    }, 300);
};
    
})();
