// ============================================================
// الميزان Pro - pos.js v30.0 (إصلاح الخزنة والطباعة)
// ============================================================
(function() {
    'use strict';

    window.populateCashBoxDropdowns = function() {
        const ids = ['saleCashBox', 'purCashBox', 'expCashBox', 'manualCashBox', 'collectCashBox', 'payCashBox', 'retCashBox', 'salCashBox'];
        const boxes = (window.cashBoxes || []).filter(b => b.active !== false);
        ids.forEach(id => {
            const sel = document.getElementById(id);
            if (!sel) return;
            let html = '<option value="">اختر الخزنة...</option>';
            boxes.forEach(box => {
                html += '<option value="' + box.id + '">' + (box.icon || '') + ' ' + window.escapeHtml(box.name) + '</option>';
            });
            sel.innerHTML = html;
        });
    };

    window.saveSale = function() {
        if (window.currentSaleItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }

        const saleWarehouseId = document.getElementById('saleWarehouse').value;
        if (!saleWarehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }

        const customer = document.getElementById('saleCustomer').value || 'عميل نقدي';
        const paymentMethod = window.getRadioValue('salePaymentMethod', 'cash');
        
        // ⚡ حل مشكلة الخزنة (بيقرأ الخزنة الصح)
        const cashBoxId = document.getElementById('saleCashBox').value;
        if (!cashBoxId) { window.showToast('⚠️ اختر الخزنة', 'error'); return; }
        
        const box = (window.cashBoxes || []).find(b => String(b.id) === String(cashBoxId));
        const total = window.currentSaleItems.reduce((s, i) => s + i.total, 0);

        const inv = {
            id: window.generateId('inv_'), number: (window.sales || []).length + 1,
            warehouseId: saleWarehouseId, customer: customer, paymentMethod: paymentMethod,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '', total: total,
            items: JSON.parse(JSON.stringify(window.currentSaleItems)),
            date: window.getTodayDate(), status: 'paid'
        };

        window.DataStore.add('sales', inv);

        const isCash = ['cash', 'wallet', 'visa', 'bank'].indexOf(paymentMethod) > -1;
        if (isCash) {
            window.DataStore.add('treasury', {
                id: window.generateId('tr_'), type: 'deposit', amount: total,
                note: 'فاتورة بيع #' + inv.number, cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
                refType: 'sale', refId: inv.id, date: window.getTodayDate()
            });
        }

        window.currentSaleItems = [];
        window.renderCashier();
        window.updateSaleTotals();
        window.showToast('✅ فاتورة #' + inv.number + ' تم حفظها', 'success');
    };

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

        // ⚡ اللوجو هيظهر هنا
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
            '<div><strong>التاريخ:</strong> ' + inv.date + '</div></div>' +
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
        if (window.currentSaleItems.length === 0) { c.innerHTML = '<div style="text-align:center;padding:20px;">لا توجد أصناف</div>'; return; }
        let html = '';
        window.currentSaleItems.forEach((it, i) => {
            html += '<div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #333;">' +
                '<span>' + it.name + '</span><span>' + it.qty + ' × ' + it.price + '</span>' +
                '<button onclick="window.currentSaleItems.splice(' + i + ',1);window.renderCashier();">X</button></div>';
        });
        c.innerHTML = html;
    };

    window.updateSaleTotals = function() {
        const total = window.currentSaleItems.reduce((s, i) => s + i.total, 0);
        if (document.getElementById('saleSubtotal')) document.getElementById('saleSubtotal').textContent = window.formatMoney(total);
        if (document.getElementById('saleTotal')) document.getElementById('saleTotal').textContent = window.formatMoney(total) + ' ج.م';
    };
})();
