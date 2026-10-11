// ============================================================
// الميزان Pro - app.js
// تسجيل الدخول + المستخدمين + الشركة + التهيئة
// ============================================================

(function() {
    'use strict';

    console.log('📱 app.js v18.0 - بدء التحميل');

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

    window.populateLoginUsers = function() {
        const sel = document.getElementById('loginUsername');
        if (!sel) return;

        let users = window.users || [];

        if (users.length === 0) {
            try {
                const stored = localStorage.getItem('mizan_v18_users');
                if (stored) {
                    users = JSON.parse(stored);
                    window.users = users;
                }
            } catch (e) {}
        }

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

        // التحقق من قفل الحساب
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

        // التحقق من كلمة المرور (مع دعم التشفير)
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

        // نجاح
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

        // إخفاء شاشة الدخول
        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.add('hidden');
        if (appCont) appCont.style.display = 'block';

        window.updateUserUI();
        window.showToast('🔓 مرحباً ' + user.name + '!', 'success');

        // تهيئة التطبيق
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

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: تهيئة التطبيق بعد تسجيل الدخول
    // ═══════════════════════════════════════════════════════════

    window.initAppAfterLogin = function() {
        // تهيئة Firebase
        if (typeof firebase !== 'undefined' && !window.firebaseReady) {
            window.CloudSync.init();
        }

        // تحديث الواجهات
        window.refreshAllUI();

        // تشغيل الساعة
        if (!window.__clockInterval) {
            window.updateClock();
            window.__clockInterval = setInterval(window.updateClock, 1000);
        }

        // ملء القوائم المنسدلة
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

        // تحديث Store ID في الإعدادات
        const storeEl = document.getElementById('storeIdDisplay');
        if (storeEl) storeEl.textContent = window.getStoreId();

        // ضبط التاريخ الافتراضي
        const today = window.getTodayDate();
        ['expDate', 'collectDate', 'payDate'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = today;
        });

        window.EventBus.emit('app:ready');
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

        // تشفير كلمة المرور
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
    // الجزء 5: بيانات الشركة
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

        // الإحصائيات
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

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: التصدير / الاستيراد
    // ═══════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: المزامنة اليدوية
    // ═══════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: إعادة التصفير
    // ═══════════════════════════════════════════════════════════

    window.confirmFullReset = async function() {
        const confirmed = await window.confirmDialog(
            'سيتم مسح كل شيء من:\n• localStorage\n• Firebase\n• Cache\n\nهل أنت متأكد؟'
        );

        if (!confirmed) return;

        try {
            // مسح Firebase
            if (window.firebaseReady && typeof firebase !== 'undefined') {
                const path = window.getStorePath();
                try {
                    await firebase.database().ref(path).remove();
                } catch (e) {}
            }

            // مسح localStorage
            window.DataStore.clearAll();

            // مسح session
            window.clearSession();

            // مسح cache
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
    // الجزء 10: التهيئة الأولية
    // ═══════════════════════════════════════════════════════════

    window.init = function() {
        console.log('🚀 بدء تهيئة التطبيق...');

        // استرجاع الجلسة السابقة
        const session = window.getSession();
        if (session && session.userId) {
            const user = (window.users || []).find(function(u) { return u.id == session.userId; });
            if (user) {
                window.currentUser = user;
                console.log('✅ استرجاع الجلسة للمستخدم:', user.name);
            }
        }

        // بيانات أولية
        window.seedInitialData();

        // تحميل البيانات من localStorage
        window.DataStore.loadAll();

        // ملء المستخدمين
        window.populateLoginUsers();

        // إظهار شاشة الدخول افتراضياً
        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.remove('hidden');
        if (appCont) appCont.style.display = 'none';

        // تهيئة Firebase إذا المستخدم مسجّل دخول بالفعل
        if (window.currentUser) {
            if (typeof firebase !== 'undefined') {
                window.CloudSync.init();
            }
        }

        // ضبط التاريخ الافتراضي
        const today = window.getTodayDate();
        ['expDate', 'collectDate', 'payDate'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = today;
        });

        // تشغيل الساعة
        window.updateClock();
        setInterval(window.updateClock, 1000);

        // ملء القوائم
        setTimeout(function() {
            window.populateLoginUsers();
        }, 500);

        window.EventBus.emit('app:initialized');
        console.log('✅ التطبيق جاهز');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 11: الربط مع نظام الأحداث
    // ═══════════════════════════════════════════════════════════

    // لما يتغير اسم الشركة، نحدث الهيدر
    window.EventBus.on('data:companyData:changed', function(data) {
        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany && data.name) {
            headerCompany.textContent = data.name;
        }
    });

    // لما تتغير المستخدمين، نحدث قائمة الدخول
    window.EventBus.on('data:users:changed', function() {
        window.populateLoginUsers();
    });

    // ═══════════════════════════════════════════════════════════
    // الجزء 12: التحميل التلقائي
    // ═══════════════════════════════════════════════════════════

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.init();
        });
    } else {
        window.init();
    }

    window.__appLoaded = true;
    console.log('✅ app.js v18.0 جاهز');

})();
