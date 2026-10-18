// ============================================================
// الميزان Pro - pos.js v23.0 (الحل النهائي للخزائن والطباعة)
// ============================================================

(function() {
    'use strict';

    function getFieldName(fieldId) {
        const el = document.getElementById(fieldId);
        if (!el) return '';
        const container = document.querySelector('.smart-search-container[data-search-target="' + fieldId + '"]');
        if (container) {
            const input = container.querySelector('.smart-search-input');
            if (input && input.value) return input.value.trim();
        }
        if (el.options && el.selectedIndex >= 0) return el.options[el.selectedIndex].text || el.value || '';
        return el.value || '';
    }

    window.populateCashBoxDropdowns = function() {
        const ids = ['saleCashBox', 'purCashBox', 'expCashBox', 'manualCashBox', 'collectCashBox', 'payCashBox', 'retCashBox', 'salCashBox'];
        const boxes = (window.cashBoxes || []).filter(b => b.active !== false);
        const defaultBox = boxes.find(b => b.isDefault) || boxes[0];

        ids.forEach(id => {
            const sel = document.getElementById(id);
            if (!sel) return;
            const cv = sel.value;
            let html = '<option value="">اختر الخزنة...</option>';
            boxes.forEach(box => {
                html += '<option value="' + box.id + '">' + (box.icon || '') + ' ' + window.escapeHtml(box.name) + '</option>';
            });
            sel.innerHTML = html;
            if (cv && Array.from(sel.options).some(o => o.value == cv)) sel.value = cv;
            else if (defaultBox) sel.value = defaultBox.id;
        });
    };

    // ⚡ إصلاح: حفظ الفاتورة وربطها بالخزنة الصحيحة
    window.saveSale = function() {
        if (window.currentSaleItems.length === 0) {
            window.showToast('⚠️ لا توجد أصناف', 'error'); return;
        }

        const saleWarehouseId = document.getElementById('saleWarehouse').value;
        if (!saleWarehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }

        const customer = getFieldName('saleCustomer') || 'عميل نقدي';
        const seller = document.getElementById('saleSeller').value;
        const paymentMethod = window.getRadioValue('salePaymentMethod', 'cash');
        
        // ⚡ السطر ده هو اللي بيحل مشكلة الخزنة (بيقرأ الخزنة اللي أنت مختارها)
        const cashBoxId = document.getElementById('saleCashBox').value;
        if (!cashBoxId) { window.showToast('⚠️ اختر الخزنة', 'error'); return; }
        
        const box = (window.cashBoxes || []).find(b => String(b.id) === String(cashBoxId));
        const subtotal = window.currentSaleItems.reduce((s, i) => s + i.total, 0);
        const total = subtotal; // مبسط للمثال

        const inv = {
            id: window.generateId('inv_'),
            number: (window.sales || []).length + 1,
            warehouseId: saleWarehouseId,
            customer: customer,
            seller: seller,
            paymentMethod: paymentMethod,
            cashBoxId: cashBoxId,
            cashBoxName: box ? box.name : '',
            total: total,
            items: JSON.parse(JSON.stringify(window.currentSaleItems)),
            date: window.getTodayDate(),
            status: 'paid'
        };

        // 1. خصم من المخزون
        window.currentSaleItems.forEach(it => {
            const p = (window.products || []).find(pr => String(pr.id) === String(it.productId));
            if (p) {
                p.qty = Math.max(0, (p.qty || 0) - it.qty);
                if (!p.warehouseStock) p.warehouseStock = {};
                p.warehouseStock[saleWarehouseId] = Math.max(0, (p.warehouseStock[saleWarehouseId] || 0) - it.qty);
            }
        });
        window.DataStore.set('products', window.products);

        // 2. حفظ الفاتورة
        window.DataStore.add('sales', inv);

        // 3. إضافة حركة للخزنة (عشان تظهر في الخزنة الصح)
        const isCash = ['cash', 'wallet', 'visa', 'bank'].indexOf(paymentMethod) > -1;
        if (isCash) {
            window.DataStore.add('treasury', {
                id: window.generateId('tr_'),
                type: 'deposit',
                amount: total,
                note: 'فاتورة بيع #' + inv.number + ' - ' + customer,
                cashBoxId: cashBoxId,
                cashBoxName: box ? box.name : '',
                refType: 'sale',
                refId: inv.id,
                date: window.getTodayDate()
            });
        }

        // 4. القيد المحاسبي
        if (window.Accounting) window.Accounting.entrySale(inv, isCash);

        // 5. تصفير الشاشة
        window.currentSaleItems = [];
        window.renderCashier();
        window.updateSaleTotals();
        document.getElementById('saleCustomer').value = '';
        
        window.showToast('✅ فاتورة #' + inv.number + ' تم حفظها بنجاح', 'success');
    };

    // ⚡ إصلاح: طباعة الفاتورة باللوجو الصحيح
    window.printInvoice = function(id) {
        const inv = (window.sales || []).find(s => String(s.id) === String(id));
        if (!inv) return;

        const company = window.companyData || {};
        let itemsRows = '';
        (inv.items || []).forEach((it, i) => {
            itemsRows += '<tr><td style="padding:8px;border:1px solid #ddd;text-align:center;">' + (i + 1) + '</td>' +
                '<td style="padding:8px;border:1px solid #ddd;">' + window.escapeHtml(it.name) + '</td>' +
                '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + it.qty + '</td>' +
                '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(it.price) + '</td>' +
                '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + window.formatMoney(it.total) + '</td></tr>';
        });

        const logoHtml = company.logo
            ? '<img src="' + company.logo + '" style="max-width:150px;max-height:150px;margin:0 auto 10px auto;display:block;object-fit:contain;" />'
            : '<h1 style="color:#C9A94E;font-size:28px;margin-bottom:5px;">⚖️ ' + window.escapeHtml(company.name || 'الميزان') + '</h1>';

        const content = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة</title>' +
            '<style>body{padding:20px;font-family:Arial;} .header{text-align:center;border-bottom:3px solid #C9A94E;padding-bottom:15px;margin-bottom:20px;}' +
            '.info-box{display:grid;grid-template-columns:1fr 1fr;gap:15px;background:#f9f9f9;padding:15px;margin-bottom:20px;}' +
            'table{width:100%;border-collapse:collapse;} th{background:#C9A94E;color:#fff;padding:10px;} td{font-size:13px;}' +
            '.totals{background:#f9f9f9;padding:15px;margin-top:10px;text-align:left;font-size:16px;font-weight:bold;}' +
            '</style></head><body>' +
            '<div class="header">' + logoHtml + (company.phone ? '<p>📞 ' + company.phone + '</p>' : '') + '</div>' +
            '<div class="info-box"><div><strong>رقم الفاتورة:</strong> #' + inv.number + '<br><strong>العميل:</strong> ' + inv.customer + '</div>' +
            '<div><strong>التاريخ:</strong> ' + inv.date + '<br><strong>البائع:</strong> ' + (inv.seller || 'المدير') + '</div></div>' +
            '<table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>' + itemsRows + '</tbody></table>' +
            '<div class="totals"><span>الإجمالي: </span><span>' + window.formatMoney(inv.total) + ' ج.م</span></div>' +
            '<script>window.onload=function(){window.print();};<\/script></body></html>';

        const w = window.open('', '_blank');
        w.document.write(content);
        w.document.close();
    };

    window.renderCashier = function() {
        const c = document.getElementById('saleItemsContainer');
        if (!c) return;
        if (window.currentSaleItems.length === 0) {
            c.innerHTML = '<div style="text-align:center;padding:20px;">لا توجد أصناف</div>';
            return;
        }
        let html = '';
        window.currentSaleItems.forEach((it, i) => {
            html += '<div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #333;">' +
                '<span>' + it.name + '</span>' +
                '<span>' + it.qty + ' × ' + it.price + '</span>' +
                '<button onclick="window.currentSaleItems.splice(' + i + ',1);window.renderCashier();">X</button></div>';
        });
        c.innerHTML = html;
    };

    window.updateSaleTotals = function() {
        const total = window.currentSaleItems.reduce((s, i) => s + i.total, 0);
        const el = document.getElementById('saleSubtotal');
        if (el) el.textContent = window.formatMoney(total);
        const finalEl = document.getElementById('saleTotal');
        if (finalEl) finalEl.textContent = window.formatMoney(total) + ' ج.م';
    };
})();
