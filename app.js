// ============================================================
// الميزان Pro - app.js v37.0 (الحل النهائي للوجو والواجهة)
// ============================================================

(function() {
    'use strict';

    window.currentUser = null;
    window.currentSaleItems = [];
    window.currentPurItems = [];
    window.currentRetItems = [];
    window.currentTreasuryFilter = 'all';
    window.currentInvoiceFilter = 'all';
    window.currentPayTab = 'collect';
    window.currentReport = 'daily';
    window.companyData = window.companyData || {};

    // ═══════════════════════════════════════════════════════════
    // إصلاح: تطبيق اللوجو بشكل صحيح (عشان ميتصرفش)
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
        if (headerCompany) headerCompany.textContent = companyName;

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

    window.loadCompanyData = function() {
        try {
            let saved = localStorage.getItem('mizan_companyData');
            if (!saved && window.DataStore && window.DataStore.get) {
                const dsData = window.DataStore.get('companyData');
                if (dsData) saved = JSON.stringify(dsData);
            }
            if (saved) { window.companyData = JSON.parse(saved); }
            if (!window.companyData) window.companyData = {};

            window.applyLogoOnLoad();

            const c = window.companyData;
            const setVal = function(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; };

            setVal('companyName', c.name);
            setVal('companyPhone', c.phone);
            setVal('companyAddress', c.address);
            setVal('companyFooter', c.footer);

            const colorEl = document.getElementById('companyPrimaryColor');
            if (colorEl) colorEl.value = c.primaryColor || '#C9A94E';
            
            const curEl = document.getElementById('companyCurrency');
            if (curEl) curEl.value = c.currency || 'ج.م';

            const preview = document.getElementById('companyLogoPreview');
            const img = document.getElementById('companyLogoImg');
            if (preview && img && c.logo) {
                img.src = c.logo;
                preview.style.display = 'block';
            }
        } catch (e) {}
    };

    window.uploadCompanyLogo = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            window.showToast('⚠️ الرجاء اختيار صورة صحيحة', 'error');
            return;
        }

        // ⚡ إصلاح: ضغط الصورة قبل الحفظ عشان متملاش الذاكرة
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedLogo = canvas.toDataURL('image/jpeg', 0.8);

                if (!window.companyData) window.companyData = {};
                window.companyData.logo = compressedLogo;

                try { localStorage.setItem('mizan_companyData', JSON.stringify(window.companyData)); } catch (err) {}
                if (window.DataStore && window.DataStore.set) window.DataStore.set('companyData', window.companyData);

                window.applyLogoOnLoad();
                
                const preview = document.getElementById('companyLogoPreview');
                const imgEl = document.getElementById('companyLogoImg');
                if (preview && imgEl) { imgEl.src = compressedLogo; preview.style.display = 'block'; }

                window.showToast('✅ تم رفع الشعار بنجاح', 'success');
                event.target.value = '';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    window.removeCompanyLogo = async function() {
        if (!await window.confirmDialog('حذف الشعار؟')) return;
        if (!window.companyData) window.companyData = {};
        window.companyData.logo = '';
        localStorage.setItem('mizan_companyData', JSON.stringify(window.companyData));
        if (window.DataStore && window.DataStore.set) window.DataStore.set('companyData', window.companyData);
        window.applyLogoOnLoad();
        window.showToast('🗑️ تم حذف الشعار', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // الدوال الأساسية للتطبيق
    // ═══════════════════════════════════════════════════════════

    window.checkLogin = async function() {
        const userId = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');

        if (!userId) { errorEl.textContent = '⚠️ اختر المستخدم'; errorEl.classList.add('show'); return; }
        
        const user = (window.users || []).find(u => u.id == userId);
        if (!user || user.password !== password) {
            if (typeof window.recordFailedLogin === 'function') window.recordFailedLogin();
            errorEl.textContent = '⚠️ كلمة المرور خاطئة'; errorEl.classList.add('show');
            setTimeout(() => errorEl.classList.remove('show'), 3000);
            return;
        }

        window.currentUser = user;
        localStorage.setItem('mizan_current_user', JSON.stringify({ id: user.id, name: user.name, role: user.role }));
        
        if (errorEl) errorEl.classList.remove('show');
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContent').style.display = 'block';

        if (typeof window.updateUserUI === 'function') window.updateUserUI();
        window.showToast('🔓 مرحباً ' + user.name + '!', 'success');
        
        window.loadCompanyData();
        if (typeof window.initAppAfterLogin === 'function') setTimeout(window.initAppAfterLogin, 100);
        if (typeof window.navigateTo === 'function') window.navigateTo('dashboard');
    };

    window.initAppAfterLogin = function() {
        if (typeof firebase !== 'undefined' && !window.firebaseReady && window.CloudSync) {
            try { window.CloudSync.init(); } catch (e) {}
        }
        window.applyLogoOnLoad();
        if (typeof window.refreshAllUI === 'function') window.refreshAllUI();
        if (typeof window.updateClock === 'function') {
            window.updateClock();
            if(!window.__clockInterval) window.__clockInterval = setInterval(window.updateClock, 1000);
        }
        if (typeof window.populateCashBoxDropdowns === 'function') window.populateCashBoxDropdowns();
        if (typeof window.populateWarehouseField === 'function') window.populateWarehouseField();
    };

    window.renderCompany = function() {
        window.loadCompanyData();
        const setTxt = function(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; };
        setTxt('companyProductsCount', (window.products || []).length);
        setTxt('companySalesCount', (window.sales || []).length);
        setTxt('companyCustomersCount', (window.customers || []).length);
        setTxt('companySuppliersCount', (window.suppliers || []).length);
        
        const totalSales = (window.sales || []).reduce((s, x) => s + (parseFloat(x.total) || 0), 0);
        setTxt('companySalesTotal', window.formatMoney(totalSales) + ' ج.م');
    };

    window.populateLoginUsers = function() {
        const sel = document.getElementById('loginUsername');
        if (!sel) return;
        let users = window.users || [];
        if (users.length === 0) {
            users = [{ id: 'user_admin', name: 'المدير', password: '123456', role: 'admin', active: true }];
            window.users = users;
            localStorage.setItem('mizan_users', JSON.stringify(users));
        }
        let html = '<option value="">اختر المستخدم...</option>';
        users.forEach(u => {
            if (u.active !== false) {
                const roleInfo = (window.ROLES && window.ROLES[u.role]) || { icon: '❓', name: u.role };
                html += '<option value="' + u.id + '">' + roleInfo.icon + ' ' + u.name + '</option>';
            }
        });
        sel.innerHTML = html;
    };

    window.lockApp = async function() {
        if (typeof window.confirmDialog === 'function') {
            if (!await window.confirmDialog('تسجيل الخروج؟')) return;
        }
        window.currentUser = null;
        localStorage.removeItem('mizan_current_user');
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('appContent').style.display = 'none';
        window.populateLoginUsers();
    };

    window.init = function() {
        if (typeof window.seedInitialData === 'function') window.seedInitialData();
        if (window.DataStore && window.DataStore.loadAll) window.DataStore.loadAll();
        
        window.loadCompanyData();
        window.populateLoginUsers();
        
        setTimeout(() => {
            if (window.CloudSync && !window.firebaseReady) window.CloudSync.init();
        }, 2000);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.init);
    } else {
        window.init();
    }
})();
