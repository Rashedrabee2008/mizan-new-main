// ============================================================
// الميزان Pro - warehouses.js
// إدارة المخازن الكاملة: أذون + تحويلات + تسويات + جرد + تقارير
// ============================================================

(function() {
    'use strict';

    console.log('🏭 warehouses.js v18.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الحالة العامة
    // ═══════════════════════════════════════════════════════════

    // الأصناف الحالية للإذن (مؤقت)
    window.currentVoucherItems = [];
    window.currentVoucherType = '';

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: التنقل بين تبويبات المخازن
    // ═══════════════════════════════════════════════════════════

    window.showWarehouseTab = function(tab, btn) {
        const tabs = ['receipts', 'issues', 'transfers', 'adjustments', 'opening', 'reports'];

        tabs.forEach(function(t) {
            const el = document.getElementById('whTab' + t.charAt(0).toUpperCase() + t.slice(1));
            if (el) el.style.display = 'none';
        });

        const target = document.getElementById('whTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
        if (target) target.style.display = 'block';

        document.querySelectorAll('#page-warehouses .tab-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        if (btn) btn.classList.add('active');

        // ملء القوائم
        window.populateWarehouseDropdowns();

        // عرض السجل المناسب
        if (tab === 'receipts') window.renderWarehouseReceipts();
        if (tab === 'issues') window.renderWarehouseIssues();
        if (tab === 'transfers') window.renderWarehouseTransfers();
        if (tab === 'adjustments') window.renderWarehouseAdjustments();
        if (tab === 'opening') window.renderOpeningBalances();
        if (tab === 'reports') window.renderWarehouseReportsList();

        // إعادة تعيين الأصناف
        window.currentVoucherItems = [];
        window.currentVoucherType = tab;
        window.renderVoucherItems();
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: ملء القوائم المنسدلة
    // ═══════════════════════════════════════════════════════════

    window.populateWarehouseDropdowns = function() {
        // المستودعات في كل الأذون
        const warehouseSelects = [
            'whReceiptWarehouse', 'whIssueWarehouse',
            'whTransferFrom', 'whTransferTo',
            'whAdjustWarehouse', 'obWarehouse'
        ];

        warehouseSelects.forEach(function(id) {
            const sel = document.getElementById(id);
            if (!sel) return;
            const cv = sel.value;
            let html = '<option value="">اختر المستودع...</option>';
            (window.warehouses || []).forEach(function(w) {
                if (w.active !== false) {
                    html += '<option value="' + w.id + '">' +
                        window.escapeHtml(w.name) + '</option>';
                }
            });
            sel.innerHTML = html;
            if (cv && Array.from(sel.options).some(function(o) { return o.value == cv; })) {
                sel.value = cv;
            }
        });

        // الموردين
        const supSel = document.getElementById('whReceiptSupplier');
        if (supSel) {
            const cv = supSel.value;
            let html = '<option value="">اختر مورد (اختياري)</option>';
            (window.suppliers || []).forEach(function(s) {
                html += '<option value="' + window.escapeHtml(s.name) + '">' +
                    window.escapeHtml(s.name) + '</option>';
            });
            supSel.innerHTML = html;
            supSel.value = cv;
        }

        // العملاء (للصرف)
        const cusSel = document.getElementById('whIssueCustomer');
        if (cusSel) {
            const cv = cusSel.value;
            let html = '<option value="">اختر عميل (اختياري)</option>';
            (window.customers || []).forEach(function(c) {
                html += '<option value="' + window.escapeHtml(c.name) + '">' +
                    window.escapeHtml(c.name) + '</option>';
            });
            cusSel.innerHTML = html;
            cusSel.value = cv;
        }

        // المنتج العام للأصناف
        const voucherProduct = document.getElementById('whVoucherProduct');
        if (voucherProduct) {
            const cv = voucherProduct.value;
            let html = '<option value="">اختر منتج...</option>';
            (window.products || []).forEach(function(p) {
                html += '<option value="' + p.id + '">' +
                    window.escapeHtml(p.name) + ' (متاح: ' + (p.qty || 0) + ')</option>';
            });
            voucherProduct.innerHTML = html;
            if (cv) voucherProduct.value = cv;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: إدارة أصناف الإذن (من القسم العام)
    // ═══════════════════════════════════════════════════════════

    window.addVoucherItemFromGlobal = function() {
        const productId = document.getElementById('whVoucherProduct') ? document.getElementById('whVoucherProduct').value : '';
        const qtyInput = document.getElementById('whVoucherQty');
        const priceInput = document.getElementById('whVoucherPrice');

        let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
        let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

        if (!productId) {
            window.showToast('⚠️ اختر منتج', 'error');
            return;
        }

        const product = (window.products || []).find(function(p) { return p.id == productId; });
        if (!product) return;

        if (qty <= 0) qty = 1;
        if (price <= 0) price = product.buy || 0;

        const existing = window.currentVoucherItems.find(function(i) { return i.productId == productId; });
        if (existing) {
            existing.qty += qty;
            existing.total = existing.qty * existing.price;
        } else {
            window.currentVoucherItems.push({
                productId: product.id,
                name: product.name,
                barcode: product.barcode || '',
                qty: qty,
                price: price,
                total: qty * price,
                actualQty: qty,
                systemQty: product.qty || 0
            });
        }

        if (qtyInput) qtyInput.value = 1;
        if (priceInput) priceInput.value = '';
        if (document.getElementById('whVoucherProduct')) {
            document.getElementById('whVoucherProduct').value = '';
        }

        window.renderVoucherItems();
        window.showToast('✅ تم إضافة ' + product.name, 'success');
    };

    // نسخة قديمة للتوافق (لا تُستخدم)
    window.addVoucherItem = function(type) {
        const prefix = type;
        const productId = document.getElementById(prefix + 'Product') ? document.getElementById(prefix + 'Product').value : '';
        const qtyInput = document.getElementById(prefix + 'Qty');
        const priceInput = document.getElementById(prefix + 'Price');
        const actualQtyInput = document.getElementById(prefix + 'ActualQty');

        let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
        let price = parseFloat(priceInput ? priceInput.value : 0) || 0;
        let actualQty = actualQtyInput ? (parseInt(actualQtyInput.value) || 0) : qty;

        if (!productId) {
            window.showToast('⚠️ اختر منتج', 'error');
            return;
        }

        const product = (window.products || []).find(function(p) { return p.id == productId; });
        if (!product) return;

        if (qty <= 0) qty = 1;
        if (price <= 0) price = product.buy || 0;

        const existing = window.currentVoucherItems.find(function(i) { return i.productId == productId; });
        if (existing) {
            existing.qty += qty;
            existing.total = existing.qty * existing.price;
        } else {
            window.currentVoucherItems.push({
                productId: product.id,
                name: product.name,
                barcode: product.barcode || '',
                qty: qty,
                price: price,
                total: qty * price,
                actualQty: actualQty,
                systemQty: product.qty || 0
            });
        }

        if (qtyInput) qtyInput.value = 1;
        if (priceInput) priceInput.value = '';
        if (actualQtyInput) actualQtyInput.value = '';
        if (document.getElementById(prefix + 'Product')) {
            document.getElementById(prefix + 'Product').value = '';
        }

        window.renderVoucherItems();
        window.showToast('✅ تم إضافة ' + product.name, 'success');
    };

    window.removeVoucherItem = function(index) {
        window.currentVoucherItems.splice(index, 1);
        window.renderVoucherItems();
    };

    window.renderVoucherItems = function() {
        const container = document.getElementById('whVoucherItemsContainer');
        const totalsBox = document.getElementById('whVoucherTotalsBox');

        if (!container) return;

        if (window.currentVoucherItems.length === 0) {
            container.innerHTML = '<div class="empty-items">' +
                '<i class="fas fa-boxes"></i>' +
                '<span>لا توجد أصناف</span>' +
                '<small>أضف صنف من الأعلى</small>' +
            '</div>';
            if (totalsBox) totalsBox.style.display = 'none';
            return;
        }

        let html = '<div class="items-header-row" style="grid-template-columns: 40px 2fr 0.8fr 0.9fr 1fr 40px;">' +
            '<span>#</span>' +
            '<span>الصنف</span>' +
            '<span>الكمية</span>' +
            '<span>السعر</span>' +
            '<span>الإجمالي</span>' +
            '<span></span>' +
        '</div>';

        window.currentVoucherItems.forEach(function(item, i) {
            html += '<div class="item-row" style="grid-template-columns: 40px 2fr 0.8fr 0.9fr 1fr 40px;">' +
                '<span class="item-id">' + (i + 1) + '</span>' +
                '<span class="item-name">' + window.escapeHtml(item.name) +
                    (item.barcode ? '<br><small style="color:#A89070;font-size:9px;">' + window.escapeHtml(item.barcode) + '</small>' : '') +
                '</span>' +
                '<span class="item-qty">' + item.qty + '</span>' +
                '<span class="item-price">' + window.formatMoney(item.price) + '</span>' +
                '<span class="item-total">' + window.formatMoney(item.total) + '</span>' +
                '<button class="item-delete" onclick="removeVoucherItem(' + i + ')"><i class="fas fa-times"></i></button>' +
            '</div>';
        });

        container.innerHTML = html;

        // الإجماليات
        const totalItems = window.currentVoucherItems.length;
        const totalQty = window.currentVoucherItems.reduce(function(s, i) { return s + i.qty; }, 0);
        const totalValue = window.currentVoucherItems.reduce(function(s, i) { return s + i.total; }, 0);

        const set = function(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        set('whVoucherItemsCount', totalItems);
        set('whVoucherTotalQty', totalQty);
        set('whVoucherTotalValue', window.formatMoney(totalValue) + ' ج.م');

        if (totalsBox) totalsBox.style.display = 'block';
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: إذن الإضافة
    // ═══════════════════════════════════════════════════════════

    window.createWarehouseReceipt = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const warehouseId = document.getElementById('whReceiptWarehouse') ? document.getElementById('whReceiptWarehouse').value : '';
        const source = document.getElementById('whReceiptSource') ? document.getElementById('whReceiptSource').value.trim() : '';
        const supplier = document.getElementById('whReceiptSupplier') ? document.getElementById('whReceiptSupplier').value : '';
        const date = document.getElementById('whReceiptDate') ? document.getElementById('whReceiptDate').value : window.getTodayDate();
        const notes = document.getElementById('whReceiptNotes') ? document.getElementById('whReceiptNotes').value.trim() : '';

        if (!warehouseId) {
            window.showToast('⚠️ اختر المستودع', 'error');
            return;
        }
        if (window.currentVoucherItems.length === 0) {
            window.showToast('⚠️ لا توجد أصناف', 'error');
            return;
        }

        const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });

        // زيادة المخزون
        window.currentVoucherItems.forEach(function(item) {
            const p = (window.products || []).find(function(pr) { return pr.id == item.productId; });
            if (p) {
                p.qty = (p.qty || 0) + item.qty;
                if (item.price > 0) p.buy = item.price;

                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[warehouseId] = (p.warehouseStock[warehouseId] || 0) + item.qty;
            }
        });

        const totalValue = window.currentVoucherItems.reduce(function(s, i) { return s + (i.qty * i.price); }, 0);

        const receipt = {
            id: window.generateId('rec_'),
            number: (window.warehouseReceipts || []).length + 1,
            warehouseId: warehouseId,
            warehouseName: warehouse ? warehouse.name : '',
            source: source,
            supplier: supplier,
            notes: notes,
            items: JSON.parse(JSON.stringify(window.currentVoucherItems)),
            totalValue: totalValue,
            date: date,
            time: window.getNowTime(),
            createdBy: window.currentUser ? window.currentUser.name : '',
            type: 'receipt'
        };

        window.DataStore.add('warehouseReceipts', receipt);
        window.DataStore.set('products', window.products);

        window.resetVoucherForm('receipt');
        window.renderWarehouseReceipts();

        window.showToast('✅ إذن إضافة #' + receipt.number, 'success');
    };

    window.resetVoucherForm = function(type) {
        window.currentVoucherItems = [];
        window.renderVoucherItems();

        if (type === 'receipt') {
            ['whReceiptSource', 'whReceiptNotes'].forEach(function(id) {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const dateEl = document.getElementById('whReceiptDate');
            if (dateEl) dateEl.value = window.getTodayDate();
        }

        if (type === 'issue') {
            ['whIssueDestination', 'whIssueNotes'].forEach(function(id) {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const dateEl = document.getElementById('whIssueDate');
            if (dateEl) dateEl.value = window.getTodayDate();
        }

        if (type === 'transfer') {
            const notesEl = document.getElementById('whTransferNotes');
            if (notesEl) notesEl.value = '';
            const dateEl = document.getElementById('whTransferDate');
            if (dateEl) dateEl.value = window.getTodayDate();
        }

        if (type === 'adjustment') {
            const notesEl = document.getElementById('whAdjustNotes');
            if (notesEl) notesEl.value = '';
            const dateEl = document.getElementById('whAdjustDate');
            if (dateEl) dateEl.value = window.getTodayDate();
        }

        if (type === 'opening') {
            const notesEl = document.getElementById('obNotes');
            if (notesEl) notesEl.value = '';
            const dateEl = document.getElementById('obDate');
            if (dateEl) dateEl.value = window.getTodayDate();
        }
    };

    window.renderWarehouseReceipts = function() {
        const c = document.getElementById('whReceiptsList');
        if (!c) return;

        if ((window.warehouseReceipts || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-arrow-down"></i><span>لا توجد أذون إضافة</span></div>';
            return;
        }

        const sorted = window.warehouseReceipts.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 30);

        let html = '';
        sorted.forEach(function(r) {
            html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid #2D8F5E;padding:12px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                    '<strong style="color:#2D8F5E;font-size:13px;">📥 إذن إضافة #' + r.number + '</strong>' +
                    '<span style="font-size:10px;color:#A89070;">' + (r.date || '') + '</span>' +
                '</div>' +
                '<div style="font-size:11px;color:#A89070;margin-bottom:4px;">🏭 ' + window.escapeHtml(r.warehouseName) + '</div>' +
                (r.supplier ? '<div style="font-size:11px;color:#A89070;">🚚 ' + window.escapeHtml(r.supplier) + '</div>' : '') +
                (r.source ? '<div style="font-size:11px;color:#A89070;">📍 ' + window.escapeHtml(r.source) + '</div>' : '') +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:6px;border-top:1px dashed #2D2D2D;margin-top:6px;">' +
                    '<span style="color:#A89070;">' + r.items.length + ' صنف</span>' +
                    '<div style="display:flex;gap:6px;align-items:center;">' +
                        '<strong style="color:#2D8F5E;">' + window.formatMoney(r.totalValue) + ' ج.م</strong>' +
                        '<button onclick="viewVoucherDetails(\'warehouseReceipts\', \'' + r.id + '\')" style="background:#4A8AB5;border:none;color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;">👁️</button>' +
                        '<button onclick="deleteVoucher(\'warehouseReceipts\', \'' + r.id + '\')" style="background:#E06060;border:none;color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;">🗑️</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: إذن الصرف
    // ═══════════════════════════════════════════════════════════

    window.createWarehouseIssue = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const warehouseId = document.getElementById('whIssueWarehouse') ? document.getElementById('whIssueWarehouse').value : '';
        const destination = document.getElementById('whIssueDestination') ? document.getElementById('whIssueDestination').value.trim() : '';
        const customer = document.getElementById('whIssueCustomer') ? document.getElementById('whIssueCustomer').value : '';
        const date = document.getElementById('whIssueDate') ? document.getElementById('whIssueDate').value : window.getTodayDate();
        const notes = document.getElementById('whIssueNotes') ? document.getElementById('whIssueNotes').value.trim() : '';

        if (!warehouseId) {
            window.showToast('⚠️ اختر المستودع', 'error');
            return;
        }
        if (window.currentVoucherItems.length === 0) {
            window.showToast('⚠️ لا توجد أصناف', 'error');
            return;
        }

        // التحقق من المخزون
        for (let i = 0; i < window.currentVoucherItems.length; i++) {
            const item = window.currentVoucherItems[i];
            const p = (window.products || []).find(function(pr) { return pr.id == item.productId; });
            if (!p) {
                window.showToast('⚠️ المنتج غير موجود', 'error');
                return;
            }
            const whQty = (p.warehouseStock && p.warehouseStock[warehouseId]) || 0;
            if (whQty < item.qty) {
                window.showToast('⚠️ الكمية غير كافية: ' + p.name + ' (متاح: ' + whQty + ')', 'error');
                return;
            }
        }

        const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });

        // خصم من المخزون
        window.currentVoucherItems.forEach(function(item) {
            const p = (window.products || []).find(function(pr) { return pr.id == item.productId; });
            if (p) {
                p.qty = Math.max(0, (p.qty || 0) - item.qty);
                if (p.warehouseStock && p.warehouseStock[warehouseId]) {
                    p.warehouseStock[warehouseId] = Math.max(0,
                        (p.warehouseStock[warehouseId] || 0) - item.qty);
                }
            }
        });

        const totalValue = window.currentVoucherItems.reduce(function(s, i) { return s + (i.qty * i.price); }, 0);

        const issue = {
            id: window.generateId('iss_'),
            number: (window.warehouseIssues || []).length + 1,
            warehouseId: warehouseId,
            warehouseName: warehouse ? warehouse.name : '',
            destination: destination,
            customer: customer,
            notes: notes,
            items: JSON.parse(JSON.stringify(window.currentVoucherItems)),
            totalValue: totalValue,
            date: date,
            time: window.getNowTime(),
            createdBy: window.currentUser ? window.currentUser.name : '',
            type: 'issue'
        };

        window.DataStore.add('warehouseIssues', issue);
        window.DataStore.set('products', window.products);

        window.resetVoucherForm('issue');
        window.renderWarehouseIssues();

        window.showToast('✅ إذن صرف #' + issue.number, 'success');
    };

    window.renderWarehouseIssues = function() {
        const c = document.getElementById('whIssuesList');
        if (!c) return;

        if ((window.warehouseIssues || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-arrow-up"></i><span>لا توجد أذون صرف</span></div>';
            return;
        }

        const sorted = window.warehouseIssues.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 30);

        let html = '';
        sorted.forEach(function(r) {
            html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid #E06060;padding:12px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                    '<strong style="color:#E06060;font-size:13px;">📤 إذن صرف #' + r.number + '</strong>' +
                    '<span style="font-size:10px;color:#A89070;">' + (r.date || '') + '</span>' +
                '</div>' +
                '<div style="font-size:11px;color:#A89070;margin-bottom:4px;">🏭 ' + window.escapeHtml(r.warehouseName) + '</div>' +
                (r.destination ? '<div style="font-size:11px;color:#A89070;">📍 ' + window.escapeHtml(r.destination) + '</div>' : '') +
                (r.customer ? '<div style="font-size:11px;color:#A89070;">👤 ' + window.escapeHtml(r.customer) + '</div>' : '') +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:6px;border-top:1px dashed #2D2D2D;margin-top:6px;">' +
                    '<span style="color:#A89070;">' + r.items.length + ' صنف</span>' +
                    '<div style="display:flex;gap:6px;align-items:center;">' +
                        '<strong style="color:#E06060;">' + window.formatMoney(r.totalValue) + ' ج.م</strong>' +
                        '<button onclick="viewVoucherDetails(\'warehouseIssues\', \'' + r.id + '\')" style="background:#4A8AB5;border:none;color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;">👁️</button>' +
                        '<button onclick="deleteVoucher(\'warehouseIssues\', \'' + r.id + '\')" style="background:#E06060;border:none;color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;">🗑️</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: التحويل بين المستودعات
    // ═══════════════════════════════════════════════════════════

    window.createWarehouseTransfer = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const fromId = document.getElementById('whTransferFrom') ? document.getElementById('whTransferFrom').value : '';
        const toId = document.getElementById('whTransferTo') ? document.getElementById('whTransferTo').value : '';
        const date = document.getElementById('whTransferDate') ? document.getElementById('whTransferDate').value : window.getTodayDate();
        const notes = document.getElementById('whTransferNotes') ? document.getElementById('whTransferNotes').value.trim() : '';

        if (!fromId) {
            window.showToast('⚠️ اختر المستودع المصدر', 'error');
            return;
        }
        if (!toId) {
            window.showToast('⚠️ اختر المستودع الهدف', 'error');
            return;
        }
        if (fromId === toId) {
            window.showToast('⚠️ لا يمكن التحويل لنفس المستودع', 'error');
            return;
        }
        if (window.currentVoucherItems.length === 0) {
            window.showToast('⚠️ لا توجد أصناف', 'error');
            return;
        }

        // التحقق من المخزون في المصدر
        for (let i = 0; i < window.currentVoucherItems.length; i++) {
            const item = window.currentVoucherItems[i];
            const p = (window.products || []).find(function(pr) { return pr.id == item.productId; });
            if (!p) {
                window.showToast('⚠️ المنتج غير موجود', 'error');
                return;
            }
            const whQty = (p.warehouseStock && p.warehouseStock[fromId]) || 0;
            if (whQty < item.qty) {
                window.showToast('⚠️ الكمية غير كافية: ' + p.name + ' (متاح: ' + whQty + ')', 'error');
                return;
            }
        }

        const fromWh = (window.warehouses || []).find(function(w) { return w.id == fromId; });
        const toWh = (window.warehouses || []).find(function(w) { return w.id == toId; });

        // التحويل
        window.currentVoucherItems.forEach(function(item) {
            const p = (window.products || []).find(function(pr) { return pr.id == item.productId; });
            if (p) {
                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[fromId] = Math.max(0, (p.warehouseStock[fromId] || 0) - item.qty);
                p.warehouseStock[toId] = (p.warehouseStock[toId] || 0) + item.qty;
            }
        });

        const totalValue = window.currentVoucherItems.reduce(function(s, i) { return s + (i.qty * i.price); }, 0);

        const transfer = {
            id: window.generateId('trf_'),
            number: (window.warehouseTransfers || []).length + 1,
            fromId: fromId,
            fromName: fromWh ? fromWh.name : '',
            toId: toId,
            toName: toWh ? toWh.name : '',
            notes: notes,
            items: JSON.parse(JSON.stringify(window.currentVoucherItems)),
            totalValue: totalValue,
            date: date,
            time: window.getNowTime(),
            createdBy: window.currentUser ? window.currentUser.name : '',
            type: 'transfer'
        };

        window.DataStore.add('warehouseTransfers', transfer);
        window.DataStore.set('products', window.products);

        window.resetVoucherForm('transfer');
        window.renderWarehouseTransfers();

        window.showToast('✅ تحويل #' + transfer.number, 'success');
    };

    window.renderWarehouseTransfers = function() {
        const c = document.getElementById('whTransfersList');
        if (!c) return;

        if ((window.warehouseTransfers || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-exchange-alt"></i><span>لا توجد تحويلات</span></div>';
            return;
        }

        const sorted = window.warehouseTransfers.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 30);

        let html = '';
        sorted.forEach(function(r) {
            html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid #4A8AB5;padding:12px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                    '<strong style="color:#4A8AB5;font-size:13px;">🔄 تحويل #' + r.number + '</strong>' +
                    '<span style="font-size:10px;color:#A89070;">' + (r.date || '') + '</span>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:11px;">' +
                    '<span style="color:#E06060;">📤 ' + window.escapeHtml(r.fromName) + '</span>' +
                    '<i class="fas fa-arrow-left" style="color:#C9A94E;"></i>' +
                    '<span style="color:#2D8F5E;">📥 ' + window.escapeHtml(r.toName) + '</span>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:6px;border-top:1px dashed #2D2D2D;">' +
                    '<span style="color:#A89070;">' + r.items.length + ' صنف</span>' +
                    '<div style="display:flex;gap:6px;align-items:center;">' +
                        '<strong style="color:#4A8AB5;">' + window.formatMoney(r.totalValue) + ' ج.م</strong>' +
                        '<button onclick="viewVoucherDetails(\'warehouseTransfers\', \'' + r.id + '\')" style="background:#4A8AB5;border:none;color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;">👁️</button>' +
                        '<button onclick="deleteVoucher(\'warehouseTransfers\', \'' + r.id + '\')" style="background:#E06060;border:none;color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;">🗑️</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: تسوية الجرد
    // ═══════════════════════════════════════════════════════════

    window.createWarehouseAdjustment = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const warehouseId = document.getElementById('whAdjustWarehouse') ? document.getElementById('whAdjustWarehouse').value : '';
        const date = document.getElementById('whAdjustDate') ? document.getElementById('whAdjustDate').value : window.getTodayDate();
        const notes = document.getElementById('whAdjustNotes') ? document.getElementById('whAdjustNotes').value.trim() : '';

        if (!warehouseId) {
            window.showToast('⚠️ اختر المستودع', 'error');
            return;
        }
        if (window.currentVoucherItems.length === 0) {
            window.showToast('⚠️ لا توجد أصناف', 'error');
            return;
        }

        const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });

        // تعديل الكميات
        window.currentVoucherItems.forEach(function(item) {
            const p = (window.products || []).find(function(pr) { return pr.id == item.productId; });
            if (p) {
                const currentQty = p.qty || 0;
                const actualQty = item.actualQty !== undefined ? item.actualQty : item.qty;
                item.diff = actualQty - currentQty;
                item.systemQty = currentQty;

                p.qty = Math.max(0, actualQty);

                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[warehouseId] = Math.max(0, actualQty);
            }
        });

        const totalValue = window.currentVoucherItems.reduce(function(s, i) {
            return s + ((i.actualQty || i.qty) * i.price);
        }, 0);

        const adjustment = {
            id: window.generateId('adj_'),
            number: (window.warehouseAdjustments || []).length + 1,
            warehouseId: warehouseId,
            warehouseName: warehouse ? warehouse.name : '',
            notes: notes,
            items: JSON.parse(JSON.stringify(window.currentVoucherItems)),
            totalValue: totalValue,
            date: date,
            time: window.getNowTime(),
            createdBy: window.currentUser ? window.currentUser.name : '',
            type: 'adjustment'
        };

        window.DataStore.add('warehouseAdjustments', adjustment);
        window.DataStore.set('products', window.products);

        window.resetVoucherForm('adjustment');
        window.renderWarehouseAdjustments();

        window.showToast('✅ تسوية #' + adjustment.number, 'success');
    };

    window.renderWarehouseAdjustments = function() {
        const c = document.getElementById('whAdjustmentsList');
        if (!c) return;

        if ((window.warehouseAdjustments || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-balance-scale"></i><span>لا توجد تسويات</span></div>';
            return;
        }

        const sorted = window.warehouseAdjustments.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 30);

        let html = '';
        sorted.forEach(function(r) {
            html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid #E6A830;padding:12px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                    '<strong style="color:#E6A830;font-size:13px;">⚖️ تسوية #' + r.number + '</strong>' +
                    '<span style="font-size:10px;color:#A89070;">' + (r.date || '') + '</span>' +
                '</div>' +
                '<div style="font-size:11px;color:#A89070;margin-bottom:6px;">🏭 ' + window.escapeHtml(r.warehouseName) + '</div>' +
                '<div style="font-size:12px;text-align:center;padding:6px;background:#0D0D0D;border-radius:6px;">' +
                    r.items.length + ' صنف تم جرده' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:6px;border-top:1px dashed #2D2D2D;margin-top:6px;">' +
                    '<span style="color:#A89070;">القيمة:</span>' +
                    '<div style="display:flex;gap:6px;align-items:center;">' +
                        '<strong style="color:#E6A830;">' + window.formatMoney(r.totalValue) + ' ج.م</strong>' +
                        '<button onclick="viewVoucherDetails(\'warehouseAdjustments\', \'' + r.id + '\')" style="background:#4A8AB5;border:none;color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;">👁️</button>' +
                        '<button onclick="deleteVoucher(\'warehouseAdjustments\', \'' + r.id + '\')" style="background:#E06060;border:none;color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;">🗑️</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: رصيد أول المدة
    // ═══════════════════════════════════════════════════════════

    window.saveOpeningBalance = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const warehouseId = document.getElementById('obWarehouse') ? document.getElementById('obWarehouse').value : '';
        const date = document.getElementById('obDate') ? document.getElementById('obDate').value : window.getTodayDate();
        const notes = document.getElementById('obNotes') ? document.getElementById('obNotes').value.trim() : '';

        if (!warehouseId) {
            window.showToast('⚠️ اختر المستودع', 'error');
            return;
        }
        if (window.currentVoucherItems.length === 0) {
            window.showToast('⚠️ لا توجد أصناف', 'error');
            return;
        }

        const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });

        // إضافة للمخزون
        window.currentVoucherItems.forEach(function(item) {
            const p = (window.products || []).find(function(pr) { return pr.id == item.productId; });
            if (p) {
                p.qty = (p.qty || 0) + item.qty;
                if (item.price > 0) p.buy = item.price;

                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[warehouseId] = (p.warehouseStock[warehouseId] || 0) + item.qty;
            }
        });

        const totalValue = window.currentVoucherItems.reduce(function(s, i) { return s + (i.qty * i.price); }, 0);

        const ob = {
            id: window.generateId('ob_'),
            number: (window.openingBalances || []).length + 1,
            warehouseId: warehouseId,
            warehouseName: warehouse ? warehouse.name : '',
            notes: notes,
            items: JSON.parse(JSON.stringify(window.currentVoucherItems)),
            totalValue: totalValue,
            date: date,
            time: window.getNowTime(),
            createdBy: window.currentUser ? window.currentUser.name : '',
            type: 'opening'
        };

        window.DataStore.add('openingBalances', ob);
        window.DataStore.set('products', window.products);

        window.resetVoucherForm('opening');
        window.renderOpeningBalances();

        window.showToast('✅ رصيد أول المدة #' + ob.number, 'success');
    };

    window.renderOpeningBalances = function() {
        const c = document.getElementById('obList');
        if (!c) return;

        if ((window.openingBalances || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-flag"></i><span>لا يوجد رصيد أول المدة</span></div>';
            return;
        }

        const sorted = window.openingBalances.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 30);

        let html = '';
        sorted.forEach(function(r) {
            html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid #9B59B6;padding:12px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                    '<strong style="color:#9B59B6;font-size:13px;">📊 أول المدة #' + r.number + '</strong>' +
                    '<span style="font-size:10px;color:#A89070;">' + (r.date || '') + '</span>' +
                '</div>' +
                '<div style="font-size:11px;color:#A89070;margin-bottom:6px;">🏭 ' + window.escapeHtml(r.warehouseName) + '</div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:6px;border-top:1px dashed #2D2D2D;">' +
                    '<span style="color:#A89070;">' + r.items.length + ' صنف</span>' +
                    '<div style="display:flex;gap:6px;align-items:center;">' +
                        '<strong style="color:#9B59B6;">' + window.formatMoney(r.totalValue) + ' ج.م</strong>' +
                        '<button onclick="viewVoucherDetails(\'openingBalances\', \'' + r.id + '\')" style="background:#4A8AB5;border:none;color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;">👁️</button>' +
                        '<button onclick="deleteVoucher(\'openingBalances\', \'' + r.id + '\')" style="background:#E06060;border:none;color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;">🗑️</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 10: عرض تفاصيل وحذف أي إذن
    // ═══════════════════════════════════════════════════════════

    window.viewVoucherDetails = function(collection, id) {
        const item = (window[collection] || []).find(function(r) { return r.id == id; });
        if (!item) return;

        const typeLabels = {
            'warehouseReceipts': { icon: '📥', label: 'إذن إضافة', color: '#2D8F5E' },
            'warehouseIssues': { icon: '📤', label: 'إذن صرف', color: '#E06060' },
            'warehouseTransfers': { icon: '🔄', label: 'تحويل', color: '#4A8AB5' },
            'warehouseAdjustments': { icon: '⚖️', label: 'تسوية', color: '#E6A830' },
            'openingBalances': { icon: '📊', label: 'أول المدة', color: '#9B59B6' }
        };

        const meta = typeLabels[collection] || { icon: '📋', label: 'إذن', color: '#C9A94E' };

        let itemsHtml = '';
        (item.items || []).forEach(function(it, i) {
            itemsHtml += '<tr>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;font-size:11px;">' + (i + 1) + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;font-size:11px;">' + window.escapeHtml(it.name) + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;font-size:11px;">' + it.qty + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;font-size:11px;">' + window.formatMoney(it.price) + '</td>' +
                '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;font-size:11px;color:' + meta.color + ';">' +
                    window.formatMoney(it.total || (it.qty * it.price)) + '</td>' +
            '</tr>';
        });

        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>' + meta.icon + ' ' + meta.label + ' #' + item.number + '</h3>' +
            '<div style="background:#0D0D0D;padding:14px;border-radius:10px;border:1px solid #2D2D2D;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:12px;">' +
                    '<div><span style="color:#A89070;">التاريخ:</span> ' + (item.date || '') + '</div>' +
                    '<div><span style="color:#A89070;">الوقت:</span> ' + (item.time || '') + '</div>' +
                    (item.warehouseName ? '<div style="grid-column:1/-1;"><span style="color:#A89070;">🏭 المستودع:</span> ' + window.escapeHtml(item.warehouseName) + '</div>' : '') +
                    (item.fromName ? '<div style="grid-column:1/-1;color:#4A8AB5;">📤 من: ' + window.escapeHtml(item.fromName) + ' → 📥 إلى: ' + window.escapeHtml(item.toName) + '</div>' : '') +
                    (item.supplier ? '<div><span style="color:#A89070;">🚚 المورد:</span> ' + window.escapeHtml(item.supplier) + '</div>' : '') +
                    (item.destination ? '<div><span style="color:#A89070;">📍 الوجهة:</span> ' + window.escapeHtml(item.destination) + '</div>' : '') +
                    (item.customer ? '<div><span style="color:#A89070;">👤 العميل:</span> ' + window.escapeHtml(item.customer) + '</div>' : '') +
                    (item.source ? '<div><span style="color:#A89070;">📍 المصدر:</span> ' + window.escapeHtml(item.source) + '</div>' : '') +
                    (item.createdBy ? '<div style="grid-column:1/-1;color:#A89070;font-size:11px;">بواسطة: ' + window.escapeHtml(item.createdBy) + '</div>' : '') +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;">' +
                    '<thead><tr style="background:' + meta.color + ';color:#fff;">' +
                        '<th style="padding:6px;font-size:11px;">#</th>' +
                        '<th style="padding:6px;font-size:11px;">الصنف</th>' +
                        '<th style="padding:6px;font-size:11px;">الكمية</th>' +
                        '<th style="padding:6px;font-size:11px;">السعر</th>' +
                        '<th style="padding:6px;font-size:11px;">الإجمالي</th>' +
                    '</tr></thead>' +
                    '<tbody>' + itemsHtml + '</tbody>' +
                '</table>' +
                '<div style="margin-top:12px;padding:10px;background:#1A1A1A;border-radius:8px;display:flex;justify-content:space-between;font-size:16px;font-weight:900;color:' + meta.color + ';">' +
                    '<span>الإجمالي:</span><span>' + window.formatMoney(item.totalValue) + ' ج.م</span>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

        window.openModal(html);
    };

    window.deleteVoucher = async function(collection, id) {
        if (!window.canDelete()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const item = (window[collection] || []).find(function(r) { return r.id == id; });
        if (!item) return;

        const confirmed = await window.confirmDialog('حذف #' + item.number + '؟ سيتم إرجاع التأثير على المخزون.');
        if (!confirmed) return;

        // عكس التأثير على المخزون
        (item.items || []).forEach(function(it) {
            const p = (window.products || []).find(function(pr) { return pr.id == it.productId; });
            if (!p) return;

            if (collection === 'warehouseReceipts' || collection === 'openingBalances') {
                // كان إضافة → نشيل
                p.qty = Math.max(0, (p.qty || 0) - it.qty);
                if (item.warehouseId && p.warehouseStock) {
                    p.warehouseStock[item.warehouseId] = Math.max(0,
                        (p.warehouseStock[item.warehouseId] || 0) - it.qty);
                }
            } else if (collection === 'warehouseIssues') {
                // كان صرف → نرجع
                p.qty = (p.qty || 0) + it.qty;
                if (item.warehouseId && p.warehouseStock) {
                    p.warehouseStock[item.warehouseId] = (p.warehouseStock[item.warehouseId] || 0) + it.qty;
                }
            } else if (collection === 'warehouseTransfers') {
                // كان تحويل → نرجعه
                if (p.warehouseStock) {
                    p.warehouseStock[item.fromId] = (p.warehouseStock[item.fromId] || 0) + it.qty;
                    p.warehouseStock[item.toId] = Math.max(0, (p.warehouseStock[item.toId] || 0) - it.qty);
                }
            } else if (collection === 'warehouseAdjustments') {
                // كان تسوية → نرجع للكمية النظامية
                if (it.systemQty !== undefined) {
                    p.qty = it.systemQty;
                    if (item.warehouseId && p.warehouseStock) {
                        p.warehouseStock[item.warehouseId] = it.systemQty;
                    }
                }
            }
        });

        window.DataStore.remove(collection, id);
        window.DataStore.set('products', window.products);

        // تحديث العرض
        if (collection === 'warehouseReceipts') window.renderWarehouseReceipts();
        if (collection === 'warehouseIssues') window.renderWarehouseIssues();
        if (collection === 'warehouseTransfers') window.renderWarehouseTransfers();
        if (collection === 'warehouseAdjustments') window.renderWarehouseAdjustments();
        if (collection === 'openingBalances') window.renderOpeningBalances();

        window.showToast('🗑️ تم الحذف وعكس التأثير', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 11: تقارير المخازن
    // ═══════════════════════════════════════════════════════════

    window.renderWarehouseReportsList = function() {
        const c = document.getElementById('whReportsList');
        if (!c) return;

        const warehouses = window.warehouses || [];
        const products = window.products || [];

        // تقرير 1: رصيد كل مستودع
        let summaryHtml = '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;">' +
            '<h3 style="color:#C9A94E;font-size:14px;margin-bottom:12px;">📊 رصيد المستودعات</h3>';

        if (warehouses.length === 0) {
            summaryHtml += '<div style="text-align:center;padding:20px;color:#A89070;">لا توجد مستودعات</div>';
        } else {
            warehouses.forEach(function(wh) {
                let totalQty = 0;
                let totalValue = 0;

                products.forEach(function(p) {
                    const qty = (p.warehouseStock && p.warehouseStock[wh.id]) || 0;
                    if (qty > 0) {
                        totalQty += qty;
                        totalValue += qty * (p.buy || 0);
                    }
                });

                summaryHtml += '<div style="background:#1A1A1A;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid #4A8AB5;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
                        '<strong style="color:#C9A94E;font-size:12px;">🏭 ' + window.escapeHtml(wh.name) + '</strong>' +
                        '<span style="color:#4A8AB5;font-weight:900;font-size:12px;">' + totalQty + ' قطعة</span>' +
                    '</div>' +
                    '<div style="color:#2D8F5E;font-size:11px;text-align:left;">💰 ' + window.formatMoney(totalValue) + ' ج.م</div>' +
                '</div>';
            });
        }

        summaryHtml += '</div>';

        // تقرير 2: عدد الأذون
        let vouchersHtml = '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;">' +
            '<h3 style="color:#C9A94E;font-size:14px;margin-bottom:12px;">📋 حركات المخازن</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
                '<div style="background:#1A1A1A;border-radius:8px;padding:10px;text-align:center;border-right:3px solid #2D8F5E;">' +
                    '<div style="color:#A89070;font-size:10px;">إضافة</div>' +
                    '<div style="color:#2D8F5E;font-size:18px;font-weight:900;">' + (window.warehouseReceipts || []).length + '</div>' +
                '</div>' +
                '<div style="background:#1A1A1A;border-radius:8px;padding:10px;text-align:center;border-right:3px solid #E06060;">' +
                    '<div style="color:#A89070;font-size:10px;">صرف</div>' +
                    '<div style="color:#E06060;font-size:18px;font-weight:900;">' + (window.warehouseIssues || []).length + '</div>' +
                '</div>' +
                '<div style="background:#1A1A1A;border-radius:8px;padding:10px;text-align:center;border-right:3px solid #4A8AB5;">' +
                    '<div style="color:#A89070;font-size:10px;">تحويل</div>' +
                    '<div style="color:#4A8AB5;font-size:18px;font-weight:900;">' + (window.warehouseTransfers || []).length + '</div>' +
                '</div>' +
                '<div style="background:#1A1A1A;border-radius:8px;padding:10px;text-align:center;border-right:3px solid #E6A830;">' +
                    '<div style="color:#A89070;font-size:10px;">تسوية</div>' +
                    '<div style="color:#E6A830;font-size:18px;font-weight:900;">' + (window.warehouseAdjustments || []).length + '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        // تقرير 3: الأصناف على وشك النفاذ
        const lowStock = products.filter(function(p) {
            return (parseInt(p.qty) || 0) <= (parseInt(p.min) || 5);
        });

        let lowHtml = '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">' +
            '<h3 style="color:#E06060;font-size:14px;margin-bottom:12px;">⚠️ أصناف قاربت على النفاذ (' + lowStock.length + ')</h3>';

        if (lowStock.length === 0) {
            lowHtml += '<div style="text-align:center;padding:20px;color:#2D8F5E;font-weight:900;">✅ المخزون بحالة جيدة</div>';
        } else {
            lowStock.sort(function(a, b) { return (a.qty || 0) - (b.qty || 0); });
            lowStock.forEach(function(p) {
                lowHtml += '<div style="background:#1A1A1A;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid #E06060;">' +
                    '<div style="display:flex;justify-content:space-between;">' +
                        '<strong style="color:#F5E6C8;font-size:12px;">' + window.escapeHtml(p.name) + '</strong>' +
                        '<span style="color:#E06060;font-weight:900;font-size:13px;">' + (p.qty || 0) + '</span>' +
                    '</div>' +
                    '<div style="color:#A89070;font-size:10px;margin-top:2px;">الحد الأدنى: ' + (p.min || 5) + '</div>' +
                '</div>';
            });
        }

        lowHtml += '</div>';

        c.innerHTML = summaryHtml + vouchersHtml + lowHtml;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 12: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    window.EventBus.on('data:products:changed', function() {
        window.populateWarehouseDropdowns();
    });

    window.EventBus.on('data:warehouses:changed', function() {
        window.populateWarehouseDropdowns();
    });

    window.__warehousesLoaded = true;
    console.log('✅ warehouses.js v18.0 جاهز');

})();
