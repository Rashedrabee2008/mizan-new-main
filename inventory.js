// ============================================================
// الميزان Pro - inventory.js v19.0 (إصلاح شامل)
// 🔧 حماية من الأخطاء + تحسينات الأداء
// ============================================================

(function() {
    'use strict';

    console.log('📦 inventory.js v19.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: المنتجات
    // ═══════════════════════════════════════════════════════════

    window.saveProduct = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const id = document.getElementById('productId') ? document.getElementById('productId').value : '';
        const name = document.getElementById('productName') ? document.getElementById('productName').value.trim() : '';
        const barcode = document.getElementById('productBarcode') ? document.getElementById('productBarcode').value.trim() : '';
        const buy = parseFloat(document.getElementById('productBuy') ? document.getElementById('productBuy').value : 0) || 0;
        const sell = parseFloat(document.getElementById('productSell') ? document.getElementById('productSell').value : 0) || 0;
        const qty = parseInt(document.getElementById('productQty') ? document.getElementById('productQty').value : 0) || 0;
        const min = parseInt(document.getElementById('productMin') ? document.getElementById('productMin').value : 5) || 5;

        if (!name) {
            window.showToast('⚠️ أدخل اسم المنتج', 'error');
            return;
        }

        if (buy < 0 || sell < 0) {
            window.showToast('⚠️ الأسعار يجب أن تكون موجبة', 'error');
            return;
        }

        if (id) {
            const idx = (window.products || []).findIndex(function(p) { return p.id == id; });
            if (idx > -1) {
                window.products[idx] = Object.assign({}, window.products[idx], {
                    name: name,
                    barcode: barcode,
                    buy: buy,
                    sell: sell,
                    qty: qty,
                    min: min
                });
                window.DataStore.set('products', window.products);
                window.showToast('✅ تم التعديل', 'success');
            }
        } else {
            if ((window.products || []).find(function(p) { return p.name === name; })) {
                window.showToast('⚠️ الاسم موجود', 'warning');
                return;
            }

            const mainWh = (window.warehouses || []).find(function(w) { return w.type === 'main'; })
                || (window.warehouses || [])[0];

            const warehouseStock = {};
            if (mainWh && qty > 0) {
                warehouseStock[mainWh.id] = qty;
            }

            window.DataStore.add('products', {
                id: window.generateId('prod_'),
                name: name,
                barcode: barcode,
                buy: buy,
                sell: sell,
                qty: qty,
                min: min,
                warehouseStock: warehouseStock
            });
            window.showToast('✅ تم الإضافة', 'success');
        }

        window.resetProductForm();
    };

    window.resetProductForm = function() {
        ['productId', 'productName', 'productBarcode', 'productBuy', 'productSell', 'productQty'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const minEl = document.getElementById('productMin');
        if (minEl) minEl.value = '5';
        const titleEl = document.getElementById('productFormTitle');
        if (titleEl) titleEl.textContent = '➕ إضافة منتج جديد';
        const btnEl = document.getElementById('productSaveBtnText');
        if (btnEl) btnEl.textContent = 'إضافة';
    };

    window.editProduct = function(id) {
        const p = (window.products || []).find(function(pr) { return pr.id == id; });
        if (!p) return;

        const setVal = function(elId, val) {
            const el = document.getElementById(elId);
            if (el) el.value = val;
        };

        setVal('productId', p.id);
        setVal('productName', p.name);
        setVal('productBarcode', p.barcode || '');
        setVal('productBuy', p.buy);
        setVal('productSell', p.sell);
        setVal('productQty', p.qty);
        setVal('productMin', p.min || 5);

        const titleEl = document.getElementById('productFormTitle');
        if (titleEl) titleEl.textContent = '✏️ تعديل المنتج';
        const btnEl = document.getElementById('productSaveBtnText');
        if (btnEl) btnEl.textContent = 'حفظ';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteProduct = async function(id) {
        if (!window.canDelete()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const p = (window.products || []).find(function(pr) { return pr.id == id; });
        if (!p) return;

        const confirmed = await window.confirmDialog('حذف "' + p.name + '"؟');
        if (!confirmed) return;

        window.DataStore.remove('products', id);
        window.showToast('🗑️ تم الحذف', 'info');
    };

    window.renderProducts = function() {
        const c = document.getElementById('productList');
        if (!c) return;

        const searchInput = document.getElementById('inventorySearch');
        const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let filtered = window.products || [];

        if (search) {
            filtered = filtered.filter(function(p) {
                return (p.name || '').toLowerCase().indexOf(search) > -1 ||
                       (p.barcode || '').indexOf(search) > -1;
            });
        }

        if (filtered.length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><span>لا توجد منتجات</span></div>';
            return;
        }

        let html = '<div class="table-header" style="grid-template-columns: 1.4fr 0.7fr 0.7fr 0.7fr 1.4fr;">' +
            '<span>الاسم</span><span>الشراء</span><span>البيع</span><span>الكمية</span><span></span>' +
        '</div>';

        filtered.forEach(function(p) {
            const qty = parseInt(p.qty) || 0;
            const min = parseInt(p.min) || 5;
            const qtyColor = qty > min ? '#C9A94E' : '#E06060';

            html += '<div class="table-row" style="grid-template-columns: 1.4fr 0.7fr 0.7fr 0.7fr 1.4fr;">' +
                '<span><strong>' + window.escapeHtml(p.name) + '</strong>' +
                    (p.barcode ? '<br><small style="color:#A89070;font-size:9px;">' + window.escapeHtml(p.barcode) + '</small>' : '') +
                '</span>' +
                '<span style="color:#E06060;">' + window.formatMoney(p.buy) + '</span>' +
                '<span style="color:#2D8F5E;">' + window.formatMoney(p.sell) + '</span>' +
                '<span style="color:' + qtyColor + ';font-weight:900;">' + qty + '</span>' +
                '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                    '<button class="btn btn-info btn-sm" onclick="showProductWarehouses(\'' + p.id + '\')" title="توزيع المستودعات"><i class="fas fa-warehouse"></i></button>' +
                    '<button class="btn btn-warning btn-sm" onclick="editProduct(\'' + p.id + '\')"><i class="fas fa-edit"></i></button>' +
                    '<button class="btn btn-danger btn-sm" onclick="deleteProduct(\'' + p.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.showProductWarehouses = function(productId) {
        const product = (window.products || []).find(function(p) { return p.id == productId; });
        if (!product) return;

        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🏭 توزيع ' + window.escapeHtml(product.name) + '</h3>';

        html += '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:10px;padding:14px;text-align:center;color:#0D0D0D;margin-bottom:12px;">' +
            '<div style="font-size:11px;opacity:0.8;">الإجمالي</div>' +
            '<div style="font-size:28px;font-weight:900;">' + (product.qty || 0) + '</div>' +
            '<div style="font-size:11px;">قطعة</div>' +
        '</div>';

        let hasDistribution = false;
        let totalDistributed = 0;

        if (product.warehouseStock && Object.keys(product.warehouseStock).length > 0) {
            (window.warehouses || []).forEach(function(wh) {
                const qty = product.warehouseStock[wh.id] || 0;
                if (qty > 0) {
                    hasDistribution = true;
                    totalDistributed += qty;
                    const percentage = product.qty > 0 ? (qty / product.qty) * 100 : 0;

                    html += '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:8px;border-right:4px solid #4A8AB5;">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                            '<div style="display:flex;align-items:center;gap:8px;">' +
                                '<span style="font-size:20px;">🏭</span>' +
                                '<div>' +
                                    '<div style="color:#C9A94E;font-weight:900;font-size:13px;">' + window.escapeHtml(wh.name) + '</div>' +
                                    '<div style="color:#A89070;font-size:10px;">' +
                                        (wh.type === 'main' ? 'رئيسي' : wh.type === 'branch' ? 'فرع' : 'مخزن') +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div style="text-align:left;">' +
                                '<div style="color:#4A8AB5;font-weight:900;font-size:18px;">' + qty + '</div>' +
                                '<div style="color:#A89070;font-size:9px;">قطعة</div>' +
                            '</div>' +
                        '</div>' +
                        '<div style="background:#1A1A1A;height:6px;border-radius:3px;overflow:hidden;">' +
                            '<div style="background:#4A8AB5;height:100%;width:' + percentage + '%;"></div>' +
                        '</div>' +
                        '<div style="text-align:center;font-size:10px;color:#5D5D5D;margin-top:4px;">' +
                            percentage.toFixed(1) + '% من الإجمالي' +
                        '</div>' +
                    '</div>';
                }
            });
        }

        if (!hasDistribution) {
            html += '<div style="text-align:center;padding:20px;color:#A89070;background:#0D0D0D;border-radius:10px;">' +
                '⚠️ لا يوجد توزيع مسجل' +
            '</div>';
        } else {
            const remaining = product.qty - totalDistributed;
            if (Math.abs(remaining) > 0.01) {
                html += '<div style="background:#2D0D0D;border-radius:8px;padding:10px;margin-top:6px;border-right:3px solid #E06060;">' +
                    '<div style="display:flex;justify-content:space-between;font-size:11px;">' +
                        '<span style="color:#E06060;">⚠️ غير موزع</span>' +
                        '<strong style="color:#E06060;">' + remaining + ' قطعة</strong>' +
                    '</div>' +
                '</div>';
            }
        }

        html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
        window.openModal(html);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: المستودعات (ERP)
    // ═══════════════════════════════════════════════════════════

    window.showERPTab = function(tab, btn) {
        ['warehouses', 'branches', 'currencies'].forEach(function(t) {
            const el = document.getElementById('erpTab' + t.charAt(0).toUpperCase() + t.slice(1));
            if (el) el.style.display = 'none';
        });

        const target = document.getElementById('erpTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
        if (target) target.style.display = 'block';

        document.querySelectorAll('#page-erp .tab-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        if (btn) btn.classList.add('active');

        if (tab === 'warehouses') window.renderWarehouses();
        if (tab === 'branches') window.renderBranches();
        if (tab === 'currencies') window.renderCurrencies();
    };

    window.saveWarehouse = function() {
        const id = document.getElementById('warehouseId') ? document.getElementById('warehouseId').value : '';
        const name = document.getElementById('warehouseName') ? document.getElementById('warehouseName').value.trim() : '';
        const type = document.getElementById('warehouseType') ? document.getElementById('warehouseType').value : 'storage';
        const location = document.getElementById('warehouseLocation') ? document.getElementById('warehouseLocation').value.trim() : '';
        const manager = document.getElementById('warehouseManager') ? document.getElementById('warehouseManager').value.trim() : '';

        if (!name) {
            window.showToast('⚠️ أدخل اسم المستودع', 'error');
            return;
        }

        if (id) {
            const idx = (window.warehouses || []).findIndex(function(w) { return w.id == id; });
            if (idx > -1) {
                window.warehouses[idx] = Object.assign({}, window.warehouses[idx], {
                    name: name,
                    type: type,
                    location: location,
                    manager: manager
                });
                window.DataStore.set('warehouses', window.warehouses);
                window.showToast('✅ تم التعديل', 'success');
            }
        } else {
            if ((window.warehouses || []).find(function(w) { return w.name === name; })) {
                window.showToast('⚠️ الاسم موجود', 'warning');
                return;
            }
            window.DataStore.add('warehouses', {
                id: window.generateId('wh_'),
                name: name,
                type: type,
                location: location,
                manager: manager,
                active: true
            });
            window.showToast('✅ تم الإضافة', 'success');
        }

        window.resetWarehouseForm();
    };

    window.resetWarehouseForm = function() {
        ['warehouseId', 'warehouseName', 'warehouseLocation', 'warehouseManager'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const typeEl = document.getElementById('warehouseType');
        if (typeEl) typeEl.value = 'storage';
        const titleEl = document.getElementById('warehouseFormTitle');
        if (titleEl) titleEl.textContent = '➕ إضافة مستودع جديد';
    };

    window.editWarehouse = function(id) {
        const w = (window.warehouses || []).find(function(x) { return x.id == id; });
        if (!w) return;

        const setVal = function(elId, val) {
            const el = document.getElementById(elId);
            if (el) el.value = val;
        };

        setVal('warehouseId', w.id);
        setVal('warehouseName', w.name);
        setVal('warehouseLocation', w.location || '');
        setVal('warehouseManager', w.manager || '');
        const typeEl = document.getElementById('warehouseType');
        if (typeEl) typeEl.value = w.type;
        const titleEl = document.getElementById('warehouseFormTitle');
        if (titleEl) titleEl.textContent = '✏️ تعديل المستودع';
    };

    window.deleteWarehouse = async function(id) {
        const w = (window.warehouses || []).find(function(x) { return x.id == id; });
        if (!w) return;

        const confirmed = await window.confirmDialog('حذف "' + w.name + '"؟');
        if (!confirmed) return;

        window.DataStore.remove('warehouses', id);
        window.populateWarehouseField();
        window.showToast('🗑️ تم الحذف', 'info');
    };

    window.renderWarehouses = function() {
        const c = document.getElementById('warehouseList');
        if (!c) return;

        if ((window.warehouses || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-warehouse"></i><span>لا توجد مستودعات</span></div>';
            return;
        }

        let html = '';
        window.warehouses.forEach(function(w) {
            const typeInfo = window.WAREHOUSE_TYPES[w.type] || { name: w.type, icon: '📦' };

            html += '<div class="cash-box-card" style="margin-bottom:10px;border-right:4px solid #4A8AB5;padding:14px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<div style="display:flex;align-items:center;gap:8px;">' +
                        '<span style="font-size:24px;">' + typeInfo.icon + '</span>' +
                        '<div>' +
                            '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + window.escapeHtml(w.name) + '</div>' +
                            '<div style="color:#A89070;font-size:10px;">' + typeInfo.name +
                                (w.location ? ' - ' + window.escapeHtml(w.location) : '') + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<span style="color:' + (w.active ? '#2D8F5E' : '#E06060') + ';font-size:11px;">' +
                        (w.active ? '✅' : '⏸️') +
                    '</span>' +
                '</div>' +
                (w.manager ? '<div style="font-size:11px;color:#A89070;margin-top:4px;">👤 ' + window.escapeHtml(w.manager) + '</div>' : '') +
                '<div style="display:flex;gap:6px;margin-top:10px;">' +
                    '<button onclick="showWarehouseStock(\'' + w.id + '\')" style="flex:1;background:#4A8AB5;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">📊 المخزون</button>' +
                    '<button onclick="editWarehouse(\'' + w.id + '\')" style="flex:1;background:#E6A830;border:none;color:#0D0D0D;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">✏️</button>' +
                    '<button onclick="deleteWarehouse(\'' + w.id + '\')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️</button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.showWarehouseStock = function(warehouseId) {
        const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });
        if (!warehouse) return;

        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🏭 مخزون ' + window.escapeHtml(warehouse.name) + '</h3>';

        const warehouseProducts = [];
        (window.products || []).forEach(function(p) {
            let qty = 0;
            if (p.warehouseStock && p.warehouseStock[warehouseId] !== undefined) {
                qty = p.warehouseStock[warehouseId];
            } else if (warehouse.type === 'main') {
                qty = p.qty || 0;
            }
            if (qty > 0) {
                warehouseProducts.push({
                    product: p,
                    qty: qty,
                    value: qty * (p.buy || 0)
                });
            }
        });

        const totalValue = warehouseProducts.reduce(function(s, i) { return s + i.value; }, 0);
        const totalQty = warehouseProducts.reduce(function(s, i) { return s + i.qty; }, 0);

        html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;border-right:4px solid #C9A94E;">' +
                '<div style="color:#A89070;font-size:11px;">الأصناف</div>' +
                '<div style="color:#C9A94E;font-size:20px;font-weight:900;">' + warehouseProducts.length + '</div>' +
            '</div>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;border-right:4px solid #4A8AB5;">' +
                '<div style="color:#A89070;font-size:11px;">الكمية</div>' +
                '<div style="color:#4A8AB5;font-size:20px;font-weight:900;">' + totalQty + '</div>' +
            '</div>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;border-right:4px solid #2D8F5E;">' +
                '<div style="color:#A89070;font-size:11px;">القيمة</div>' +
                '<div style="color:#2D8F5E;font-size:18px;font-weight:900;">' + window.formatMoney(totalValue) + '</div>' +
            '</div>' +
        '</div>';

        html += '<div style="max-height:400px;overflow-y:auto;">';
        if (warehouseProducts.length === 0) {
            html += '<div style="text-align:center;padding:40px;color:#5D5D5D;">لا يوجد مخزون</div>';
        } else {
            warehouseProducts.sort(function(a, b) { return b.value - a.value; }).forEach(function(item) {
                const color = item.qty <= (item.product.min || 5) ? '#E06060' : '#2D8F5E';
                html += '<div style="background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid ' + color + ';">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                        '<strong style="color:#C9A94E;font-size:13px;">' + window.escapeHtml(item.product.name) + '</strong>' +
                        '<span style="color:' + color + ';font-weight:900;font-size:15px;">' + item.qty + '</span>' +
                    '</div>' +
                    '<div style="display:flex;justify-content:space-between;font-size:11px;color:#A89070;margin-top:4px;">' +
                        '<span>شراء: ' + window.formatMoney(item.product.buy) + '</span>' +
                        '<span>قيمة: ' + window.formatMoney(item.value) + ' ج.م</span>' +
                    '</div>' +
                '</div>';
            });
        }
        html += '</div>';

        html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
        window.openModal(html);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: الفروع
    // ═══════════════════════════════════════════════════════════

    window.saveBranch = function() {
        const id = document.getElementById('branchId') ? document.getElementById('branchId').value : '';
        const name = document.getElementById('branchName') ? document.getElementById('branchName').value.trim() : '';
        const code = document.getElementById('branchCode') ? document.getElementById('branchCode').value.trim() : '';
        const address = document.getElementById('branchAddress') ? document.getElementById('branchAddress').value.trim() : '';
        const phone = document.getElementById('branchPhone') ? document.getElementById('branchPhone').value.trim() : '';

        if (!name) {
            window.showToast('⚠️ أدخل اسم الفرع', 'error');
            return;
        }

        if (id) {
            const idx = (window.branches || []).findIndex(function(b) { return b.id == id; });
            if (idx > -1) {
                window.branches[idx] = Object.assign({}, window.branches[idx], {
                    name: name, code: code, address: address, phone: phone
                });
                window.DataStore.set('branches', window.branches);
                window.showToast('✅ تم التعديل', 'success');
            }
        } else {
            window.DataStore.add('branches', {
                id: window.generateId('br_'),
                name: name,
                code: code || 'BR-' + String((window.branches || []).length + 1).padStart(3, '0'),
                address: address,
                phone: phone,
                manager: '',
                active: true
            });
            window.showToast('✅ تم الإضافة', 'success');
        }

        ['branchId', 'branchName', 'branchCode', 'branchAddress', 'branchPhone'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    };

    window.renderBranches = function() {
        const c = document.getElementById('branchList');
        if (!c) return;

        if ((window.branches || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i><span>لا توجد فروع</span></div>';
            return;
        }

        let html = '';
        window.branches.forEach(function(b) {
            html += '<div class="cash-box-card" style="margin-bottom:10px;border-right:4px solid #9B59B6;padding:14px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<div style="display:flex;align-items:center;gap:8px;">' +
                        '<span style="font-size:24px;">🏢</span>' +
                        '<div>' +
                            '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + window.escapeHtml(b.name) + '</div>' +
                            '<div style="color:#A89070;font-size:10px;">كود: ' + window.escapeHtml(b.code || '') + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                (b.address ? '<div style="font-size:11px;color:#A89070;">📍 ' + window.escapeHtml(b.address) + '</div>' : '') +
                (b.phone ? '<div style="font-size:11px;color:#A89070;">📞 ' + window.escapeHtml(b.phone) + '</div>' : '') +
                '<div style="display:flex;gap:6px;margin-top:10px;">' +
                    '<button onclick="deleteBranch(\'' + b.id + '\')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️ حذف</button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.deleteBranch = async function(id) {
        const confirmed = await window.confirmDialog('حذف هذا الفرع؟');
        if (!confirmed) return;

        window.DataStore.remove('branches', id);
        window.showToast('🗑️ تم الحذف', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: العملات
    // ═══════════════════════════════════════════════════════════

    window.loadCurrencies = function() {
        if (!window.currencies || window.currencies.length === 0) {
            window.currencies = window.DEFAULT_CURRENCIES || [];
        }
    };

    window.renderCurrencies = function() {
        const c = document.getElementById('currencyList');
        if (!c) return;

        window.loadCurrencies();

        let html = '<div style="background:#1A1A1A;border-radius:10px;padding:12px;margin-bottom:12px;color:#A89070;font-size:11px;text-align:center;">' +
            '💱 أسعار الصرف مقابل الجنيه المصري' +
        '</div>';

        window.currencies.forEach(function(curr) {
            html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid ' +
                (curr.isDefault ? '#C9A94E' : '#4A8AB5') + ';padding:12px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<div>' +
                        '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' +
                            curr.symbol + ' ' + window.escapeHtml(curr.name) + '</div>' +
                        '<div style="color:#A89070;font-size:10px;">' + curr.code +
                            (curr.isDefault ? ' ⭐' : '') + '</div>' +
                    '</div>' +
                    '<div style="text-align:left;">' +
                        '<div style="color:#2D8F5E;font-weight:900;font-size:15px;">' +
                            curr.rate.toFixed(2) + '</div>' +
                        '<div style="color:#A89070;font-size:9px;">ج.م لكل وحدة</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    window.EventBus.on('data:warehouses:changed', function() {
        window.populateWarehouseField();
    });

    window.__inventoryLoaded = true;
    console.log('✅ inventory.js v19.0 جاهز');

})();
