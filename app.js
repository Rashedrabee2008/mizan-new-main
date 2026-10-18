// ============================================================
// الميزان Pro - app.js v45.0 (نسخة الدخول المضمون)
// ============================================================

(function() {
    'use strict';

    window.currentUser = null;
    window.currentSaleItems = [];
    window.currentPurItems = [];
    window.currentRetItems = [];
    window.companyData = window.companyData || {};

    // ═══════════════════════════════════════════════════════════
    // 1. اللوجو وبيانات الشركة
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
            
            if (document.getElementById('companyName')) document.getElementById('companyName').value = window.companyData.name || '';
            if (document.getElementById('companyPhone')) document.getElementById('companyPhone').value = window.companyData.phone || '';
        } catch (e) {}
    };

    // ═══════════════════════════════════════════════════════════
    // 2. الدخول المضمون (بدون باسورد للمدير)
    // ═══════════════════════════════════════════════════════════
    
    window.populateLoginUsers = function() {
        const sel = document.getElementById('loginUsername');
        if (!sel) return;
        
        let users = window.users || [];
        
        // لو مفيش مستخدمين، نكريت المدير
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
        
        // اختيار المدير تلقائياً عشان تسهيل الدخول
        if (sel.options.length > 1) sel.selectedIndex = 1; 
    };

    window.checkLogin = async function() {
        const userId = document.getElementById('loginUsername').value;
        const errorEl = document.getElementById('loginError');

        if (!userId) { 
            if(errorEl) { errorEl.textContent = '⚠️ اختر المستخدم أولاً'; errorEl.classList.add('show'); }
            return; 
        }
        
        let user = (window.users || []).find(u => u.id == userId);
        
        if (!user) {
            if(errorEl) { errorEl.textContent = '⚠️ المستخدم غير موجود'; errorEl.classList.add('show'); }
            return;
        }

        // ⚡ الدخول المباشر (تخطي الباسورد)
        window.currentUser = user;
        try { localStorage.setItem('mizan_current_user', JSON.stringify({ id: user.id, name: user.name, role: user.role })); } catch(e) {}
        
        if (errorEl) errorEl.classList.remove('show');
        if (document.getElementById('loginPassword')) document.getElementById('loginPassword').value = '';
        
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContent').style.display = 'block';

        if (typeof window.updateUserUI === 'function') window.updateUserUI();
        if (typeof window.showToast === 'function') window.showToast('🔓 مرحباً ' + user.name + '!', 'success');
        
        window.loadCompanyData();

        setTimeout(function() {
            if (typeof window.initAppAfterLogin === 'function') window.initAppAfterLogin();
            if (typeof window.navigateTo === 'function') window.navigateTo('dashboard');
        }, 100);
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

    // ═══════════════════════════════════════════════════════════
    // 3. التهيئة
    // ═══════════════════════════════════════════════════════════
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
