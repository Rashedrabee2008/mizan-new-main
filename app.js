// ============================================================
// الميزان Pro - app.js v33.0 (حفظ اللوجو بشكل دائم)
// ============================================================

(function() {
    'use strict';

    window.companyData = window.companyData || {};

    // ═══════════════════════════════════════════════════════════
    // دالة حفظ اللوجو في ذاكرة قوية (IndexedDB)
    // ═══════════════════════════════════════════════════════════
    function saveLogoToDB(base64Data) {
        return new Promise(function(resolve) {
            const request = indexedDB.open('MizanDB', 1);
            request.onupgradeneeded = function(e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            };
            request.onsuccess = function(e) {
                const db = e.target.result;
                const transaction = db.transaction('settings', 'readwrite');
                const store = transaction.objectStore('settings');
                store.put(base64Data, 'companyLogo');
                transaction.oncomplete = function() { resolve(true); };
                transaction.onerror = function() { resolve(false); };
            };
            request.onerror = function() { resolve(false); };
        });
    }

    function loadLogoFromDB() {
        return new Promise(function(resolve) {
            const request = indexedDB.open('MizanDB', 1);
            request.onupgradeneeded = function(e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            };
            request.onsuccess = function(e) {
                const db = e.target.result;
                const transaction = db.transaction('settings', 'readonly');
                const store = transaction.objectStore('settings');
                const getReq = store.get('companyLogo');
                getReq.onsuccess = function() { resolve(getReq.result || ''); };
                getReq.onerror = function() { resolve(''); };
            };
            request.onerror = function() { resolve(''); };
        });
    }

    // ═══════════════════════════════════════════════════════════
    // تطبيق اللوجو واسم الشركة
    // ═══════════════════════════════════════════════════════════

    window.applyLogoOnLoad = async function() {
        const company = window.companyData || {};
        let logoData = company.logo || '';
        
        // لو مفيش لوجو في الذاكرة العادية، نجيبه من الذاكرة القوية
        if (!logoData) {
            logoData = await loadLogoFromDB();
            if (logoData) window.companyData.logo = logoData;
        }
        
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

    window.loadCompanyData = async function() {
        try {
            let saved = localStorage.getItem('mizan_companyData');
            if (!saved && window.DataStore && window.DataStore.get) {
                const dsData = window.DataStore.get('companyData');
                if (dsData) saved = JSON.stringify(dsData);
            }
            if (!saved) saved = localStorage.getItem('companyData');

            if (saved) {
                try { window.companyData = JSON.parse(saved); } catch (e) {}
            }
            if (!window.companyData) window.companyData = {};

            await window.applyLogoOnLoad();

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

        } catch (e) {
            console.warn('⚠️ خطأ في تحميل بيانات الشركة:', e);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // رفع اللوجو
    // ═══════════════════════════════════════════════════════════

    window.uploadCompanyLogo = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ الرجاء اختيار صورة', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async function(e) {
            const logoData = e.target.result;

            if (!window.companyData) window.companyData = {};
            window.companyData.logo = logoData;

            // 1. الحفظ في الـ IndexedDB (للطباعة)
            await saveLogoToDB(logoData);

            // 2. الحفظ في الـ localStorage
            try {
                localStorage.setItem('mizan_companyData', JSON.stringify(window.companyData));
            } catch (err) {
                if (typeof window.showToast === 'function') window.showToast('⚠️ فشل الحفظ: الصورة كبيرة جداً', 'error');
                return;
            }

            if (window.DataStore && window.DataStore.set) {
                window.DataStore.set('companyData', window.companyData);
            }

            await window.applyLogoOnLoad();

            if (typeof window.showToast === 'function') window.showToast('✅ تم رفع الشعار', 'success');
            event.target.value = '';
        };
        reader.readAsDataURL(file);
    };

    // ═══════════════════════════════════════════════════════════
    // حفظ بيانات الشركة
    // ═══════════════════════════════════════════════════════════

    window.saveCompanyData = async function() {
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

        await window.applyLogoOnLoad();

        if (typeof window.showToast === 'function') {
            window.showToast('✅ تم حفظ بيانات الشركة', 'success');
        }
    };

    // (باقي دوال app.js زي login و renderCompany هتكون موجودة زي ما هي عندك، 
    // المهم هنا إننا غيرنا الدوال اللي بتتعامل مع اللوجو وحفظ الاسم)

    window.__appLoaded = true;
})();
