// ============================================================
// الميزان 17.0 - dashboard.js
// لوحة التحكم الموحّدة - بدون تعارضات
// يدمج: accounting-engine.js + auto-sync.js + last-sales-fix.js + final-touches.js
// ============================================================

console.log('📊 تحميل dashboard.js v17.0');

// ═══════════════════════════════════════════════════════════
// أدوات مساعدة محلية
// ═══════════════════════════════════════════════════════════
const DashboardUtils = {
    num: function(v, d) {
        const n = parseFloat(v);
        return isFinite(n) && !isNaN(n) ? n : (d || 0);
    },
    round: function(v) {
        return Math.round((this.num(v) + Number.EPSILON) * 100) / 100;
    },
    format: function(v) {
        return this.round(v).toFixed(2);
    }
};

// ═══════════════════════════════════════════════════════════
// حساب رصيد خزنة (موحّد)
// ═══════════════════════════════════════════════════════════
window.getCashBoxBalance = function(boxId) {
    if (!window.cashBoxes || !boxId) return 0;
    
    const box = window.cashBoxes.find(function(b) { return b.id == boxId; });
    if (!box) return 0;
    
    let balance = DashboardUtils.num(box.openingBalance, 0);
    
    (window.treasury || []).forEach(function(t) {
        if (t.cashBoxId == boxId) {
            const amount = DashboardUtils.num(t.amount, 0);
            if (t.type === 'deposit') {
                balance += amount;
            } else if (t.type === 'withdraw') {
                balance -= amount;
            }
        }
    });
    
    return DashboardUtils.round(balance);
};

window.getTotalCashBalance = function() {
    if (!window.cashBoxes) return 0;
    return DashboardUtils.round(
        window.cashBoxes.reduce(function(sum, box) {
            return sum + window.getCashBoxBalance(box.id);
        }, 0)
    );
};

// ═══════════════════════════════════════════════════════════
// حساب رصيد عميل (موحّد)
// ═══════════════════════════════════════════════════════════
window.getCustomerBalance = function(name) {
    if (!name || name === 'عميل نقدي') return 0;
    if (!window.sales) return 0;
    
    return DashboardUtils.round(
        window.sales
            .filter(function(s) {
                return s.customer === name && s.paymentMethod === 'credit';
            })
            .reduce(function(sum, s) {
                const remaining = s.remainingAmount !== undefined 
                    ? s.remainingAmount 
                    : s.total;
                return sum + DashboardUtils.num(remaining, 0);
            }, 0)
    );
};

// ═══════════════════════════════════════════════════════════
// حساب رصيد مورد (موحّد)
// ═══════════════════════════════════════════════════════════
window.getSupplierBalance = function(name) {
    if (!name) return 0;
    if (!window.purchases) return 0;
    
    return DashboardUtils.round(
        window.purchases
            .filter(function(p) {
                return p.supplierName === name && p.payment === 'credit';
            })
            .reduce(function(sum, p) {
                const remaining = p.remainingAmount !== undefined 
                    ? p.remainingAmount 
                    : p.total;
                return sum + DashboardUtils.num(remaining, 0);
            }, 0)
    );
};

// ═══════════════════════════════════════════════════════════
// حساب قيمة المخزون
// ═══════════════════════════════════════════════════════════
window.calculateInventoryValue = function() {
    if (!window.products) return 0;
    return DashboardUtils.round(
        window.products.reduce(function(sum, p) {
            const qty = DashboardUtils.num(p.qty, 0);
            const buy = DashboardUtils.num(p.buy, 0);
            return sum + (qty * buy);
        }, 0)
    );
};

// ═══════════════════════════════════════════════════════════
// الدالة الرئيسية: updateDashboard
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
            return s + DashboardUtils.num(p.qty, 0);
        }, 0);
        
        const invValue = window.calculateInventoryValue();
        
        const lowStock = products.filter(function(p) {
            const qty = DashboardUtils.num(p.qty, 0);
            const min = DashboardUtils.num(p.min, 5);
            return qty <= min && qty > 0;
        }).length;

        // ═══ المبيعات ═══
        const salesTotal = sales.reduce(function(s, x) {
            return s + DashboardUtils.num(x.total, 0);
        }, 0);

        // ═══ المشتريات ═══
        const purchasesTotal = purchases.reduce(function(s, x) {
            return s + DashboardUtils.num(x.total, 0);
        }, 0);

        // ═══ المصروفات ═══
        const expensesTotal = expenses.reduce(function(s, x) {
            return s + DashboardUtils.num(x.amount, 0);
        }, 0);

        // ═══ الخزائن ═══
        const treasuryTotal = window.getTotalCashBalance();

        // ═══ الربح ═══
        const grossProfit = sales.reduce(function(s, x) {
            return s + DashboardUtils.num(x.profit, 0);
        }, 0);
        const netProfit = grossProfit - expensesTotal;

        // ═══ المديونيات ═══
        const customerDebt = customers.reduce(function(sum, c) {
            return sum + window.getCustomerBalance(c.name);
        }, 0);

        const supplierDebt = suppliers.reduce(function(sum, s) {
            return sum + window.getSupplierBalance(s.name);
        }, 0);

        // ═══ تحديث العناصر ═══
        const set = function(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        set('dashProducts', products.length);
        set('dashInventory', Math.round(totalQty));
        set('dashInventoryValue', DashboardUtils.format(invValue));
        set('dashLowStock', lowStock);
        set('dashSalesCount', sales.length);
        set('dashSalesTotal', DashboardUtils.format(salesTotal));
        set('dashPurchasesTotal', DashboardUtils.format(purchasesTotal));
        set('dashExpensesTotal', DashboardUtils.format(expensesTotal));
        set('dashTreasury', DashboardUtils.format(treasuryTotal));
        set('dashProfit', DashboardUtils.format(netProfit));
        set('dashCustomerDebt', DashboardUtils.format(customerDebt));
        set('dashSupplierDebt', DashboardUtils.format(supplierDebt));

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
// ملخص الأداء
// ═══════════════════════════════════════════════════════════
window.updatePerformanceSummary = function() {
    try {
        const sales = window.sales || [];
        const customers = window.customers || [];
        const products = window.products || [];

        // ═══ أفضل يوم مبيعات ═══
        const dailySales = {};
        sales.forEach(function(s) {
            const day = (s.date || '').split('T')[0];
            if (!day) return;
            dailySales[day] = (dailySales[day] || 0) + DashboardUtils.num(s.total, 0);
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
                const d = new Date(bestDay);
                const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
                bestDayNameEl.textContent = dayNames[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
                bestDaySalesEl.textContent = DashboardUtils.format(bestAmount);
            } else {
                bestDayNameEl.textContent = 'لا توجد بيانات';
                bestDaySalesEl.textContent = '0.00';
            }
        }

        // ═══ متوسط الفاتورة ═══
        const totalSales = sales.reduce(function(s, x) {
            return s + DashboardUtils.num(x.total, 0);
        }, 0);
        const avg = sales.length > 0 ? totalSales / sales.length : 0;

        const avgEl = document.getElementById('avgInvoice');
        if (avgEl) avgEl.textContent = DashboardUtils.format(avg);

        // ═══ أفضل عميل ═══
        const customerStats = {};
        sales.forEach(function(s) {
            const name = s.customer || '';
            if (!name || name === 'عميل نقدي') return;
            customerStats[name] = (customerStats[name] || 0) + DashboardUtils.num(s.total, 0);
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
            custTotalEl.textContent = DashboardUtils.format(bestCustomerAmount);
        }

        // ═══ أفضل منتج ═══
        const productStats = {};
        sales.forEach(function(s) {
            (s.items || []).forEach(function(it) {
                if (!it.name) return;
                productStats[it.name] = (productStats[it.name] || 0) + DashboardUtils.num(it.qty, 0);
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
// عرض آخر المبيعات
// ═══════════════════════════════════════════════════════════
window.renderLastSales = function() {
    const container = document.getElementById('dashLastSales');
    if (!container) return;

    const sales = window.sales || [];

    if (sales.length === 0) {
        container.innerHTML = 
            '<div class="empty-state">' +
                '<i class="fas fa-receipt"></i>' +
                '<span>لا توجد مبيعات بعد</span>' +
            '</div>';
        return;
    }

    // ترتيب حسب الأحدث
    const sorted = sales.slice().sort(function(a, b) {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
    });

    const recent = sorted.slice(0, 5);

    const payIcons = {
        cash: '💵', credit: '📝', wallet: '📱',
        visa: '💳', bank: '🏦', installment: '📅'
    };

    const escape = function(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    let html = '<div class="last-sales-list">';

    recent.forEach(function(sale, index) {
        const total = DashboardUtils.num(sale.total, 0);
        const date = sale.date ? new Date(sale.date) : new Date();
        const dateStr = String(date.getDate()).padStart(2, '0') + '/' + 
                       String(date.getMonth() + 1).padStart(2, '0');
        const timeStr = String(date.getHours()).padStart(2, '0') + ':' + 
                       String(date.getMinutes()).padStart(2, '0');
        const invNum = sale.number || sale.id || '#' + (index + 1);
        const customer = sale.customer || 'عميل نقدي';
        const payIcon = payIcons[sale.paymentMethod] || '💵';

        html += '<div class="last-sale-item" onclick="window.showSaleDetails(' + sale.id + ')">' +
            '<div class="last-sale-icon">' + payIcon + '</div>' +
            '<div class="last-sale-info">' +
                '<div class="last-sale-customer">' + escape(customer) + '</div>' +
                '<div class="last-sale-meta">' +
                    '<span>🧾 #' + escape(String(invNum)) + '</span>' +
                    '<span>📅 ' + dateStr + '</span>' +
                    '<span>🕐 ' + timeStr + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="last-sale-amount">' +
                '<div class="last-sale-total">' + DashboardUtils.format(total) + '</div>' +
                '<div class="last-sale-currency">ج.م</div>' +
            '</div>' +
        '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// عرض تفاصيل فاتورة
// ═══════════════════════════════════════════════════════════
window.showSaleDetails = function(saleId) {
    const sales = window.sales || [];
    const sale = sales.find(function(s) {
        return String(s.id) === String(saleId) || 
               String(s.number) === String(saleId);
    });

    if (!sale) {
        if (typeof window.showToast === 'function') {
            window.showToast('⚠️ الفاتورة غير موجودة', 'error');
        }
        return;
    }

    const escape = function(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    const date = sale.date ? new Date(sale.date) : new Date();
    const dateStr = String(date.getDate()).padStart(2, '0') + '/' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '/' + 
                   date.getFullYear();
    const timeStr = String(date.getHours()).padStart(2, '0') + ':' + 
                   String(date.getMinutes()).padStart(2, '0');

    const items = sale.items || [];
    let itemsHtml = '';

    items.forEach(function(item, i) {
        itemsHtml += '<div class="sale-detail-item">' +
            '<div class="sale-detail-num">' + (i + 1) + '</div>' +
            '<div class="sale-detail-name">' + escape(item.name) + '</div>' +
            '<div class="sale-detail-qty">' + DashboardUtils.num(item.qty) + ' × ' + 
                DashboardUtils.format(item.price) + '</div>' +
            '<div class="sale-detail-total">' + 
                DashboardUtils.format(DashboardUtils.num(item.qty) * DashboardUtils.num(item.price)) + 
            '</div>' +
        '</div>';
    });

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>🧾 تفاصيل الفاتورة</h3>' +
        
        '<div class="sale-detail-header">' +
            '<div><strong>رقم الفاتورة:</strong> #' + escape(String(sale.number || sale.id)) + '</div>' +
            '<div><strong>التاريخ:</strong> ' + dateStr + ' - ' + timeStr + '</div>' +
            '<div><strong>العميل:</strong> ' + escape(sale.customer || 'عميل نقدي') + '</div>' +
            (sale.seller ? '<div><strong>البائع:</strong> ' + escape(sale.seller) + '</div>' : '') +
            (sale.warehouseName ? '<div><strong>المستودع:</strong> ' + escape(sale.warehouseName) + '</div>' : '') +
        '</div>';

    if (items.length > 0) {
        html += '<div class="sale-detail-items">' +
            '<div class="sale-detail-items-header">' +
                '<span>#</span>' +
                '<span>الصنف</span>' +
                '<span>الكمية × السعر</span>' +
                '<span>الإجمالي</span>' +
            '</div>' +
            itemsHtml +
        '</div>';
    }

    html += '<div class="sale-detail-totals">' +
        '<div><span>المجموع:</span><strong>' + 
            DashboardUtils.format(sale.subtotal || sale.total) + 
        '</strong></div>';

    if (sale.vat > 0) {
        html += '<div><span>الضريبة:</span><strong>' + 
            DashboardUtils.format(sale.vat) + '</strong></div>';
    }
    if (sale.discount > 0) {
        html += '<div><span>الخصم:</span><strong style="color:#E06060;">-' + 
            DashboardUtils.format(sale.discount) + '</strong></div>';
    }

    html += '<div class="sale-detail-grand"><span>الإجمالي:</span><strong>' + 
        DashboardUtils.format(sale.total) + ' ج.م</strong></div>' +
    '</div>' +
    
    '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">' +
        '<i class="fas fa-times"></i> إغلاق' +
    '</button>';

    if (typeof window.openModal === 'function') window.openModal(html);
};

// ═══════════════════════════════════════════════════════════
// ربط التنقل
// ═══════════════════════════════════════════════════════════
(function() {
    // لما يفتح لوحة التحكم، نحدّث
    const originalNavigateTo = window.navigateTo;
    if (typeof originalNavigateTo === 'function') {
        window.navigateTo = function(page) {
            originalNavigateTo(page);
            if (page === 'dashboard') {
                setTimeout(function() {
                    if (typeof window.updateDashboard === 'function') {
                        window.updateDashboard();
                    }
                }, 100);
            }
        };
    }
})();

// ═══════════════════════════════════════════════════════════
// علم التحميل
// ═══════════════════════════════════════════════════════════
window.__dashboardLoaded = true;

console.log('✅ dashboard.js v17.0 جاهز');
