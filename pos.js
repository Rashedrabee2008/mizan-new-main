// ============================================================
// الميزان 17.0 - pos.js
// الكاشير + المشتريات + المرتجعات + الكوبونات + واتساب
// يدمج: app.js (POS) + loyalty.js + whatsapp.js
// ============================================================

console.log('🛒 تحميل pos.js v17.0');

// ═══════════════════════════════════════════════════════════
// إعدادات الولاء
// ═══════════════════════════════════════════════════════════
window.LOYALTY_CONFIG = {
    POINTS_PER_100: 1,
    POINT_VALUE: 0.1,
    MIN_REDEEM_POINTS: 50,
    LEVELS: [
        { name: 'عادي',    min: 0,    icon: '🥉', color: '#A89070', discount: 0 },
        { name: 'فضي',     min: 500,  icon: '🥈', color: '#A8A8A8', discount: 2 },
        { name: 'ذهبي',    min: 2000, icon: '🥇', color: '#C9A94E', discount: 5 },
        { name: 'بلاتيني', min: 5000, icon: '💎', color: '#4A8AB5', discount: 10 }
    ]
};

// ═══════════════════════════════════════════════════════════
// الجزء 1: الكاشير
// ═══════════════════════════════════════════════════════════

window.populateSaleProducts = function() {
    const sel = document.getElementById('saleProduct');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر منتج...</option>';
    (window.products || []).forEach(function(p) {
        sel.innerHTML += '<option value="' + p.id + '">' + p.name + ' (متاح: ' + p.qty + ')</option>';
    });
    sel.value = cv;
};

window.populateSaleCustomers = function() {
    const sel = document.getElementById('saleCustomer');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">عميل نقدي</option>';
    (window.customers || []).forEach(function(c) {
        sel.innerHTML += '<option value="' + c.name + '">' + c.name + '</option>';
    });
    sel.value = cv;
};

window.populateCashBoxDropdowns = function() {
    const ids = ['saleCashBox', 'purCashBox', 'expCashBox', 'manualCashBox', 'collectCashBox', 'payCashBox', 'retCashBox', 'salCashBox'];
    const boxes = (window.cashBoxes || []).filter(function(b) { return b.active !== false; });
    const defaultBox = boxes.find(function(b) { return b.isDefault; }) || boxes[0];

    ids.forEach(function(id) {
        const sel = document.getElementById(id);
        if (!sel) return;
        const cv = sel.value;
        let html = '<option value="">اختر الخزنة...</option>';
        boxes.forEach(function(box) {
            html += '<option value="' + box.id + '">' + (box.icon || '') + ' ' + box.name + (box.isDefault ? ' ⭐' : '') + '</option>';
        });
        sel.innerHTML = html;
        if (cv) {
            const exists = Array.from(sel.options).some(function(opt) { return opt.value == cv; });
            if (exists) sel.value = cv;
        } else if (defaultBox) {
            const exists = Array.from(sel.options).some(function(opt) { return opt.value == defaultBox.id; });
            if (exists) sel.value = defaultBox.id;
        }
    });
};

window.updateSalePrice = function() {
    const id = document.getElementById('saleProduct') ? document.getElementById('saleProduct').value : '';
    const priceInput = document.getElementById('salePrice');
    if (!id) { if (priceInput) priceInput.value = ''; return; }
    const product = (window.products || []).find(function(pr) { return pr.id == id; });
    if (product && priceInput) priceInput.value = product.sell;
};

window.addSaleItem = function() {
    const productSelect = document.getElementById('saleProduct');
    const qtyInput = document.getElementById('saleQty');
    const priceInput = document.getElementById('salePrice');
    const id = productSelect ? productSelect.value : '';
    let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

    if (!id) { window.showToast('⚠️ اختر منتج', 'error'); return; }
    const p = (window.products || []).find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (price <= 0) price = p.sell;
    if (qty <= 0) qty = 1;

    const saleWarehouseId = document.getElementById('saleWarehouse') ? document.getElementById('saleWarehouse').value : '';
    if (saleWarehouseId) {
        const whQty = (p.warehouseStock && p.warehouseStock[saleWarehouseId]) || 0;
        const existingItem = window.currentSaleItems.find(function(i) { return i.productId == id; });
        const totalRequested = qty + (existingItem ? existingItem.qty : 0);
        
        if (totalRequested > whQty) {
            const warehouse = (window.warehouses || []).find(function(w) { return w.id == saleWarehouseId; });
            window.showToast('⚠️ المتاح في ' + (warehouse ? warehouse.name : 'المستودع') + ': ' + whQty, 'error');
            return;
        }
    }

    const ex = window.currentSaleItems.find(function(i) { return i.productId == id; });
    if (ex) {
        ex.qty += qty;
        ex.price = price;
        ex.total = ex.qty * ex.price;
    } else {
        window.currentSaleItems.push({ 
            productId: p.id, name: p.name, qty: qty, price: price, 
            costPrice: p.buy, total: qty * price 
        });
    }

    if (qtyInput) qtyInput.value = 1;
    if (priceInput) priceInput.value = '';
    if (productSelect) productSelect.value = '';

    window.renderCashier();
    window.updateSaleTotals();
    window.showToast('✅ تم إضافة ' + p.name, 'success');
};

window.removeSaleItem = function(i) {
    window.currentSaleItems.splice(i, 1);
    window.renderCashier();
    window.updateSaleTotals();
};

window.renderCashier = function() {
    const c = document.getElementById('saleItemsContainer');
    const tb = document.getElementById('saleTotalBox');
    if (!c) return;
    
    const badge = document.getElementById('itemsCountBadge');
    if (badge) badge.textContent = window.currentSaleItems.length;

    if (window.currentSaleItems.length === 0) {
        c.innerHTML = '<div class="empty-items"><i class="fas fa-shopping-cart"></i><span>لا توجد أصناف</span><small>أضف صنف من الأعلى</small></div>';
        if (tb) tb.style.display = 'none';
        return;
    }

    let html = '<div class="items-header-row"><span>ID</span><span>اسم الصنف</span><span>الوحدة</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span></div>';
    window.currentSaleItems.forEach(function(it, i) {
        html += '<div class="item-row">' +
            '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
            '<span class="item-name">' + it.name + '</span>' +
            '<span class="item-unit">قطعة</span>' +
            '<span class="item-qty">' + it.qty + '</span>' +
            '<span class="item-price">' + window.formatMoney(it.price) + '</span>' +
            '<span class="item-total">' + window.formatMoney(it.qty * it.price) + '</span>' +
            '<button class="item-delete" onclick="removeSaleItem(' + i + ')"><i class="fas fa-times"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
    if (tb) tb.style.display = 'block';
};

window.updateSaleTotals = function() {
    const subtotal = window.currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
    const totalQty = window.currentSaleItems.reduce(function(s, i) { return s + i.qty; }, 0);
    const invoiceType = window.getRadioValue('saleInvoiceType', 'simple');
    const isTax = invoiceType === 'tax';
    const vat = isTax ? (subtotal * (window.vatSettings.defaultVAT / 100)) : 0;

    const discountValue = parseFloat(document.getElementById('saleDiscount') ? document.getElementById('saleDiscount').value : 0) || 0;
    const discountType = document.getElementById('saleDiscountType') ? document.getElementById('saleDiscountType').value : 'fixed';
    let discount = 0;
    if (discountType === 'percent') {
        discount = (subtotal + vat) * (discountValue / 100);
    } else {
        discount = discountValue;
    }

    const levelDiscountValue = parseFloat(document.getElementById('saleLevelDiscount') ? document.getElementById('saleLevelDiscount').value : 0) || 0;
    const levelDiscountType = document.getElementById('saleLevelDiscountType') ? document.getElementById('saleLevelDiscountType').value : 'fixed';
    let levelDiscount = 0;
    if (levelDiscountType === 'percent') {
        levelDiscount = (subtotal + vat) * (levelDiscountValue / 100);
    } else {
        levelDiscount = levelDiscountValue;
    }

    let couponDiscount = 0;
    if (window.currentCoupon && typeof window.validateCoupon === 'function') {
        const validation = window.validateCoupon(window.currentCoupon, subtotal);
        if (validation.valid) couponDiscount = validation.discount;
    }

    let pointsDiscount = 0;
    if (window.currentPointsToRedeem > 0) {
        pointsDiscount = window.currentPointsToRedeem * window.LOYALTY_CONFIG.POINT_VALUE;
    }

    const grandTotal = Math.max(0, subtotal + vat - discount - levelDiscount - couponDiscount - pointsDiscount);

    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('statItemsCount', window.currentSaleItems.length);
    set('statTotalQty', totalQty);
    set('saleSubtotal', window.formatMoney(subtotal));
    set('saleVAT', window.formatMoney(vat));
    set('saleTotal', window.formatMoney(grandTotal) + ' ج.م');
};

window.updateInvoiceHeader = function() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');

    const dateEl = document.getElementById('invDateDisplay');
    const timeEl = document.getElementById('invTimeDisplay');
    const numEl = document.getElementById('invNumberDisplay');
    
    if (dateEl) dateEl.value = day + '/' + month + '/' + year;
    if (timeEl) timeEl.value = hoursStr + ':' + minutes + ' ' + ampm;
    if (numEl) numEl.textContent = '#' + ((window.sales || []).length + 1);
};

window.saveSale = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    if (window.currentSaleItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }

    const saleWarehouseId = document.getElementById('saleWarehouse') ? document.getElementById('saleWarehouse').value : '';
    const saleWarehouse = (window.warehouses || []).find(function(w) { return w.id == saleWarehouseId; });
    
    if (!saleWarehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }

    for (let i = 0; i < window.currentSaleItems.length; i++) {
        const it = window.currentSaleItems[i];
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (!p) { window.showToast('⚠️ المنتج غير موجود', 'error'); return; }
        
        const whQty = (p.warehouseStock && p.warehouseStock[saleWarehouseId]) || 0;
        if (whQty < it.qty) {
            window.showToast('⚠️ الكمية غير كافية: ' + p.name + ' (متاح: ' + whQty + ')', 'error');
            return;
        }
    }

    const customer = document.getElementById('saleCustomer') ? document.getElementById('saleCustomer').value : 'عميل نقدي';
    const seller = document.getElementById('saleSeller') ? document.getElementById('saleSeller').value : '';
    const delivery = document.getElementById('saleDelivery') ? document.getElementById('saleDelivery').value : '';
    const shipping = document.getElementById('saleShipping') ? document.getElementById('saleShipping').value.trim() : '';
    const paymentMethod = window.getRadioValue('salePaymentMethod', 'cash');
    const invoiceType = window.getRadioValue('saleInvoiceType', 'simple');
    const isTax = invoiceType === 'tax';
    const cashBoxId = (document.getElementById('saleCashBox') ? document.getElementById('saleCashBox').value : '') 
        || (window.cashBoxes.find(function(b) { return b.isDefault; }) || {}).id;
    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });

    const subtotal = window.currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
    const vat = isTax ? (subtotal * (window.vatSettings.defaultVAT / 100)) : 0;

    const discountValue = parseFloat(document.getElementById('saleDiscount') ? document.getElementById('saleDiscount').value : 0) || 0;
    const discountType = document.getElementById('saleDiscountType') ? document.getElementById('saleDiscountType').value : 'fixed';
    let discount = discountType === 'percent' ? (subtotal + vat) * (discountValue / 100) : discountValue;

    const levelDiscountValue = parseFloat(document.getElementById('saleLevelDiscount') ? document.getElementById('saleLevelDiscount').value : 0) || 0;
    const levelDiscountType = document.getElementById('saleLevelDiscountType') ? document.getElementById('saleLevelDiscountType').value : 'fixed';
    let levelDiscount = levelDiscountType === 'percent' ? (subtotal + vat) * (levelDiscountValue / 100) : levelDiscountValue;

    let couponDiscount = 0;
    let couponCode = null;
    if (window.currentCoupon && typeof window.validateCoupon === 'function') {
        const validation = window.validateCoupon(window.currentCoupon, subtotal);
        if (validation.valid) {
            couponDiscount = validation.discount;
            couponCode = window.currentCoupon.code;
        }
    }

    let pointsDiscount = 0;
    let redeemedPoints = 0;
    if (window.currentPointsToRedeem > 0) {
        pointsDiscount = window.currentPointsToRedeem * window.LOYALTY_CONFIG.POINT_VALUE;
        redeemedPoints = window.currentPointsToRedeem;
    }

    const total = Math.max(0, subtotal + vat - discount - levelDiscount - couponDiscount - pointsDiscount);
    const today = window.getTodayDate();
    let cogsTotal = 0;

    window.currentSaleItems.forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) { 
            it.costPrice = p.buy; 
            cogsTotal += p.buy * it.qty; 
            p.qty -= it.qty;
            
            if (!p.warehouseStock) p.warehouseStock = {};
            p.warehouseStock[saleWarehouseId] = Math.max(0, (p.warehouseStock[saleWarehouseId] || 0) - it.qty);
        }
    });

    const isCash = ['cash', 'wallet', 'visa', 'bank'].indexOf(paymentMethod) > -1;
    const inv = {
        id: Date.now(), number: (window.sales || []).length + 1,
        warehouseId: saleWarehouseId,
        warehouseName: saleWarehouse ? saleWarehouse.name : '',
        customer: customer,
        customerId: ((window.customers || []).find(function(c) { return c.name === customer; }) || {}).id || null,
        seller: seller, delivery: delivery, shipping: shipping,
        paymentMethod: paymentMethod, invoiceType: invoiceType,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        subtotal: subtotal, vat: vat,
        discount: discount, levelDiscount: levelDiscount,
        couponDiscount: couponDiscount, couponCode: couponCode,
        redeemedPoints: redeemedPoints, pointsDiscount: pointsDiscount,
        total: total,
        cogs: cogsTotal, 
        profit: subtotal - cogsTotal - discount - levelDiscount - couponDiscount - pointsDiscount,
        paidAmount: isCash ? total : 0,
        remainingAmount: isCash ? 0 : total,
        status: isCash ? 'paid' : 'unpaid',
        items: JSON.parse(JSON.stringify(window.currentSaleItems)),
        date: today, time: window.getNowTime(),
        soldBy: window.currentUser ? window.currentUser.name : ''
    };
    
    if (!window.sales) window.sales = [];
    window.sales.push(inv);

    if (window.currentCoupon && typeof window.useCoupon === 'function') {
        window.useCoupon(window.currentCoupon.id);
    }

    if (isCash && cashBoxId) {
        window.treasury.push({
            id: Date.now() + 1, type: 'deposit', amount: total,
            note: 'فاتورة بيع #' + inv.number + ' - ' + customer,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'sale', refId: inv.id,
            date: today, time: window.getNowTime()
        });
    }

    window.setData('sales', window.sales);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);
    window.setData('coupons', window.coupons);

    // قيود محاسبية
    try {
        if (typeof window.getAccountByCode === 'function' && typeof window.createJournalEntry === 'function') {
            const salesAccount = window.getAccountByCode('4100');
            const cashAccount = window.getAccountByCode('1110');
            const customerAccount = window.getAccountByCode('1200');
            const cogsAccount = window.getAccountByCode('5100');
            const inventoryAccount = window.getAccountByCode('1300');

            if (salesAccount) {
                if (isCash && cashAccount) {
                    window.createJournalEntry(today, 'فاتورة بيع نقدية #' + inv.number,
                        [
                            { accountId: cashAccount.id, debit: total, credit: 0 },
                            { accountId: salesAccount.id, debit: 0, credit: total }
                        ], 'INV-' + inv.number);
                } else if (customerAccount) {
                    window.createJournalEntry(today, 'فاتورة بيع آجل #' + inv.number,
                        [
                            { accountId: customerAccount.id, debit: total, credit: 0 },
                            { accountId: salesAccount.id, debit: 0, credit: total }
                        ], 'INV-' + inv.number);
                }

                if (cogsTotal > 0 && cogsAccount && inventoryAccount) {
                    window.createJournalEntry(today, 'تكلفة مبيعات #' + inv.number,
                        [
                            { accountId: cogsAccount.id, debit: cogsTotal, credit: 0 },
                            { accountId: inventoryAccount.id, debit: 0, credit: cogsTotal }
                        ], 'INV-' + inv.number + '-COGS');
                }
            }
        }
    } catch (e) {}

    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    // إعادة تعيين
    window.currentSaleItems = [];
    window.currentCoupon = null;
    window.currentPointsToRedeem = 0;
    
    const resetEls = ['saleCustomer', 'saleDelivery', 'saleShipping', 'saleCouponCode', 'redeemPointsInput'];
    resetEls.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['saleDiscount', 'saleLevelDiscount'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '0';
    });

    window.setRadioValue('salePaymentMethod', 'cash');
    window.setRadioValue('saleInvoiceType', 'simple');

    window.populateWarehouseField();
    window.renderCashier();
    window.updateSaleTotals();
    window.populateSaleProducts();
    window.updateInvoiceHeader();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    if (typeof window.renderCashBoxes === 'function') window.renderCashBoxes();

    window.showToast('✅ فاتورة #' + inv.number + ' - ' + window.formatMoney(total), 'success');
};

window.clearSale = function() {
    if (window.currentSaleItems.length === 0) return;
    if (!confirm('⚠️ إلغاء الفاتورة؟')) return;
    window.currentSaleItems = [];
    window.currentCoupon = null;
    window.currentPointsToRedeem = 0;
    window.renderCashier();
    window.updateSaleTotals();
    window.showToast('🗑️ تم الإلغاء', 'info');
};

// ═══════════════════════════════════════════════════════════
// الجزء 2: المشتريات
// ═══════════════════════════════════════════════════════════

window.populatePurProducts = function() {
    const sel = document.getElementById('purProduct');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر منتج...</option>';
    (window.products || []).forEach(function(p) {
        sel.innerHTML += '<option value="' + p.id + '">' + p.name + ' (شراء: ' + window.formatMoney(p.buy) + ')</option>';
    });
    sel.value = cv;
};

window.populatePurSuppliers = function() {
    const sel = document.getElementById('purSupplier');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر مورد...</option>';
    (window.suppliers || []).forEach(function(s) {
        sel.innerHTML += '<option value="' + s.name + '">' + s.name + '</option>';
    });
    sel.value = cv;
};

window.updatePurPrice = function() {
    const id = document.getElementById('purProduct') ? document.getElementById('purProduct').value : '';
    const priceInput = document.getElementById('purPrice');
    if (!id) { if (priceInput) priceInput.value = ''; return; }
    const product = (window.products || []).find(function(pr) { return pr.id == id; });
    if (product && priceInput) priceInput.value = product.buy;
};

window.addPurItem = function() {
    const productSelect = document.getElementById('purProduct');
    const qtyInput = document.getElementById('purQty');
    const priceInput = document.getElementById('purPrice');
    const id = productSelect ? productSelect.value : '';
    let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

    if (!id) { window.showToast('⚠️ اختر منتج', 'error'); return; }
    const p = (window.products || []).find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (price <= 0) price = p.buy;
    if (qty <= 0) qty = 1;

    const ex = window.currentPurItems.find(function(i) { return i.productId == id; });
    if (ex) {
        ex.qty += qty;
        ex.price = price;
        ex.total = ex.qty * ex.price;
    } else {
        window.currentPurItems.push({ productId: p.id, name: p.name, qty: qty, price: price, total: qty * price });
    }

    if (qtyInput) qtyInput.value = 1;
    if (priceInput) priceInput.value = '';
    if (productSelect) productSelect.value = '';

    window.renderPurItems();
    window.updatePurTotals();
    window.showToast('✅ تم الإضافة', 'success');
};

window.removePurItem = function(i) {
    window.currentPurItems.splice(i, 1);
    window.renderPurItems();
    window.updatePurTotals();
};

window.renderPurItems = function() {
    const c = document.getElementById('purItemsContainer');
    const tb = document.getElementById('purTotalBox');
    if (!c) return;

    if (window.currentPurItems.length === 0) {
        c.innerHTML = '<div class="empty-items"><i class="fas fa-shopping-cart"></i><span>لا توجد أصناف</span></div>';
        if (tb) tb.style.display = 'none';
        return;
    }

    let html = '<div class="items-header-row"><span>ID</span><span>اسم الصنف</span><span>الوحدة</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span></div>';
    window.currentPurItems.forEach(function(it, i) {
        html += '<div class="item-row">' +
            '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
            '<span class="item-name">' + it.name + '</span>' +
            '<span class="item-unit">قطعة</span>' +
            '<span class="item-qty">' + it.qty + '</span>' +
            '<span class="item-price">' + window.formatMoney(it.price) + '</span>' +
            '<span class="item-total" style="color:#E06060;">' + window.formatMoney(it.qty * it.price) + '</span>' +
            '<button class="item-delete" onclick="removePurItem(' + i + ')"><i class="fas fa-times"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
    if (tb) tb.style.display = 'block';
};

window.updatePurTotals = function() {
    const subtotal = window.currentPurItems.reduce(function(s, i) { return s + i.total; }, 0);
    const totalQty = window.currentPurItems.reduce(function(s, i) { return s + i.qty; }, 0);
    
    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    
    set('purStatItemsCount', window.currentPurItems.length);
    set('purStatTotalQty', totalQty);
    set('purSubtotal', window.formatMoney(subtotal));
    set('purTotal', window.formatMoney(subtotal) + ' ج.م');
};

window.savePurchase = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    if (window.currentPurItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }
    
    const supplierName = document.getElementById('purSupplier') ? document.getElementById('purSupplier').value : '';
    if (!supplierName) { window.showToast('⚠️ اختر مورد', 'error'); return; }

    const purWarehouseId = document.getElementById('purWarehouse') ? document.getElementById('purWarehouse').value : '';
    const purWarehouse = (window.warehouses || []).find(function(w) { return w.id == purWarehouseId; });
    
    if (!purWarehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }

    const payment = document.getElementById('purPayment') ? document.getElementById('purPayment').value : 'cash';
    const cashBoxId = (document.getElementById('purCashBox') ? document.getElementById('purCashBox').value : '') 
        || ((window.cashBoxes || []).find(function(b) { return b.isDefault; }) || {}).id;
    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });
    const notes = document.getElementById('purNotes') ? document.getElementById('purNotes').value.trim() : '';
    const subtotal = window.currentPurItems.reduce(function(s, i) { return s + i.total; }, 0);
    const today = window.getTodayDate();

    window.currentPurItems.forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) { 
            p.qty += it.qty; 
            p.buy = it.price;
            
            if (!p.warehouseStock) p.warehouseStock = {};
            p.warehouseStock[purWarehouseId] = (p.warehouseStock[purWarehouseId] || 0) + it.qty;
        }
    });

    const isCash = payment === 'cash';
    const inv = {
        id: Date.now(), number: (window.purchases || []).length + 1,
        warehouseId: purWarehouseId,
        warehouseName: purWarehouse ? purWarehouse.name : '',
        supplierName: supplierName, notes: notes, 
        subtotal: subtotal, total: subtotal,
        payment: payment, cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        paidAmount: isCash ? subtotal : 0,
        remainingAmount: isCash ? 0 : subtotal,
        status: isCash ? 'paid' : 'unpaid',
        items: JSON.parse(JSON.stringify(window.currentPurItems)),
        date: today, time: window.getNowTime(),
        purchasedBy: window.currentUser ? window.currentUser.name : ''
    };
    
    if (!window.purchases) window.purchases = [];
    window.purchases.push(inv);

    if (isCash && cashBoxId) {
        window.treasury.push({
            id: Date.now() + 1, type: 'withdraw', amount: subtotal,
            note: 'فاتورة شراء #' + inv.number + ' - ' + supplierName,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'purchase', refId: inv.id,
            date: today, time: window.getNowTime()
        });
    }

    window.setData('purchases', window.purchases);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);

    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    // إعادة تعيين
    window.currentPurItems = [];
    const resetEls = ['purSupplier', 'purNotes'];
    resetEls.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const payEl = document.getElementById('purPayment');
    if (payEl) payEl.value = 'cash';

    window.populateWarehouseField();
    window.renderPurItems();
    window.updatePurTotals();
    window.renderPurchases();
    window.updatePurStats();
    window.populatePurProducts();
    window.populateSaleProducts();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();

    window.showToast('✅ فاتورة شراء #' + inv.number, 'success');
};

window.clearPurchase = function() {
    if (window.currentPurItems.length === 0) return;
    if (!confirm('⚠️ إلغاء؟')) return;
    window.currentPurItems = [];
    window.renderPurItems();
    window.updatePurTotals();
    window.showToast('🗑️ تم الإلغاء', 'info');
};

window.updatePurStats = function() {
    const total = (window.purchases || []).reduce(function(s, p) { return s + (p.total || 0); }, 0);
    const today = (window.purchases || []).filter(function(p) { return p.date === window.getTodayDate(); })
        .reduce(function(s, p) { return s + (p.total || 0); }, 0);
    
    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    
    set('purTotalCount', (window.purchases || []).length);
    set('purTotalAmount', window.formatMoney(total));
    set('purTodayAmount', window.formatMoney(today));
};

window.renderPurchases = function() {
    const c = document.getElementById('purchasesList');
    if (!c) return;
    if ((window.purchases || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><span>لا توجد فواتير</span></div>';
        return;
    }
    const sorted = window.purchases.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 30);
    let html = '<div class="table-header" style="grid-template-columns: 0.5fr 1.2fr 1fr 0.8fr 0.8fr 1.2fr;"><span>#</span><span>المورد</span><span>المبلغ</span><span>الدفع</span><span>التاريخ</span><span></span></div>';
    sorted.forEach(function(inv) {
        const statusLabel = inv.status === 'paid' ? '✅ نقدي' : '📝 آجل';
        html += '<div class="table-row" style="grid-template-columns: 0.5fr 1.2fr 1fr 0.8fr 0.8fr 1.2fr;">' +
            '<span>#' + inv.number + '</span>' +
            '<span><strong>' + inv.supplierName + '</strong>' +
                (inv.warehouseName ? '<br><small style="color:#A89070;font-size:9px;">🏭 ' + inv.warehouseName + '</small>' : '') +
            '</span>' +
            '<span style="color:#E06060;font-weight:700;">' + window.formatMoney(inv.total) + '</span>' +
            '<span style="font-size:10px;">' + statusLabel + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + inv.date + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-danger btn-sm" onclick="deletePurchase(' + inv.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.deletePurchase = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const inv = (window.purchases || []).find(function(p) { return p.id == id; });
    if (!inv) return;
    if (!confirm('⚠️ حذف فاتورة #' + inv.number + '؟')) return;
    
    inv.items.forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) {
            p.qty -= it.qty;
            if (inv.warehouseId && p.warehouseStock) {
                p.warehouseStock[inv.warehouseId] = Math.max(0, (p.warehouseStock[inv.warehouseId] || 0) - it.qty);
            }
        }
    });
    
    window.treasury = window.treasury.filter(function(t) { return !(t.refType === 'purchase' && t.refId === id); });
    window.purchases = window.purchases.filter(function(p) { return p.id !== id; });
    window.journalEntries = (window.journalEntries || []).filter(function(e) { return e.reference !== 'PUR-' + inv.number; });

    window.setData('purchases', window.purchases);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);
    window.setData('journalEntries', window.journalEntries);
    
    window.renderPurchases();
    window.updatePurStats();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    
    window.showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// الجزء 3: المرتجعات
// ═══════════════════════════════════════════════════════════

window.toggleReturnParty = function() {
    const type = document.getElementById('retType') ? document.getElementById('retType').value : 'sale';
    const label = document.getElementById('retPartyLabel');
    const sel = document.getElementById('retParty');
    if (label) label.textContent = type === 'sale' ? 'العميل' : 'المورد';
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر...</option>';
    if (type === 'sale') {
        (window.customers || []).forEach(function(c) { sel.innerHTML += '<option value="' + c.name + '">' + c.name + '</option>'; });
    } else {
        (window.suppliers || []).forEach(function(s) { sel.innerHTML += '<option value="' + s.name + '">' + s.name + '</option>'; });
    }
    sel.value = cv;
};

window.populateRetProducts = function() {
    const sel = document.getElementById('retProduct');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر منتج...</option>';
    (window.products || []).forEach(function(p) {
        sel.innerHTML += '<option value="' + p.id + '">' + p.name + ' (متاح: ' + p.qty + ')</option>';
    });
    sel.value = cv;
};

window.updateRetPrice = function() {
    const id = document.getElementById('retProduct') ? document.getElementById('retProduct').value : '';
    const priceInput = document.getElementById('retPrice');
    if (!id) { if (priceInput) priceInput.value = ''; return; }
    const product = (window.products || []).find(function(pr) { return pr.id == id; });
    if (product && priceInput) priceInput.value = product.sell;
};

window.addRetItem = function() {
    const productSelect = document.getElementById('retProduct');
    const qtyInput = document.getElementById('retQty');
    const priceInput = document.getElementById('retPrice');
    const id = productSelect ? productSelect.value : '';
    let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

    if (!id) { window.showToast('⚠️ اختر منتج', 'error'); return; }
    const p = (window.products || []).find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (price <= 0) price = p.sell;
    if (qty <= 0) qty = 1;

    const ex = window.currentRetItems.find(function(i) { return i.productId == id; });
    if (ex) {
        ex.qty += qty;
        ex.price = price;
        ex.total = ex.qty * ex.price;
    } else {
        window.currentRetItems.push({ 
            productId: p.id, name: p.name, qty: qty, price: price, 
            costPrice: p.buy, total: qty * price 
        });
    }

    if (qtyInput) qtyInput.value = 1;
    if (priceInput) priceInput.value = '';
    if (productSelect) productSelect.value = '';

    window.renderRetItems();
    window.showToast('✅ تم الإضافة', 'success');
};

window.removeRetItem = function(i) {
    window.currentRetItems.splice(i, 1);
    window.renderRetItems();
};

window.renderRetItems = function() {
    const c = document.getElementById('retItemsContainer');
    const tb = document.getElementById('retTotalBox');
    if (!c) return;
    
    if (window.currentRetItems.length === 0) {
        c.innerHTML = '<div class="empty-items"><i class="fas fa-undo-alt"></i><span>لا توجد أصناف</span></div>';
        if (tb) tb.style.display = 'none';
        return;
    }
    
    let html = '<div class="items-header-row"><span>ID</span><span>اسم الصنف</span><span>الوحدة</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span></div>';
    window.currentRetItems.forEach(function(it, i) {
        html += '<div class="item-row">' +
            '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
            '<span class="item-name">' + it.name + '</span>' +
            '<span class="item-unit">قطعة</span>' +
            '<span class="item-qty">' + it.qty + '</span>' +
            '<span class="item-price">' + window.formatMoney(it.price) + '</span>' +
            '<span class="item-total" style="color:#E6A830;">' + window.formatMoney(it.qty * it.price) + '</span>' +
            '<button class="item-delete" onclick="removeRetItem(' + i + ')"><i class="fas fa-times"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
    const total = window.currentRetItems.reduce(function(s, i) { return s + i.total; }, 0);
    const totalEl = document.getElementById('retTotal');
    if (totalEl) totalEl.textContent = window.formatMoney(total) + ' ج.م';
    if (tb) tb.style.display = 'block';
};

window.saveReturn = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    if (window.currentRetItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }
    
    const type = document.getElementById('retType') ? document.getElementById('retType').value : 'sale';
    const party = document.getElementById('retParty') ? document.getElementById('retParty').value : '';
    if (!party) { window.showToast('⚠️ اختر الجهة', 'error'); return; }
    
    const cashBoxId = document.getElementById('retCashBox') ? document.getElementById('retCashBox').value : '';
    if (!cashBoxId) { window.showToast('⚠️ اختر الخزنة', 'error'); return; }

    const retWarehouseId = document.getElementById('retWarehouse') ? document.getElementById('retWarehouse').value : '';
    const retWarehouse = (window.warehouses || []).find(function(w) { return w.id == retWarehouseId; });
    
    if (!retWarehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }

    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });
    const notes = document.getElementById('retNotes') ? document.getElementById('retNotes').value.trim() : '';
    const total = window.currentRetItems.reduce(function(s, i) { return s + i.total; }, 0);
    const today = window.getTodayDate();

    window.currentRetItems.forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) {
            if (type === 'sale') {
                p.qty += it.qty;
                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[retWarehouseId] = (p.warehouseStock[retWarehouseId] || 0) + it.qty;
            } else {
                p.qty = Math.max(0, p.qty - it.qty);
                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[retWarehouseId] = Math.max(0, (p.warehouseStock[retWarehouseId] || 0) - it.qty);
            }
        }
    });

    const ret = {
        id: Date.now(), number: (window.returns || []).length + 1,
        type: type, party: party,
        warehouseId: retWarehouseId,
        warehouseName: retWarehouse ? retWarehouse.name : '',
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        notes: notes, total: total, 
        items: JSON.parse(JSON.stringify(window.currentRetItems)),
        date: today, time: window.getNowTime(),
        createdBy: window.currentUser ? window.currentUser.name : ''
    };
    
    if (!window.returns) window.returns = [];
    window.returns.push(ret);

    if (type === 'sale') {
        window.treasury.push({
            id: Date.now() + 1, type: 'withdraw', amount: total,
            note: 'مرتجع بيع #' + ret.number + ' - ' + party,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'return', refId: ret.id,
            date: today, time: window.getNowTime()
        });
    } else {
        window.treasury.push({
            id: Date.now() + 1, type: 'deposit', amount: total,
            note: 'مرتجع شراء #' + ret.number + ' - ' + party,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'return', refId: ret.id,
            date: today, time: window.getNowTime()
        });
    }

    window.setData('returns', window.returns);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);

    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    window.currentRetItems = [];
    const partyEl = document.getElementById('retParty');
    const notesEl = document.getElementById('retNotes');
    if (partyEl) partyEl.value = '';
    if (notesEl) notesEl.value = '';

    window.populateWarehouseField();
    window.renderRetItems();
    window.renderReturns();
    window.updateReturnsStats();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();

    window.showToast('✅ مرتجع #' + ret.number, 'success');
};

window.clearReturn = function() {
    if (window.currentRetItems.length === 0) return;
    if (!confirm('⚠️ إلغاء المرتجع؟')) return;
    window.currentRetItems = [];
    window.renderRetItems();
    window.showToast('🗑️ تم الإلغاء', 'info');
};

window.updateReturnsStats = function() {
    const total = (window.returns || []).reduce(function(s, r) { return s + (r.total || 0); }, 0);
    const countEl = document.getElementById('retTotalCount');
    const amountEl = document.getElementById('retTotalAmount');
    if (countEl) countEl.textContent = (window.returns || []).length;
    if (amountEl) amountEl.textContent = window.formatMoney(total);
};

window.renderReturns = function() {
    const c = document.getElementById('returnsList');
    if (!c) return;
    if ((window.returns || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-undo-alt"></i><span>لا توجد مرتجعات</span></div>';
        return;
    }
    const sorted = window.returns.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 50);
    let html = '<div class="table-header" style="grid-template-columns: 0.5fr 0.8fr 1.3fr 1fr 1fr 1.2fr;"><span>#</span><span>النوع</span><span>الجهة</span><span>المبلغ</span><span>التاريخ</span><span></span></div>';
    sorted.forEach(function(r) {
        const isSale = r.type === 'sale';
        const color = isSale ? '#E6A830' : '#4A8AB5';
        html += '<div class="table-row" style="grid-template-columns: 0.5fr 0.8fr 1.3fr 1fr 1fr 1.2fr;">' +
            '<span>#' + r.number + '</span>' +
            '<span style="color:' + color + ';font-size:11px;font-weight:700;">' + (isSale ? '🔄 بيع' : '🔄 شراء') + '</span>' +
            '<span>' + r.party +
                (r.warehouseName ? '<br><small style="color:#A89070;font-size:9px;">🏭 ' + r.warehouseName + '</small>' : '') +
            '</span>' +
            '<span style="color:' + color + ';font-weight:700;">' + window.formatMoney(r.total) + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + r.date + '</span>' +
            '<button class="btn btn-danger btn-sm" onclick="deleteReturn(' + r.id + ')"><i class="fas fa-trash"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.deleteReturn = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const ret = (window.returns || []).find(function(r) { return r.id == id; });
    if (!ret) return;
    if (!confirm('⚠️ حذف مرتجع #' + ret.number + '؟')) return;
    
    ret.items.forEach(function(it) {
        const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
        if (p) {
            if (ret.type === 'sale') {
                p.qty -= it.qty;
                if (ret.warehouseId && p.warehouseStock) {
                    p.warehouseStock[ret.warehouseId] = Math.max(0, (p.warehouseStock[ret.warehouseId] || 0) - it.qty);
                }
            } else {
                p.qty += it.qty;
                if (ret.warehouseId && p.warehouseStock) {
                    p.warehouseStock[ret.warehouseId] = (p.warehouseStock[ret.warehouseId] || 0) + it.qty;
                }
            }
        }
    });
    
    window.treasury = window.treasury.filter(function(t) { return !(t.refType === 'return' && t.refId === id); });
    window.journalEntries = (window.journalEntries || []).filter(function(e) { return e.reference !== 'RET-' + ret.number; });
    window.returns = window.returns.filter(function(r) { return r.id !== id; });
    
    window.setData('returns', window.returns);
    window.setData('products', window.products);
    window.setData('treasury', window.treasury);
    window.setData('journalEntries', window.journalEntries);
    
    window.renderReturns();
    window.updateReturnsStats();
    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    
    window.showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// الجزء 4: الكوبونات والنقاط (loyalty)
// ═══════════════════════════════════════════════════════════

window.calculatePoints = function(amount) {
    return Math.floor((amount || 0) / 100) * window.LOYALTY_CONFIG.POINTS_PER_100;
};

window.getCustomerPoints = function(customerName) {
    if (!customerName || customerName === 'عميل نقدي') return 0;
    let totalPoints = 0;
    (window.sales || []).forEach(function(s) {
        if (s.customer === customerName) totalPoints += window.calculatePoints(s.total || 0);
        if (s.customer === customerName && s.redeemedPoints) totalPoints -= s.redeemedPoints;
    });
    return Math.max(0, totalPoints);
};

window.getCustomerLevel = function(customerName) {
    const totalPurchases = (window.sales || [])
        .filter(function(s) { return s.customer === customerName; })
        .reduce(function(sum, s) { return sum + (s.total || 0); }, 0);
    
    const levels = window.LOYALTY_CONFIG.LEVELS;
    for (let i = levels.length - 1; i >= 0; i--) {
        if (totalPurchases >= levels[i].min) return levels[i];
    }
    return levels[0];
};

window.findCoupon = function(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    return (window.coupons || []).find(function(c) {
        return c.code.toUpperCase() === cleanCode && c.active !== false;
    });
};

window.validateCoupon = function(coupon, amount) {
    if (!coupon) return { valid: false, reason: 'الكوبون غير موجود' };
    if (coupon.active === false) return { valid: false, reason: 'الكوبون موقوف' };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return { valid: false, reason: 'الكوبون منتهي' };
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { valid: false, reason: 'الكوبون استُنفذ' };
    }
    if (coupon.minAmount && amount < coupon.minAmount) {
        return { valid: false, reason: 'الحد الأدنى: ' + window.formatMoney(coupon.minAmount) };
    }
    
    let discount = 0;
    if (coupon.type === 'percent') {
        discount = amount * (coupon.value / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    } else {
        discount = coupon.value;
    }
    if (discount > amount) discount = amount;
    
    return { valid: true, discount: discount };
};

window.useCoupon = function(couponId) {
    const coupon = (window.coupons || []).find(function(c) { return c.id === couponId; });
    if (!coupon) return;
    coupon.usedCount = (coupon.usedCount || 0) + 1;
    window.setData('coupons', window.coupons);
};

window.applyCouponCode = function() {
    const input = document.getElementById('saleCouponCode');
    if (!input) return;
    
    const code = input.value.trim();
    if (!code) { window.showToast('⚠️ أدخل الكود', 'warning'); return; }
    
    const coupon = window.findCoupon(code);
    if (!coupon) { window.showToast('❌ كود غير صحيح', 'error'); return; }
    
    const subtotal = window.currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
    const validation = window.validateCoupon(coupon, subtotal);
    
    if (!validation.valid) { window.showToast('❌ ' + validation.reason, 'error'); return; }
    
    window.currentCoupon = coupon;
    
    const box = document.getElementById('couponInfoBox');
    if (box) {
        box.style.display = 'block';
        box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<span style="color:#2D8F5E;font-size:12px;">🎫 ' + coupon.code + ' - خصم ' + validation.discount.toFixed(2) + ' ج.م</span>' +
            '<button onclick="removeCoupon()" style="background:#E06060;border:none;color:#fff;padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer;">إلغاء</button>' +
        '</div>';
    }
    
    window.showToast('✅ تم تطبيق الكوبون', 'success');
    window.updateSaleTotals();
};

window.removeCoupon = function() {
    window.currentCoupon = null;
    const input = document.getElementById('saleCouponCode');
    if (input) input.value = '';
    const box = document.getElementById('couponInfoBox');
    if (box) box.style.display = 'none';
    window.updateSaleTotals();
    window.showToast('🗑️ تم إلغاء الكوبون', 'info');
};

window.applyRedeemPoints = function() {
    const input = document.getElementById('redeemPointsInput');
    if (!input) return;
    
    const points = parseInt(input.value) || 0;
    const available = window.getCustomerPoints(window.currentCustomerName);
    
    if (points <= 0) { window.showToast('⚠️ أدخل عدد صحيح', 'warning'); return; }
    if (points > available) { window.showToast('❌ المتاح فقط ' + available, 'error'); return; }
    if (points < window.LOYALTY_CONFIG.MIN_REDEEM_POINTS) {
        window.showToast('⚠️ الحد الأدنى ' + window.LOYALTY_CONFIG.MIN_REDEEM_POINTS, 'warning');
        return;
    }
    
    window.currentPointsToRedeem = points;
    const value = points * window.LOYALTY_CONFIG.POINT_VALUE;
    
    const info = document.getElementById('redeemedPointsInfo');
    if (info) {
        info.style.display = 'block';
        info.innerHTML = '✅ استخدمت ' + points + ' نقطة = ' + window.formatMoney(value) + ' ج.م';
    }
    
    window.showToast('⭐ تم تطبيق ' + points + ' نقطة', 'success');
    window.updateSaleTotals();
};

// ═══════════════════════════════════════════════════════════
// الجزء 5: واتساب
// ═══════════════════════════════════════════════════════════

window.sendWhatsApp = function(phone, message) {
    if (!phone) { window.showToast('⚠️ لا يوجد رقم', 'warning'); return; }
    
    let cleanPhone = String(phone).replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('1')) {
        cleanPhone = '20' + cleanPhone;
    }
    
    const url = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank');
};

window.sendInvoiceWhatsApp = function(invoiceId) {
    const invoice = (window.sales || []).find(function(s) { return s.id == invoiceId; });
    if (!invoice) { window.showToast('⚠️ الفاتورة غير موجودة', 'error'); return; }

    const customer = (window.customers || []).find(function(c) { return c.name === invoice.customer; });
    let customerPhone = customer ? (customer.phone || customer.whatsapp) : '';

    const company = window.companyData || { name: 'الميزان' };
    const lines = [
        '⚖️ *' + company.name + '*',
        '',
        '📄 *فاتورة رقم:* ' + invoice.number,
        '📅 *التاريخ:* ' + invoice.date,
        '',
        '👤 *العميل:* ' + (invoice.customer || 'عميل نقدي'),
        '',
        '*📦 الأصناف:*'
    ];

    (invoice.items || []).forEach(function(item, i) {
        lines.push('  ' + (i+1) + '. ' + item.name + ' × ' + item.qty + ' = ' + window.formatMoney(item.total) + ' ج.م');
    });

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━');
    lines.push('*✅ الإجمالي: ' + window.formatMoney(invoice.total) + ' ج.م*');

    if (!customerPhone) {
        customerPhone = prompt('📱 أدخل رقم واتساب (مع كود الدولة):', '20');
        if (!customerPhone) return;
    }

    window.sendWhatsApp(customerPhone, lines.join('\n'));
};

window.sendDebtReminderWhatsApp = function(customerName) {
    const customer = (window.customers || []).find(function(c) { return c.name === customerName; });
    if (!customer) return;

    const balance = window.getCustomerBalance(customerName);
    if (balance <= 0) { window.showToast('ℹ️ لا توجد مديونية', 'info'); return; }

    const company = window.companyData || { name: 'الميزان' };
    const message = '⚖️ *' + company.name + '*\n\n' +
        'مرحباً ' + customer.name + '،\n\n' +
        '💳 مديونية مستحقة: *' + window.formatMoney(balance) + ' ج.م*\n\n' +
        'شكراً لتعاملكم معنا 🌟';

    const phone = customer.whatsapp || customer.phone;
    if (!phone) {
        const input = prompt('📱 أدخل رقم واتساب:');
        if (!input) return;
        window.sendWhatsApp(input, message);
    } else {
        window.sendWhatsApp(phone, message);
    }
};

// ═══════════════════════════════════════════════════════════
// علم التحميل
// ═══════════════════════════════════════════════════════════
window.__posLoaded = true;

console.log('✅ pos.js v17.0 جاهز');
