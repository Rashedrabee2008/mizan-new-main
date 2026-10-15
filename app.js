/* ============================================================
   الميزان Pro - app.js v24.0 (النسخة النهائية المصححة)
   ============================================================ */

(function() {
    'use strict';

    console.log('📱 app.js v24.0 - بدء التشغيل');

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
    window.companyData = window.companyData || {};

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: تطبيق اللوجو
    // ═══════════════════════════════════════════════════════════

    window.applyLogoOnLoad = function() {
        const company = window.companyData || {};
        const logoData = company.logo || '';

        // الهيدر
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

        // اسم الشركة في الهيدر
        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany) {
            headerCompany.textContent = company.name || 'الميزان Pro';
        }

        // في صفحة الشركة
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

            // ★★★ تطبيق اللوجو ★★★
            window.applyLogoOnLoad();

            // تعبئة الحقول
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

            // المعاينة
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
    // الجزء 4: رفع اللوجو (الإصدار النهائي)
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

            // ★★★ تأكد إن companyData موجودة ★★★
            if (!window.companyData) window.companyData = {};
            window.companyData.logo = logoData;

            // ★★★ الحفظ في localStorage ★★★
            try {
                localStorage.setItem('companyData', JSON.stringify(window.companyData));
                console.log('✅ تم حفظ اللوجو في localStorage');
            } catch (err) {
                alert('⚠️ فشل الحفظ: الصورة كبيرة جداً');
                console.error(err);
                return;
            }

            // تحديث المعاينة
            const preview = document.getElementById('companyLogoPreview');
            const img = document.getElementById('companyLogoImg');
            if (preview && img) {
                img.src = logoData;
                preview.style.display = 'block';
            }

            // تحديث اللوجو في الهيدر
            window.applyLogoOnLoad();

            // رسالة نجاح
            if (typeof window.showToast === 'function') {
                window.showToast('✅ تم رفع اللوجو بنجاح', 'success');
            } else {
                alert('✅ تم رفع اللوجو بنجاح');
            }

            // تفريغ حقل الرفع
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

        // الحفظ في localStorage
        localStorage.setItem('companyData', JSON.stringify(window.companyData));

        // تحديث الواجهة
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

        // احفظ اللوجو الحالي
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
            updatedAt: new Date().toISOString(),
            updatedBy: window.currentUser ? window.currentUser.name : ''
        };

        // الحفظ في localStorage
        localStorage.setItem('companyData', JSON.stringify(window.companyData));

        // تحديث الهيدر
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

        if (typeof window.formatMoney === 'function') {
            setTxt('companySalesTotal', window.formatMoney(totalSales) + ' ج.م');
        } else {
            setTxt('companySalesTotal', totalSales.toFixed(2) + ' ج.م');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: باقي الدوال (تسجيل الدخول، التنقل، إلخ)
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
    // الجزء 9: التهيئة النهائية
    // ═══════════════════════════════════════════════════════════

    window.init = function() {
        console.log('🚀 بدء تهيئة التطبيق...');

        if (typeof window.seedInitialData === 'function') window.seedInitialData();
        if (window.DataStore && window.DataStore.loadAll) window.DataStore.loadAll();

        // استرجاع الجلسة
        if (typeof window.getSession === 'function') {
            const session = window.getSession();
            if (session && session.userId) {
                const user = (window.users || []).find(function(u) { return u.id == session.userId; });
                if (user) window.currentUser = user;
            }
        }

        if (typeof window.populateLoginUsers === 'function') window.populateLoginUsers();

        // إظهار شاشة الدخول
        const loginCont = document.getElementById('loginContainer');
        const appCont = document.getElementById('appContent');
        if (loginCont) loginCont.classList.remove('hidden');
        if (appCont) appCont.style.display = 'none';

        // ★★★ تحميل بيانات الشركة واللوجو - مهم جداً ★★★
        window.loadCompanyData();

        // الساعة
        if (typeof window.updateClock === 'function') {
            window.updateClock();
            setInterval(window.updateClock, 1000);
        }

        if (window.EventBus) window.EventBus.emit('app:initialized');
        console.log('✅ التطبيق جاهز');
    };

    // ═══════════════════════════════════════════════════════════
    // التحميل التلقائي
    // ═══════════════════════════════════════════════════════════

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.init();
        });
    } else {
        window.init();
    }

    window.__appLoaded = true;
    console.log('✅ app.js v24.0 كامل جاهز');

})();
