// ============================================================
// الميزان Pro - ui.js
// التنقل + Modal + Toast + القوائم + تحديث الواجهات
// ============================================================

(function() {
    'use strict';

    console.log('🎨 ui.js v18.0 - بدء التحميل');

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
    // الجزء 3: التنقل
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
        'erp':          ['renderWarehouses', 'renderBranches', 'renderCurrencies'],
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
    // ⚡ فحص الصلاحية قبل التنقل
    if (window.currentUser && typeof window.canAccessPage === 'function') {
        if (!window.canAccessPage(page)) {
            window.showToast('🚫 ليس لديك صلاحية الوصول لهذه الصفحة', 'error');
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
                try {
                    window[fn]();
                } catch (e) {
                    console.warn('⚠️ خطأ في ' + fn + ':', e.message);
                }
            }
        });

        // إغلاق قائمة المزيد لو مفتوحة
        const moreMenu = document.getElementById('moreMenu');
        if (moreMenu && moreMenu.style.display !== 'none') {
            moreMenu.style.display = 'none';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.EventBus.emit('page:navigated', page);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: قائمة المزيد
    // ═══════════════════════════════════════════════════════════

    window.toggleMoreMenu = function() {
        const menu = document.getElementById('moreMenu');
        if (!menu) return;
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    };

    // إغلاق القائمة عند النقر خارجها
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

        // تحديث حقول الفاتورة لو موجودة
        const invDateEl = document.getElementById('invDateDisplay');
        const invTimeEl = document.getElementById('invTimeDisplay');
        if (invDateEl) invDateEl.value = day + '/' + month + '/' + year;
        if (invTimeEl) invTimeEl.value = hoursStr + ':' + minutes + ' ' + ampm;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: تحديث كل الواجهات (بعد مزامنة مثلاً)
    // ═══════════════════════════════════════════════════════════

    window.refreshAllUI = function() {
        const currentPage = document.querySelector('.page-container.active');
        const pageId = currentPage ? currentPage.id.replace('page-', '') : 'dashboard';

        // تحديث الصفحة الحالية
        const refreshers = PAGE_REFRESHERS[pageId] || [];
        refreshers.forEach(function(fn) {
            if (typeof window[fn] === 'function') {
                try { window[fn](); } catch (e) {}
            }
        });

        // تحديث الإحصائيات العامة
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
    // الجزء 7: عرض المستخدم الحالي
    // ═══════════════════════════════════════════════════════════

    window.updateUserUI = function() {
        if (!window.currentUser) return;

        const el = document.getElementById('currentUserName');
        if (el) {
            const roleInfo = window.ROLES[window.currentUser.role] || { icon: '❓' };
            el.textContent = roleInfo.icon + ' ' + window.currentUser.name;
        }

        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany && window.companyData && window.companyData.name) {
            headerCompany.textContent = window.companyData.name;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: ربط الأحداث (EventBus → UI)
    // ═══════════════════════════════════════════════════════════

    // كل ما تتغير مجموعة بيانات، نحدث الواجهة
    window.EventBus.on('data:changed', function(evt) {
        const key = evt.key;

        // خريطة تحديثات حسب المفتاح
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

        // لا نحدث إلا الصفحات الظاهرة (لتجنب البطء)
        toRefresh.forEach(function(fn) {
            if (typeof window[fn] === 'function') {
                try { window[fn](); } catch (e) {}
            }
        });
    });

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: أدوات واجهة إضافية
    // ═══════════════════════════════════════════════════════════

    // تعطيل/تفعيل زر
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

    // تأكيد
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

    // إدخال سريع
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

    // ═══════════════════════════════════════════════════════════
    // جاهز
    // ═══════════════════════════════════════════════════════════

    window.__uiLoaded = true;
    console.log('✅ ui.js v18.0 جاهز');

    // ═══════════════════════════════════════════════════════════
// ربط الصلاحيات بأحداث التطبيق
// ═══════════════════════════════════════════════════════════

if (window.EventBus) {
    // عند اكتمال التطبيق، طبّق الصلاحيات
    window.EventBus.on('app:ready', function() {
        if (typeof window.applyPagePermissions === 'function') {
            setTimeout(window.applyPagePermissions, 500);
        }
    });

    // عند التنقل، أعد فحص الصلاحيات
    window.EventBus.on('page:navigated', function() {
        if (typeof window.applyPagePermissions === 'function') {
            setTimeout(window.applyPagePermissions, 100);
        }
    });
}

})();
