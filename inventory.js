// ============================================================
// الميزان 17.0 - inventory.js
// المخزون + المستودعات + الفروع + العملات + المخازن
// يدمج: app.js (products) + erp.js + warehouse-management.js
// ============================================================

console.log('📦 تحميل inventory.js v17.0');

// ═══════════════════════════════════════════════════════════
// الجزء 1: إدارة المنتجات
// ═══════════════════════════════════════════════════════════

window.saveProduct = function() {
    if (!window.canAdd()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    
    const id = document.getElementById('productId') ? document.getElementById('productId').value : '';
    const name = document.getElementById('productName') ? document.getElementById('productName').value.trim() : '';
    const barcode = document.getElementById('productBarcode') ? document.getElementById('productBarcode').value.trim() : '';
    const buy = parseFloat(document.getElementById('productBuy') ? document.getElementById('productBuy').value : 0) || 0;
    const sell = parseFloat(document.getElementById('productSell') ? document.getElementById('productSell').value : 0) || 0;
    const qty = parseInt(document.getElementById('productQty') ? document.getElementById('productQty').value : 0) || 0;
    const min = parseInt(document.getElementById('productMin') ? document.getElementById('productMin').value : 5) || 5;

    if (!name) { window.showToast('⚠️ أدخل اسم المنتج', 'error'); return; }

    if (id) {
        const idx = (window.products || []).findIndex(function(p) { return p.id == id; });
        if (idx > -1) {
            window.products[idx] = Object.assign({}, window.products[idx], { 
                name: name, barcode: barcode, buy: buy, sell: sell, qty: qty, min: min 
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        if ((window.products || []).find(function(p) { return p.name === name; })) { 
            window.showToast('⚠️ الاسم موجود', 'warning'); 
            return; 
        }
        
        // ربط المنتج بالمستودع الرئيسي
        const mainWh = (window.warehouses || []).find(function(w) { return w.type === 'main'; }) 
            || (window.warehouses || [])[0];
        const warehouseStock = {};
        if (mainWh && qty > 0) {
            warehouseStock[mainWh.id] = qty;
        }
        
        window.products.push({ 
            id: Date.now(), 
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
    
    window.setData('products', window.products);
    window.resetProductForm();
    window.renderProducts();
    window.populateSaleProducts();
    window.populatePurProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();
};

window.resetProductForm = function() {
    ['productId','productName','productBarcode','productBuy','productSell','productQty'].forEach(function(id) {
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

window.deleteProduct = function(id) {
    if (!window.canDelete()) { window.showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const p = (window.products || []).find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (!confirm('⚠️ حذف "' + p.name + '"؟')) return;
    
    window.products = window.products.filter(function(pr) { return pr.id !== id; });
    window.setData('products', window.products);
    window.renderProducts();
    window.populateSaleProducts();
    window.populatePurProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();
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
    
    let html = '<div class="table-header" style="grid-template-columns: 1.4fr 0.7fr 0.7fr 0.7fr 1.4fr;"><span>الاسم</span><span>الشراء</span><span>البيع</span><span>الكمية</span><span></span></div>';
    
    filtered.forEach(function(p) {
        const qtyColor = p.qty > (p.min || 5) ? '#C9A94E' : '#E06060';
        html += '<div class="table-row" style="grid-template-columns: 1.4fr 0.7fr 0.7fr 0.7fr 1.4fr;">' +
            '<span><strong>' + p.name + '</strong>' +
                (p.barcode ? '<br><small style="color:#A89070;font-size:9px;">' + p.barcode + '</small>' : '') +
            '</span>' +
            '<span style="color:#E06060;">' + window.formatMoney(p.buy) + '</span>' +
            '<span style="color:#2D8F5E;">' + window.formatMoney(p.sell) + '</span>' +
            '<span style="color:' + qtyColor + ';font-weight:900;">' + p.qty + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-info btn-sm" onclick="showProductWarehouses(' + p.id + ')" title="توزيع المستودعات"><i class="fas fa-warehouse"></i></button>' +
                '<button class="btn btn-warning btn-sm" onclick="editProduct(' + p.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteProduct(' + p.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    
    c.innerHTML = html;
};

window.showProductWarehouses = function(productId) {
    const product = (window.products || []).find(function(p) { return p.id == productId; });
    if (!product) return;
    
    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>🏭 توزيع ' + product.name + '</h3>';
    
    html += '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:10px;padding:14px;text-align:center;color:#0D0D0D;margin-bottom:12px;">' +
        '<div style="font-size:11px;opacity:0.8;">الإجمالي</div>' +
        '<div style="font-size:28px;font-weight:900;">' + product.qty + '</div>' +
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
                                '<div style="color:#C9A94E;font-weight:900;font-size:13px;">' + wh.name + '</div>' +
                                '<div style="color:#A89070;font-size:10px;">' + (wh.type === 'main' ? 'رئيسي' : wh.type === 'branch' ? 'فرع' : 'مخزن') + '</div>' +
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
                    '<div style="text-align:center;font-size:10px;color:#5D5D5D;margin-top:4px;">' + percentage.toFixed(1) + '% من الإجمالي</div>' +
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
// الجزء 2: ERP - المستودعات
// ═══════════════════════════════════════════════════════════

window.WAREHOUSE_TYPES = {
    'main':     { name: 'رئيسي',   icon: '🏭' },
    'branch':   { name: 'فرع',     icon: '🏪' },
    'storage':  { name: 'مخزن',    icon: '📦' },
    'returns':  { name: 'مرتجعات', icon: '🔄' }
};

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

    if (!name) { window.showToast('⚠️ أدخل اسم المستودع', 'error'); return; }

    if (id) {
        const idx = (window.warehouses || []).findIndex(function(w) { return w.id == id; });
        if (idx > -1) {
            window.warehouses[idx] = Object.assign({}, window.warehouses[idx], {
                name: name, type: type, location: location, manager: manager
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        if ((window.warehouses || []).find(function(w) { return w.name === name; })) {
            window.showToast('⚠️ الاسم موجود', 'warning');
            return;
        }
        window.warehouses.push({
            id: Date.now(), name: name, type: type,
            location: location, manager: manager,
            active: true, createdAt: new Date().toISOString()
        });
        window.showToast('✅ تم الإضافة', 'success');
    }

    window.setData('warehouses', window.warehouses);
    window.resetWarehouseForm();
    window.renderWarehouses();
    window.populateWarehouseField();
    if (typeof window.populateWarehouseDropdowns === 'function') window.populateWarehouseDropdowns();
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

window.deleteWarehouse = function(id) {
    if (!confirm('⚠️ حذف هذا المستودع؟')) return;
    window.warehouses = (window.warehouses || []).filter(function(w) { return w.id != id; });
    window.setData('warehouses', window.warehouses);
    window.renderWarehouses();
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
                        '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + w.name + '</div>' +
                        '<div style="color:#A89070;font-size:10px;">' + typeInfo.name + (w.location ? ' - ' + w.location : '') + '</div>' +
                    '</div>' +
                '</div>' +
                '<span style="color:' + (w.active ? '#2D8F5E' : '#E06060') + ';font-size:11px;">' +
                    (w.active ? '✅ نشط' : '⏸️ موقوف') +
                '</span>' +
            '</div>' +
            (w.manager ? '<div style="font-size:11px;color:#A89070;margin-top:4px;">👤 ' + w.manager + '</div>' : '') +
            '<div style="display:flex;gap:6px;margin-top:10px;">' +
                '<button onclick="showWarehouseStock(' + w.id + ')" style="flex:1;background:#4A8AB5;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">📊 المخزون</button>' +
                '<button onclick="editWarehouse(' + w.id + ')" style="flex:1;background:#E6A830;border:none;color:#0D0D0D;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">✏️</button>' +
                '<button onclick="deleteWarehouse(' + w.id + ')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️</button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
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

    if (!name) { window.showToast('⚠️ أدخل اسم الفرع', 'error'); return; }

    if (!window.branches) window.branches = [];

    if (id) {
        const idx = window.branches.findIndex(function(b) { return b.id == id; });
        if (idx > -1) {
            window.branches[idx] = Object.assign({}, window.branches[idx], {
                name: name, code: code, address: address, phone: phone
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        window.branches.push({
            id: Date.now(), name: name,
            code: code || 'BR-' + String(window.branches.length + 1).padStart(3, '0'),
            address: address, phone: phone, manager: '',
            active: true, createdAt: new Date().toISOString()
        });
        window.showToast('✅ تم الإضافة', 'success');
    }

    window.setData('branches', window.branches);
    ['branchId', 'branchName', 'branchCode', 'branchAddress', 'branchPhone'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    window.renderBranches();
};

window.renderBranches = function() {
    const c = document.getElementById('branchList');
    if (!c) return;

    if (!window.branches) window.branches = [];

    if (window.branches.length === 0) {
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
                        '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + b.name + '</div>' +
                        '<div style="color:#A89070;font-size:10px;">كود: ' + b.code + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            (b.address ? '<div style="font-size:11px;color:#A89070;">📍 ' + b.address + '</div>' : '') +
            (b.phone ? '<div style="font-size:11px;color:#A89070;">📞 ' + b.phone + '</div>' : '') +
            '<div style="display:flex;gap:6px;margin-top:10px;">' +
                '<button onclick="deleteBranch(' + b.id + ')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️ حذف</button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.deleteBranch = function(id) {
    if (!confirm('⚠️ حذف هذا الفرع؟')) return;
    window.branches = (window.branches || []).filter(function(b) { return b.id != id; });
    window.setData('branches', window.branches);
    window.renderBranches();
    window.showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// الجزء 4: العملات
// ═══════════════════════════════════════════════════════════

window.loadCurrencies = function() {
    if (!window.currencies || window.currencies.length === 0) {
        window.currencies = window.DEFAULT_CURRENCIES || [
            { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', rate: 1, isDefault: true },
            { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 50.00, isDefault: false },
            { code: 'EUR', name: 'يورو', symbol: '€', rate: 54.00, isDefault: false },
            { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 13.33, isDefault: false },
            { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 13.60, isDefault: false }
        ];
    }
};

window.convertCurrency = function(amount, fromCode, toCode) {
    if (!window.currencies || window.currencies.length === 0) return amount;
    const from = window.currencies.find(function(c) { return c.code === fromCode; });
    const to = window.currencies.find(function(c) { return c.code === toCode; });
    if (!from || !to) return amount;
    const amountInEGP = amount * from.rate;
    return amountInEGP / to.rate;
};

window.renderCurrencies = function() {
    const c = document.getElementById('currencyList');
    if (!c) return;

    window.loadCurrencies();

    let html = '<div style="background:#1A1A1A;border-radius:10px;padding:12px;margin-bottom:12px;color:#A89070;font-size:11px;text-align:center;">' +
        '💱 أسعار الصرف مقابل الجنيه المصري' +
    '</div>';

    window.currencies.forEach(function(curr) {
        html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid ' + (curr.isDefault ? '#C9A94E' : '#4A8AB5') + ';padding:12px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<div>' +
                    '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + curr.symbol + ' ' + curr.name + '</div>' +
                    '<div style="color:#A89070;font-size:10px;">' + curr.code + (curr.isDefault ? ' ⭐' : '') + '</div>' +
                '</div>' +
                '<div style="text-align:left;">' +
                    '<div style="color:#2D8F5E;font-weight:900;font-size:15px;">' + curr.rate.toFixed(2) + '</div>' +
                    '<div style="color:#A89070;font-size:9px;">ج.م لكل وحدة</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الجزء 5: عرض مخزون المستودع
// ═══════════════════════════════════════════════════════════

window.showWarehouseStock = function(warehouseId) {
    const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });
    if (!warehouse) return;

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>🏭 مخزون ' + warehouse.name + '</h3>';

    const warehouseProducts = [];
    (window.products || []).forEach(function(p) {
        let qty = 0;
        if (p.warehouseStock && p.warehouseStock[warehouseId] !== undefined) {
            qty = p.warehouseStock[warehouseId];
        } else if (warehouse.type === 'main' || warehouse.isDefault) {
            qty = p.qty || 0;
        }
        if (qty > 0) {
            warehouseProducts.push({
                product: p, qty: qty, value: qty * (p.buy || 0)
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
                    '<strong style="color:#C9A94E;font-size:13px;">' + item.product.name + '</strong>' +
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
// الجزء 6: إدارة المخازن (أذون)
// ═══════════════════════════════════════════════════════════

window.warehouseReceipts = window.warehouseReceipts || [];
window.warehouseIssues = window.warehouseIssues || [];
window.warehouseTransfers = window.warehouseTransfers || [];
window.warehouseAdjustments = window.warehouseAdjustments || [];
window.openingBalances = window.openingBalances || [];
window.currentWarehouseItems = [];
window.currentWarehouseType = '';

window.loadWarehouseData = function() {
    try {
        window.warehouseReceipts = window.toArray(window.getData('warehouseReceipts', []));
        window.warehouseIssues = window.toArray(window.getData('warehouseIssues', []));
        window.warehouseTransfers = window.toArray(window.getData('warehouseTransfers', []));
        window.warehouseAdjustments = window.toArray(window.getData('warehouseAdjustments', []));
        window.openingBalances = window.toArray(window.getData('openingBalances', []));
    } catch (e) {
        console.error('❌ خطأ تحميل المخازن:', e);
    }
};

window.showWarehouseTab = function(tab, btn) {
    ['receipts', 'issues', 'transfers', 'adjustments', 'opening', 'reports'].forEach(function(t) {
        const el = document.getElementById('whTab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (el) el.style.display = 'none';
    });

    const target = document.getElementById('whTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (target) target.style.display = 'block';

    document.querySelectorAll('#page-warehouses .tab-btn').forEach(function(b) {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    if (tab === 'receipts') window.renderWarehouseReceipts();
    if (tab === 'issues') window.renderWarehouseIssues();
    if (tab === 'transfers') window.renderWarehouseTransfers();
    if (tab === 'adjustments') window.renderWarehouseAdjustments();
    if (tab === 'opening') window.renderOpeningBalances();
};

window.populateWarehouseDropdowns = function() {
    const ids = ['whReceiptWarehouse', 'whIssueWarehouse', 'whTransferFrom', 'whTransferTo', 'whAdjustWarehouse', 'obWarehouse'];
    
    ids.forEach(function(id) {
        const sel = document.getElementById(id);
        if (!sel) return;
        const cv = sel.value;
        let html = '<option value="">اختر المستودع...</option>';
        (window.warehouses || []).forEach(function(w) {
            html += '<option value="' + w.id + '">' + w.name + '</option>';
        });
        sel.innerHTML = html;
        sel.value = cv;
    });

    // الموردين
    const supSel = document.getElementById('whReceiptSupplier');
    if (supSel) {
        const cv = supSel.value;
        let html = '<option value="">اختر مورد (اختياري)</option>';
        (window.suppliers || []).forEach(function(s) {
            html += '<option value="' + s.name + '">' + s.name + '</option>';
        });
        supSel.innerHTML = html;
        supSel.value = cv;
    }

    // العملاء
    const cusSel = document.getElementById('whIssueCustomer');
    if (cusSel) {
        const cv = cusSel.value;
        let html = '<option value="">اختر عميل (اختياري)</option>';
        (window.customers || []).forEach(function(c) {
            html += '<option value="' + c.name + '">' + c.name + '</option>';
        });
        cusSel.innerHTML = html;
        cusSel.value = cv;
    }

    // المنتجات
    const productIds = ['whReceiptProduct', 'whIssueProduct', 'whTransferProduct', 'whAdjustProduct', 'obProduct'];
    productIds.forEach(function(id) {
        const sel = document.getElementById(id);
        if (!sel) return;
        const cv = sel.value;
        let html = '<option value="">اختر منتج...</option>';
        (window.products || []).forEach(function(p) {
            html += '<option value="' + p.id + '">' + p.name + ' (متاح: ' + p.qty + ')</option>';
        });
        sel.innerHTML = html;
        sel.value = cv;
    });
};

window.updateWarehouseProductPrice = function(type) {
    const productId = document.getElementById(type + 'Product') ? document.getElementById(type + 'Product').value : '';
    const priceInput = document.getElementById(type + 'Price');
    const actualQtyInput = document.getElementById(type + 'ActualQty');
    
    if (!productId) {
        if (priceInput) priceInput.value = '';
        if (actualQtyInput) actualQtyInput.value = '';
        return;
    }
    
    const product = (window.products || []).find(function(p) { return p.id == productId; });
    if (product) {
        if (priceInput) priceInput.value = product.buy;
        if (actualQtyInput) actualQtyInput.value = product.qty;
    }
};

window.addWarehouseVoucherItem = function(type) {
    const productId = document.getElementById(type + 'Product') ? document.getElementById(type + 'Product').value : '';
    const qtyInput = document.getElementById(type + 'Qty');
    const priceInput = document.getElementById(type + 'Price');
    const actualQtyInput = document.getElementById(type + 'ActualQty');
    
    let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    let price = parseFloat(priceInput ? priceInput.value : 0) || 0;
    let actualQty = actualQtyInput ? (parseInt(actualQtyInput.value) || 0) : qty;

    if (!productId) { window.showToast('⚠️ اختر منتج', 'error'); return; }
    const product = (window.products || []).find(function(p) { return p.id == productId; });
    if (!product) return;
    if (qty <= 0) qty = 1;
    if (price <= 0) price = product.buy;

    // نوع الإذن
    window.currentWarehouseType = type;

    const existing = window.currentWarehouseItems.find(function(i) { return i.productId == productId; });
    if (existing) {
        existing.qty += qty;
        existing.total = existing.qty * existing.price;
        if (actualQtyInput) existing.actualQty = actualQty;
    } else {
        window.currentWarehouseItems.push({
            productId: product.id,
            name: product.name,
            barcode: product.barcode || '',
            qty: qty,
            price: price,
            total: qty * price,
            actualQty: actualQty,
            systemQty: product.qty
        });
    }

    if (qtyInput) qtyInput.value = 1;
    if (priceInput) priceInput.value = '';
    if (actualQtyInput) actualQtyInput.value = '';

    window.renderWarehouseVoucherItems(type + 'ItemsContainer');
    window.updateWarehouseVoucherTotals(type);
    window.showToast('✅ تم إضافة ' + product.name, 'success');
};

window.removeWarehouseVoucherItem = function(index, containerId) {
    window.currentWarehouseItems.splice(index, 1);
    window.renderWarehouseVoucherItems(containerId);
    
    const typeMap = {
        'whReceiptItemsContainer': 'whReceipt',
        'whIssueItemsContainer': 'whIssue',
        'whTransferItemsContainer': 'whTransfer',
        'whAdjustItemsContainer': 'whAdjust',
        'obItemsContainer': 'ob'
    };
    if (typeMap[containerId]) window.updateWarehouseVoucherTotals(typeMap[containerId]);
};

window.renderWarehouseVoucherItems = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!window.currentWarehouseItems || window.currentWarehouseItems.length === 0) {
        container.innerHTML = '<div class="empty-items"><i class="fas fa-box"></i><span>لا توجد أصناف</span></div>';
        return;
    }

    let html = '<div class="items-header-row" style="grid-template-columns: 40px 2fr 0.7fr 0.8fr 0.9fr 40px;">' +
        '<span>#</span><span>الصنف</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span></div>';

    window.currentWarehouseItems.forEach(function(item, i) {
        html += '<div class="item-row" style="grid-template-columns: 40px 2fr 0.7fr 0.8fr 0.9fr 40px;">' +
            '<span class="item-id">' + (i + 1) + '</span>' +
            '<span class="item-name">' + item.name + '</span>' +
            '<span class="item-qty">' + item.qty + '</span>' +
            '<span class="item-price">' + window.formatMoney(item.price) + '</span>' +
            '<span class="item-total">' + window.formatMoney(item.total) + '</span>' +
            '<button class="item-delete" onclick="removeWarehouseVoucherItem(' + i + ', \'' + containerId + '\')"><i class="fas fa-times"></i></button>' +
        '</div>';
    });

    container.innerHTML = html;
};

window.updateWarehouseVoucherTotals = function(type) {
    const total = window.currentWarehouseItems.reduce(function(s, i) { return s + i.total; }, 0);
    const totalQty = window.currentWarehouseItems.reduce(function(s, i) { return s + i.qty; }, 0);

    const totalsMap = {
        'whReceipt': { items: 'whReceiptItemsCount', qty: 'whReceiptTotalQty', total: 'whReceiptTotal' },
        'whIssue': { items: 'whIssueItemsCount', qty: 'whIssueTotalQty', total: 'whIssueTotal' },
        'whTransfer': { items: 'whTransferItemsCount', qty: 'whTransferTotalQty', total: 'whTransferTotal' },
        'whAdjust': { items: 'whAdjustItemsCount', qty: 'whAdjustTotalQty', total: 'whAdjustTotal' },
        'ob': { items: 'obItemsCount', qty: 'obTotalQty', total: 'obTotal' }
    };

    const map = totalsMap[type];
    if (map) {
        const set = function(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        set(map.items, window.currentWarehouseItems.length);
        set(map.qty, totalQty);
        set(map.total, window.formatMoney(total) + ' ج.م');
    }
};

// ═══════════════════════════════════════════════════════════
// الجزء 7: أذون الإضافة
// ═══════════════════════════════════════════════════════════

window.createWarehouseReceipt = function() {
    const warehouseId = document.getElementById('whReceiptWarehouse') ? document.getElementById('whReceiptWarehouse').value : '';
    const source = document.getElementById('whReceiptSource') ? document.getElementById('whReceiptSource').value.trim() : '';
    const supplier = document.getElementById('whReceiptSupplier') ? document.getElementById('whReceiptSupplier').value : '';
    const date = document.getElementById('whReceiptDate') ? document.getElementById('whReceiptDate').value : window.getTodayDate();
    const notes = document.getElementById('whReceiptNotes') ? document.getElementById('whReceiptNotes').value.trim() : '';

    if (!warehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }
    if (window.currentWarehouseItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }

    const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });

    window.currentWarehouseItems.forEach(function(item) {
        const product = (window.products || []).find(function(p) { return p.id == item.productId; });
        if (product) {
            product.qty = (product.qty || 0) + item.qty;
            if (item.price > 0) product.buy = item.price;

            if (!product.warehouseStock) product.warehouseStock = {};
            product.warehouseStock[warehouseId] = (product.warehouseStock[warehouseId] || 0) + item.qty;
        }
    });

    const receipt = {
        id: Date.now(),
        number: window.warehouseReceipts.length + 1,
        warehouseId: warehouseId,
        warehouseName: warehouse ? warehouse.name : '',
        source: source, supplier: supplier, notes: notes,
        items: JSON.parse(JSON.stringify(window.currentWarehouseItems)),
        totalValue: window.currentWarehouseItems.reduce(function(s, i) { return s + (i.qty * i.price); }, 0),
        date: date, time: window.getNowTime(),
        createdBy: window.currentUser ? window.currentUser.name : '',
        type: 'receipt'
    };

    window.warehouseReceipts.push(receipt);
    window.setData('products', window.products);
    window.setData('warehouseReceipts', window.warehouseReceipts);

    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    window.currentWarehouseItems = [];
    window.resetWarehouseReceiptForm();
    window.renderWarehouseReceipts();

    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.populateSaleProducts === 'function') window.populateSaleProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();

    window.showToast('✅ إذن إضافة #' + receipt.number, 'success');
};

window.resetWarehouseReceiptForm = function() {
    ['whReceiptSource','whReceiptNotes'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const dateEl = document.getElementById('whReceiptDate');
    if (dateEl) dateEl.value = window.getTodayDate();
    window.currentWarehouseItems = [];
    window.renderWarehouseVoucherItems('whReceiptItemsContainer');
    window.updateWarehouseVoucherTotals('whReceipt');
};

window.renderWarehouseReceipts = function() {
    const c = document.getElementById('whReceiptsList');
    if (!c) return;
    if (window.warehouseReceipts.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-arrow-down"></i><span>لا توجد أذون إضافة</span></div>';
        return;
    }
    const sorted = window.warehouseReceipts.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 30);
    let html = '';
    sorted.forEach(function(r) {
        html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid #2D8F5E;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<strong style="color:#2D8F5E;font-size:13px;">📥 إذن إضافة #' + r.number + '</strong>' +
                '<span style="font-size:10px;color:#A89070;">' + r.date + '</span>' +
            '</div>' +
            '<div style="font-size:11px;color:#A89070;margin-bottom:4px;">🏭 ' + r.warehouseName + '</div>' +
            (r.supplier ? '<div style="font-size:11px;color:#A89070;">🚚 ' + r.supplier + '</div>' : '') +
            '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:6px;border-top:1px dashed #2D2D2D;margin-top:6px;">' +
                '<span style="color:#A89070;">' + r.items.length + ' صنف</span>' +
                '<strong style="color:#2D8F5E;">' + window.formatMoney(r.totalValue) + ' ج.م</strong>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الجزء 8: أذون الصرف
// ═══════════════════════════════════════════════════════════

window.createWarehouseIssue = function() {
    const warehouseId = document.getElementById('whIssueWarehouse') ? document.getElementById('whIssueWarehouse').value : '';
    const destination = document.getElementById('whIssueDestination') ? document.getElementById('whIssueDestination').value.trim() : '';
    const customer = document.getElementById('whIssueCustomer') ? document.getElementById('whIssueCustomer').value : '';
    const date = document.getElementById('whIssueDate') ? document.getElementById('whIssueDate').value : window.getTodayDate();
    const notes = document.getElementById('whIssueNotes') ? document.getElementById('whIssueNotes').value.trim() : '';

    if (!warehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }
    if (window.currentWarehouseItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }

    for (let i = 0; i < window.currentWarehouseItems.length; i++) {
        const item = window.currentWarehouseItems[i];
        const product = (window.products || []).find(function(p) { return p.id == item.productId; });
        if (!product) { window.showToast('⚠️ المنتج غير موجود', 'error'); return; }
        if (product.qty < item.qty) {
            window.showToast('⚠️ الكمية غير كافية: ' + product.name, 'error');
            return;
        }
    }

    const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });

    window.currentWarehouseItems.forEach(function(item) {
        const product = (window.products || []).find(function(p) { return p.id == item.productId; });
        if (product) {
            product.qty = Math.max(0, (product.qty || 0) - item.qty);
            if (product.warehouseStock && product.warehouseStock[warehouseId]) {
                product.warehouseStock[warehouseId] = Math.max(0, product.warehouseStock[warehouseId] - item.qty);
            }
        }
    });

    const issue = {
        id: Date.now(),
        number: window.warehouseIssues.length + 1,
        warehouseId: warehouseId,
        warehouseName: warehouse ? warehouse.name : '',
        destination: destination, customer: customer, notes: notes,
        items: JSON.parse(JSON.stringify(window.currentWarehouseItems)),
        totalValue: window.currentWarehouseItems.reduce(function(s, i) { return s + (i.qty * i.price); }, 0),
        date: date, time: window.getNowTime(),
        createdBy: window.currentUser ? window.currentUser.name : '',
        type: 'issue'
    };

    window.warehouseIssues.push(issue);
    window.setData('products', window.products);
    window.setData('warehouseIssues', window.warehouseIssues);

    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    window.currentWarehouseItems = [];
    window.resetWarehouseIssueForm();
    window.renderWarehouseIssues();

    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.populateSaleProducts === 'function') window.populateSaleProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();

    window.showToast('✅ إذن صرف #' + issue.number, 'success');
};

window.resetWarehouseIssueForm = function() {
    ['whIssueDestination','whIssueNotes'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const dateEl = document.getElementById('whIssueDate');
    if (dateEl) dateEl.value = window.getTodayDate();
    window.currentWarehouseItems = [];
    window.renderWarehouseVoucherItems('whIssueItemsContainer');
    window.updateWarehouseVoucherTotals('whIssue');
};

window.renderWarehouseIssues = function() {
    const c = document.getElementById('whIssuesList');
    if (!c) return;
    if (window.warehouseIssues.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-arrow-up"></i><span>لا توجد أذون صرف</span></div>';
        return;
    }
    const sorted = window.warehouseIssues.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 30);
    let html = '';
    sorted.forEach(function(r) {
        html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid #E06060;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<strong style="color:#E06060;font-size:13px;">📤 إذن صرف #' + r.number + '</strong>' +
                '<span style="font-size:10px;color:#A89070;">' + r.date + '</span>' +
            '</div>' +
            '<div style="font-size:11px;color:#A89070;margin-bottom:4px;">🏭 ' + r.warehouseName + '</div>' +
            (r.destination ? '<div style="font-size:11px;color:#A89070;">📍 ' + r.destination + '</div>' : '') +
            '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:6px;border-top:1px dashed #2D2D2D;margin-top:6px;">' +
                '<span style="color:#A89070;">' + r.items.length + ' صنف</span>' +
                '<strong style="color:#E06060;">' + window.formatMoney(r.totalValue) + ' ج.م</strong>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الجزء 9: التحويلات
// ═══════════════════════════════════════════════════════════

window.createWarehouseTransfer = function() {
    const fromId = document.getElementById('whTransferFrom') ? document.getElementById('whTransferFrom').value : '';
    const toId = document.getElementById('whTransferTo') ? document.getElementById('whTransferTo').value : '';
    const date = document.getElementById('whTransferDate') ? document.getElementById('whTransferDate').value : window.getTodayDate();
    const notes = document.getElementById('whTransferNotes') ? document.getElementById('whTransferNotes').value.trim() : '';

    if (!fromId) { window.showToast('⚠️ اختر المستودع المصدر', 'error'); return; }
    if (!toId) { window.showToast('⚠️ اختر المستودع الهدف', 'error'); return; }
    if (fromId === toId) { window.showToast('⚠️ لا يمكن التحويل لنفس المستودع', 'error'); return; }
    if (window.currentWarehouseItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }

    const fromWh = (window.warehouses || []).find(function(w) { return w.id == fromId; });
    const toWh = (window.warehouses || []).find(function(w) { return w.id == toId; });

    window.currentWarehouseItems.forEach(function(item) {
        const product = (window.products || []).find(function(p) { return p.id == item.productId; });
        if (product) {
            if (!product.warehouseStock) product.warehouseStock = {};
            product.warehouseStock[fromId] = Math.max(0, (product.warehouseStock[fromId] || 0) - item.qty);
            product.warehouseStock[toId] = (product.warehouseStock[toId] || 0) + item.qty;
        }
    });

    const transfer = {
        id: Date.now(),
        number: window.warehouseTransfers.length + 1,
        fromId: fromId, fromName: fromWh ? fromWh.name : '',
        toId: toId, toName: toWh ? toWh.name : '',
        notes: notes,
        items: JSON.parse(JSON.stringify(window.currentWarehouseItems)),
        totalValue: window.currentWarehouseItems.reduce(function(s, i) { return s + (i.qty * i.price); }, 0),
        date: date, time: window.getNowTime(),
        createdBy: window.currentUser ? window.currentUser.name : '',
        type: 'transfer'
    };

    window.warehouseTransfers.push(transfer);
    window.setData('products', window.products);
    window.setData('warehouseTransfers', window.warehouseTransfers);

    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    window.currentWarehouseItems = [];
    window.resetWarehouseTransferForm();
    window.renderWarehouseTransfers();

    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();

    window.showToast('✅ تحويل #' + transfer.number, 'success');
};

window.resetWarehouseTransferForm = function() {
    const notesEl = document.getElementById('whTransferNotes');
    if (notesEl) notesEl.value = '';
    const dateEl = document.getElementById('whTransferDate');
    if (dateEl) dateEl.value = window.getTodayDate();
    window.currentWarehouseItems = [];
    window.renderWarehouseVoucherItems('whTransferItemsContainer');
    window.updateWarehouseVoucherTotals('whTransfer');
};

window.renderWarehouseTransfers = function() {
    const c = document.getElementById('whTransfersList');
    if (!c) return;
    if (window.warehouseTransfers.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-exchange-alt"></i><span>لا توجد تحويلات</span></div>';
        return;
    }
    const sorted = window.warehouseTransfers.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 30);
    let html = '';
    sorted.forEach(function(r) {
        html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid #4A8AB5;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<strong style="color:#4A8AB5;font-size:13px;">🔄 تحويل #' + r.number + '</strong>' +
                '<span style="font-size:10px;color:#A89070;">' + r.date + '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:11px;">' +
                '<span style="color:#E06060;">📤 ' + r.fromName + '</span>' +
                '<i class="fas fa-arrow-left" style="color:#C9A94E;"></i>' +
                '<span style="color:#2D8F5E;">📥 ' + r.toName + '</span>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:6px;border-top:1px dashed #2D2D2D;">' +
                '<span style="color:#A89070;">' + r.items.length + ' صنف</span>' +
                '<strong style="color:#4A8AB5;">' + window.formatMoney(r.totalValue) + ' ج.م</strong>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الجزء 10: تسوية الجرد
// ═══════════════════════════════════════════════════════════

window.createWarehouseAdjustment = function() {
    const warehouseId = document.getElementById('whAdjustWarehouse') ? document.getElementById('whAdjustWarehouse').value : '';
    const date = document.getElementById('whAdjustDate') ? document.getElementById('whAdjustDate').value : window.getTodayDate();
    const notes = document.getElementById('whAdjustNotes') ? document.getElementById('whAdjustNotes').value.trim() : '';

    if (!warehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }
    if (window.currentWarehouseItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }

    const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });

    window.currentWarehouseItems.forEach(function(item) {
        const product = (window.products || []).find(function(p) { return p.id == item.productId; });
        if (product) {
            const currentQty = product.qty || 0;
            const actualQty = item.actualQty !== undefined ? item.actualQty : currentQty;
            item.diff = actualQty - currentQty;
            item.systemQty = currentQty;
            product.qty = actualQty;
            
            if (!product.warehouseStock) product.warehouseStock = {};
            product.warehouseStock[warehouseId] = actualQty;
        }
    });

    const adjustment = {
        id: Date.now(),
        number: window.warehouseAdjustments.length + 1,
        warehouseId: warehouseId,
        warehouseName: warehouse ? warehouse.name : '',
        notes: notes,
        items: JSON.parse(JSON.stringify(window.currentWarehouseItems)),
        date: date, time: window.getNowTime(),
        createdBy: window.currentUser ? window.currentUser.name : '',
        type: 'adjustment'
    };

    window.warehouseAdjustments.push(adjustment);
    window.setData('products', window.products);
    window.setData('warehouseAdjustments', window.warehouseAdjustments);

    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    window.currentWarehouseItems = [];
    window.resetWarehouseAdjustmentForm();
    window.renderWarehouseAdjustments();

    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();

    window.showToast('✅ تسوية #' + adjustment.number, 'success');
};

window.resetWarehouseAdjustmentForm = function() {
    const notesEl = document.getElementById('whAdjustNotes');
    if (notesEl) notesEl.value = '';
    const dateEl = document.getElementById('whAdjustDate');
    if (dateEl) dateEl.value = window.getTodayDate();
    window.currentWarehouseItems = [];
    window.renderWarehouseVoucherItems('whAdjustItemsContainer');
    window.updateWarehouseVoucherTotals('whAdjust');
};

window.renderWarehouseAdjustments = function() {
    const c = document.getElementById('whAdjustmentsList');
    if (!c) return;
    if (window.warehouseAdjustments.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-balance-scale"></i><span>لا توجد تسويات</span></div>';
        return;
    }
    const sorted = window.warehouseAdjustments.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 30);
    let html = '';
    sorted.forEach(function(r) {
        html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid #E6A830;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<strong style="color:#E6A830;font-size:13px;">⚖️ تسوية #' + r.number + '</strong>' +
                '<span style="font-size:10px;color:#A89070;">' + r.date + '</span>' +
            '</div>' +
            '<div style="font-size:11px;color:#A89070;">🏭 ' + r.warehouseName + '</div>' +
            '<div style="font-size:12px;text-align:center;padding:6px;background:#0D0D0D;border-radius:6px;margin-top:6px;">' +
                r.items.length + ' صنف تم جردها' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الجزء 11: مخزون أول المدة
// ═══════════════════════════════════════════════════════════

window.saveOpeningBalance = function() {
    const warehouseId = document.getElementById('obWarehouse') ? document.getElementById('obWarehouse').value : '';
    const date = document.getElementById('obDate') ? document.getElementById('obDate').value : window.getTodayDate();
    const notes = document.getElementById('obNotes') ? document.getElementById('obNotes').value.trim() : '';

    if (!warehouseId) { window.showToast('⚠️ اختر المستودع', 'error'); return; }
    if (window.currentWarehouseItems.length === 0) { window.showToast('⚠️ لا توجد أصناف', 'error'); return; }

    const warehouse = (window.warehouses || []).find(function(w) { return w.id == warehouseId; });

    window.currentWarehouseItems.forEach(function(item) {
        const product = (window.products || []).find(function(p) { return p.id == item.productId; });
        if (product) {
            product.qty = (product.qty || 0) + item.qty;
            product.buy = item.price || product.buy;
            if (!product.warehouseStock) product.warehouseStock = {};
            product.warehouseStock[warehouseId] = (product.warehouseStock[warehouseId] || 0) + item.qty;
        }
    });

    const ob = {
        id: Date.now(),
        number: window.openingBalances.length + 1,
        warehouseId: warehouseId,
        warehouseName: warehouse ? warehouse.name : '',
        notes: notes,
        items: JSON.parse(JSON.stringify(window.currentWarehouseItems)),
        totalValue: window.currentWarehouseItems.reduce(function(s, i) { return s + (i.qty * i.price); }, 0),
        date: date, time: window.getNowTime(),
        createdBy: window.currentUser ? window.currentUser.name : '',
        type: 'opening'
    };

    window.openingBalances.push(ob);
    window.setData('products', window.products);
    window.setData('openingBalances', window.openingBalances);

    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    window.currentWarehouseItems = [];
    window.resetOpeningBalanceForm();
    window.renderOpeningBalances();

    if (typeof window.renderProducts === 'function') window.renderProducts();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();

    window.showToast('✅ مخزون أول المدة #' + ob.number, 'success');
};

window.resetOpeningBalanceForm = function() {
    const notesEl = document.getElementById('obNotes');
    if (notesEl) notesEl.value = '';
    const dateEl = document.getElementById('obDate');
    if (dateEl) dateEl.value = window.getTodayDate();
    window.currentWarehouseItems = [];
    window.renderWarehouseVoucherItems('obItemsContainer');
    window.updateWarehouseVoucherTotals('ob');
};

window.renderOpeningBalances = function() {
    const c = document.getElementById('obList');
    if (!c) return;
    if (window.openingBalances.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-flag"></i><span>لا يوجد مخزون أول المدة</span></div>';
        return;
    }
    const sorted = window.openingBalances.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 30);
    let html = '';
    sorted.forEach(function(r) {
        html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid #9B59B6;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<strong style="color:#9B59B6;font-size:13px;">📊 أول المدة #' + r.number + '</strong>' +
                '<span style="font-size:10px;color:#A89070;">' + r.date + '</span>' +
            '</div>' +
            '<div style="font-size:11px;color:#A89070;">🏭 ' + r.warehouseName + '</div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:6px;border-top:1px dashed #2D2D2D;margin-top:6px;">' +
                '<span style="color:#A89070;">' + r.items.length + ' صنف</span>' +
                '<strong style="color:#9B59B6;">' + window.formatMoney(r.totalValue) + ' ج.م</strong>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الجزء 12: تقارير المخازن
// ═══════════════════════════════════════════════════════════

window.showWarehouseReports = function() {
    const reportType = document.getElementById('whReportType') ? document.getElementById('whReportType').value : 'current';
    const fromDate = document.getElementById('whReportFrom') ? document.getElementById('whReportFrom').value : '';
    const toDate = document.getElementById('whReportTo') ? document.getElementById('whReportTo').value : '';

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>';
    html += '<h3>📊 تقرير المخازن</h3>';

    if (reportType === 'current') {
        const items = (window.products || []).map(function(p) {
            return { name: p.name, qty: p.qty, buy: p.buy, value: p.qty * p.buy, min: p.min };
        });

        const totalValue = items.reduce(function(s, i) { return s + i.value; }, 0);
        const totalQty = items.reduce(function(s, i) { return s + i.qty; }, 0);

        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;border-right:4px solid #C9A94E;">' +
                '<div style="color:#A89070;font-size:11px;">عدد المنتجات</div>' +
                '<div style="color:#C9A94E;font-size:20px;font-weight:900;">' + items.length + '</div>' +
            '</div>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;border-right:4px solid #2D8F5E;">' +
                '<div style="color:#A89070;font-size:11px;">إجمالي القيمة</div>' +
                '<div style="color:#2D8F5E;font-size:20px;font-weight:900;">' + window.formatMoney(totalValue) + '</div>' +
            '</div>' +
        '</div>';

        html += '<div style="max-height:400px;overflow-y:auto;">';
        items.sort(function(a, b) { return b.value - a.value; }).forEach(function(item, i) {
            const color = item.qty <= item.min ? '#E06060' : '#2D8F5E';
            html += '<div style="background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid ' + color + ';">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
                    '<strong style="color:#C9A94E;font-size:13px;">' + (i + 1) + '. ' + item.name + '</strong>' +
                    '<span style="color:' + color + ';font-weight:900;font-size:14px;">' + item.qty + '</span>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;font-size:11px;color:#A89070;">' +
                    '<span>شراء: ' + window.formatMoney(item.buy) + '</span>' +
                    '<span>قيمة: ' + window.formatMoney(item.value) + ' ج.م</span>' +
                '</div>' +
            '</div>';
        });
        html += '</div>';
    } else if (reportType === 'movement') {
        const allMovements = [];
        
        (window.warehouseReceipts || []).forEach(function(r) {
            if (fromDate && r.date < fromDate) return;
            if (toDate && r.date > toDate) return;
            allMovements.push({ date: r.date, type: 'إضافة', number: r.number, amount: r.totalValue, color: '#2D8F5E' });
        });
        
        (window.warehouseIssues || []).forEach(function(r) {
            if (fromDate && r.date < fromDate) return;
            if (toDate && r.date > toDate) return;
            allMovements.push({ date: r.date, type: 'صرف', number: r.number, amount: r.totalValue, color: '#E06060' });
        });
        
        (window.warehouseTransfers || []).forEach(function(r) {
            if (fromDate && r.date < fromDate) return;
            if (toDate && r.date > toDate) return;
            allMovements.push({ date: r.date, type: 'تحويل', number: r.number, amount: r.totalValue, color: '#4A8AB5' });
        });

        allMovements.sort(function(a, b) { return b.date.localeCompare(a.date); });

        html += '<div style="max-height:400px;overflow-y:auto;">';
        if (allMovements.length === 0) {
            html += '<div style="text-align:center;padding:40px;color:#5D5D5D;">لا توجد حركات</div>';
        } else {
            allMovements.forEach(function(m) {
                html += '<div style="background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid ' + m.color + ';">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
                        '<strong style="color:' + m.color + ';font-size:12px;">' + m.type + ' #' + m.number + '</strong>' +
                        '<span style="color:#A89070;font-size:11px;">' + m.date + '</span>' +
                    '</div>' +
                    '<div style="color:' + m.color + ';font-weight:900;font-size:14px;text-align:left;">' + window.formatMoney(m.amount) + ' ج.م</div>' +
                '</div>';
            });
        }
        html += '</div>';
    } else if (reportType === 'lowstock') {
        const lowItems = (window.products || []).filter(function(p) { return p.qty <= (p.min || 5); });
        
        html += '<div style="background:#2D0D0D;border-radius:10px;padding:12px;margin-bottom:12px;border-right:4px solid #E06060;">' +
            '<div style="color:#E06060;font-size:16px;font-weight:900;">⚠️ ' + lowItems.length + ' منتج قارب على النفاذ</div>' +
        '</div>';

        html += '<div style="max-height:400px;overflow-y:auto;">';
        if (lowItems.length === 0) {
            html += '<div style="text-align:center;padding:40px;color:#2D8F5E;font-weight:900;">✅ المخزون في حالة ممتازة</div>';
        } else {
            lowItems.sort(function(a, b) { return a.qty - b.qty; }).forEach(function(p) {
                html += '<div style="background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid #E06060;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
                        '<strong style="color:#F5E6C8;font-size:13px;">' + p.name + '</strong>' +
                        '<span style="color:#E06060;font-weight:900;font-size:14px;">' + p.qty + '</span>' +
                    '</div>' +
                    '<div style="font-size:11px;color:#A89070;">الحد الأدنى: ' + (p.min || 5) + '</div>' +
                '</div>';
            });
        }
        html += '</div>';
    }

    html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

// ═══════════════════════════════════════════════════════════
// علم التحميل
// ═══════════════════════════════════════════════════════════
window.__inventoryLoaded = true;

console.log('✅ inventory.js v17.0 جاهز');
