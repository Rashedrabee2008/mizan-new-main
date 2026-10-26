// ============================================================
// الميزان Pro - inventory.js v19.0 (الحل النهائي الشامل)
// المنتجات + العملاء + الموردين + الخزائن
// ============================================================

(function() {
    'use strict';

    console.log('📦 inventory.js v19.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // 1. المنتجات (المخزون)
    // ═══════════════════════════════════════════════════════════

    window.saveProduct = function() {
        if (typeof window.canAdd === 'function' && !window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
        const id = document.getElementById('productId') ? document.getElementById('productId').value : '';
        const name = document.getElementById('productName') ? document.getElementById('productName').value.trim() : '';
        const barcode = document.getElementById('productBarcode') ? document.getElementById('productBarcode').value.trim() : '';
        const buy = parseFloat(document.getElementById('productBuy') ? document.getElementById('productBuy').value : 0) || 0;
        const sell = parseFloat(document.getElementById('productSell') ? document.getElementById('productSell').value : 0) || 0;
        const qty = parseInt(document.getElementById('productQty') ? document.getElementById('productQty').value : 0) || 0;
        const min = parseInt(document.getElementById('productMin') ? document.getElementById('productMin').value : 5) || 5;

        if (!name) { window.showToast('⚠️ أدخل اسم المنتج', 'error'); return; }
        
        if (id) {
            const idx = (window.products || []).findIndex(function(p) { return String(p.id) === String(id); });
            if (idx > -1) {
                window.products[idx] = Object.assign({}, window.products[idx], { name, barcode, buy, sell, qty, min });
                window.DataStore.set('products', window.products);
                window.showToast('✅ تم تعديل المنتج', 'success');
            }
        } else {
            if ((window.products || []).find(function(p) { return p.name === name; })) { window.showToast('⚠️ الاسم موجود', 'warning'); return; }
            const mainWh = (window.warehouses || []).find(function(w) { return w.type === 'main'; }) || (window.warehouses || [])[0];
            const warehouseStock = mainWh && qty > 0 ? { [mainWh.id]: qty } : {};
            window.DataStore.add('products', { id: window.generateId('prod_'), name, barcode, buy, sell, qty, min, warehouseStock });
            window.showToast('✅ تم إضافة المنتج', 'success');
        }
        window.resetProductForm();
    };

    window.resetProductForm = function() {
        ['productId', 'productName', 'productBarcode', 'productBuy', 'productSell', 'productQty'].forEach(function(id) {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        const minEl = document.getElementById('productMin'); if (minEl) minEl.value = '5';
        const titleEl = document.getElementById('productFormTitle'); if (titleEl) titleEl.textContent = '➕ إضافة منتج جديد';
        const btnEl = document.getElementById('productSaveBtnText'); if (btnEl) btnEl.textContent = 'إضافة';
    };

    window.editProduct = function(id) {
        const p = (window.products || []).find(function(pr) { return String(pr.id) === String(id); }); if (!p) return;
        ['productId|'+p.id, 'productName|'+p.name, 'productBarcode|'+(p.barcode||''), 'productBuy|'+p.buy, 'productSell|'+p.sell, 'productQty|'+p.qty, 'productMin|'+(p.min||5)].forEach(function(item) {
            const parts = item.split('|'); const el = document.getElementById(parts[0]); if (el) el.value = parts[1];
        });
        const titleEl = document.getElementById('productFormTitle'); if (titleEl) titleEl.textContent = '✏️ تعديل المنتج';
        const btnEl = document.getElementById('productSaveBtnText'); if (btnEl) btnEl.textContent = 'حفظ';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteProduct = async function(id) {
        if (typeof window.canDelete === 'function' && !window.canDelete()) return;
        const p = (window.products || []).find(function(pr) { return String(pr.id) === String(id); }); if (!p) return;
        const confirmed = await window.confirmDialog('حذف "' + p.name + '"؟'); if (!confirmed) return;
        window.DataStore.remove('products', id); window.showToast('🗑️ تم الحذف', 'info');
    };

    window.renderProducts = function() {
        const c = document.getElementById('productList'); if (!c) return;
        const searchInput = document.getElementById('inventorySearch'); const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let filtered = window.products || [];
        if (search) { filtered = filtered.filter(function(p) { return (p.name || '').toLowerCase().indexOf(search) > -1 || (p.barcode || '').indexOf(search) > -1; }); }
        if (filtered.length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><span>لا توجد منتجات</span></div>'; return; }
        let html = '<div class="table-header" style="grid-template-columns: 1.4fr 0.7fr 0.7fr 0.7fr 1.4fr;"><span>الاسم</span><span>الشراء</span><span>البيع</span><span>الكمية</span><span></span></div>';
        filtered.forEach(function(p) {
            const qty = parseInt(p.qty) || 0; const min = parseInt(p.min) || 5; const qtyColor = qty > min ? '#C9A94E' : '#E06060';
            html += '<div class="table-row" style="grid-template-columns: 1.4fr 0.7fr 0.7fr 0.7fr 1.4fr;"><span><strong>' + window.escapeHtml(p.name) + '</strong>' + (p.barcode ? '<br><small style="color:#A89070;font-size:9px;">' + window.escapeHtml(p.barcode) + '</small>' : '') + '</span><span style="color:#E06060;">' + window.formatMoney(p.buy) + '</span><span style="color:#2D8F5E;">' + window.formatMoney(p.sell) + '</span><span style="color:' + qtyColor + ';font-weight:900;">' + qty + '</span><div style="display:flex;gap:4px;justify-content:flex-end;"><button class="btn btn-info btn-sm" onclick="showProductWarehouses(\'' + p.id + '\')"><i class="fas fa-warehouse"></i></button><button class="btn btn-warning btn-sm" onclick="editProduct(\'' + p.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-danger btn-sm" onclick="deleteProduct(\'' + p.id + '\')"><i class="fas fa-trash"></i></button></div></div>';
        });
        c.innerHTML = html;
    };

    window.showProductWarehouses = function(productId) {
        const product = (window.products || []).find(function(p) { return String(p.id) === String(productId); }); if (!product) return;
        let html = '<button class="modal-close" onclick="closeModal()">&times;</button><h3>🏭 توزيع ' + window.escapeHtml(product.name) + '</h3>';
        html += '<div style="background:#C9A94E;border-radius:10px;padding:14px;text-align:center;color:#0D0D0D;margin-bottom:12px;"><div>الإجمالي: ' + (product.qty || 0) + ' قطعة</div></div>';
        html += '<button class="btn btn-secondary btn-block" onclick="closeModal()">إغلاق</button>';
        window.openModal(html);
    };

    // ═══════════════════════════════════════════════════════════
    // 2. العملاء (اللي كانت ناقصة)
    // ═══════════════════════════════════════════════════════════

    window.saveCustomer = function() {
        if (typeof window.canAdd === 'function' && !window.canAdd()) return;
        const id = document.getElementById('customerId') ? document.getElementById('customerId').value : '';
        const name = document.getElementById('customerName') ? document.getElementById('customerName').value.trim() : '';
        const phone = document.getElementById('customerPhone') ? document.getElementById('customerPhone').value.trim() : '';
        const whatsapp = document.getElementById('customerWhatsapp') ? document.getElementById('customerWhatsapp').value.trim() : '';
        const address = document.getElementById('customerAddress') ? document.getElementById('customerAddress').value.trim() : '';

        if (!name) { window.showToast('⚠️ أدخل اسم العميل', 'error'); return; }

        if (id) {
            const idx = (window.customers || []).findIndex(function(c) { return String(c.id) === String(id); });
            if (idx > -1) {
                window.customers[idx] = Object.assign({}, window.customers[idx], { name, phone, whatsapp, address });
                window.DataStore.set('customers', window.customers);
                window.showToast('✅ تم تعديل العميل', 'success');
            }
        } else {
            if ((window.customers || []).find(function(c) { return c.name === name; })) { window.showToast('⚠️ الاسم موجود', 'warning'); return; }
            window.DataStore.add('customers', { id: window.generateId('cus_'), name, phone, whatsapp, address });
            window.showToast('✅ تم إضافة العميل', 'success');
        }
        window.resetCustomerForm();
    };

    window.resetCustomerForm = function() {
        ['customerId', 'customerName', 'customerPhone', 'customerWhatsapp', 'customerAddress'].forEach(function(id) {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        const titleEl = document.getElementById('customerFormTitle'); if (titleEl) titleEl.textContent = '➕ إضافة عميل';
        const btnEl = document.getElementById('customerSaveBtnText'); if (btnEl) btnEl.textContent = 'إضافة';
    };

    window.editCustomer = function(id) {
        const c = (window.customers || []).find(function(cus) { return String(cus.id) === String(id); }); if (!c) return;
        ['customerId|'+c.id, 'customerName|'+c.name, 'customerPhone|'+(c.phone||''), 'customerWhatsapp|'+(c.whatsapp||''), 'customerAddress|'+(c.address||'')].forEach(function(item) {
            const parts = item.split('|'); const el = document.getElementById(parts[0]); if (el) el.value = parts[1];
        });
        const titleEl = document.getElementById('customerFormTitle'); if (titleEl) titleEl.textContent = '✏️ تعديل العميل';
        const btnEl = document.getElementById('customerSaveBtnText'); if (btnEl) btnEl.textContent = 'حفظ';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteCustomer = async function(id) {
        if (typeof window.canDelete === 'function' && !window.canDelete()) return;
        const c = (window.customers || []).find(function(cus) { return String(cus.id) === String(id); }); if (!c) return;
        const confirmed = await window.confirmDialog('حذف العميل "' + c.name + '"؟'); if (!confirmed) return;
        window.DataStore.remove('customers', id); window.showToast('🗑️ تم الحذف', 'info');
    };

    window.renderCustomers = function() {
        const c = document.getElementById('customerList'); if (!c) return;
        if ((window.customers || []).length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><span>لا يوجد عملاء</span></div>'; return; }
        let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;"><span>الاسم</span><span>الهاتف</span><span>المديونية</span><span></span></div>';
        window.customers.forEach(function(cus) {
            const debt = window.Balance ? window.Balance.customer(cus.name) : 0;
            html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;"><span><strong>' + window.escapeHtml(cus.name) + '</strong></span><span style="direction:ltr;text-align:right;font-size:11px;">' + (cus.phone || '-') + '</span><span style="color:' + (debt > 0 ? '#E06060' : '#2D8F5E') + ';font-weight:700;">' + window.formatMoney(debt) + '</span><div style="display:flex;gap:4px;justify-content:flex-end;"><button class="btn btn-warning btn-sm" onclick="editCustomer(\'' + cus.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-danger btn-sm" onclick="deleteCustomer(\'' + cus.id + '\')"><i class="fas fa-trash"></i></button></div></div>';
        });
        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // 3. الموردين
    // ═══════════════════════════════════════════════════════════

    window.saveSupplier = function() {
        if (typeof window.canAdd === 'function' && !window.canAdd()) return;
        const id = document.getElementById('supplierId') ? document.getElementById('supplierId').value : '';
        const name = document.getElementById('supplierName') ? document.getElementById('supplierName').value.trim() : '';
        const phone = document.getElementById('supplierPhone') ? document.getElementById('supplierPhone').value.trim() : '';
        const whatsapp = document.getElementById('supplierWhatsapp') ? document.getElementById('supplierWhatsapp').value.trim() : '';
        const address = document.getElementById('supplierAddress') ? document.getElementById('supplierAddress').value.trim() : '';

        if (!name) { window.showToast('⚠️ أدخل اسم المورد', 'error'); return; }

        if (id) {
            const idx = (window.suppliers || []).findIndex(function(s) { return String(s.id) === String(id); });
            if (idx > -1) {
                window.suppliers[idx] = Object.assign({}, window.suppliers[idx], { name, phone, whatsapp, address });
                window.DataStore.set('suppliers', window.suppliers);
                window.showToast('✅ تم تعديل المورد', 'success');
            }
        } else {
            if ((window.suppliers || []).find(function(s) { return s.name === name; })) { window.showToast('⚠️ الاسم موجود', 'warning'); return; }
            window.DataStore.add('suppliers', { id: window.generateId('sup_'), name, phone, whatsapp, address });
            window.showToast('✅ تم إضافة المورد', 'success');
        }
        window.resetSupplierForm();
    };

    window.resetSupplierForm = function() {
        ['supplierId', 'supplierName', 'supplierPhone', 'supplierWhatsapp', 'supplierAddress'].forEach(function(id) {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        const titleEl = document.getElementById('supplierFormTitle'); if (titleEl) titleEl.textContent = '➕ إضافة مورد';
        const btnEl = document.getElementById('supplierSaveBtnText'); if (btnEl) btnEl.textContent = 'إضافة';
    };

    window.editSupplier = function(id) {
        const s = (window.suppliers || []).find(function(sup) { return String(sup.id) === String(id); }); if (!s) return;
        ['supplierId|'+s.id, 'supplierName|'+s.name, 'supplierPhone|'+(s.phone||''), 'supplierWhatsapp|'+(s.whatsapp||''), 'supplierAddress|'+(s.address||'')].forEach(function(item) {
            const parts = item.split('|'); const el = document.getElementById(parts[0]); if (el) el.value = parts[1];
        });
        const titleEl = document.getElementById('supplierFormTitle'); if (titleEl) titleEl.textContent = '✏️ تعديل المورد';
        const btnEl = document.getElementById('supplierSaveBtnText'); if (btnEl) btnEl.textContent = 'حفظ';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteSupplier = async function(id) {
        if (typeof window.canDelete === 'function' && !window.canDelete()) return;
        const s = (window.suppliers || []).find(function(sup) { return String(sup.id) === String(id); }); if (!s) return;
        const confirmed = await window.confirmDialog('حذف المورد "' + s.name + '"؟'); if (!confirmed) return;
        window.DataStore.remove('suppliers', id); window.showToast('🗑️ تم الحذف', 'info');
    };

    window.renderSuppliers = function() {
        const c = document.getElementById('supplierList'); if (!c) return;
        if ((window.suppliers || []).length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-truck"></i><span>لا يوجد موردين</span></div>'; return; }
        let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;"><span>الاسم</span><span>الهاتف</span><span>الالتزامات</span><span></span></div>';
        window.suppliers.forEach(function(s) {
            const debt = window.Balance ? window.Balance.supplier(s.name) : 0;
            html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;"><span><strong>' + window.escapeHtml(s.name) + '</strong></span><span style="direction:ltr;text-align:right;font-size:11px;">' + (s.phone || '-') + '</span><span style="color:' + (debt > 0 ? '#E06060' : '#2D8F5E') + ';font-weight:700;">' + window.formatMoney(debt) + '</span><div style="display:flex;gap:4px;justify-content:flex-end;"><button class="btn btn-warning btn-sm" onclick="editSupplier(\'' + s.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-danger btn-sm" onclick="deleteSupplier(\'' + s.id + '\')"><i class="fas fa-trash"></i></button></div></div>';
        });
        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // 4. الخزائن
    // ═══════════════════════════════════════════════════════════

    window.saveCashBox = function() {
        if (typeof window.canAdd === 'function' && !window.canAdd()) return;
        const id = document.getElementById('cashBoxId') ? document.getElementById('cashBoxId').value : '';
        const name = document.getElementById('cashBoxName') ? document.getElementById('cashBoxName').value.trim() : '';
        const type = document.getElementById('cashBoxType') ? document.getElementById('cashBoxType').value : 'cash';
        const icon = document.getElementById('cashBoxIcon') ? document.getElementById('cashBoxIcon').value : '💵';
        const openingBalance = parseFloat(document.getElementById('cashBoxOpeningBalance') ? document.getElementById('cashBoxOpeningBalance').value : 0) || 0;

        if (!name) { window.showToast('⚠️ أدخل اسم الخزنة', 'error'); return; }

        if (id) {
            const idx = (window.cashBoxes || []).findIndex(function(b) { return String(b.id) === String(id); });
            if (idx > -1) {
                window.cashBoxes[idx] = Object.assign({}, window.cashBoxes[idx], { name, type, icon, openingBalance });
                window.DataStore.set('cashBoxes', window.cashBoxes);
                window.showToast('✅ تم تعديل الخزنة', 'success');
            }
        } else {
            if ((window.cashBoxes || []).find(function(b) { return b.name === name; })) { window.showToast('⚠️ الاسم موجود', 'warning'); return; }
            window.DataStore.add('cashBoxes', { id: window.generateId('box_'), name, type, icon, openingBalance, active: true });
            window.showToast('✅ تم إضافة الخزنة', 'success');
        }
        window.resetCashBoxForm();
        if (typeof window.populateCashBoxDropdowns === 'function') window.populateCashBoxDropdowns();
    };

    window.resetCashBoxForm = function() {
        ['cashBoxId', 'cashBoxName', 'cashBoxOpeningBalance'].forEach(function(id) {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        const typeEl = document.getElementById('cashBoxType'); if (typeEl) typeEl.value = 'cash';
        const iconEl = document.getElementById('cashBoxIcon'); if (iconEl) iconEl.value = '💵';
        const titleEl = document.getElementById('cashBoxFormTitle'); if (titleEl) titleEl.textContent = '➕ إضافة خزنة';
        const btnEl = document.getElementById('cashBoxSaveBtnText'); if (btnEl) btnEl.textContent = 'إضافة';
    };

    window.editCashBox = function(id) {
        const b = (window.cashBoxes || []).find(function(box) { return String(box.id) === String(id); }); if (!b) return;
        ['cashBoxId|'+b.id, 'cashBoxName|'+b.name, 'cashBoxType|'+b.type, 'cashBoxIcon|'+(b.icon||'💵'), 'cashBoxOpeningBalance|'+(b.openingBalance||0)].forEach(function(item) {
            const parts = item.split('|'); const el = document.getElementById(parts[0]); if (el) el.value = parts[1];
        });
        const titleEl = document.getElementById('cashBoxFormTitle'); if (titleEl) titleEl.textContent = '✏️ تعديل الخزنة';
        const btnEl = document.getElementById('cashBoxSaveBtnText'); if (btnEl) btnEl.textContent = 'حفظ';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteCashBox = async function(id) {
        if (typeof window.canDelete === 'function' && !window.canDelete()) return;
        const b = (window.cashBoxes || []).find(function(box) { return String(box.id) === String(id); }); if (!b) return;
        const confirmed = await window.confirmDialog('حذف الخزنة "' + b.name + '"؟'); if (!confirmed) return;
        window.DataStore.remove('cashBoxes', id);
        if (typeof window.populateCashBoxDropdowns === 'function') window.populateCashBoxDropdowns();
        window.showToast('🗑️ تم الحذف', 'info');
    };

    window.renderCashBoxes = function() {
        const c = document.getElementById('cashBoxesList'); if (!c) return;
        const totalBalance = window.Balance ? window.Balance.totalCash() : 0;
        const setTxt = function(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; };
        setTxt('totalCashBoxesBalance', window.formatMoney(totalBalance));
        setTxt('totalCashBoxesCount', (window.cashBoxes || []).length);

        if ((window.cashBoxes || []).length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-money-bill-wave"></i><span>لا توجد خزائن</span></div>'; return; }
        let html = '';
        window.cashBoxes.forEach(function(box) {
            const balance = window.Balance ? window.Balance.cashBox(box.id) : 0;
            html += '<div class="cash-box-card ' + (box.isDefault ? 'default' : '') + '" style="margin-bottom:10px;padding:14px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="display:flex;align-items:center;gap:10px;"><span style="font-size:24px;">' + (box.icon || '💵') + '</span><div><div style="color:#C9A94E;font-weight:900;font-size:14px;">' + window.escapeHtml(box.name) + '</div><div style="color:#A89070;font-size:10px;">' + (box.type === 'cash' ? 'نقدي' : box.type === 'wallet' ? 'محفظة' : 'بنك') + '</div></div></div><div style="text-align:left;color:' + (balance >= 0 ? '#C9A94E' : '#E06060') + ';font-weight:900;font-size:16px;">' + window.formatMoney(balance) + ' ج.م</div></div><div style="display:flex;gap:6px;"><button onclick="editCashBox(\'' + box.id + '\')" style="flex:1;background:#E6A830;border:none;color:#0D0D0D;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">✏️</button><button onclick="deleteCashBox(\'' + box.id + '\')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️</button></div></div>';
        });
        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // 5. المستودعات والفروع والعملات (لصفحة ERP)
    // ═══════════════════════════════════════════════════════════

    window.showERPTab = function(tab, btn) {
        ['warehouses', 'branches', 'currencies'].forEach(function(t) {
            const el = document.getElementById('erpTab' + t.charAt(0).toUpperCase() + t.slice(1)); if (el) el.style.display = 'none';
        });
        const target = document.getElementById('erpTab' + tab.charAt(0).toUpperCase() + tab.slice(1)); if (target) target.style.display = 'block';
        document.querySelectorAll('#page-erp .tab-btn').forEach(function(b) { b.classList.remove('active'); }); if (btn) btn.classList.add('active');
        if (tab === 'warehouses') window.renderWarehouses(); if (tab === 'branches') window.renderBranches(); if (tab === 'currencies') window.renderCurrencies();
    };

    window.saveWarehouse = function() {
        const id = document.getElementById('warehouseId') ? document.getElementById('warehouseId').value : '';
        const name = document.getElementById('warehouseName') ? document.getElementById('warehouseName').value.trim() : '';
        const type = document.getElementById('warehouseType') ? document.getElementById('warehouseType').value : 'storage';
        const location = document.getElementById('warehouseLocation') ? document.getElementById('warehouseLocation').value.trim() : '';
        const manager = document.getElementById('warehouseManager') ? document.getElementById('warehouseManager').value.trim() : '';
        if (!name) { window.showToast('⚠️ أدخل اسم المستودع', 'error'); return; }
        if (id) {
            const idx = (window.warehouses || []).findIndex(function(w) { return String(w.id) === String(id); });
            if (idx > -1) { window.warehouses[idx] = Object.assign({}, window.warehouses[idx], { name, type, location, manager }); window.DataStore.set('warehouses', window.warehouses); window.showToast('✅ تم التعديل', 'success'); }
        } else {
            if ((window.warehouses || []).find(function(w) { return w.name === name; })) { window.showToast('⚠️ الاسم موجود', 'warning'); return; }
            window.DataStore.add('warehouses', { id: window.generateId('wh_'), name, type, location, manager, active: true }); window.showToast('✅ تم الإضافة', 'success');
        }
        window.resetWarehouseForm();
    };

    window.resetWarehouseForm = function() {
        ['warehouseId', 'warehouseName', 'warehouseLocation', 'warehouseManager'].forEach(function(id) { const el = document.getElementById(id); if (el) el.value = ''; });
        const typeEl = document.getElementById('warehouseType'); if (typeEl) typeEl.value = 'storage';
        const titleEl = document.getElementById('warehouseFormTitle'); if (titleEl) titleEl.textContent = '➕ إضافة مستودع';
    };

    window.editWarehouse = function(id) {
        const w = (window.warehouses || []).find(function(x) { return String(x.id) === String(id); }); if (!w) return;
        ['warehouseId|'+w.id, 'warehouseName|'+w.name, 'warehouseLocation|'+(w.location||''), 'warehouseManager|'+(w.manager||'')].forEach(function(item) { const parts = item.split('|'); const el = document.getElementById(parts[0]); if (el) el.value = parts[1]; });
        const typeEl = document.getElementById('warehouseType'); if (typeEl) typeEl.value = w.type;
        const titleEl = document.getElementById('warehouseFormTitle'); if (titleEl) titleEl.textContent = '✏️ تعديل المستودع';
    };

    window.deleteWarehouse = async function(id) {
        const w = (window.warehouses || []).find(function(x) { return String(x.id) === String(id); }); if (!w) return;
        const confirmed = await window.confirmDialog('حذف "' + w.name + '"؟'); if (!confirmed) return;
        window.DataStore.remove('warehouses', id); if (typeof window.populateWarehouseField === 'function') window.populateWarehouseField(); window.showToast('🗑️ تم الحذف', 'info');
    };

    window.renderWarehouses = function() {
        const c = document.getElementById('warehouseList'); if (!c) return;
        if ((window.warehouses || []).length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-warehouse"></i><span>لا توجد مستودعات</span></div>'; return; }
        let html = '';
        window.warehouses.forEach(function(w) {
            const typeInfo = (window.WAREHOUSE_TYPES && window.WAREHOUSE_TYPES[w.type]) || { name: w.type, icon: '📦' };
            html += '<div class="cash-box-card" style="margin-bottom:10px;padding:14px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:24px;">' + typeInfo.icon + '</span><div><div style="color:#C9A94E;font-weight:900;font-size:14px;">' + window.escapeHtml(w.name) + '</div><div style="color:#A89070;font-size:10px;">' + typeInfo.name + (w.location ? ' - ' + window.escapeHtml(w.location) : '') + '</div></div></div></div><div style="display:flex;gap:6px;margin-top:10px;"><button onclick="showWarehouseStock(\'' + w.id + '\')" style="flex:1;background:#4A8AB5;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">📊 المخزون</button><button onclick="editWarehouse(\'' + w.id + '\')" style="flex:1;background:#E6A830;border:none;color:#0D0D0D;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">✏️</button><button onclick="deleteWarehouse(\'' + w.id + '\')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️</button></div></div>';
        });
        c.innerHTML = html;
    };

    window.showWarehouseStock = function(warehouseId) {
        const warehouse = (window.warehouses || []).find(function(w) { return String(w.id) === String(warehouseId); }); if (!warehouse) return;
        let html = '<button class="modal-close" onclick="closeModal()">&times;</button><h3>🏭 مخزون ' + window.escapeHtml(warehouse.name) + '</h3>';
        html += '<button class="btn btn-secondary btn-block" onclick="closeModal()">إغلاق</button>';
        window.openModal(html);
    };

    window.saveBranch = function() {
        const name = document.getElementById('branchName') ? document.getElementById('branchName').value.trim() : '';
        if (!name) { window.showToast('⚠️ أدخل اسم الفرع', 'error'); return; }
        window.DataStore.add('branches', { id: window.generateId('br_'), name, code: '', address: '', phone: '', active: true });
        window.showToast('✅ تم الإضافة', 'success');
        ['branchId', 'branchName', 'branchCode', 'branchAddress', 'branchPhone'].forEach(function(id) { const el = document.getElementById(id); if (el) el.value = ''; });
    };

    window.renderBranches = function() { const c = document.getElementById('branchList'); if (!c) return; c.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i><span>لا توجد فروع</span></div>'; };
    window.deleteBranch = async function(id) { const confirmed = await window.confirmDialog('حذف هذا الفرع؟'); if (!confirmed) return; window.DataStore.remove('branches', id); window.showToast('🗑️ تم الحذف', 'info'); };

    window.loadCurrencies = function() { if (!window.currencies || window.currencies.length === 0) window.currencies = window.DEFAULT_CURRENCIES || []; };
    window.renderCurrencies = function() { const c = document.getElementById('currencyList'); if (!c) return; window.loadCurrencies(); let html = ''; window.currencies.forEach(function(curr) { html += '<div class="cash-box-card" style="margin-bottom:8px;padding:12px;"><div style="color:#C9A94E;font-weight:900;font-size:14px;">' + curr.symbol + ' ' + window.escapeHtml(curr.name) + '</div></div>'; }); c.innerHTML = html; };

    window.__inventoryLoaded = true;
    console.log('✅ inventory.js v19.0 جاهز');

})();
