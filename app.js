/* ============================================================
   الميزان Pro - app.js v25.0 (حل مشكلة تسجيل الدخول)
   ============================================================ */

(function() {
    'use strict';

    console.log('📱 app.js v25.0 - بدء التشغيل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: متغيرات عامة
    // ═══════════════════════════════════════════════════════════

    window.currentUser = null;
    window.companyData = window.companyData || {};
    window.users = window.users || [];

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: تطبيق اللوجو
    // ═══════════════════════════════════════════════════════════

    window.applyLogoOnLoad = function() {
        const company = window.companyData || {};
        const logoData = company.logo || '';

        const headerLogo = document.getElementById('headerLogo');
        const defaultIcon = document.getElementById('headerDefaultIcon');

        if (headerLogo && defaultIcon) {
            if (logoData) {
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
            headerCompany.textContent = company.name || 'الميزان Pro';
        }

        const preview = document.getElementById('companyLogoPreview');
        const img = document.getElementById('companyLogoImg');
        if (preview && img) {
            if (logoData) {
                img.src = logoData;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: تحميل بيانات الشركة
    // ═══════════════════════════════════════════════════════════

    window.loadCompanyData = function() {
        try {
            const saved = localStorage.getItem('companyData');
            if (saved) {
                window.companyData = JSON.parse(saved);
            } else {
                window.companyData = window.companyData || {};
            }

            const c = window.companyData;
            window.applyLogoOnLoad();

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
    // الجزء 4: رفع اللوجو
    // ═══════════════════════════════════════════════════════════

    window.uploadCompanyLogo = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('⚠️ الرجاء اختيار صورة (JPG أو PNG)');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('⚠️ حجم الصورة كبير جداً (أقصى حد 2 ميجا)');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const logoData = e.target.result;

            if (!window.companyData) window.companyData = {};
            window.companyData.logo = logoData;

            try {
                localStorage.setItem('companyData', JSON.stringify(window.companyData));
            } catch (err) {
                alert('⚠️ فشل الحفظ: الصورة كبيرة جداً');
                return;
            }

            const preview = document.getElementById('companyLogoPreview');
            const img = document.getElementById('companyLogoImg');
            if (preview && img) {
                img.src = logoData;
                preview.style.display = 'block';
            }

            window.applyLogoOnLoad();

            if (typeof window.showToast === 'function') {
                window.showToast('✅ تم رفع اللوجو بنجاح', 'success');
            } else {
                alert('✅ تم رفع اللوجو بنجاح');
            }

            event.target.value = '';
        };
        reader.readAsDataURL(file);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: حذف اللوجو
    // ═══════════════════════════════════════════════════════════

    window.removeCompanyLogo = async function() {
        let confirmed = true;
        if (typeof window.confirmDialog === 'function') {
            confirmed = await window.confirmDialog('حذف الشعار؟');
        }
        if (!confirmed) return;

        if (!window.companyData) window.companyData = {};
        window.companyData.logo = '';

        localStorage.setItem('companyData', JSON.stringify(window.companyData));
        window.applyLogoOnLoad();

        if (typeof window.showToast === 'function') {
            window.showToast('🗑️ تم حذف الشعار', 'info');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: حفظ بيانات الشركة
    // ═══════════════════════════════════════════════════════════

    window.saveCompanyData = function() {
        const getVal = function(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        const currentLogo = (window.companyData || {}).logo || '';

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
            logo: currentLogo,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('companyData', JSON.stringify(window.companyData));
        window.applyLogoOnLoad();

        if (typeof window.showToast === 'function') {
            window.showToast('✅ تم حفظ بيانات الشركة', 'success');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: عرض بيانات الشركة
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

        setTxt('companySalesTotal', totalSales.toFixed(2) + ' ج.م');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: تسجيل الدخول (الإصدار المبسط)
    // ═══════════════════════════════════════════════════════════

    // ★★★ تحميل المستخدمين أو إنشاء المدير الافتراضي ★★★
    window.loadOrCreateUsers = function() {
        try {
            const saved = localStorage.getItem('users');
            if (saved) {
                window.users = JSON.parse(saved);
                if (Array.isArray(window.users) && window.users.length > 0) {
                    return;
                }
            }
        } catch (e) {}

        // إنشاء المدير الافتراضي
        window.users = [
            {
                id: 'user_admin',
                name: 'المدير',
                password: '123456',
                role: 'admin',
                active: true,
                storeId: 'store_default'
            }
        ];
        localStorage.setItem('users', JSON.stringify(window.users));
    };

    // ★★★ تعبئة قائمة المستخدمين ★★★
    window.populateLoginUsers = function() {
        const sel = document.getElementById('loginUsername');
        if (!sel) return;

        window.loadOrCreateUsers();

        let html = '<option value="">اختر المستخدم...</option>';
        window.users.forEach(function(u) {
            if (u.active !== false) {
                const roleIcon = u.role === 'admin' ? '👑' : (u.role === 'manager' ? '📊' : '👤');
                html += '<option value="' + u.id + '">' + roleIcon + ' ' + u.name + '</option>';
            }
        });
        sel.innerHTML = html;
    };

    // ★★★ التحقق من تسجيل الدخول ★★★
    window.checkLogin = function() {
        const userIdEl = document.getElementById('loginUsername');
        const passwordEl = document.getElementById('loginPassword');
        const errorEl = document.getElementById('loginError');

        const userId = userIdEl ? userIdEl.value : '';
        const password = passwordEl ? passwordEl.value : '';

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

        // مقارنة كلمة المرور (مباشرة)
        if (password !== user.password) {
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

        // ✅ نجاح
        window.currentUser = user;

        try {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } catch (e) {}

        if (errorEl) errorEl.classList.remove('show');
        if (passwordEl) passwordEl.value = '';

        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.add('hidden');
        if (appCont) appCont.style.display = 'block';

        // ★★★ تحميل بيانات الشركة واللوجو ★★★
        window.loadCompanyData();

        if (typeof window.showToast === 'function') {
            window.showToast('🔓 مرحباً ' + user.name + '!', 'success');
        }

        if (typeof window.navigateTo === 'function') {
            window.navigateTo('dashboard');
        }
    };

    // ★★★ قفل التطبيق ★★★
    window.lockApp = function() {
        if (!confirm('هل تريد تسجيل الخروج؟')) return;

        window.currentUser = null;
        localStorage.removeItem('currentUser');

        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.remove('hidden');
        if (appCont) appCont.style.display = 'none';

        const passwordEl = document.getElementById('loginPassword');
        const userEl = document.getElementById('loginUsername');
        if (passwordEl) passwordEl.value = '';
        if (userEl) userEl.value = '';

        window.populateLoginUsers();
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: التنقل بين الصفحات
    // ═══════════════════════════════════════════════════════════

    window.navigateTo = function(pageName) {
        document.querySelectorAll('.page-container').forEach(function(p) {
            p.classList.remove('active');
        });

        const page = document.getElementById('page-' + pageName);
        if (page) page.classList.add('active');

        document.querySelectorAll('.bottom-nav .nav-item').forEach(function(item) {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        const moreMenu = document.getElementById('moreMenu');
        if (moreMenu) moreMenu.style.display = 'none';

        const renderers = {
            'dashboard': 'renderDashboard',
            'company': 'renderCompany',
            'inventory': 'renderProducts',
            'customers': 'renderCustomers',
            'suppliers': 'renderSuppliers',
            'invoices': 'renderInvoices',
            'expenses': 'renderExpenses',
            'treasury': 'renderTreasury',
            'cash-boxes': 'renderCashBoxes',
            'users': 'renderUsers',
            'reports': 'renderReports',
            'accounts': 'renderAccounts',
            'settings': 'renderSettings'
        };

        const fnName = renderers[pageName];
        if (fnName && typeof window[fnName] === 'function') {
            window[fnName]();
        }

        if (pageName === 'settings' && typeof window.renderAdsList === 'function') {
            setTimeout(window.renderAdsList, 100);
        }
    };

    window.toggleMoreMenu = function() {
        const menu = document.getElementById('moreMenu');
        if (!menu) return;
        menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 10: التهيئة النهائية
    // ═══════════════════════════════════════════════════════════

    window.init = function() {
        console.log('🚀 بدء تهيئة التطبيق...');

        // تحميل المستخدمين أو إنشاء المدير
        window.loadOrCreateUsers();

        // تحميل بيانات الشركة واللوجو
        window.loadCompanyData();

        // تعبئة قائمة المستخدمين
        window.populateLoginUsers();

        // إظهار شاشة الدخول
        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.remove('hidden');
        if (appCont) appCont.style.display = 'none';

        // الساعة
        if (typeof window.updateClock === 'function') {
            window.updateClock();
            setInterval(window.updateClock, 1000);
        }

        console.log('✅ التطبيق جاهز');
    };

    // التحميل التلقائي
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.init();
        });
    } else {
        window.init();
    }

    window.__appLoaded = true;
    console.log('✅ app.js v25.0 كامل جاهز');

})();
