// ============================================================
// الميزان Pro - pos.js
// الكاشير + المشتريات + المرتجعات + الكوبونات + واتساب
// ============================================================

(function() {
    'use strict';

    console.log('🛒 pos.js v18.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: دوال مساعدة
    // ═══════════════════════════════════════════════════════════

    window.populateSaleProducts = function() {
        const sel = document.getElementById('saleProduct');
        if (!sel) return;
        const cv = sel.value;
        sel.innerHTML = '<option value="">اختر منتج...</option>';
        (window.products || []).forEach(function(p) {
            sel.innerHTML += '<option value="' + p.id + '">' +
                window.escapeHtml(p.name) + ' (متاح: ' + (p.qty || 0) + ')</option>';
        });
        sel.value = cv;
    };

    window.populateSaleCustomers = function() {
        const sel = document.getElementById('saleCustomer');
        if (!sel) return;
        const cv = sel.value;
        sel.innerHTML = '<option value="">عميل نقدي</option>';
        (window.customers || []).forEach(function(c) {
            sel.innerHTML += '<option value="' + window.escapeHtml(c.name) + '">' +
                window.escapeHtml(c.name) + '</option>';
        });
        sel.value = cv;
    };

    window.populateCashBoxDropdowns = function() {
        const ids = ['saleCashBox', 'purCashBox', 'expCashBox', 'manualCashBox',
                     'collectCashBox', 'payCashBox', 'retCashBox', 'salCashBox'];
        const boxes = (window.cashBoxes || []).filter(function(b) {
            return b.active !== false;
        });
        const defaultBox = boxes.find(function(b) { return b.isDefault; }) || boxes[0];

        ids.forEach(function(id) {
            const sel = document.getElementById(id);
            if (!sel) return;
            const cv = sel.value;
            let html = '<option value="">اختر الخزنة...</option>';
            boxes.forEach(function(box) {
                html += '<option value="' + box.id + '">' +
                    (box.icon || '') + ' ' + window.escapeHtml(box.name) +
                    (box.isDefault ? ' ⭐' : '') + '</option>';
            });
            sel.innerHTML = html;
            if (cv && Array.from(sel.options).some(function(o) { return o.value == cv; })) {
                sel.value = cv;
            } else if (defaultBox && Array.from(sel.options).some(function(o) { return o.value == defaultBox.id; })) {
                sel.value = defaultBox.id;
            }
        });
    };

    window.populateWarehouseField = function() {
        const ids = ['saleWarehouse', 'purWarehouse', 'retWarehouse'];
        const warehouses = window.warehouses || [];

        ids.forEach(function(id) {
            const sel = document.getElementById(id);
            if (!sel) return;
            const cv = sel.value;
            let html = '<option value="">اختر المستودع...</option>';
            warehouses.forEach(function(w) {
                if (w.active !== false) {
                    html += '<option value="' + w.id + '">' +
                        window.escapeHtml(w.name) + '</option>';
                }
            });
            sel.innerHTML = html;

            if (cv && Array.from(sel.options).some(function(o) { return o.value == cv; })) {
                sel.value = cv;
            } else {
                const mainWh = warehouses.find(function(w) { return w.type === 'main'; }) || warehouses[0];
                if (mainWh) sel.value = mainWh.id;
            }
        });
    };

    window.updateSalePrice = function() {
        const id = document.getElementById('saleProduct') ? document.getElementById('saleProduct').value : '';
        const priceInput = document.getElementById('salePrice');
        if (!id) {
            if (priceInput) priceInput.value = '';
            return;
        }
        const product = (window.products || []).find(function(pr) { return pr.id == id; });
        if (product && priceInput) priceInput.value = product.sell || 0;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: إضافة الأصناف للسلة
    // ═══════════════════════════════════════════════════════════

    window.addSaleItem = function() {
        const productSelect = document.getElementById('saleProduct');
        const qtyInput = document.getElementById('saleQty');
        const priceInput = document.getElementById('salePrice');
        const id = productSelect ? productSelect.value : '';
        let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
        let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

        if (!id) {
            window.showToast('⚠️ اختر منتج', 'error');
            return;
        }

        const p = (window.products || []).find(function(pr) { return pr.id == id; });
        if (!p) return;
        if (price <= 0) price = p.sell || 0;
        if (qty <= 0) qty = 1;

        // التحقق من المستودع
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
                productId: p.id,
                name: p.name,
                qty: qty,
                price: price,
                costPrice: p.buy || 0,
                total: qty * price
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
            c.innerHTML = '<div class="empty-items">' +
                '<i class="fas fa-shopping-cart"></i>' +
                '<span>لا توجد أصناف</span>' +
                '<small>أضف صنف من الأعلى</small>' +
            '</div>';
            if (tb) tb.style.display = 'none';
            return;
        }

        let html = '<div class="items-header-row">' +
            '<span>ID</span><span>اسم الصنف</span><span>الوحدة</span>' +
            '<span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span>' +
        '</div>';

        window.currentSaleItems.forEach(function(it, i) {
            html += '<div class="item-row">' +
                '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
                '<span class="item-name">' + window.escapeHtml(it.name) + '</span>' +
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

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: حساب الإجماليات
    // ═══════════════════════════════════════════════════════════

    window.updateSaleTotals = function() {
        const subtotal = window.currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
        const totalQty = window.currentSaleItems.reduce(function(s, i) { return s + i.qty; }, 0);
        const invoiceType = window.getRadioValue('saleInvoiceType', 'simple');
        const isTax = invoiceType === 'tax';
        const vat = isTax ? (subtotal * (window.VAT_SETTINGS.defaultVAT / 100)) : 0;

        // الخصم
        const discountValue = parseFloat(document.getElementById('saleDiscount') ? document.getElementById('saleDiscount').value : 0) || 0;
        const discountType = document.getElementById('saleDiscountType') ? document.getElementById('saleDiscountType').value : 'fixed';
        const discount = discountType === 'percent'
            ? (subtotal + vat) * (discountValue / 100)
            : discountValue;

        // خصم المستوى
        const levelDiscountValue = parseFloat(document.getElementById('saleLevelDiscount') ? document.getElementById('saleLevelDiscount').value : 0) || 0;
        const levelDiscountType = document.getElementById('saleLevelDiscountType') ? document.getElementById('saleLevelDiscountType').value : 'fixed';
        const levelDiscount = levelDiscountType === 'percent'
            ? (subtotal + vat) * (levelDiscountValue / 100)
            : levelDiscountValue;

        // كوبون
        let couponDiscount = 0;
        if (window.currentCoupon && typeof window.validateCoupon === 'function') {
            const validation = window.validateCoupon(window.currentCoupon, subtotal);
            if (validation.valid) couponDiscount = validation.discount;
        }

        // نقاط
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

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: حفظ فاتورة البيع
    // ═══════════════════════════════════════════════════════════

    window.saveSale = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        if (window.currentSaleItems.length === 0) {
            window.showToast('⚠️ لا توجد أصناف', 'error');
            return;
        }

        const saleWarehouseId = document.getElementById('saleWarehouse') ? document.getElementById('saleWarehouse').value : '';
        const saleWarehouse = (window.warehouses || []).find(function(w) { return w.id == saleWarehouseId; });

        if (!saleWarehouseId) {
            window.showToast('⚠️ اختر المستودع', 'error');
            return;
        }

        // التحقق من المخزون
        for (let i = 0; i < window.currentSaleItems.length; i++) {
            const it = window.currentSaleItems[i];
            const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
            if (!p) {
                window.showToast('⚠️ المنتج غير موجود', 'error');
                return;
            }
            const whQty = (p.warehouseStock && p.warehouseStock[saleWarehouseId]) || 0;
            if (whQty < it.qty) {
                window.showToast('⚠️ الكمية غير كافية: ' + p.name + ' (متاح: ' + whQty + ')', 'error');
                return;
            }
        }

        // جمع البيانات
        const customer = document.getElementById('saleCustomer') ? document.getElementById('saleCustomer').value : 'عميل نقدي';
        const seller = document.getElementById('saleSeller') ? document.getElementById('saleSeller').value : '';
        const delivery = document.getElementById('saleDelivery') ? document.getElementById('saleDelivery').value : '';
        const shipping = document.getElementById('saleShipping') ? document.getElementById('saleShipping').value.trim() : '';
        const paymentMethod = window.getRadioValue('salePaymentMethod', 'cash');
        const invoiceType = window.getRadioValue('saleInvoiceType', 'simple');
        const isTax = invoiceType === 'tax';

        const cashBoxes = window.cashBoxes || [];
        const cashBoxId = (document.getElementById('saleCashBox') ? document.getElementById('saleCashBox').value : '')
            || (cashBoxes.find(function(b) { return b.isDefault; }) || {}).id;
        const box = cashBoxes.find(function(b) { return b.id == cashBoxId; });

        const subtotal = window.currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
        const vat = isTax ? (subtotal * (window.VAT_SETTINGS.defaultVAT / 100)) : 0;

        // حساب الخصومات
        const discountValue = parseFloat(document.getElementById('saleDiscount') ? document.getElementById('saleDiscount').value : 0) || 0;
        const discountType = document.getElementById('saleDiscountType') ? document.getElementById('saleDiscountType').value : 'fixed';
        const discount = discountType === 'percent'
            ? (subtotal + vat) * (discountValue / 100)
            : discountValue;

        const levelDiscountValue = parseFloat(document.getElementById('saleLevelDiscount') ? document.getElementById('saleLevelDiscount').value : 0) || 0;
        const levelDiscountType = document.getElementById('saleLevelDiscountType') ? document.getElementById('saleLevelDiscountType').value : 'fixed';
        const levelDiscount = levelDiscountType === 'percent'
            ? (subtotal + vat) * (levelDiscountValue / 100)
            : levelDiscountValue;

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

        // خصم المخزون + حساب COGS
        const itemsCopy = JSON.parse(JSON.stringify(window.currentSaleItems));

        itemsCopy.forEach(function(it) {
            const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
            if (p) {
                it.costPrice = p.buy || 0;
                cogsTotal += (p.buy || 0) * it.qty;
                p.qty = Math.max(0, (p.qty || 0) - it.qty);

                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[saleWarehouseId] = Math.max(0,
                    (p.warehouseStock[saleWarehouseId] || 0) - it.qty);
            }
        });

        const isCash = ['cash', 'wallet', 'visa', 'bank'].indexOf(paymentMethod) > -1;

        const inv = {
            id: window.generateId('inv_'),
            number: (window.sales || []).length + 1,
            warehouseId: saleWarehouseId,
            warehouseName: saleWarehouse ? saleWarehouse.name : '',
            customer: customer,
            customerId: ((window.customers || []).find(function(c) { return c.name === customer; }) || {}).id || null,
            seller: seller,
            delivery: delivery,
            shipping: shipping,
            paymentMethod: paymentMethod,
            invoiceType: invoiceType,
            cashBoxId: cashBoxId,
            cashBoxName: box ? box.name : '',
            subtotal: subtotal,
            vat: vat,
            discount: discount,
            levelDiscount: levelDiscount,
            couponDiscount: couponDiscount,
            couponCode: couponCode,
            redeemedPoints: redeemedPoints,
            pointsDiscount: pointsDiscount,
            total: total,
            cogs: cogsTotal,
            profit: subtotal - cogsTotal - discount - levelDiscount - couponDiscount - pointsDiscount,
            paidAmount: isCash ? total : 0,
            remainingAmount: isCash ? 0 : total,
            status: isCash ? 'paid' : 'unpaid',
            items: itemsCopy,
            date: today,
            time: window.getNowTime(),
            soldBy: window.currentUser ? window.currentUser.name : ''
        };

        // إضافة البيع
        window.DataStore.add('sales', inv);

        // ربط الكوبون
        if (window.currentCoupon && typeof window.useCoupon === 'function') {
            window.useCoupon(window.currentCoupon.id);
        }

        // خصم من الخزنة لو نقدي
        if (isCash && cashBoxId) {
            window.DataStore.add('treasury', {
                id: window.generateId('tr_'),
                type: 'deposit',
                amount: total,
                note: 'فاتورة بيع #' + inv.number + ' - ' + customer,
                cashBoxId: cashBoxId,
                cashBoxName: box ? box.name : '',
                refType: 'sale',
                refId: inv.id,
                date: today,
                time: window.getNowTime()
            });
        }

        // حفظ المنتجات (بعد خصم المخزون)
        window.DataStore.set('products', window.products);

        // قيد محاسبي
        window.Accounting.entrySale(inv, isCash);

        // إعادة تعيين
        window.currentSaleItems = [];
        window.currentCoupon = null;
        window.currentPointsToRedeem = 0;

        ['saleCustomer', 'saleDelivery', 'saleShipping', 'saleCouponCode', 'redeemPointsInput'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        ['saleDiscount', 'saleLevelDiscount'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '0';
        });

        window.setRadioValue('salePaymentMethod', 'cash');
        window.setRadioValue('saleInvoiceType', 'simple');

        // تحديث الواجهات
        window.populateWarehouseField();
        window.renderCashier();
        window.updateSaleTotals();
        window.populateSaleProducts();
        window.updateInvoiceHeader();

        window.showToast('✅ فاتورة #' + inv.number + ' - ' + window.formatMoney(total), 'success');

        // إشعار
        if (typeof window.notifyNewInvoice === 'function') {
            window.notifyNewInvoice(inv);
        }
    };

    window.clearSale = async function() {
        if (window.currentSaleItems.length === 0) return;

        const confirmed = await window.confirmDialog('إلغاء الفاتورة؟');
        if (!confirmed) return;

        window.currentSaleItems = [];
        window.currentCoupon = null;
        window.currentPointsToRedeem = 0;
        window.renderCashier();
        window.updateSaleTotals();
        window.showToast('🗑️ تم الإلغاء', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: المشتريات
    // ═══════════════════════════════════════════════════════════

    window.populatePurProducts = function() {
        const sel = document.getElementById('purProduct');
        if (!sel) return;
        const cv = sel.value;
        sel.innerHTML = '<option value="">اختر منتج...</option>';
        (window.products || []).forEach(function(p) {
            sel.innerHTML += '<option value="' + p.id + '">' +
                window.escapeHtml(p.name) + ' (شراء: ' + window.formatMoney(p.buy) + ')</option>';
        });
        sel.value = cv;
    };

    window.populatePurSuppliers = function() {
        const sel = document.getElementById('purSupplier');
        if (!sel) return;
        const cv = sel.value;
        sel.innerHTML = '<option value="">اختر مورد...</option>';
        (window.suppliers || []).forEach(function(s) {
            sel.innerHTML += '<option value="' + window.escapeHtml(s.name) + '">' +
                window.escapeHtml(s.name) + '</option>';
        });
        sel.value = cv;
    };

    window.updatePurPrice = function() {
        const id = document.getElementById('purProduct') ? document.getElementById('purProduct').value : '';
        const priceInput = document.getElementById('purPrice');
        if (!id) {
            if (priceInput) priceInput.value = '';
            return;
        }
        const product = (window.products || []).find(function(pr) { return pr.id == id; });
        if (product && priceInput) priceInput.value = product.buy || 0;
    };

    window.addPurItem = function() {
        const productSelect = document.getElementById('purProduct');
        const qtyInput = document.getElementById('purQty');
        const priceInput = document.getElementById('purPrice');
        const id = productSelect ? productSelect.value : '';
        let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
        let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

        if (!id) {
            window.showToast('⚠️ اختر منتج', 'error');
            return;
        }

        const p = (window.products || []).find(function(pr) { return pr.id == id; });
        if (!p) return;
        if (price <= 0) price = p.buy || 0;
        if (qty <= 0) qty = 1;

        const ex = window.currentPurItems.find(function(i) { return i.productId == id; });
        if (ex) {
            ex.qty += qty;
            ex.price = price;
            ex.total = ex.qty * ex.price;
        } else {
            window.currentPurItems.push({
                productId: p.id,
                name: p.name,
                qty: qty,
                price: price,
                total: qty * price
            });
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

        let html = '<div class="items-header-row">' +
            '<span>ID</span><span>اسم الصنف</span><span>الوحدة</span>' +
            '<span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span>' +
        '</div>';

        window.currentPurItems.forEach(function(it, i) {
            html += '<div class="item-row">' +
                '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
                '<span class="item-name">' + window.escapeHtml(it.name) + '</span>' +
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
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        if (window.currentPurItems.length === 0) {
            window.showToast('⚠️ لا توجد أصناف', 'error');
            return;
        }

        const supplierName = document.getElementById('purSupplier') ? document.getElementById('purSupplier').value : '';
        if (!supplierName) {
            window.showToast('⚠️ اختر مورد', 'error');
            return;
        }

        const purWarehouseId = document.getElementById('purWarehouse') ? document.getElementById('purWarehouse').value : '';
        const purWarehouse = (window.warehouses || []).find(function(w) { return w.id == purWarehouseId; });

        if (!purWarehouseId) {
            window.showToast('⚠️ اختر المستودع', 'error');
            return;
        }

        const payment = document.getElementById('purPayment') ? document.getElementById('purPayment').value : 'cash';
        const cashBoxes = window.cashBoxes || [];
        const cashBoxId = (document.getElementById('purCashBox') ? document.getElementById('purCashBox').value : '')
            || (cashBoxes.find(function(b) { return b.isDefault; }) || {}).id;
        const box = cashBoxes.find(function(b) { return b.id == cashBoxId; });
        const notes = document.getElementById('purNotes') ? document.getElementById('purNotes').value.trim() : '';
        const subtotal = window.currentPurItems.reduce(function(s, i) { return s + i.total; }, 0);
        const today = window.getTodayDate();

        // إضافة للمخزون
        const itemsCopy = JSON.parse(JSON.stringify(window.currentPurItems));

        itemsCopy.forEach(function(it) {
            const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
            if (p) {
                p.qty = (p.qty || 0) + it.qty;
                p.buy = it.price;

                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[purWarehouseId] = (p.warehouseStock[purWarehouseId] || 0) + it.qty;
            }
        });

        const isCash = payment === 'cash';

        const inv = {
            id: window.generateId('pur_'),
            number: (window.purchases || []).length + 1,
            warehouseId: purWarehouseId,
            warehouseName: purWarehouse ? purWarehouse.name : '',
            supplierName: supplierName,
            notes: notes,
            subtotal: subtotal,
            total: subtotal,
            payment: payment,
            cashBoxId: cashBoxId,
            cashBoxName: box ? box.name : '',
            paidAmount: isCash ? subtotal : 0,
            remainingAmount: isCash ? 0 : subtotal,
            status: isCash ? 'paid' : 'unpaid',
            items: itemsCopy,
            date: today,
            time: window.getNowTime(),
            purchasedBy: window.currentUser ? window.currentUser.name : ''
        };

        window.DataStore.add('purchases', inv);

        // خصم من الخزنة لو نقدي
        if (isCash && cashBoxId) {
            window.DataStore.add('treasury', {
                id: window.generateId('tr_'),
                type: 'withdraw',
                amount: subtotal,
                note: 'فاتورة شراء #' + inv.number + ' - ' + supplierName,
                cashBoxId: cashBoxId,
                cashBoxName: box ? box.name : '',
                refType: 'purchase',
                refId: inv.id,
                date: today,
                time: window.getNowTime()
            });
        }

        window.DataStore.set('products', window.products);

        // قيد محاسبي
        window.Accounting.entryPurchase(inv, isCash);

        // إعادة تعيين
        window.currentPurItems = [];
        ['purSupplier', 'purNotes'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const payEl = document.getElementById('purPayment');
        if (payEl) payEl.value = 'cash';

        window.populateWarehouseField();
        window.renderPurItems();
        window.updatePurTotals();

        window.showToast('✅ فاتورة شراء #' + inv.number, 'success');
    };

    window.clearPurchase = async function() {
        if (window.currentPurItems.length === 0) return;
        const confirmed = await window.confirmDialog('إلغاء؟');
        if (!confirmed) return;
        window.currentPurItems = [];
        window.renderPurItems();
        window.updatePurTotals();
        window.showToast('🗑️ تم الإلغاء', 'info');
    };

    window.updatePurStats = function() {
        const total = (window.purchases || []).reduce(function(s, p) {
            return s + (parseFloat(p.total) || 0);
        }, 0);
        const today = (window.purchases || []).filter(function(p) {
            return p.date === window.getTodayDate();
        }).reduce(function(s, p) {
            return s + (parseFloat(p.total) || 0);
        }, 0);

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

        const sorted = window.purchases.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 50);

        let html = '<div class="table-header" style="grid-template-columns: 0.5fr 1.2fr 1fr 0.8fr 0.8fr 1.2fr;">' +
            '<span>#</span><span>المورد</span><span>المبلغ</span>' +
            '<span>الدفع</span><span>التاريخ</span><span></span>' +
        '</div>';

        sorted.forEach(function(inv) {
            const statusLabel = inv.status === 'paid' ? '✅ نقدي' : '📝 آجل';
            html += '<div class="table-row" style="grid-template-columns: 0.5fr 1.2fr 1fr 0.8fr 0.8fr 1.2fr;">' +
                '<span>#' + inv.number + '</span>' +
                '<span><strong>' + window.escapeHtml(inv.supplierName) + '</strong>' +
                    (inv.warehouseName ? '<br><small style="color:#A89070;font-size:9px;">🏭 ' + window.escapeHtml(inv.warehouseName) + '</small>' : '') +
                '</span>' +
                '<span style="color:#E06060;font-weight:700;">' + window.formatMoney(inv.total) + '</span>' +
                '<span style="font-size:10px;">' + statusLabel + '</span>' +
                '<span style="font-size:10px;color:#A89070;">' + (inv.date || '') + '</span>' +
                '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                    '<button class="btn btn-info btn-sm" onclick="showPurchaseDetails(\'' + inv.id + '\')"><i class="fas fa-eye"></i></button>' +
                    '<button class="btn btn-danger btn-sm" onclick="deletePurchase(\'' + inv.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.deletePurchase = async function(id) {
        if (!window.canDelete()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const inv = (window.purchases || []).find(function(p) { return p.id == id; });
        if (!inv) return;

        const confirmed = await window.confirmDialog('حذف فاتورة #' + inv.number + '؟');
        if (!confirmed) return;

        // إرجاع المخزون
        (inv.items || []).forEach(function(it) {
            const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
            if (p) {
                p.qty = Math.max(0, (p.qty || 0) - it.qty);
                if (inv.warehouseId && p.warehouseStock) {
                    p.warehouseStock[inv.warehouseId] = Math.max(0,
                        (p.warehouseStock[inv.warehouseId] || 0) - it.qty);
                }
            }
        });

        // حذف من الخزنة
        window.treasury = (window.treasury || []).filter(function(t) {
            return !(t.refType === 'purchase' && t.refId === id);
        });

        // حذف من السجل
        window.DataStore.remove('purchases', id);
        window.DataStore.set('products', window.products);
        window.DataStore.set('treasury', window.treasury);

        // حذف القيد المحاسبي
        window.Accounting.removeByReference('PUR-' + inv.number);

        window.showToast('🗑️ تم الحذف', 'info');
    };

    window.showPurchaseDetails = function(id) {
        const inv = (window.purchases || []).find(function(p) { return p.id == id; });
        if (!inv) return;

        let itemsHtml = '';
        (inv.items || []).forEach(function(it, i) {
            itemsHtml += '<tr>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;">' + (i + 1) + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;">' + window.escapeHtml(it.name) + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;">' + it.qty + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;">' + window.formatMoney(it.price) + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;color:#E06060;">' + window.formatMoney(it.total) + '</td>' +
            '</tr>';
        });

        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🛒 فاتورة شراء #' + inv.number + '</h3>' +
            '<div style="background:#0D0D0D;padding:14px;border-radius:10px;border:1px solid #2D2D2D;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:12px;">' +
                    '<div><span style="color:#A89070;">المورد:</span> <strong>' + window.escapeHtml(inv.supplierName) + '</strong></div>' +
                    '<div><span style="color:#A89070;">التاريخ:</span> ' + (inv.date || '') + ' ' + (inv.time || '') + '</div>' +
                    '<div><span style="color:#A89070;">الحالة:</span> ' + (inv.status === 'paid' ? '✅ مدفوعة' : '📝 آجل') + '</div>' +
                    (inv.warehouseName ? '<div style="grid-column:1/-1;color:#4A8AB5;">🏭 ' + window.escapeHtml(inv.warehouseName) + '</div>' : '') +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                    '<thead><tr style="background:#E06060;color:#fff;">' +
                        '<th style="padding:6px;">#</th>' +
                        '<th style="padding:6px;">الصنف</th>' +
                        '<th style="padding:6px;">الكمية</th>' +
                        '<th style="padding:6px;">السعر</th>' +
                        '<th style="padding:6px;">الإجمالي</th>' +
                    '</tr></thead>' +
                    '<tbody>' + itemsHtml + '</tbody>' +
                '</table>' +
                '<div style="margin-top:12px;padding:12px;background:#1A1A1A;border-radius:8px;display:flex;justify-content:space-between;font-size:16px;font-weight:900;color:#E06060;">' +
                    '<span>الإجمالي:</span><span>' + window.formatMoney(inv.total) + ' ج.م</span>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

        window.openModal(html);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: المرتجعات
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
            (window.customers || []).forEach(function(c) {
                sel.innerHTML += '<option value="' + window.escapeHtml(c.name) + '">' +
                    window.escapeHtml(c.name) + '</option>';
            });
        } else {
            (window.suppliers || []).forEach(function(s) {
                sel.innerHTML += '<option value="' + window.escapeHtml(s.name) + '">' +
                    window.escapeHtml(s.name) + '</option>';
            });
        }
        sel.value = cv;
    };

    window.populateRetProducts = function() {
        const sel = document.getElementById('retProduct');
        if (!sel) return;
        const cv = sel.value;
        sel.innerHTML = '<option value="">اختر منتج...</option>';
        (window.products || []).forEach(function(p) {
            sel.innerHTML += '<option value="' + p.id + '">' +
                window.escapeHtml(p.name) + ' (متاح: ' + (p.qty || 0) + ')</option>';
        });
        sel.value = cv;
    };

    window.updateRetPrice = function() {
        const id = document.getElementById('retProduct') ? document.getElementById('retProduct').value : '';
        const priceInput = document.getElementById('retPrice');
        if (!id) {
            if (priceInput) priceInput.value = '';
            return;
        }
        const product = (window.products || []).find(function(pr) { return pr.id == id; });
        if (product && priceInput) priceInput.value = product.sell || 0;
    };

    window.addRetItem = function() {
        const productSelect = document.getElementById('retProduct');
        const qtyInput = document.getElementById('retQty');
        const priceInput = document.getElementById('retPrice');
        const id = productSelect ? productSelect.value : '';
        let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
        let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

        if (!id) {
            window.showToast('⚠️ اختر منتج', 'error');
            return;
        }

        const p = (window.products || []).find(function(pr) { return pr.id == id; });
        if (!p) return;
        if (price <= 0) price = p.sell || 0;
        if (qty <= 0) qty = 1;

        const ex = window.currentRetItems.find(function(i) { return i.productId == id; });
        if (ex) {
            ex.qty += qty;
            ex.price = price;
            ex.total = ex.qty * ex.price;
        } else {
            window.currentRetItems.push({
                productId: p.id,
                name: p.name,
                qty: qty,
                price: price,
                costPrice: p.buy || 0,
                total: qty * price
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

        let html = '<div class="items-header-row">' +
            '<span>ID</span><span>اسم الصنف</span><span>الوحدة</span>' +
            '<span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span>' +
        '</div>';

        window.currentRetItems.forEach(function(it, i) {
            html += '<div class="item-row">' +
                '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
                '<span class="item-name">' + window.escapeHtml(it.name) + '</span>' +
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
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        if (window.currentRetItems.length === 0) {
            window.showToast('⚠️ لا توجد أصناف', 'error');
            return;
        }

        const type = document.getElementById('retType') ? document.getElementById('retType').value : 'sale';
        const party = document.getElementById('retParty') ? document.getElementById('retParty').value : '';
        if (!party) {
            window.showToast('⚠️ اختر الجهة', 'error');
            return;
        }

        const cashBoxId = document.getElementById('retCashBox') ? document.getElementById('retCashBox').value : '';
        if (!cashBoxId) {
            window.showToast('⚠️ اختر الخزنة', 'error');
            return;
        }

        const retWarehouseId = document.getElementById('retWarehouse') ? document.getElementById('retWarehouse').value : '';
        const retWarehouse = (window.warehouses || []).find(function(w) { return w.id == retWarehouseId; });

        if (!retWarehouseId) {
            window.showToast('⚠️ اختر المستودع', 'error');
            return;
        }

        const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });
        const notes = document.getElementById('retNotes') ? document.getElementById('retNotes').value.trim() : '';
        const total = window.currentRetItems.reduce(function(s, i) { return s + i.total; }, 0);
        const today = window.getTodayDate();

        // تعديل المخزون
        const itemsCopy = JSON.parse(JSON.stringify(window.currentRetItems));

        itemsCopy.forEach(function(it) {
            const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
            if (p) {
                if (type === 'sale') {
                    p.qty = (p.qty || 0) + it.qty;
                    if (!p.warehouseStock) p.warehouseStock = {};
                    p.warehouseStock[retWarehouseId] = (p.warehouseStock[retWarehouseId] || 0) + it.qty;
                } else {
                    p.qty = Math.max(0, (p.qty || 0) - it.qty);
                    if (!p.warehouseStock) p.warehouseStock = {};
                    p.warehouseStock[retWarehouseId] = Math.max(0,
                        (p.warehouseStock[retWarehouseId] || 0) - it.qty);
                }
            }
        });

        const ret = {
            id: window.generateId('ret_'),
            number: (window.returns || []).length + 1,
            type: type,
            party: party,
            warehouseId: retWarehouseId,
            warehouseName: retWarehouse ? retWarehouse.name : '',
            cashBoxId: cashBoxId,
            cashBoxName: box ? box.name : '',
            notes: notes,
            total: total,
            items: itemsCopy,
            date: today,
            time: window.getNowTime(),
            createdBy: window.currentUser ? window.currentUser.name : ''
        };

        window.DataStore.add('returns', ret);

        // خصم/إيداع الخزنة
        if (type === 'sale') {
            window.DataStore.add('treasury', {
                id: window.generateId('tr_'),
                type: 'withdraw',
                amount: total,
                note: 'مرتجع بيع #' + ret.number + ' - ' + party,
                cashBoxId: cashBoxId,
                cashBoxName: box ? box.name : '',
                refType: 'return',
                refId: ret.id,
                date: today,
                time: window.getNowTime()
            });
        } else {
            window.DataStore.add('treasury', {
                id: window.generateId('tr_'),
                type: 'deposit',
                amount: total,
                note: 'مرتجع شراء #' + ret.number + ' - ' + party,
                cashBoxId: cashBoxId,
                cashBoxName: box ? box.name : '',
                refType: 'return',
                refId: ret.id,
                date: today,
                time: window.getNowTime()
            });
        }

        window.DataStore.set('products', window.products);

        // إعادة تعيين
        window.currentRetItems = [];
        const partyEl = document.getElementById('retParty');
        const notesEl = document.getElementById('retNotes');
        if (partyEl) partyEl.value = '';
        if (notesEl) notesEl.value = '';

        window.populateWarehouseField();
        window.renderRetItems();

        window.showToast('✅ مرتجع #' + ret.number, 'success');
    };

    window.clearReturn = async function() {
        if (window.currentRetItems.length === 0) return;
        const confirmed = await window.confirmDialog('إلغاء المرتجع؟');
        if (!confirmed) return;
        window.currentRetItems = [];
        window.renderRetItems();
        window.showToast('🗑️ تم الإلغاء', 'info');
    };

    window.updateReturnsStats = function() {
        const total = (window.returns || []).reduce(function(s, r) {
            return s + (parseFloat(r.total) || 0);
        }, 0);

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

        const sorted = window.returns.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 50);

        let html = '<div class="table-header" style="grid-template-columns: 0.5fr 0.8fr 1.3fr 1fr 1fr 1.2fr;">' +
            '<span>#</span><span>النوع</span><span>الجهة</span>' +
            '<span>المبلغ</span><span>التاريخ</span><span></span>' +
        '</div>';

        sorted.forEach(function(r) {
            const isSale = r.type === 'sale';
            const color = isSale ? '#E6A830' : '#4A8AB5';
            html += '<div class="table-row" style="grid-template-columns: 0.5fr 0.8fr 1.3fr 1fr 1fr 1.2fr;">' +
                '<span>#' + r.number + '</span>' +
                '<span style="color:' + color + ';font-size:11px;font-weight:700;">' + (isSale ? '🔄 بيع' : '🔄 شراء') + '</span>' +
                '<span>' + window.escapeHtml(r.party) +
                    (r.warehouseName ? '<br><small style="color:#A89070;font-size:9px;">🏭 ' + window.escapeHtml(r.warehouseName) + '</small>' : '') +
                '</span>' +
                '<span style="color:' + color + ';font-weight:700;">' + window.formatMoney(r.total) + '</span>' +
                '<span style="font-size:10px;color:#A89070;">' + (r.date || '') + '</span>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteReturn(\'' + r.id + '\')"><i class="fas fa-trash"></i></button>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.deleteReturn = async function(id) {
        if (!window.canDelete()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const ret = (window.returns || []).find(function(r) { return r.id == id; });
        if (!ret) return;

        const confirmed = await window.confirmDialog('حذف مرتجع #' + ret.number + '؟');
        if (!confirmed) return;

        // إرجاع المخزون
        (ret.items || []).forEach(function(it) {
            const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
            if (p) {
                if (ret.type === 'sale') {
                    p.qty = Math.max(0, (p.qty || 0) - it.qty);
                    if (ret.warehouseId && p.warehouseStock) {
                        p.warehouseStock[ret.warehouseId] = Math.max(0,
                            (p.warehouseStock[ret.warehouseId] || 0) - it.qty);
                    }
                } else {
                    p.qty = (p.qty || 0) + it.qty;
                    if (ret.warehouseId && p.warehouseStock) {
                        p.warehouseStock[ret.warehouseId] = (p.warehouseStock[ret.warehouseId] || 0) + it.qty;
                    }
                }
            }
        });

        window.treasury = (window.treasury || []).filter(function(t) {
            return !(t.refType === 'return' && t.refId === id);
        });

        window.DataStore.remove('returns', id);
        window.DataStore.set('products', window.products);
        window.DataStore.set('treasury', window.treasury);

        window.showToast('🗑️ تم الحذف', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: الكوبونات
    // ═══════════════════════════════════════════════════════════

    window.calculatePoints = function(amount) {
        return Math.floor((amount || 0) / 100) * window.LOYALTY_CONFIG.POINTS_PER_100;
    };

    window.findCoupon = function(code) {
        if (!code) return null;
        const cleanCode = code.trim().toUpperCase();
        return (window.coupons || []).find(function(c) {
            return c.code && c.code.toUpperCase() === cleanCode && c.active !== false;
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
        window.DataStore.set('coupons', window.coupons);
    };

    window.applyCouponCode = function() {
        const input = document.getElementById('saleCouponCode');
        if (!input) return;

        const code = input.value.trim();
        if (!code) {
            window.showToast('⚠️ أدخل الكود', 'warning');
            return;
        }

        const coupon = window.findCoupon(code);
        if (!coupon) {
            window.showToast('❌ كود غير صحيح', 'error');
            return;
        }

        const subtotal = window.currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
        const validation = window.validateCoupon(coupon, subtotal);

        if (!validation.valid) {
            window.showToast('❌ ' + validation.reason, 'error');
            return;
        }

        window.currentCoupon = coupon;

        const box = document.getElementById('couponInfoBox');
        if (box) {
            box.style.display = 'block';
            box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="color:#2D8F5E;font-size:12px;">🎫 ' + window.escapeHtml(coupon.code) +
                ' - خصم ' + validation.discount.toFixed(2) + ' ج.م</span>' +
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

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: واتساب
    // ═══════════════════════════════════════════════════════════

    window.sendWhatsApp = function(phone, message) {
        if (!phone) {
            window.showToast('⚠️ لا يوجد رقم', 'warning');
            return;
        }

        let cleanPhone = String(phone).replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10 && cleanPhone.startsWith('1')) {
            cleanPhone = '20' + cleanPhone;
        }

        const url = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message);
        window.open(url, '_blank');
    };

    window.sendInvoiceWhatsApp = function(invoiceId) {
        const invoice = (window.sales || []).find(function(s) { return s.id == invoiceId; });
        if (!invoice) {
            window.showToast('⚠️ الفاتورة غير موجودة', 'error');
            return;
        }

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
            lines.push('  ' + (i + 1) + '. ' + item.name + ' × ' + item.qty + ' = ' + window.formatMoney(item.total) + ' ج.م');
        });

        lines.push('');
        lines.push('━━━━━━━━━━━━━━━');
        lines.push('*✅ الإجمالي: ' + window.formatMoney(invoice.total) + ' ج.م*');

        if (!customerPhone) {
            window.promptDialog('📱 أدخل رقم واتساب:', '20').then(function(value) {
                if (value) window.sendWhatsApp(value, lines.join('\n'));
            });
        } else {
            window.sendWhatsApp(customerPhone, lines.join('\n'));
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: عرض الفواتير
    // ═══════════════════════════════════════════════════════════

    window.updateInvoiceStats = function() {
        const total = (window.sales || []).reduce(function(s, i) {
            return s + (parseFloat(i.total) || 0);
        }, 0);
        const today = (window.sales || []).filter(function(s) {
            return s.date === window.getTodayDate();
        }).reduce(function(s, i) {
            return s + (parseFloat(i.total) || 0);
        }, 0);
        const pending = (window.sales || []).filter(function(s) {
            return s.status === 'unpaid' || s.status === 'partial';
        }).reduce(function(s, i) {
            return s + (parseFloat(i.remainingAmount) || 0);
        }, 0);

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
        document.querySelectorAll('#page-invoices .filter-chip').forEach(function(c) {
            c.classList.remove('active');
        });
        if (btn) btn.classList.add('active');
        window.renderInvoices();
    };

    window.renderInvoices = function() {
        const filter = window.currentInvoiceFilter || 'all';
        const c = document.getElementById('invoiceList');
        if (!c) return;

        const searchInput = document.getElementById('invoiceSearch');
        const search = searchInput ? searchInput.value.trim().toLowerCase() : '';

        let filtered = window.sales || [];
        if (filter === 'paid') filtered = filtered.filter(function(i) { return i.status === 'paid'; });
        if (filter === 'unpaid') filtered = filtered.filter(function(i) { return i.status === 'unpaid'; });
        if (filter === 'partial') filtered = filtered.filter(function(i) { return i.status === 'partial'; });

        if (search) {
            filtered = filtered.filter(function(i) {
                return (i.customer || '').toLowerCase().indexOf(search) > -1 ||
                       String(i.number).indexOf(search) > -1;
            });
        }

        if (filtered.length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-file-invoice"></i><span>لا توجد فواتير</span></div>';
            return;
        }

        const sorted = filtered.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        });

        let html = '<div class="table-header" style="grid-template-columns: 0.5fr 1.3fr 1fr 0.8fr 0.7fr 1.5fr;">' +
            '<span>#</span><span>العميل</span><span>المبلغ</span>' +
            '<span>الدفع</span><span>الحالة</span><span></span>' +
        '</div>';

        sorted.forEach(function(inv) {
            const statusLabel = inv.status === 'paid' ? '✅' : inv.status === 'partial' ? '⚠️' : '❌';
            const payIcon = window.getPaymentIcon(inv.paymentMethod);

            html += '<div class="table-row" style="grid-template-columns: 0.5fr 1.3fr 1fr 0.8fr 0.7fr 1.5fr;">' +
                '<span>#' + inv.number + '</span>' +
                '<span>' + window.escapeHtml(inv.customer || 'عميل نقدي') +
                    (inv.warehouseName ? '<br><small style="color:#A89070;font-size:9px;">🏭 ' + window.escapeHtml(inv.warehouseName) + '</small>' : '') +
                '</span>' +
                '<span style="color:#2D8F5E;font-weight:700;">' + window.formatMoney(inv.total) + '</span>' +
                '<span>' + payIcon + '</span>' +
                '<span style="font-size:14px;">' + statusLabel + '</span>' +
                '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                    '<button class="btn btn-info btn-sm" onclick="showInvoiceDetails(\'' + inv.id + '\')"><i class="fas fa-eye"></i></button>' +
                    '<button class="btn btn-success btn-sm" onclick="printInvoice(\'' + inv.id + '\')"><i class="fas fa-print"></i></button>' +
                    '<button class="btn btn-danger btn-sm" onclick="deleteInvoice(\'' + inv.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.showInvoiceDetails = function(id) {
        const inv = (window.sales || []).find(function(s) { return s.id == id; });
        if (!inv) return;

        let itemsHtml = '';
        (inv.items || []).forEach(function(it, i) {
            itemsHtml += '<tr>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;">' + (i + 1) + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;">' + window.escapeHtml(it.name) + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;">' + it.qty + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;">' + window.formatMoney(it.price) + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;color:#2D8F5E;">' + window.formatMoney(it.total) + '</td>' +
            '</tr>';
        });

        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>📄 فاتورة #' + inv.number + '</h3>' +
            '<div style="background:#0D0D0D;padding:14px;border-radius:10px;border:1px solid #2D2D2D;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:12px;">' +
                    '<div><span style="color:#A89070;">العميل:</span> <strong>' + window.escapeHtml(inv.customer || 'عميل نقدي') + '</strong></div>' +
                    '<div><span style="color:#A89070;">التاريخ:</span> ' + (inv.date || '') + ' ' + (inv.time || '') + '</div>' +
                    '<div><span style="color:#A89070;">الحالة:</span> ' + (inv.status === 'paid' ? '✅ مدفوعة' : inv.status === 'partial' ? '⚠️ جزئية' : '❌ غير مدفوعة') + '</div>' +
                    (inv.warehouseName ? '<div style="grid-column:1/-1;color:#4A8AB5;">🏭 ' + window.escapeHtml(inv.warehouseName) + '</div>' : '') +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                    '<thead><tr style="background:#C9A94E;color:#0D0D0D;">' +
                        '<th style="padding:6px;">#</th>' +
                        '<th style="padding:6px;">الصنف</th>' +
                        '<th style="padding:6px;">الكمية</th>' +
                        '<th style="padding:6px;">السعر</th>' +
                        '<th style="padding:6px;">الإجمالي</th>' +
                    '</tr></thead>' +
                    '<tbody>' + itemsHtml + '</tbody>' +
                '</table>' +
                '<div style="margin-top:12px;padding:10px;background:#1A1A1A;border-radius:8px;">' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">' +
                        '<span>المجموع:</span><span>' + window.formatMoney(inv.subtotal || inv.total) + ' ج.م</span>' +
                    '</div>' +
                    (inv.vat > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#9B59B6;"><span>الضريبة:</span><span>' + window.formatMoney(inv.vat) + ' ج.م</span></div>' : '') +
                    (inv.discount > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#E6A830;"><span>الخصم:</span><span>' + window.formatMoney(inv.discount) + ' ج.م</span></div>' : '') +
                    '<div style="display:flex;justify-content:space-between;padding:6px 0;border-top:2px solid #C9A94E;margin-top:6px;font-size:16px;font-weight:900;color:#C9A94E;">' +
                        '<span>الإجمالي:</span><span>' + window.formatMoney(inv.total) + ' ج.م</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

        window.openModal(html);
    };

    window.printInvoice = function(id) {
        const inv = (window.sales || []).find(function(s) { return s.id == id; });
        if (!inv) {
            window.showToast('⚠️ الفاتورة غير موجودة', 'error');
            return;
        }

        const company = window.companyData || { name: 'الميزان' };
        let itemsRows = '';
        (inv.items || []).forEach(function(it, i) {
            itemsRows += '<tr>' +
                '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + (i + 1) + '</td>' +
                '<td style="padding:8px;border:1px solid #ddd;">' + window.escapeHtml(it.name) + '</td>' +
                '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + it.qty + '</td>' +
                '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(it.price) + '</td>' +
                '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(it.total) + '</td>' +
            '</tr>';
        });

        const content = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة #' + inv.number + '</title>' +
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
            '<div class="header"><h1>⚖️ ' + window.escapeHtml(company.name || 'الميزان') + '</h1>' +
            (company.phone ? '<p>📞 ' + window.escapeHtml(company.phone) + '</p>' : '') + '</div>' +
            '<div class="info-box"><div><strong>رقم الفاتورة:</strong> #' + inv.number + '<br>' +
            '<strong>التاريخ:</strong> ' + (inv.date || '') + '<br><strong>الوقت:</strong> ' + (inv.time || '') + '</div>' +
            '<div><strong>العميل:</strong> ' + window.escapeHtml(inv.customer || 'عميل نقدي') + '<br>' +
            '<strong>البائع:</strong> ' + window.escapeHtml(inv.seller || '-') + '<br>' +
            (inv.warehouseName ? '<strong>المستودع:</strong> ' + window.escapeHtml(inv.warehouseName) : '') + '</div></div>' +
            '<table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>' + itemsRows + '</tbody></table>' +
            '<div class="totals"><div><span>المجموع:</span><span>' + window.formatMoney(inv.subtotal || inv.total) + ' ج.م</span></div>' +
            (inv.vat > 0 ? '<div><span>الضريبة:</span><span>' + window.formatMoney(inv.vat) + ' ج.م</span></div>' : '') +
            (inv.discount > 0 ? '<div><span>الخصم:</span><span>- ' + window.formatMoney(inv.discount) + ' ج.م</span></div>' : '') +
            '<div class="final"><span>الإجمالي:</span><span>' + window.formatMoney(inv.total) + ' ج.م</span></div></div>' +
            '<div class="footer">' + window.escapeHtml(company.footer || 'شكراً لتعاملكم معنا 🌟') + '</div>' +
            '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script></body></html>';

        const w = window.open('', '_blank', 'width=900,height=700');
        if (!w) {
            window.showToast('⚠️ يرجى السماح بالنوافذ المنبثقة', 'warning');
            return;
        }
        w.document.write(content);
        w.document.close();
        window.showToast('🖨️ جاري الطباعة...', 'info');
    };

    window.deleteInvoice = async function(id) {
        if (!window.canDelete()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const inv = (window.sales || []).find(function(s) { return s.id == id; });
        if (!inv) return;

        const confirmed = await window.confirmDialog('حذف فاتورة #' + inv.number + '؟');
        if (!confirmed) return;

        // إرجاع المخزون
        (inv.items || []).forEach(function(it) {
            const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
            if (p) {
                p.qty = (p.qty || 0) + it.qty;
                if (inv.warehouseId && p.warehouseStock) {
                    p.warehouseStock[inv.warehouseId] = (p.warehouseStock[inv.warehouseId] || 0) + it.qty;
                }
            }
        });

        // حذف من الخزنة
        window.treasury = (window.treasury || []).filter(function(t) {
            return !(t.refType === 'sale' && t.refId === id);
        });

        window.DataStore.remove('sales', id);
        window.DataStore.set('products', window.products);
        window.DataStore.set('treasury', window.treasury);

        // حذف القيد
        window.Accounting.removeByReference('INV-' + inv.number);
        window.Accounting.removeByReference('INV-' + inv.number + '-COGS');

        window.showToast('🗑️ تم الحذف', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 10: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    // لما يتغير المنتجات أو المخزون، نحدث الكاشير والمشتريات والمرتجعات
    window.EventBus.on('data:products:changed', function() {
        window.populateSaleProducts();
        window.populatePurProducts();
        window.populateRetProducts();
    });

    // ═══════════════════════════════════════════════════════════
// الجزء 11: التبديل بين التحصيل والسداد
// ═══════════════════════════════════════════════════════════

window.switchPayTab = function(tab, btn) {
    window.currentPayTab = tab;

    // تحديث أزرار التبويب
    document.querySelectorAll('#page-payments .tab-btn').forEach(function(b) {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    // إخفاء/إظهار المحتوى
    const collect = document.getElementById('payTabCollect');
    const pay = document.getElementById('payTabPay');

    if (collect) collect.style.display = tab === 'collect' ? 'block' : 'none';
    if (pay) pay.style.display = tab === 'pay' ? 'block' : 'none';

    // تحديث القوائم المنسدلة عند التبديل
    if (tab === 'collect') {
        window.populateCollectCustomers();
        window.populateCashBoxDropdowns();
    } else if (tab === 'pay') {
        window.populatePaySuppliers();
        window.populateCashBoxDropdowns();
    }
};

// ═══════════════════════════════════════════════════════════
// الجزء 12: التحصيل من العملاء
// ═══════════════════════════════════════════════════════════

window.populateCollectCustomers = function() {
    const sel = document.getElementById('collectCustomer');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر عميل...</option>';
    (window.customers || []).forEach(function(c) {
        const bal = window.Balance.customer(c.name);
        const text = window.escapeHtml(c.name) +
            (bal > 0 ? ' (مديونية: ' + window.formatMoney(bal) + ')' : '');
        sel.innerHTML += '<option value="' + window.escapeHtml(c.name) + '">' + text + '</option>';
    });
    sel.value = cv;
};

window.populatePaySuppliers = function() {
    const sel = document.getElementById('paySupplier');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر مورد...</option>';
    (window.suppliers || []).forEach(function(s) {
        const bal = window.Balance.supplier(s.name);
        const text = window.escapeHtml(s.name) +
            (bal > 0 ? ' (مديونية: ' + window.formatMoney(bal) + ')' : '');
        sel.innerHTML += '<option value="' + window.escapeHtml(s.name) + '">' + text + '</option>';
    });
    sel.value = cv;
};

window.updateCollectInfo = function() {
    const name = document.getElementById('collectCustomer') ? document.getElementById('collectCustomer').value : '';
    const box = document.getElementById('collectInfoBox');
    if (!box) return;

    if (!name) {
        box.style.display = 'none';
        return;
    }

    const balance = window.Balance.customer(name);
    box.style.display = 'block';

    const debtEl = document.getElementById('collectCurrentDebt');
    if (debtEl) debtEl.textContent = window.formatMoney(balance);

    const amountInput = document.getElementById('collectAmount');
    if (amountInput) {
        amountInput.max = balance;
        if (balance > 0) amountInput.value = balance.toFixed(2);
    }
};

window.updatePayInfo = function() {
    const name = document.getElementById('paySupplier') ? document.getElementById('paySupplier').value : '';
    const box = document.getElementById('payInfoBox');
    if (!box) return;

    if (!name) {
        box.style.display = 'none';
        return;
    }

    const balance = window.Balance.supplier(name);
    box.style.display = 'block';

    const debtEl = document.getElementById('payCurrentDebt');
    if (debtEl) debtEl.textContent = window.formatMoney(balance);

    const amountInput = document.getElementById('payAmount');
    if (amountInput) {
        amountInput.max = balance;
        if (balance > 0) amountInput.value = balance.toFixed(2);
    }
};

// توزيع دفعة العميل على فواتيره الآجلة
function distributePayment(customerName, amount) {
    const relatedInvoices = [];
    let remaining = amount;

    const customerInvoices = (window.sales || []).filter(function(s) {
        return s.customer === customerName &&
               s.paymentMethod === 'credit' &&
               (s.status === 'unpaid' || s.status === 'partial');
    }).sort(function(a, b) {
        return (a.createdAt || '').localeCompare(b.createdAt || '');
    });

    customerInvoices.forEach(function(inv) {
        if (remaining <= 0.01) return;
        const invRemaining = inv.remainingAmount !== undefined ? inv.remainingAmount : inv.total;
        if (invRemaining <= 0.01) return;

        const pay = Math.min(remaining, invRemaining);
        inv.paidAmount = (inv.paidAmount || 0) + pay;
        inv.remainingAmount = invRemaining - pay;
        inv.status = inv.remainingAmount <= 0.01 ? 'paid' : 'partial';
        if (inv.remainingAmount <= 0.01) inv.remainingAmount = 0;

        relatedInvoices.push({
            invoiceId: inv.id,
            invoiceNumber: inv.number,
            amount: pay
        });
        remaining -= pay;
    });

    return relatedInvoices;
}

// توزيع دفعة المورد على فواتيره الآجلة
function distributePay(supplierName, amount) {
    const relatedInvoices = [];
    let remaining = amount;

    const supplierInvoices = (window.purchases || []).filter(function(p) {
        return p.supplierName === supplierName &&
               p.payment === 'credit' &&
               (p.status === 'unpaid' || p.status === 'partial');
    }).sort(function(a, b) {
        return (a.createdAt || '').localeCompare(b.createdAt || '');
    });

    supplierInvoices.forEach(function(inv) {
        if (remaining <= 0.01) return;
        const invRemaining = inv.remainingAmount !== undefined ? inv.remainingAmount : inv.total;
        if (invRemaining <= 0.01) return;

        const pay = Math.min(remaining, invRemaining);
        inv.paidAmount = (inv.paidAmount || 0) + pay;
        inv.remainingAmount = invRemaining - pay;
        inv.status = inv.remainingAmount <= 0.01 ? 'paid' : 'partial';
        if (inv.remainingAmount <= 0.01) inv.remainingAmount = 0;

        relatedInvoices.push({
            invoiceId: inv.id,
            invoiceNumber: inv.number,
            amount: pay
        });
        remaining -= pay;
    });

    return relatedInvoices;
}

// ═══════════════════════════════════════════════════════════
// الجزء 13: حفظ التحصيل
// ═══════════════════════════════════════════════════════════

window.saveCollect = function() {
    if (!window.canAdd()) {
        window.showToast('⚠️ لا تملك صلاحية', 'error');
        return;
    }

    const party = document.getElementById('collectCustomer') ? document.getElementById('collectCustomer').value : '';
    const amount = parseFloat(document.getElementById('collectAmount') ? document.getElementById('collectAmount').value : 0) || 0;
    const date = (document.getElementById('collectDate') ? document.getElementById('collectDate').value : '') || window.getTodayDate();
    const cashBoxId = document.getElementById('collectCashBox') ? document.getElementById('collectCashBox').value : '';
    const note = document.getElementById('collectNote') ? document.getElementById('collectNote').value.trim() : '';

    if (!party) {
        window.showToast('⚠️ اختر عميل', 'error');
        return;
    }
    if (amount <= 0) {
        window.showToast('⚠️ أدخل مبلغ صحيح', 'error');
        return;
    }
    if (!cashBoxId) {
        window.showToast('⚠️ اختر الخزنة', 'error');
        return;
    }

    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });

    const pay = {
        id: window.generateId('col_'),
        type: 'collect',
        party: party,
        amount: amount,
        date: date,
        time: window.getNowTime(),
        note: note,
        cashBoxId: cashBoxId,
        cashBoxName: box ? box.name : '',
        relatedInvoices: [],
        createdBy: window.currentUser ? window.currentUser.name : ''
    };

    // توزيع المبلغ على الفواتير
    pay.relatedInvoices = distributePayment(party, amount);

    window.DataStore.add('payments', pay);
    window.DataStore.set('sales', window.sales);

    // إضافة للخزنة
    window.DataStore.add('treasury', {
        id: window.generateId('tr_'),
        type: 'deposit',
        amount: amount,
        note: 'تحصيل من ' + party,
        cashBoxId: cashBoxId,
        cashBoxName: box ? box.name : '',
        refType: 'collect',
        refId: pay.id,
        date: date,
        time: window.getNowTime()
    });

    // قيد محاسبي
    window.Accounting.entryCollect(pay);

    // إعادة تعيين
    const amountEl = document.getElementById('collectAmount');
    const noteEl = document.getElementById('collectNote');
    const custEl = document.getElementById('collectCustomer');
    const infoBox = document.getElementById('collectInfoBox');

    if (amountEl) amountEl.value = '';
    if (noteEl) noteEl.value = '';
    if (custEl) custEl.value = '';
    if (infoBox) infoBox.style.display = 'none';

    window.updatePaymentsStats();
    window.showToast('✅ تم تحصيل ' + window.formatMoney(amount) + ' ج.م', 'success');

    // إشعار
    if (typeof window.sendNotification === 'function') {
        window.sendNotification('💵 تحصيل جديد', 'من ' + party + ' - ' + window.formatMoney(amount) + ' ج.م',
            { type: 'success', tag: 'collect-' + Date.now() });
    }
};

// ═══════════════════════════════════════════════════════════
// الجزء 14: حفظ السداد
// ═══════════════════════════════════════════════════════════

window.savePay = function() {
    if (!window.canAdd()) {
        window.showToast('⚠️ لا تملك صلاحية', 'error');
        return;
    }

    const party = document.getElementById('paySupplier') ? document.getElementById('paySupplier').value : '';
    const amount = parseFloat(document.getElementById('payAmount') ? document.getElementById('payAmount').value : 0) || 0;
    const date = (document.getElementById('payDate') ? document.getElementById('payDate').value : '') || window.getTodayDate();
    const cashBoxId = document.getElementById('payCashBox') ? document.getElementById('payCashBox').value : '';
    const note = document.getElementById('payNote') ? document.getElementById('payNote').value.trim() : '';

    if (!party) {
        window.showToast('⚠️ اختر مورد', 'error');
        return;
    }
    if (amount <= 0) {
        window.showToast('⚠️ أدخل مبلغ صحيح', 'error');
        return;
    }
    if (!cashBoxId) {
        window.showToast('⚠️ اختر الخزنة', 'error');
        return;
    }

    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });

    const pay = {
        id: window.generateId('pay_'),
        type: 'pay',
        party: party,
        amount: amount,
        date: date,
        time: window.getNowTime(),
        note: note,
        cashBoxId: cashBoxId,
        cashBoxName: box ? box.name : '',
        relatedInvoices: [],
        createdBy: window.currentUser ? window.currentUser.name : ''
    };

    pay.relatedInvoices = distributePay(party, amount);

    window.DataStore.add('payments', pay);
    window.DataStore.set('purchases', window.purchases);

    // خصم من الخزنة
    window.DataStore.add('treasury', {
        id: window.generateId('tr_'),
        type: 'withdraw',
        amount: amount,
        note: 'سداد لـ ' + party,
        cashBoxId: cashBoxId,
        cashBoxName: box ? box.name : '',
        refType: 'pay',
        refId: pay.id,
        date: date,
        time: window.getNowTime()
    });

    // قيد محاسبي
    window.Accounting.entryPay(pay);

    // إعادة تعيين
    const amountEl = document.getElementById('payAmount');
    const noteEl = document.getElementById('payNote');
    const supEl = document.getElementById('paySupplier');
    const infoBox = document.getElementById('payInfoBox');

    if (amountEl) amountEl.value = '';
    if (noteEl) noteEl.value = '';
    if (supEl) supEl.value = '';
    if (infoBox) infoBox.style.display = 'none';

    window.updatePaymentsStats();
    window.showToast('✅ تم سداد ' + window.formatMoney(amount) + ' ج.م', 'success');

    if (typeof window.sendNotification === 'function') {
        window.sendNotification('💳 سداد جديد', 'لـ ' + party + ' - ' + window.formatMoney(amount) + ' ج.م',
            { type: 'success', tag: 'pay-' + Date.now() });
    }
};

// ═══════════════════════════════════════════════════════════
// الجزء 15: إحصائيات المدفوعات
// ═══════════════════════════════════════════════════════════

window.updatePaymentsStats = function() {
    const collected = (window.payments || []).filter(function(p) { return p.type === 'collect'; })
        .reduce(function(s, p) { return s + (parseFloat(p.amount) || 0); }, 0);
    const paid = (window.payments || []).filter(function(p) { return p.type === 'pay'; })
        .reduce(function(s, p) { return s + (parseFloat(p.amount) || 0); }, 0);

    const set = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('payTotalCollected', window.formatMoney(collected));
    set('payTotalPaid', window.formatMoney(paid));
};

window.renderPayments = function() {
    const c = document.getElementById('paymentsList');
    if (!c) return;

    if ((window.payments || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-hand-holding-usd"></i><span>لا توجد عمليات</span></div>';
        return;
    }

    const sorted = window.payments.slice().sort(function(a, b) {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
    }).slice(0, 50);

    let html = '<div class="table-header" style="grid-template-columns: 0.7fr 1.5fr 1fr 1fr 0.7fr;">' +
        '<span>النوع</span><span>الجهة</span><span>المبلغ</span><span>التاريخ</span><span></span>' +
    '</div>';

    sorted.forEach(function(p) {
        const isCollect = p.type === 'collect';
        const color = isCollect ? '#2D8F5E' : '#E06060';

        html += '<div class="table-row" style="grid-template-columns: 0.7fr 1.5fr 1fr 1fr 0.7fr;">' +
            '<span style="color:' + color + ';font-size:11px;font-weight:700;">' +
                (isCollect ? '💰 تحصيل' : '💸 سداد') + '</span>' +
            '<span>' + window.escapeHtml(p.party) + '</span>' +
            '<span style="color:' + color + ';font-weight:700;">' + window.formatMoney(p.amount) + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + (p.date || '') + '</span>' +
            '<button class="btn btn-info btn-sm" onclick="showReceipt(\'' + p.id + '\')"><i class="fas fa-receipt"></i></button>' +
        '</div>';
    });

    c.innerHTML = html;
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
                '<h2 style="color:' + color + ';font-size:20px;">' +
                    window.escapeHtml((window.companyData || {}).name || 'الميزان') + '</h2>' +
                '<p style="font-size:12px;">' + label + '</p>' +
            '</div>' +
            '<div style="padding:10px 0;border-bottom:1px dashed #333;margin-bottom:12px;">' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;">' +
                    '<span>رقم الإيصال:</span><span>#' + String(pay.id).slice(-6) + '</span>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;">' +
                    '<span>التاريخ:</span><span>' + pay.date + '</span>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;">' +
                    '<span>' + (isCollect ? 'العميل' : 'المورد') + ':</span>' +
                    '<span>' + window.escapeHtml(pay.party) + '</span>' +
                '</div>' +
            '</div>' +
            '<div style="text-align:center;padding:15px;border:2px solid ' + color + ';border-radius:8px;margin:12px 0;background:#f9f9f9;">' +
                '<div style="font-size:12px;color:#555;margin-bottom:6px;">' +
                    (isCollect ? 'المبلغ المستلم' : 'المبلغ المدفوع') + '</div>' +
                '<div style="font-size:26px;font-weight:900;color:' + color + ';">' +
                    window.formatMoney(pay.amount) + ' ج.م</div>' +
            '</div>' +
            '<div style="text-align:center;margin-top:12px;padding-top:10px;border-top:2px dashed #333;font-size:11px;color:#666;">' +
                window.escapeHtml((window.companyData || {}).footer || 'شكراً لتعاملكم معنا 🌟') +
            '</div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

    window.openModal(html);
};
    
    window.__posLoaded = true;
    console.log('✅ pos.js v18.0 جاهز');

})();
