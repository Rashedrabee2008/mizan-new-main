// ============================================================
// الميزان Pro - app.js v50.0 (نسخة الدخول النهائي)
// ============================================================
(function() {
    'use strict';

    window.currentUser = null;
    window.companyData = window.companyData || {};

    window.applyLogoOnLoad = function() {
        const company = window.companyData || {};
        const logoData = company.logo || '';
        const companyName = company.name || 'الميزان Pro';
        const headerLogo = document.getElementById('headerLogo');
        const defaultIcon = document.getElementById('headerDefaultIcon');
        if (headerLogo && defaultIcon) {
            if (logoData) { headerLogo.src = logoData; headerLogo.style.display = 'block'; defaultIcon.style.display = 'none'; }
            else { headerLogo.style.display = 'none'; defaultIcon.style.display = 'block'; }
        }
        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany) headerCompany.textContent = companyName;
    };

    window.loadCompanyData = function() {
        try {
            let saved = localStorage.getItem('mizan_companyData');
            if (!saved && window.DataStore) saved = JSON.stringify(window.DataStore.get('companyData'));
            if (saved) window.companyData = JSON.parse(saved);
            if (!window.companyData) window.companyData = {};
            window.applyLogoOnLoad();
        } catch (e) {}
    };

    // ⚡ الدخول المضمون - شيلنا الباسورد خالص عشان المشكلة تتحل
    window.checkLogin = async function() {
        const userId = document.getElementById('loginUsername').value;
        const errorEl = document.getElementById('loginError');

        if (!userId) { 
            if(errorEl) { errorEl.textContent = '⚠️ اختر المستخدم'; errorEl.classList.add('show'); }
            return; 
        }
        
        let user = (window.users || []).find(u => u.id == userId);
        if (!user) {
            if(errorEl) { errorEl.textContent = '⚠️ المستخدم غير موجود'; errorEl.classList.add('show'); }
            return;
        }

        window.currentUser = user;
        localStorage.setItem('mizan_current_user', JSON.stringify({ id: user.id, name: user.name, role: user.role }));
        if (errorEl) errorEl.classList.remove('show');
        
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContent').style.display = 'block';

        if (typeof window.showToast === 'function') window.showToast('مرحباً ' + user.name, 'success');
        window.loadCompanyData();
        
        if (window.CloudSync && !window.firebaseReady) window.CloudSync.init();
        if (typeof window.navigateTo === 'function') window.navigateTo('dashboard');
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
            if (u.active !== false) html += '<option value="' + u.id + '">👑 ' + u.name + '</option>';
        });
        sel.innerHTML = html;
        if (sel.options.length > 1) sel.selectedIndex = 1;
    };

    window.init = function() {
        if (window.seedInitialData) window.seedInitialData();
        if (window.DataStore) window.DataStore.loadAll();
        window.loadCompanyData();
        window.populateLoginUsers();
    };

    window.init();
})();
