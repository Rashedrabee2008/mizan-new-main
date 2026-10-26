// ============================================================
// الميزان Pro - dashboard.js
// لوحة التحكم + آخر المبيعات + ملخص الأداء
// ============================================================

(function() {
    'use strict';

    console.log('📊 dashboard.js v18.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الدالة الرئيسية
    // ═══════════════════════════════════════════════════════════

    window.updateDashboard = function() {
        try {
            const products = window.products || [];
            const sales = window.sales || [];
            const purchases = window.purchases || [];
            const expenses = window.expenses || [];
            const customers = window.customers || [];
            const suppliers = window.suppliers || [];

            // ═══ المنتجات ═══
            const totalQty = products.reduce(function(s, p) {
                return s + (parseFloat(p.qty) || 0);
            }, 0);

            const invValue = window.Balance.inventory();

            const lowStock = products.filter(function(p) {
                const qty = parseFloat(p.qty) || 0;
                const min = parseFloat(p.min) || 5;
                return qty <= min && qty > 0;
            }).length;

            // ═══ المبيعات ═══
            const salesTotal = sales.reduce(function(s, x) {
                return s + (parseFloat(x.total) || 0);
            }, 0);

            // ═══ المشتريات ═══
            const purchasesTotal = purchases.reduce(function(s, x) {
                return s + (parseFloat(x.total) || 0);
            }, 0);

            // ═══ المصروفات ═══
            const expensesTotal = expenses.reduce(function(s, x) {
                return s + (parseFloat(x.amount) || 0);
            }, 0);

            // ═══ الخزائن ═══
            const treasuryTotal = window.Balance.totalCash();

            // ═══ الربح ═══
            const grossProfit = sales.reduce(function(s, x) {
                return s + (parseFloat(x.profit) || 0);
            }, 0);
            const netProfit = grossProfit - expensesTotal;

            // ═══ المديونيات ═══
            const customerDebt = customers.reduce(function(sum, c) {
                return sum + window.Balance.customer(c.name);
            }, 0);

            const supplierDebt = suppliers.reduce(function(sum, s) {
                return sum + window.Balance.supplier(s.name);
            }, 0);

            // ═══ تحديث العناصر ═══
            const set = function(id, val) {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            };

            set('dashProducts', products.length);
            set('dashInventory', Math.round(totalQty));
            set('dashInventoryValue', window.formatMoney(invValue));
            set('dashLowStock', lowStock);
            set('dashSalesCount', sales.length);
            set('dashSalesTotal', window.formatMoney(salesTotal));
            set('dashPurchasesTotal', window.formatMoney(purchasesTotal));
            set('dashExpensesTotal', window.formatMoney(expensesTotal));
            set('dashTreasury', window.formatMoney(treasuryTotal));
            set('dashProfit', window.formatMoney(netProfit));
            set('dashCustomerDebt', window.formatMoney(customerDebt));
            set('dashSupplierDebt', window.formatMoney(supplierDebt));

            // ═══ الألوان ═══
            const profitEl = document.getElementById('dashProfit');
            if (profitEl) {
                profitEl.style.color = netProfit < 0 ? '#E06060'
                    : netProfit > 0 ? '#2D8F5E'
                    : '#C9A94E';
            }

            const treasuryEl = document.getElementById('dashTreasury');
            if (treasuryEl) {
                treasuryEl.style.color = treasuryTotal < 0 ? '#E06060' : '#C9A94E';
            }

            // ═══ ملخص الأداء ═══
            window.updatePerformanceSummary();

            // ═══ آخر المبيعات ═══
            window.renderLastSales();

            return true;
        } catch (err) {
            console.error('❌ خطأ في تحديث لوحة التحكم:', err);
            return false;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: ملخص الأداء
    // ═══════════════════════════════════════════════════════════

    window.updatePerformanceSummary = function() {
        try {
            const sales = window.sales || [];

            // ═══ أفضل يوم مبيعات ═══
            const dailySales = {};
            sales.forEach(function(s) {
                const day = (s.date || '').split('T')[0];
                if (!day) return;
                dailySales[day] = (dailySales[day] || 0) + (parseFloat(s.total) || 0);
            });

            let bestDay = null;
            let bestAmount = 0;
            Object.keys(dailySales).forEach(function(day) {
                if (dailySales[day] > bestAmount) {
                    bestAmount = dailySales[day];
                    bestDay = day;
                }
            });

            const bestDayNameEl = document.getElementById('bestDayName');
            const bestDaySalesEl = document.getElementById('bestDaySales');

            if (bestDayNameEl && bestDaySalesEl) {
                if (bestDay && bestAmount > 0) {
                    bestDayNameEl.textContent = window.formatDate(bestDay);
                    bestDaySalesEl.textContent = window.formatMoney(bestAmount);
                } else {
                    bestDayNameEl.textContent = 'لا توجد بيانات';
                    bestDaySalesEl.textContent = '0.00';
                }
            }

            // ═══ متوسط الفاتورة ═══
            const totalSales = sales.reduce(function(s, x) {
                return s + (parseFloat(x.total) || 0);
            }, 0);
            const avg = sales.length > 0 ? totalSales / sales.length : 0;

            const avgEl = document.getElementById('avgInvoice');
            if (avgEl) avgEl.textContent = window.formatMoney(avg);

            // ═══ أفضل عميل ═══
            const customerStats = {};
            sales.forEach(function(s) {
                const name = s.customer || '';
                if (!name || name === 'عميل نقدي') return;
                customerStats[name] = (customerStats[name] || 0) + (parseFloat(s.total) || 0);
            });

            let bestCustomer = '';
            let bestCustomerAmount = 0;
            Object.keys(customerStats).forEach(function(name) {
                if (customerStats[name] > bestCustomerAmount) {
                    bestCustomerAmount = customerStats[name];
                    bestCustomer = name;
                }
            });

            const custNameEl = document.getElementById('bestCustomerName');
            const custTotalEl = document.getElementById('bestCustomerTotal');
            if (custNameEl && custTotalEl) {
                custNameEl.textContent = bestCustomer || 'لا يوجد';
                custTotalEl.textContent = window.formatMoney(bestCustomerAmount);
            }

            // ═══ أفضل منتج ═══
            const productStats = {};
            sales.forEach(function(s) {
                (s.items || []).forEach(function(it) {
                    if (!it.name) return;
                    productStats[it.name] = (productStats[it.name] || 0) + (parseFloat(it.qty) || 0);
                });
            });

            let bestProduct = '';
            let bestProductQty = 0;
            Object.keys(productStats).forEach(function(name) {
                if (productStats[name] > bestProductQty) {
                    bestProductQty = productStats[name];
                    bestProduct = name;
                }
            });

            const prodNameEl = document.getElementById('bestProductName');
            const prodQtyEl = document.getElementById('bestProductQty');
            if (prodNameEl && prodQtyEl) {
                prodNameEl.textContent = bestProduct || 'لا يوجد';
                prodQtyEl.textContent = Math.round(bestProductQty);
            }
        } catch (e) {
            console.error('❌ خطأ في ملخص الأداء:', e.message);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: آخر المبيعات
    // ═══════════════════════════════════════════════════════════

    window.renderLastSales = function() {
        const container = document.getElementById('dashLastSales');
        if (!container) return;

        const sales = window.sales || [];

        if (sales.length === 0) {
            container.innerHTML = '<div class="empty-state">' +
                '<i class="fas fa-receipt"></i>' +
                '<span>لا توجد مبيعات بعد</span>' +
            '</div>';
            return;
        }

        const sorted = sales.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        });

        const recent = sorted.slice(0, 5);

        let html = '<div class="last-sales-list">';

        recent.forEach(function(sale, index) {
            const total = parseFloat(sale.total) || 0;
            const date = sale.date ? new Date(sale.date) : new Date();
            const dateStr = String(date.getDate()).padStart(2, '0') + '/' +
                           String(date.getMonth() + 1).padStart(2, '0');
            const timeStr = sale.time || '';
            const invNum = sale.number || '#' + (index + 1);
            const customer = sale.customer || 'عميل نقدي';
            const payIcon = window.getPaymentIcon(sale.paymentMethod);

            html += '<div class="last-sale-item" onclick="showInvoiceDetails(\'' + sale.id + '\')" ' +
                'style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:8px;border-right:4px solid #C9A94E;cursor:pointer;display:flex;gap:10px;align-items:center;">' +
                '<div style="font-size:24px;flex-shrink:0;">' + payIcon + '</div>' +
                '<div style="flex:1;min-width:0;">' +
                    '<div style="color:#F5E6C8;font-weight:800;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
                        window.escapeHtml(customer) +
                    '</div>' +
                    '<div style="color:#A89070;font-size:10px;display:flex;gap:10px;flex-wrap:wrap;margin-top:2px;">' +
                        '<span>🧾 #' + invNum + '</span>' +
                        '<span>📅 ' + dateStr + '</span>' +
                        '<span>🕐 ' + timeStr + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="text-align:left;flex-shrink:0;">' +
                    '<div style="color:#2D8F5E;font-weight:900;font-size:15px;font-family:Courier New,monospace;">' +
                        window.formatMoney(total) +
                    '</div>' +
                    '<div style="color:#5D5D5D;font-size:10px;">ج.م</div>' +
                '</div>' +
            '</div>';
        });

        html += '</div>';
        container.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    // أي تغيير في البيانات يعيد تحديث اللوحة
    const refreshEvents = [
        'data:sales:changed',
        'data:purchases:changed',
        'data:products:changed',
        'data:expenses:changed',
        'data:treasury:changed',
        'data:cashBoxes:changed',
        'data:customers:changed',
        'data:suppliers:changed'
    ];

    refreshEvents.forEach(function(evt) {
        window.EventBus.on(evt, function() {
            const activePage = document.querySelector('.page-container.active');
            if (activePage && activePage.id === 'page-dashboard') {
                setTimeout(window.updateDashboard, 100);
            }
        });
    });

    window.__dashboardLoaded = true;
    console.log('✅ dashboard.js v18.0 جاهز');

})();
