// ============================================================
// الميزان Pro - app.js v34.0 (نسخة التشغيل المستقرة)
// ============================================================

(function() {
    'use strict';

    console.log('📱 app.js v34.0 - بدء التشغيل');

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
    window.companyData = window.companyData || {};

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: تطبيق اللوجو واسم الشركة
    // ═══════════════════════════════════════════════════════════

    window.applyLogoOnLoad = function() {
        const company = window.companyData || {};
        const logoData = company.logo || '';
        const companyName = company.name || 'الميزان Pro';

        const headerLogo = document.getElementById('headerLogo');
        const defaultIcon = document.getElementById('headerDefaultIcon');

        if (headerLogo && defaultIcon) {
            if (logoData && logoData.trim() !== '') {
                headerLogo.src = logoData;
                headerLogo.style.display = 'block';
                defaultIcon.style.display = 'none';
            } else {
                headerLogo.style.display = 'none';
                defaultIcon.style.display = 'block';
            }
        }

        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany) {
            headerCompany.textContent = companyName;
        }

        document.querySelectorAll('[data-logo]').forEach(function(el) {
            if (logoData && logoData.trim() !== '') {
                el.src = logoData;
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });

        const preview = document.getElementById('companyLogoPreview');
        const img = document.getElementById('companyLogoImg');
        if (preview && img) {
            if (logoData && logoData.trim() !== '') {
                img.src = logoData;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: تحميل بيانات الشركة
    // ═══════════════════════════════════════════════════════════

    window.loadCompanyData = function() {
        try {
            let saved = localStorage.getItem('mizan_companyData');
            
            if (!saved && window.DataStore && window.DataStore.get) {
                const dsData = window.DataStore.get('companyData');
                if (dsData) saved = JSON.stringify(dsData);
            }

            if (!saved) {
                saved = localStorage.getItem('companyData');
            }

            if (saved) {
                try {
                    window.companyData = JSON.parse(saved);
                } catch (e) {}
            }

            if (!window.companyData) window.companyData = {};

            window.applyLogoOnLoad();

            const c = window.companyData;
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

            const preview = document.getElementById('companyLogoPreview');
            const img = document.getElementById('companyLogoImg');
            if (preview && img) {
                if (c.logo) {
                    img.src = c.logo;
                    preview.style.display = 'block';
                } else {
                    preview.style.display = 'none';
                }
            }
        } catch (e) {
            console.warn('⚠️ خطأ في تحميل بيانات الشركة:', e);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: تسجيل الدخول
    // ═══════════════════════════════════════════════════════════

    window.populateLoginUsers = function() {
        const sel = document.getElementById('loginUsername');
        if (!sel) return;

        let users = window.users || [];

        if (users.length === 0) {
            if (typeof window.seedInitialData === 'function') {
                window.seedInitialData();
                users = window.users;
            }
        }

        if (users.length === 0) {
            users = [
                { id: 'user_admin', name: 'المدير', password: '123456', role: 'admin', active: true }
            ];
            window.users = users;
            localStorage.setItem('mizan_users', JSON.stringify(users));
        }

        let html = '<option value="">اختر المستخدم...</option>';
        users.forEach(function(u) {
            if (u.active !== false) {
                const roleInfo = (window.ROLES && window.ROLES[u.role]) || { icon: '❓', name: u.role };
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

        if (typeof window.isAccountLocked === 'function') {
            const lockStatus = window.isAccountLocked();
            if (lockStatus.locked) {
                if (errorEl) {
                    errorEl.textContent = '🚫 الحساب مقفل. جرب بعد ' + lockStatus.remaining + ' دقيقة';
                    errorEl.classList.add('show');
                }
                return;
            }
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

        let isPasswordValid = false;
        if (typeof window.verifyPassword === 'function') {
            isPasswordValid = await window.verifyPassword(password, user.password);
        } else {
            isPasswordValid = (password === user.password);
        }

        if (!isPasswordValid) {
            if (typeof window.recordFailedLogin === 'function') window.recordFailedLogin();
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

        if (typeof window.recordSuccessfulLogin === 'function') window.recordSuccessfulLogin();

        window.currentUser = user;
        
        try {
            localStorage.setItem('mizan_current_user', JSON.stringify({
                id: user.id,
                name: user.name,
                role: user.role
            }));
        } catch (e) {}

        if (errorEl) errorEl.classList.remove('show');
        if (passwordEl) passwordEl.value = '';

        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.add('hidden');
        if (appCont) appCont.style.display = 'block';

        if (typeof window.updateUserUI === 'function') window.updateUserUI();
        if (typeof window.showToast === 'function') window.showToast('🔓 مرحباً ' + user.name + '!', 'success');

        window.loadCompanyData();

        setTimeout(function() {
            if (typeof window.initAppAfterLogin === 'function') {
                window.initAppAfterLogin();
            }
        }, 100);

        if (typeof window.initAdBar === 'function') {
            setTimeout(window.initAdBar, 200);
        }

        if (typeof window.navigateTo === 'function') window.navigateTo('dashboard');
    };

    window.lockApp = async function() {
        let confirmed = true;
        if (typeof window.confirmDialog === 'function') {
            confirmed = await window.confirmDialog('هل تريد تسجيل الخروج؟');
        }
        if (!confirmed) return;

        window.currentUser = null;
        if (typeof window.clearSession === 'function') window.clearSession();
        localStorage.removeItem('mizan_current_user');

        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.remove('hidden');
        if (appCont) appCont.style.display = 'none';

        const passwordEl = document.getElementById('loginPassword');
        const userEl = document.getElementById('loginUsername');
        if (passwordEl) passwordEl.value = '';
        if (userEl) userEl.value = '';

        window.populateLoginUsers();
        if (typeof window.showToast === 'function') window.showToast('🔒 تم تسجيل الخروج', 'info');
    };

    window.initAppAfterLogin = function() {
        if (typeof firebase !== 'undefined' && !window.firebaseReady && window.CloudSync) {
            try { window.CloudSync.init(); } catch (e) {}
        }

        window.applyLogoOnLoad();

        if (typeof window.refreshAllUI === 'function') window.refreshAllUI();

        if (!window.__clockInterval && typeof window.updateClock === 'function') {
            window.updateClock();
            window.__clockInterval = setInterval(window.updateClock, 1000);
        }

        window.populateLoginUsers();
        if (typeof window.populateCashBoxDropdowns === 'function') window.populateCashBoxDropdowns();
        if (typeof window.populateWarehouseField === 'function') window.populateWarehouseField();

        const storeEl = document.getElementById('storeIdDisplay');
        if (storeEl && typeof window.getStoreId === 'function') {
            storeEl.textContent = window.getStoreId();
        }

        if (typeof window.getTodayDate === 'function') {
            const today = window.getTodayDate();
            ['expDate', 'collectDate', 'payDate'].forEach(function(id) {
                const el = document.getElementById(id);
                if (el) el.value = today;
            });
        }

        if (window.EventBus) window.EventBus.emit('app:ready');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: إدارة المستخدمين
    // ═══════════════════════════════════════════════════════════

    window.renderUsers = function() {
        const c = document.getElementById('userList');
        if (!c) return;

        if ((window.users || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-user-cog"></i><span>لا يوجد مستخدمين</span></div>';
            return;
        }

        let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 0.8fr 1.2fr;">' +
            '<span>الاسم</span><span>الدور</span><span>الحالة</span><span></span>' +
        '</div>';

        window.users.forEach(function(u) {
            const roleInfo = (window.ROLES && window.ROLES[u.role]) || { name: u.role, icon: '❓' };
            html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 0.8fr 1.2fr;">' +
                '<span><strong>' + (typeof window.escapeHtml === 'function' ? window.escapeHtml(u.name) : u.name) + '</strong></span>' +
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
        if (typeof window.canManageUsers === 'function' && !window.canManageUsers()) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const id = document.getElementById('userId') ? document.getElementById('userId').value : '';
        const name = document.getElementById('userName') ? document.getElementById('userName').value.trim() : '';
        const password = document.getElementById('userPassword') ? document.getElementById('userPassword').value.trim() : '';
        const role = document.getElementById('userRole') ? document.getElementById('userRole').value : 'cashier';

        if (!name || !password) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ أدخل البيانات كاملة', 'error');
            return;
        }

        let hashedPassword = password;
        if (typeof window.hashPassword === 'function') {
            hashedPassword = await window.hashPassword(password);
        }

        if (id) {
            const idx = (window.users || []).findIndex(function(u) { return u.id == id; });
            if (idx > -1) {
                window.users[idx] = Object.assign({}, window.users[idx], {
                    name: name,
                    password: hashedPassword,
                    role: role
                });
                if (typeof window.showToast === 'function') window.showToast('✅ تم التعديل', 'success');
            }
        } else {
            if ((window.users || []).find(function(u) { return u.name === name; })) {
                if (typeof window.showToast === 'function') window.showToast('⚠️ الاسم موجود مسبقاً', 'warning');
                return;
            }

            const newUser = {
                id: typeof window.generateId === 'function' ? window.generateId('user_') : 'user_' + Date.now(),
                name: name,
                password: hashedPassword,
                role: role,
                active: true,
                storeId: typeof window.getStoreId === 'function' ? window.getStoreId() : ''
            };
            window.users.push(newUser);
            if (typeof window.showToast === 'function') window.showToast('✅ تم الإضافة', 'success');
        }

        if (window.DataStore && window.DataStore.set) {
            window.DataStore.set('users', window.users);
        }
        localStorage.setItem('mizan_users', JSON.stringify(window.users));
        
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
        if (typeof window.canManageUsers === 'function' && !window.canManageUsers()) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ لا تملك صلاحية', 'error');
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
        if (typeof window.canManageUsers === 'function' && !window.canManageUsers()) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ لا تملك صلاحية', 'error');
            return;
        }

        const u = (window.users || []).find(function(us) { return us.id == id; });
        if (!u) return;

        if (window.currentUser && window.currentUser.id == id) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ لا يمكن حذف المستخدم الحالي', 'error');
            return;
        }

        let confirmed = true;
        if (typeof window.confirmDialog === 'function') {
            confirmed = await window.confirmDialog('حذف "' + u.name + '"؟');
        }
        if (!confirmed) return;

        window.users = window.users.filter(function(us) { return us.id != id; });
        if (window.DataStore && window.DataStore.set) {
            window.DataStore.set('users', window.users);
        }
        localStorage.setItem('mizan_users', JSON.stringify(window.users));
        
        window.renderUsers();
        window.populateLoginUsers();
        if (typeof window.showToast === 'function') window.showToast('🗑️ تم الحذف', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: بيانات الشركة واللوجو
    // ═══════════════════════════════════════════════════════════

    window.renderCompany = function() {
        window.loadCompanyData();

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
        setTxt('companySalesTotal', window.formatMoney ? window.formatMoney(totalSales) + ' ج.م' : totalSales.toFixed(2) + ' ج.م');
    };

    window.uploadCompanyLogo = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            if (typeof window.showToast === 'function') {
                window.showToast('⚠️ الرجاء اختيار صورة', 'error');
            } else {
                alert('⚠️ الرجاء اختيار صورة');
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const logoData = e.target.result;

            if (!window.companyData) window.companyData = {};
            window.companyData.logo = logoData;

            try {
                localStorage.setItem('mizan_companyData', JSON.stringify(window.companyData));
            } catch (err) {
                if (typeof window.showToast === 'function') window.showToast('⚠️ فشل الحفظ: الصورة كبيرة جداً', 'error');
                return;
            }

            if (window.DataStore && window.DataStore.set) {
                window.DataStore.set('companyData', window.companyData);
            }

            window.applyLogoOnLoad();

            const preview = document.getElementById('companyLogoPreview');
            const img = document.getElementById('companyLogoImg');
            if (preview && img) {
                img.src = logoData;
                preview.style.display = 'block';
            }

            if (typeof window.showToast === 'function') {
                window.showToast('✅ تم رفع الشعار', 'success');
            }

            event.target.value = '';
        };
        reader.readAsDataURL(file);
    };

    window.removeCompanyLogo = async function() {
        let confirmed = true;
        if (typeof window.confirmDialog === 'function') {
            confirmed = await window.confirmDialog('حذف الشعار؟');
        } else {
            confirmed = confirm('حذف الشعار؟');
        }
        if (!confirmed) return;

        if (!window.companyData) window.companyData = {};
        window.companyData.logo = '';

        localStorage.setItem('mizan_companyData', JSON.stringify(window.companyData));

        if (window.DataStore && window.DataStore.set) {
            window.DataStore.set('companyData', window.companyData);
        }

        window.applyLogoOnLoad();

        if (typeof window.showToast === 'function') {
            window.showToast('🗑️ تم حذف الشعار', 'info');
        }
    };

    window.saveCompanyData = function() {
        const getVal = function(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        const currentLogo = (window.companyData || {}).logo || '';
        const newName = getVal('companyName') || 'الميزان';

        window.companyData = {
            name: newName,
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
            logo: currentLogo,
            updatedAt: new Date().toISOString()
        };

        try {
            localStorage.setItem('mizan_companyData', JSON.stringify(window.companyData));
        } catch(e) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ فشل الحفظ', 'error');
            return;
        }

        if (window.DataStore && window.DataStore.set) {
            window.DataStore.set('companyData', window.companyData);
        }

        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany) headerCompany.textContent = newName;

        window.applyLogoOnLoad();

        if (typeof window.showToast === 'function') {
            window.showToast('✅ تم حفظ بيانات الشركة', 'success');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: الإعدادات والتصدير
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
        if (storeEl && typeof window.getStoreId === 'function') {
            storeEl.textContent = window.getStoreId();
        }

        const cloudEl = document.getElementById('cloudStatusText');
        if (cloudEl) {
            cloudEl.textContent = window.firebaseReady ? '✅ متصل' : '⏳ جاري الاتصال...';
            cloudEl.style.color = window.firebaseReady ? '#2D8F5E' : '#E6A830';
        }
    };

    window.exportData = function() {
        if (!window.DataStore || !window.DataStore.export) return;
        const data = window.DataStore.export();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'mizan_backup_' + (window.getTodayDate ? window.getTodayDate() : Date.now()) + '.json';
        a.click();
        URL.revokeObjectURL(a.href);
        if (typeof window.showToast === 'function') window.showToast('✅ تم التصدير', 'success');
    };

    window.importData = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const doImport = function(confirmed) {
            if (!confirmed) {
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const json = JSON.parse(e.target.result);
                    if (window.DataStore && window.DataStore.import && window.DataStore.import(json)) {
                        if (typeof window.showToast === 'function') window.showToast('✅ تم الاستيراد', 'success');
                        setTimeout(function() { location.reload(); }, 1000);
                    } else {
                        if (typeof window.showToast === 'function') window.showToast('❌ ملف غير صالح', 'error');
                    }
                } catch (err) {
                    if (typeof window.showToast === 'function') window.showToast('❌ خطأ في الملف', 'error');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        };

        if (typeof window.confirmDialog === 'function') {
            window.confirmDialog('⚠️ سيتم استبدال البيانات. متابعة؟').then(doImport);
        } else {
            doImport(confirm('⚠️ سيتم استبدال البيانات. متابعة؟'));
        }
    };

    window.manualSync = async function() {
        if (!window.CloudSync || !window.CloudSync.isReady()) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ Firebase غير متصل', 'error');
            return;
        }

        if (typeof window.showToast === 'function') window.showToast('🔄 جاري المزامنة...', 'info');

        try {
            await window.CloudSync.pushAll(true);
            await window.CloudSync.pullAll(true);
            if (typeof window.showToast === 'function') window.showToast('✅ تمت المزامنة', 'success');
        } catch (e) {
            if (typeof window.showToast === 'function') window.showToast('❌ فشلت المزامنة', 'error');
        }
    };

    window.confirmFullReset = async function() {
        const doReset = async function(confirmed) {
            if (!confirmed) return;

            try {
                if (window.firebaseReady && typeof firebase !== 'undefined' && typeof window.getStorePath === 'function') {
                    const path = window.getStorePath();
                    try {
                        await firebase.database().ref(path).remove();
                    } catch (e) {}
                }

                if (window.DataStore && window.DataStore.clearAll) window.DataStore.clearAll();
                if (typeof window.clearSession === 'function') window.clearSession();

                if ('caches' in window) {
                    const names = await caches.keys();
                    await Promise.all(names.map(function(n) { return caches.delete(n); }));
                }

                if (typeof window.showToast === 'function') window.showToast('🗑️ تم المسح، جاري إعادة التحميل...', 'info');
                setTimeout(function() { location.reload(); }, 1500);
            } catch (e) {
                if (typeof window.showToast === 'function') window.showToast('❌ فشل المسح', 'error');
            }
        };

        if (typeof window.confirmDialog === 'function') {
            window.confirmDialog('سيتم مسح كل شيء من:\n• localStorage\n• Firebase\n• Cache\n\nهل أنت متأكد؟').then(doReset);
        } else {
            doReset(confirm('سيتم مسح كل البيانات. متابعة؟'));
        }
    };

    window.toggleMoreMenu = function() {
        const menu = document.getElementById('moreMenu');
        if (!menu) return;
        menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
    };

    window.init = function() {
        console.log('🚀 بدء تهيئة التطبيق...');

        if (typeof window.seedInitialData === 'function') window.seedInitialData();

        if (window.DataStore && window.DataStore.loadAll) window.DataStore.loadAll();

        if (typeof window.getSession === 'function') {
            const session = window.getSession();
            if (session && session.userId) {
                const user = (window.users || []).find(function(u) { return u.id == session.userId; });
                if (user) window.currentUser = user;
            }
        }

        window.loadCompanyData();

        window.populateLoginUsers();

        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.remove('hidden');
        if (appCont) appCont.style.display = 'none';

        if (typeof window.getTodayDate === 'function') {
            const today = window.getTodayDate();
            ['expDate', 'collectDate', 'payDate'].forEach(function(id) {
                const el = document.getElementById(id);
                if (el) el.value = today;
            });
        }

        if (typeof window.updateClock === 'function') {
            window.updateClock();
            setInterval(window.updateClock, 1000);
        }

        setTimeout(window.populateLoginUsers, 500);

        setTimeout(function() {
            if (typeof window.initCloudSync === 'function') window.initCloudSync();
        }, 2000);

        if (window.EventBus) window.EventBus.emit('app:initialized');
        console.log('✅ التطبيق جاهز');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.init();
        });
    } else {
        window.init();
    }

    window.__appLoaded = true;
    console.log('✅ app.js v34.0 كامل جاهز');

})();
