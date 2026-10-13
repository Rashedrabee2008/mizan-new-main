// ============================================================
// الميزان Pro - app.js v18.1
// تسجيل الدخول + المستخدمين + الشركة + إدارة كاملة
// ============================================================

(function() {
    'use strict';

    console.log('📱 app.js v18.1 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: متغيرات عامة
    // ═══════════════════════════════════════════════════════════

    window.currentUser = null;
    window.currentSaleItems = [];
    window.currentPurItems = [];
    window.currentRetItems = [];
    window.currentTreasuryFilter = 'all';
    window.currentInvoiceFilter = 'all';
    window.currentPayTab = 'collect';
    window.currentWarehouseItems = [];
    window.currentWarehouseType = '';
    window.currentReport = 'daily';
    window.currentCoupon = null;
    window.currentPointsToRedeem = 0;
    window.currentCustomerName = '';
    window.currentWarehouseFilter = 'all';

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: تسجيل الدخول
    // ═══════════════════════════════════════════════════════════

        // ⚡ تخطي شاشة التفعيل لو التطبيق مفعّل
    function skipActivationIfNeeded() {
        // لو التفعيل موجود في localStorage
        const activation = localStorage.getItem('mizan_activation_v1');
        if (activation) {
            // امسح شاشة التفعيل من DOM
            const activationScreen = document.getElementById('activationScreen');
            if (activationScreen) {
                activationScreen.style.display = 'none';
            }

            // أظهر شاشة الدخول
            const loginContainer = document.getElementById('loginContainer');
            if (loginContainer) {
                loginContainer.style.display = 'flex';
                loginContainer.classList.remove('hidden');
            }

            const appContent = document.getElementById('appContent');
            if (appContent) {
                appContent.style.display = 'none';
            }

            return true;
        }
        return false;
    }

    window.populateLoginUsers = function() {
        const sel = document.getElementById('loginUsername');
        if (!sel) return;

        let users = window.users || [];

        if (users.length === 0) {
            window.seedInitialData();
            users = window.users;
        }

        let html = '<option value="">اختر المستخدم...</option>';
        users.forEach(function(u) {
            if (u.active !== false) {
                const roleInfo = window.ROLES[u.role] || { icon: '❓', name: u.role };
                html += '<option value="' + u.id + '">' + roleInfo.icon + ' ' + u.name + ' (' + roleInfo.name + ')</option>';
            }
        });
        sel.innerHTML = html;
    };

    window.checkLogin = async function() {
        const userIdEl = document.getElementById('loginUsername');
        const passwordEl = document.getElementById('loginPassword');
        const errorEl = document.getElementById('loginError');

        const userId = userIdEl ? userIdEl.value : '';
        const password = passwordEl ? passwordEl.value : '';

        const lockStatus = window.isAccountLocked();
        if (lockStatus.locked) {
            if (errorEl) {
                errorEl.textContent = '🚫 الحساب مقفل. جرب بعد ' + lockStatus.remaining + ' دقيقة';
                errorEl.classList.add('show');
            }
            return;
        }

        if (!userId) {
            if (errorEl) {
                errorEl.textContent = '⚠️ اختر المستخدم';
                errorEl.classList.add('show');
            }
            return;
        }

        const user = (window.users || []).find(function(u) { return u.id == userId; });
        if (!user) {
            if (errorEl) {
                errorEl.textContent = '⚠️ المستخدم غير موجود';
                errorEl.classList.add('show');
            }
            return;
        }

        const isPasswordValid = await window.verifyPassword(password, user.password);

        if (!isPasswordValid) {
            window.recordFailedLogin();
            if (errorEl) {
                errorEl.textContent = '⚠️ كلمة المرور خاطئة';
                errorEl.classList.add('show');
            }
            if (passwordEl) passwordEl.value = '';
            setTimeout(function() {
                if (errorEl) errorEl.classList.remove('show');
            }, 3000);
            return;
        }

        window.recordSuccessfulLogin();

        window.currentUser = user;
        window.saveSession({
            id: user.id,
            name: user.name,
            role: user.role,
            storeId: window.getStoreId()
        });

        if (errorEl) errorEl.classList.remove('show');
        if (passwordEl) passwordEl.value = '';

        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.add('hidden');
        if (appCont) appCont.style.display = 'block';

        window.updateUserUI();
        window.showToast('🔓 مرحباً ' + user.name + '!', 'success');

        setTimeout(function() {
            window.initAppAfterLogin();
        }, 100);

        window.navigateTo('dashboard');
    };

    window.lockApp = async function() {
        const confirmed = await window.confirmDialog('هل تريد تسجيل الخروج؟');
        if (!confirmed) return;

        window.currentUser = null;
        window.clearSession();

        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.remove('hidden');
        if (appCont) appCont.style.display = 'none';

        const passwordEl = document.getElementById('loginPassword');
        const userEl = document.getElementById('loginUsername');
        if (passwordEl) passwordEl.value = '';
        if (userEl) userEl.value = '';

        window.populateLoginUsers();
        window.showToast('🔒 تم تسجيل الخروج', 'info');
    };

    window.initAppAfterLogin = function() {
        if (typeof firebase !== 'undefined' && !window.firebaseReady) {
            window.CloudSync.init();
        }

        window.refreshAllUI();

        if (!window.__clockInterval) {
            window.updateClock();
            window.__clockInterval = setInterval(window.updateClock, 1000);
        }

        window.populateLoginUsers();
        window.populateSaleProducts();
        window.populateSaleCustomers();
        window.populatePurProducts();
        window.populatePurSuppliers();
        window.populateRetProducts();
        window.populateCashBoxDropdowns();
        window.populateWarehouseField();
        window.populateCollectCustomers();
        window.populatePaySuppliers();
        window.populateWarehouseDropdowns();

        const storeEl = document.getElementById('storeIdDisplay');
        if (storeEl) storeEl.textContent = window.getStoreId();

        const today = window.getTodayDate();
        ['expDate', 'collectDate', 'payDate'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = today;
        });

        window.EventBus.emit('app:ready');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: إدارة المستخدمين
    // ═══════════════════════════════════════════════════════════

    window.renderUsers = function() {
        const c = document.getElementById('userList');
        if (!c) return;

        if ((window.users || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-user-cog"></i><span>لا يوجد مستخدمين</span></div>';
            return;
        }

        let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 0.8fr 1.2fr;"><span>الاسم</span><span>الدور</span><span>الحالة</span><span></span></div>';

        window.users.forEach(function(u) {
            const roleInfo = window.ROLES[u.role] || { name: u.role, icon: '❓' };
            html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 0.8fr 1.2fr;">' +
                '<span><strong>' + window.escapeHtml(u.name) + '</strong></span>' +
                '<span>' + roleInfo.icon + ' ' + roleInfo.name + '</span>' +
                '<span style="color:' + (u.active !== false ? '#2D8F5E' : '#E06060') + ';">' +
                    (u.active !== false ? '✅' : '⏸️') + '</span>' +
                '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                    '<button class="btn btn-warning btn-sm" onclick="editUser(' + u.id + ')"><i class="fas fa-edit"></i></button>' +
                    '<button class="btn btn-danger btn-sm" onclick="deleteUser(' + u.id + ')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.saveUser = async function() {
        if (!window.canManageUsers()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const id = document.getElementById('userId') ? document.getElementById('userId').value : '';
        const name = document.getElementById('userName') ? document.getElementById('userName').value.trim() : '';
        const password = document.getElementById('userPassword') ? document.getElementById('userPassword').value.trim() : '';
        const role = document.getElementById('userRole') ? document.getElementById('userRole').value : 'cashier';

        if (!name || !password) {
            window.showToast('⚠️ أدخل البيانات كاملة', 'error');
            return;
        }

        const hashedPassword = password.indexOf('sha256_') === 0 || password.indexOf('simple_') === 0
            ? password
            : await window.hashPassword(password);

        if (id) {
            const idx = (window.users || []).findIndex(function(u) { return u.id == id; });
            if (idx > -1) {
                window.users[idx] = Object.assign({}, window.users[idx], {
                    name: name,
                    password: hashedPassword,
                    role: role
                });
                window.showToast('✅ تم التعديل', 'success');
            }
        } else {
            if ((window.users || []).find(function(u) { return u.name === name; })) {
                window.showToast('⚠️ الاسم موجود مسبقاً', 'warning');
                return;
            }

            const newUser = {
                id: window.generateId('user_'),
                name: name,
                password: hashedPassword,
                role: role,
                active: true,
                storeId: window.getStoreId()
            };
            window.users.push(newUser);
            window.showToast('✅ تم الإضافة', 'success');
        }

        window.DataStore.set('users', window.users);
        window.resetUserForm();
        window.renderUsers();
        window.populateLoginUsers();
    };

    window.resetUserForm = function() {
        ['userId', 'userName', 'userPassword'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const roleEl = document.getElementById('userRole');
        if (roleEl) roleEl.value = 'cashier';
        const titleEl = document.getElementById('userFormTitle');
        if (titleEl) titleEl.textContent = '➕ إضافة مستخدم';
        const btnEl = document.getElementById('userSaveBtnText');
        if (btnEl) btnEl.textContent = 'إضافة';
    };

    window.editUser = function(id) {
        if (!window.canManageUsers()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const u = (window.users || []).find(function(us) { return us.id == id; });
        if (!u) return;

        const setVal = function(elId, val) {
            const el = document.getElementById(elId);
            if (el) el.value = val;
        };

        setVal('userId', u.id);
        setVal('userName', u.name);
        setVal('userPassword', '');
        setVal('userRole', u.role);

        const titleEl = document.getElementById('userFormTitle');
        if (titleEl) titleEl.textContent = '✏️ تعديل المستخدم';
        const btnEl = document.getElementById('userSaveBtnText');
        if (btnEl) btnEl.textContent = 'حفظ';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteUser = async function(id) {
        if (!window.canManageUsers()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const u = (window.users || []).find(function(us) { return us.id == id; });
        if (!u) return;

        if (window.currentUser && window.currentUser.id == id) {
            window.showToast('⚠️ لا يمكن حذف المستخدم الحالي', 'error');
            return;
        }

        const confirmed = await window.confirmDialog('حذف "' + u.name + '"؟');
        if (!confirmed) return;

        window.users = window.users.filter(function(us) { return us.id != id; });
        window.DataStore.set('users', window.users);
        window.renderUsers();
        window.populateLoginUsers();
        window.showToast('🗑️ تم الحذف', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: بيانات الشركة
    // ═══════════════════════════════════════════════════════════

    window.renderCompany = function() {
        const c = window.companyData || {};

        const setVal = function(id, val) {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        setVal('companyName', c.name);
        setVal('companyTradeName', c.tradeName);
        setVal('companyPhone', c.phone);
        setVal('companyPhone2', c.phone2);
        setVal('companyEmail', c.email);
        setVal('companyWebsite', c.website);
        setVal('companyAddress', c.address);
        setVal('companyCity', c.city);
        setVal('companyCountry', c.country || 'مصر');
        setVal('companyTax', c.tax);
        setVal('companyCommercial', c.commercial);
        setVal('companyTaxCard', c.taxCard);
        setVal('companyNationalId', c.nationalId);
        setVal('companyFooter', c.footer);

        const colorEl = document.getElementById('companyPrimaryColor');
        if (colorEl) colorEl.value = c.primaryColor || '#C9A94E';

        const curEl = document.getElementById('companyCurrency');
        if (curEl) curEl.value = c.currency || 'ج.م';

        const setTxt = function(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setTxt('companyProductsCount', (window.products || []).length);
        setTxt('companySalesCount', (window.sales || []).length);
        setTxt('companyCustomersCount', (window.customers || []).length);
        setTxt('companySuppliersCount', (window.suppliers || []).length);

        const totalSales = (window.sales || []).reduce(function(s, x) {
            return s + (parseFloat(x.total) || 0);
        }, 0);
        setTxt('companySalesTotal', window.formatMoney(totalSales) + ' ج.م');
    };

    window.saveCompanyData = function() {
        if (!window.isAdmin()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const getVal = function(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        window.companyData = {
            name: getVal('companyName') || 'الميزان',
            tradeName: getVal('companyTradeName'),
            phone: getVal('companyPhone'),
            phone2: getVal('companyPhone2'),
            email: getVal('companyEmail'),
            website: getVal('companyWebsite'),
            address: getVal('companyAddress'),
            city: getVal('companyCity'),
            country: getVal('companyCountry') || 'مصر',
            tax: getVal('companyTax'),
            commercial: getVal('companyCommercial'),
            taxCard: getVal('companyTaxCard'),
            nationalId: getVal('companyNationalId'),
            footer: getVal('companyFooter') || 'شكراً لتعاملكم معنا 🌟',
            primaryColor: getVal('companyPrimaryColor') || '#C9A94E',
            currency: getVal('companyCurrency') || 'ج.م',
            logo: (window.companyData || {}).logo || '',
            updatedAt: new Date().toISOString(),
            updatedBy: window.currentUser ? window.currentUser.name : ''
        };

        window.DataStore.set('companyData', window.companyData);

        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany) headerCompany.textContent = window.companyData.name;

        window.showToast('✅ تم حفظ بيانات الشركة', 'success');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: ⚡ العملاء + الموردين + الخزائن + المصروفات ⚡
    // ═══════════════════════════════════════════════════════════

    // ---------- العملاء ----------
    window.saveCustomer = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const id = document.getElementById('customerId') ? document.getElementById('customerId').value : '';
        const name = document.getElementById('customerName') ? document.getElementById('customerName').value.trim() : '';
        const phone = document.getElementById('customerPhone') ? document.getElementById('customerPhone').value.trim() : '';
        const whatsapp = document.getElementById('customerWhatsapp') ? document.getElementById('customerWhatsapp').value.trim() : '';
        const address = document.getElementById('customerAddress') ? document.getElementById('customerAddress').value.trim() : '';

        if (!name) {
            window.showToast('⚠️ أدخل اسم العميل', 'error');
            return;
        }

        if (id) {
            const idx = (window.customers || []).findIndex(function(c) { return c.id == id; });
            if (idx > -1) {
                window.customers[idx] = Object.assign({}, window.customers[idx], {
                    name: name, phone: phone, whatsapp: whatsapp, address: address
                });
                window.DataStore.set('customers', window.customers);
                window.showToast('✅ تم التعديل', 'success');
            }
        } else {
            if ((window.customers || []).find(function(c) { return c.name === name; })) {
                window.showToast('⚠️ الاسم موجود', 'warning');
                return;
            }
            window.DataStore.add('customers', {
                id: window.generateId('cust_'),
                name: name,
                phone: phone,
                whatsapp: whatsapp,
                address: address
            });
            window.showToast('✅ تم إضافة العميل', 'success');
        }

        window.resetCustomerForm();
        window.renderCustomers();
    };

    window.resetCustomerForm = function() {
        ['customerId', 'customerName', 'customerPhone', 'customerWhatsapp', 'customerAddress'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const titleEl = document.getElementById('customerFormTitle');
        if (titleEl) titleEl.textContent = '➕ إضافة عميل';
        const btnEl = document.getElementById('customerSaveBtnText');
        if (btnEl) btnEl.textContent = 'إضافة';
    };

    window.editCustomer = function(id) {
        const c = (window.customers || []).find(function(cu) { return cu.id == id; });
        if (!c) return;

        const setVal = function(elId, val) {
            const el = document.getElementById(elId);
            if (el) el.value = val;
        };

        setVal('customerId', c.id);
        setVal('customerName', c.name);
        setVal('customerPhone', c.phone || '');
        setVal('customerWhatsapp', c.whatsapp || '');
        setVal('customerAddress', c.address || '');

        const titleEl = document.getElementById('customerFormTitle');
        if (titleEl) titleEl.textContent = '✏️ تعديل';
        const btnEl = document.getElementById('customerSaveBtnText');
        if (btnEl) btnEl.textContent = 'حفظ';
    };

    window.deleteCustomer = async function(id) {
        if (!window.canDelete()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }
        const c = (window.customers || []).find(function(cu) { return cu.id == id; });
        if (!c) return;

        const confirmed = await window.confirmDialog('حذف "' + c.name + '"؟');
        if (!confirmed) return;

        window.DataStore.remove('customers', id);
        window.showToast('🗑️ تم الحذف', 'info');
    };

    window.renderCustomers = function() {
        const c = document.getElementById('customerList');
        if (!c) return;

        const searchInput = document.getElementById('customerSearch');
        const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let filtered = window.customers || [];

        if (search) {
            filtered = filtered.filter(function(cu) {
                return (cu.name || '').toLowerCase().indexOf(search) > -1;
            });
        }

        if (filtered.length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><span>لا يوجد عملاء</span></div>';
            return;
        }

        let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;"><span>الاسم</span><span>الهاتف</span><span>المديونية</span><span></span></div>';

        filtered.forEach(function(cu) {
            const balance = window.Balance.customer(cu.name);

            html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;">' +
                '<span><strong>' + window.escapeHtml(cu.name) + '</strong>' +
                    (cu.address ? '<br><small style="color:#A89070;font-size:9px;">📍 ' + window.escapeHtml(cu.address) + '</small>' : '') +
                '</span>' +
                '<span style="font-size:11px;color:#A89070;">' + (cu.phone || '-') + '</span>' +
                '<span style="color:' + (balance > 0 ? '#E06060' : '#2D8F5E') + ';font-weight:900;">' + window.formatMoney(balance) + '</span>' +
                '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                    '<button class="btn btn-warning btn-sm" onclick="editCustomer(\'' + cu.id + '\')"><i class="fas fa-edit"></i></button>' +
                    '<button class="btn btn-danger btn-sm" onclick="deleteCustomer(\'' + cu.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ---------- الموردين ----------
    window.saveSupplier = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const id = document.getElementById('supplierId') ? document.getElementById('supplierId').value : '';
        const name = document.getElementById('supplierName') ? document.getElementById('supplierName').value.trim() : '';
        const phone = document.getElementById('supplierPhone') ? document.getElementById('supplierPhone').value.trim() : '';
        const whatsapp = document.getElementById('supplierWhatsapp') ? document.getElementById('supplierWhatsapp').value.trim() : '';
        const address = document.getElementById('supplierAddress') ? document.getElementById('supplierAddress').value.trim() : '';

        if (!name) {
            window.showToast('⚠️ أدخل اسم المورد', 'error');
            return;
        }

        if (id) {
            const idx = (window.suppliers || []).findIndex(function(s) { return s.id == id; });
            if (idx > -1) {
                window.suppliers[idx] = Object.assign({}, window.suppliers[idx], {
                    name: name, phone: phone, whatsapp: whatsapp, address: address
                });
                window.DataStore.set('suppliers', window.suppliers);
                window.showToast('✅ تم التعديل', 'success');
            }
        } else {
            if ((window.suppliers || []).find(function(s) { return s.name === name; })) {
                window.showToast('⚠️ الاسم موجود', 'warning');
                return;
            }
            window.DataStore.add('suppliers', {
                id: window.generateId('sup_'),
                name: name,
                phone: phone,
                whatsapp: whatsapp,
                address: address
            });
            window.showToast('✅ تم إضافة المورد', 'success');
        }

        window.resetSupplierForm();
        window.renderSuppliers();
    };

    window.resetSupplierForm = function() {
        ['supplierId', 'supplierName', 'supplierPhone', 'supplierWhatsapp', 'supplierAddress'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const titleEl = document.getElementById('supplierFormTitle');
        if (titleEl) titleEl.textContent = '➕ إضافة مورد';
        const btnEl = document.getElementById('supplierSaveBtnText');
        if (btnEl) btnEl.textContent = 'إضافة';
    };

    window.editSupplier = function(id) {
        const s = (window.suppliers || []).find(function(su) { return su.id == id; });
        if (!s) return;

        const setVal = function(elId, val) {
            const el = document.getElementById(elId);
            if (el) el.value = val;
        };

        setVal('supplierId', s.id);
        setVal('supplierName', s.name);
        setVal('supplierPhone', s.phone || '');
        setVal('supplierWhatsapp', s.whatsapp || '');
        setVal('supplierAddress', s.address || '');

        const titleEl = document.getElementById('supplierFormTitle');
        if (titleEl) titleEl.textContent = '✏️ تعديل';
        const btnEl = document.getElementById('supplierSaveBtnText');
        if (btnEl) btnEl.textContent = 'حفظ';
    };

    window.deleteSupplier = async function(id) {
        if (!window.canDelete()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }
        const s = (window.suppliers || []).find(function(su) { return su.id == id; });
        if (!s) return;

        const confirmed = await window.confirmDialog('حذف "' + s.name + '"؟');
        if (!confirmed) return;

        window.DataStore.remove('suppliers', id);
        window.showToast('🗑️ تم الحذف', 'info');
    };

    window.renderSuppliers = function() {
        const c = document.getElementById('supplierList');
        if (!c) return;

        const searchInput = document.getElementById('supplierSearch');
        const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let filtered = window.suppliers || [];

        if (search) {
            filtered = filtered.filter(function(s) {
                return (s.name || '').toLowerCase().indexOf(search) > -1;
            });
        }

        if (filtered.length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-truck"></i><span>لا يوجد موردين</span></div>';
            return;
        }

        let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;"><span>الاسم</span><span>الهاتف</span><span>المديونية</span><span></span></div>';

        filtered.forEach(function(s) {
            const balance = window.Balance.supplier(s.name);

            html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 1fr 1.2fr;">' +
                '<span><strong>' + window.escapeHtml(s.name) + '</strong>' +
                    (s.address ? '<br><small style="color:#A89070;font-size:9px;">📍 ' + window.escapeHtml(s.address) + '</small>' : '') +
                '</span>' +
                '<span style="font-size:11px;color:#A89070;">' + (s.phone || '-') + '</span>' +
                '<span style="color:' + (balance > 0 ? '#E6A830' : '#2D8F5E') + ';font-weight:900;">' + window.formatMoney(balance) + '</span>' +
                '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                    '<button class="btn btn-warning btn-sm" onclick="editSupplier(\'' + s.id + '\')"><i class="fas fa-edit"></i></button>' +
                    '<button class="btn btn-danger btn-sm" onclick="deleteSupplier(\'' + s.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ---------- الخزائن ----------
    window.getCashBoxById = function(id) {
        return (window.cashBoxes || []).find(function(b) { return b.id == id; });
    };

    window.getDefaultCashBox = function() {
        return (window.cashBoxes || []).find(function(b) { return b.isDefault; }) || (window.cashBoxes || [])[0];
    };

    window.getBoxTypeName = function(type) {
        const types = {
            'cash': '💵 نقدي',
            'wallet': '📱 محفظة',
            'bank': '🏦 بنكي',
            'visa': '💳 فيزا',
            'other': '📋 أخرى'
        };
        return types[type] || type;
    };

    window.saveCashBox = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const id = document.getElementById('cashBoxId') ? document.getElementById('cashBoxId').value : '';
        const name = document.getElementById('cashBoxName') ? document.getElementById('cashBoxName').value.trim() : '';
        const type = document.getElementById('cashBoxType') ? document.getElementById('cashBoxType').value : 'cash';
        const icon = document.getElementById('cashBoxIcon') ? document.getElementById('cashBoxIcon').value : '💵';
        const details = document.getElementById('cashBoxDetails') ? document.getElementById('cashBoxDetails').value.trim() : '';
        const openingBalance = parseFloat(document.getElementById('cashBoxOpeningBalance') ? document.getElementById('cashBoxOpeningBalance').value : 0) || 0;
        const isDefault = document.getElementById('cashBoxIsDefault') ? document.getElementById('cashBoxIsDefault').checked : false;

        if (!name) {
            window.showToast('⚠️ أدخل اسم الخزنة', 'error');
            return;
        }

        if (id) {
            const idx = (window.cashBoxes || []).findIndex(function(b) { return b.id == id; });
            if (idx > -1) {
                if (isDefault) {
                    window.cashBoxes.forEach(function(b) { b.isDefault = false; });
                }
                window.cashBoxes[idx] = Object.assign({}, window.cashBoxes[idx], {
                    name: name,
                    type: type,
                    icon: icon,
                    details: details,
                    openingBalance: openingBalance,
                    isDefault: isDefault || window.cashBoxes[idx].isDefault
                });
                window.DataStore.set('cashBoxes', window.cashBoxes);
                window.showToast('✅ تم التعديل', 'success');
            }
        } else {
            if ((window.cashBoxes || []).find(function(b) { return b.name === name; })) {
                window.showToast('⚠️ الاسم موجود', 'warning');
                return;
            }
            if (isDefault) {
                window.cashBoxes.forEach(function(b) { b.isDefault = false; });
            }
            window.DataStore.add('cashBoxes', {
                id: window.generateId('cb_'),
                name: name,
                type: type,
                icon: icon,
                details: details,
                openingBalance: openingBalance,
                isDefault: isDefault || window.cashBoxes.length === 0,
                active: true
            });
            window.showToast('✅ تم الإضافة', 'success');
        }

        window.resetCashBoxForm();
        window.renderCashBoxes();
        window.populateCashBoxDropdowns();
    };

    window.resetCashBoxForm = function() {
        ['cashBoxId', 'cashBoxName', 'cashBoxDetails'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        if (document.getElementById('cashBoxType')) document.getElementById('cashBoxType').value = 'cash';
        if (document.getElementById('cashBoxIcon')) document.getElementById('cashBoxIcon').value = '💵';
        if (document.getElementById('cashBoxOpeningBalance')) document.getElementById('cashBoxOpeningBalance').value = '0';
        if (document.getElementById('cashBoxIsDefault')) document.getElementById('cashBoxIsDefault').checked = false;
        const titleEl = document.getElementById('cashBoxFormTitle');
        if (titleEl) titleEl.textContent = '➕ إضافة خزنة جديدة';
        const btnEl = document.getElementById('cashBoxSaveBtnText');
        if (btnEl) btnEl.textContent = 'إضافة';
    };

    window.editCashBox = function(id) {
        const box = window.getCashBoxById(id);
        if (!box) return;

        if (document.getElementById('cashBoxId')) document.getElementById('cashBoxId').value = box.id;
        if (document.getElementById('cashBoxName')) document.getElementById('cashBoxName').value = box.name;
        if (document.getElementById('cashBoxType')) document.getElementById('cashBoxType').value = box.type;
        if (document.getElementById('cashBoxIcon')) document.getElementById('cashBoxIcon').value = box.icon || '💵';
        if (document.getElementById('cashBoxDetails')) document.getElementById('cashBoxDetails').value = box.details || '';
        if (document.getElementById('cashBoxOpeningBalance')) document.getElementById('cashBoxOpeningBalance').value = box.openingBalance || 0;
        if (document.getElementById('cashBoxIsDefault')) document.getElementById('cashBoxIsDefault').checked = box.isDefault || false;

        const titleEl = document.getElementById('cashBoxFormTitle');
        if (titleEl) titleEl.textContent = '✏️ تعديل';
        const btnEl = document.getElementById('cashBoxSaveBtnText');
        if (btnEl) btnEl.textContent = 'حفظ';
    };

    window.deleteCashBox = async function(id) {
        if (!window.canDelete()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }
        const box = window.getCashBoxById(id);
        if (!box) return;

        if (box.isDefault) {
            window.showToast('⚠️ لا يمكن حذف الافتراضية', 'error');
            return;
        }

        const balance = window.Balance.cashBox(id);
        let msg = 'حذف "' + box.name + '"؟';
        if (balance !== 0) {
            msg = '⚠️ الخزنة فيها ' + window.formatMoney(balance) + ' ج.م.\n' + msg;
        }

        const confirmed = await window.confirmDialog(msg);
        if (!confirmed) return;

        window.DataStore.remove('cashBoxes', id);
        window.populateCashBoxDropdowns();
        window.showToast('🗑️ تم الحذف', 'info');
    };

    window.setDefaultCashBox = function(id) {
        window.cashBoxes.forEach(function(b) { b.isDefault = false; });
        const box = window.getCashBoxById(id);
        if (box) box.isDefault = true;
        window.DataStore.set('cashBoxes', window.cashBoxes);
        window.populateCashBoxDropdowns();
        window.showToast('⭐ تم التعيين', 'success');
    };

    window.renderCashBoxes = function() {
        const c = document.getElementById('cashBoxList');
        if (!c) return;

        if ((window.cashBoxes || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-vault"></i><span>لا توجد خزائن</span></div>';
            if (document.getElementById('cbCount')) document.getElementById('cbCount').textContent = '0';
            if (document.getElementById('cbTotal')) document.getElementById('cbTotal').textContent = '0.00';
            return;
        }

        const total = window.Balance.totalCash();
        if (document.getElementById('cbCount')) document.getElementById('cbCount').textContent = window.cashBoxes.length;
        if (document.getElementById('cbTotal')) document.getElementById('cbTotal').textContent = window.formatMoney(total);

        let html = '';
        window.cashBoxes.forEach(function(box) {
            const balance = window.Balance.cashBox(box.id);
            html += '<div class="cash-box-card ' + (box.isDefault ? 'default' : '') + '" style="margin-bottom:10px;">' +
                '<div class="cash-box-header">' +
                    '<div class="cash-box-icon">' + (box.icon || '💵') + '</div>' +
                    '<div class="cash-box-info">' +
                        '<div class="cash-box-name">' + window.escapeHtml(box.name) + (box.isDefault ? ' ⭐' : '') + '</div>' +
                        '<div class="cash-box-type">' + window.getBoxTypeName(box.type) + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="cash-box-balance">' +
                    '<div class="balance-label">الرصيد الحالي</div>' +
                    '<div class="balance-value ' + (balance < 0 ? 'negative' : '') + '">' + window.formatMoney(balance) + ' ج.م</div>' +
                '</div>' +
                '<div class="cash-box-actions">' +
                    (!box.isDefault ? '<button class="btn-icon-sm" onclick="setDefaultCashBox(\'' + box.id + '\')">⭐</button>' : '') +
                    '<button class="btn-icon-sm" onclick="editCashBox(\'' + box.id + '\')">✏️</button>' +
                    '<button class="btn-icon-sm" onclick="deleteCashBox(\'' + box.id + '\')">🗑️</button>' +
                '</div>' +
            '</div>';
        });
        c.innerHTML = html;
    };

    // ---------- المصروفات ----------
    window.saveExpense = function() {
        if (!window.canAdd()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const note = document.getElementById('expNote') ? document.getElementById('expNote').value.trim() : '';
        const amount = parseFloat(document.getElementById('expAmount') ? document.getElementById('expAmount').value : 0) || 0;
        const category = document.getElementById('expCategory') ? document.getElementById('expCategory').value : 'عام';
        const date = (document.getElementById('expDate') ? document.getElementById('expDate').value : '') || window.getTodayDate();
        const cashBoxId = document.getElementById('expCashBox') ? document.getElementById('expCashBox').value : '';

        if (!note) {
            window.showToast('⚠️ أدخل البيان', 'error');
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

        const exp = {
            id: window.generateId('exp_'),
            note: note,
            amount: amount,
            category: category,
            date: date,
            cashBoxId: cashBoxId,
            cashBoxName: box ? box.name : '',
            time: window.getNowTime(),
            createdBy: window.currentUser ? window.currentUser.name : ''
        };

        window.DataStore.add('expenses', exp);

        window.DataStore.add('treasury', {
            id: window.generateId('tr_'),
            type: 'withdraw',
            amount: amount,
            note: 'مصروف (' + category + ') - ' + note,
            cashBoxId: cashBoxId,
            cashBoxName: box ? box.name : '',
            refType: 'expense',
            refId: exp.id,
            date: date,
            time: window.getNowTime()
        });

        // قيد محاسبي
        window.Accounting.entryExpense(exp);

        if (document.getElementById('expNote')) document.getElementById('expNote').value = '';
        if (document.getElementById('expAmount')) document.getElementById('expAmount').value = '';

        window.showToast('✅ تم إضافة ' + window.formatMoney(amount) + ' ج.م', 'success');
    };

    window.updateExpensesStats = function() {
        const total = (window.expenses || []).reduce(function(s, e) {
            return s + (parseFloat(e.amount) || 0);
        }, 0);
        const today = (window.expenses || []).filter(function(e) {
            return e.date === window.getTodayDate();
        }).reduce(function(s, e) {
            return s + (parseFloat(e.amount) || 0);
        }, 0);
        const month = (window.expenses || []).filter(function(e) {
            return (e.date || '').indexOf(window.getTodayDate().substring(0, 7)) === 0;
        }).reduce(function(s, e) {
            return s + (parseFloat(e.amount) || 0);
        }, 0);

        const set = function(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        set('expTotalCount', (window.expenses || []).length);
        set('expTotalAmount', window.formatMoney(total));
        set('expTodayAmount', window.formatMoney(today));
        set('expMonthAmount', window.formatMoney(month));
    };

    window.renderExpenses = function() {
        const c = document.getElementById('expensesList');
        if (!c) return;

        if ((window.expenses || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-money-bill-wave"></i><span>لا توجد مصروفات</span></div>';
            return;
        }

        const sorted = window.expenses.slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 50);

        let html = '<div class="table-header" style="grid-template-columns: 1.3fr 0.8fr 0.8fr 0.8fr 0.6fr;"><span>البيان</span><span>المبلغ</span><span>التصنيف</span><span>التاريخ</span><span></span></div>';

        sorted.forEach(function(e) {
            html += '<div class="table-row" style="grid-template-columns: 1.3fr 0.8fr 0.8fr 0.8fr 0.6fr;">' +
                '<span><strong>' + window.escapeHtml(e.note) + '</strong></span>' +
                '<span style="color:#E06060;font-weight:700;">' + window.formatMoney(e.amount) + '</span>' +
                '<span style="font-size:11px;color:#A89070;">' + window.escapeHtml(e.category || 'عام') + '</span>' +
                '<span style="font-size:10px;color:#A89070;">' + (e.date || '') + '</span>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteExpense(\'' + e.id + '\')"><i class="fas fa-trash"></i></button>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.deleteExpense = async function(id) {
        if (!window.canDelete()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }
        const e = (window.expenses || []).find(function(x) { return x.id == id; });
        if (!e) return;

        const confirmed = await window.confirmDialog('حذف "' + e.note + '"؟');
        if (!confirmed) return;

        window.treasury = window.treasury.filter(function(t) {
            return !(t.refType === 'expense' && t.refId === id);
        });
        window.DataStore.set('treasury', window.treasury);
        window.DataStore.remove('expenses', id);

        window.Accounting.removeByReference('EXP-' + id);

        window.showToast('🗑️ تم الحذف', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: الإعدادات
    // ═══════════════════════════════════════════════════════════

    window.renderSettings = function() {
        const setTxt = function(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        setTxt('setProductsCount', (window.products || []).length);
        setTxt('setSalesCount', (window.sales || []).length);
        setTxt('setCustomersCount', (window.customers || []).length);
        setTxt('setSuppliersCount', (window.suppliers || []).length);

        const storeEl = document.getElementById('storeIdDisplay');
        if (storeEl) storeEl.textContent = window.getStoreId();

        const cloudEl = document.getElementById('cloudStatusText');
        if (cloudEl) {
            cloudEl.textContent = window.firebaseReady ? '✅ متصل' : '⏳ جاري الاتصال...';
            cloudEl.style.color = window.firebaseReady ? '#2D8F5E' : '#E6A830';
        }
    };

    window.exportData = function() {
        const data = window.DataStore.export();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'mizan_backup_' + window.getTodayDate() + '.json';
        a.click();
        URL.revokeObjectURL(a.href);
        window.showToast('✅ تم التصدير', 'success');
    };

    window.importData = function(event) {
        if (!window.isAdmin()) {
            window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        window.confirmDialog('⚠️ سيتم استبدال البيانات. متابعة؟').then(function(confirmed) {
            if (!confirmed) {
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const json = JSON.parse(e.target.result);
                    if (window.DataStore.import(json)) {
                        window.showToast('✅ تم الاستيراد', 'success');
                        setTimeout(function() { location.reload(); }, 1000);
                    } else {
                        window.showToast('❌ ملف غير صالح', 'error');
                    }
                } catch (err) {
                    window.showToast('❌ خطأ في الملف', 'error');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        });
    };

    window.manualSync = async function() {
        if (!window.CloudSync.isReady()) {
            window.showToast('⚠️ Firebase غير متصل', 'error');
            return;
        }

        window.showToast('🔄 جاري المزامنة...', 'info');

        try {
            await window.CloudSync.pushAll(true);
            await window.CloudSync.pullAll(true);
            window.showToast('✅ تمت المزامنة', 'success');
        } catch (e) {
            window.showToast('❌ فشلت المزامنة', 'error');
        }
    };

    window.confirmFullReset = async function() {
        const confirmed = await window.confirmDialog(
            'سيتم مسح كل شيء من:\n• localStorage\n• Firebase\n• Cache\n\nهل أنت متأكد؟'
        );

        if (!confirmed) return;

        try {
            if (window.firebaseReady && typeof firebase !== 'undefined') {
                const path = window.getStorePath();
                try {
                    await firebase.database().ref(path).remove();
                } catch (e) {}
            }

            window.DataStore.clearAll();
            window.clearSession();

            if ('caches' in window) {
                const names = await caches.keys();
                await Promise.all(names.map(function(n) { return caches.delete(n); }));
            }

            window.showToast('🗑️ تم المسح، جاري إعادة التحميل...', 'info');
            setTimeout(function() { location.reload(); }, 1500);
        } catch (e) {
            window.showToast('❌ فشل المسح', 'error');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: التهيئة الأولية
    // ═══════════════════════════════════════════════════════════

    window.init = function() {
        console.log('🚀 بدء تهيئة التطبيق...');

        // بيانات أولية
        window.seedInitialData();

        // تحميل البيانات
        window.DataStore.loadAll();

        // استرجاع الجلسة
        const session = window.getSession();
        if (session && session.userId) {
            const user = (window.users || []).find(function(u) { return u.id == session.userId; });
            if (user) {
                window.currentUser = user;
            }
        }

        // ملء المستخدمين
        window.populateLoginUsers();

        // إظهار شاشة الدخول
        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.remove('hidden');
        if (appCont) appCont.style.display = 'none';

        // تاريخ اليوم
        const today = window.getTodayDate();
        ['expDate', 'collectDate', 'payDate'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = today;
        });

        // الساعة
        window.updateClock();
        setInterval(window.updateClock, 1000);

        // ملء المستخدمين تاني
        setTimeout(function() {
            window.populateLoginUsers();
        }, 500);

        window.EventBus.emit('app:initialized');
        console.log('✅ التطبيق جاهز');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    window.EventBus.on('data:companyData:changed', function(data) {
        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany && data.name) {
            headerCompany.textContent = data.name;
        }
    });

    window.EventBus.on('data:users:changed', function() {
        window.populateLoginUsers();
    });

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: التحميل التلقائي
    // ═══════════════════════════════════════════════════════════

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.init();
        });
    } else {
        window.init();
    }

    window.__appLoaded = true;
    console.log('✅ app.js v18.1 جاهز');

})();
