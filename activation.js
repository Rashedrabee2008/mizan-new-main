// ============================================================
// الميزان Pro - activation.js v6.0 (حل جذري للتفعيل)
// 🔧 التعديلات: تدفق تفعيل متزامن + حماية من التعارض مع app.js
// ============================================================

(function() {
    'use strict';

    console.log('🔐 activation.js v6.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الإعدادات
    // ═══════════════════════════════════════════════════════════

    const FIREBASE_CONFIG_FALLBACK = {
        apiKey: "AIzaSyB3cnrETONbcrH1d_94w3TzeUEQIF0MSXw",
        authDomain: "mizan-new-main.firebaseapp.com",
        databaseURL: "https://mizan-new-main-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "mizan-new-main",
        storageBucket: "mizan-new-main.firebasestorage.app",
        messagingSenderId: "442192802804",
        appId: "1:442192802804:web:8035c27ab7dcf38a547fa1"
    };

    const ACTIVATION_KEY = 'mizan_activation_v1';
    const CACHED_CODES_KEY = 'mizan_cached_codes';
    const ACTIVATION_PATH = 'activations';

    // 🔧 علامة عامة تُبلّغ app.js بنتيجة التفعيل
    window.__activationPassed = undefined;
    window.__activationChecked = false;

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: تهيئة Firebase
    // ═══════════════════════════════════════════════════════════

    function ensureFirebaseInitialized() {
        if (typeof firebase === 'undefined') return false;

        try {
            if (!firebase.apps || firebase.apps.length === 0) {
                const config = window.FIREBASE_CONFIG || FIREBASE_CONFIG_FALLBACK;
                firebase.initializeApp(config);
                console.log('✅ Firebase تم تهيئته من activation.js');
            }
            window.firebaseReady = true;
            return true;
        } catch (e) {
            console.error('❌ فشل تهيئة Firebase:', e.message);
            return false;
        }
    }

    function waitForFirebaseAndInit() {
        if (typeof firebase === 'undefined') {
            setTimeout(waitForFirebaseAndInit, 300);
            return;
        }
        ensureFirebaseInitialized();
    }

    waitForFirebaseAndInit();

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: التحقق من التفعيل
    // ═══════════════════════════════════════════════════════════

    function getCurrentStoreId() {
        if (typeof window.getStoreId === 'function') {
            return window.getStoreId();
        }
        return localStorage.getItem('mizan_store_id_v18') || '';
    }

    // 🔧 نسخة محسّنة: لا ترفض التفعيل بسبب تغيّر storeId
    function isActivated() {
        try {
            const data = localStorage.getItem(ACTIVATION_KEY);
            if (!data) return false;

            const parsed = JSON.parse(data);
            if (!parsed.code && !parsed.storeId) return false;

            // ✅ لا ترفض بسبب تغيّر storeId — فقط سجّل تحذيراً
            const currentStoreId = getCurrentStoreId();
            if (parsed.storeId && parsed.storeId !== currentStoreId) {
                console.warn('⚠️ storeId تغيّر — التفعيل لا يزال صالحاً');
            }

            return true;
        } catch (e) {
            return false;
        }
    }

    function saveActivation(code) {
        try {
            localStorage.setItem(ACTIVATION_KEY, JSON.stringify({
                code: code,
                storeId: getCurrentStoreId(),
                activatedAt: new Date().toISOString()
            }));
            return true;
        } catch (e) {
            return false;
        }
    }

    function clearActivation() {
        try { localStorage.removeItem(ACTIVATION_KEY); } catch (e) {}
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: التخزين المؤقت
    // ═══════════════════════════════════════════════════════════

    function cacheActivationCode(code, data) {
        try {
            const cachedCodes = JSON.parse(localStorage.getItem(CACHED_CODES_KEY) || '{}');
            cachedCodes[code] = Object.assign({}, data, { cachedAt: new Date().toISOString() });
            localStorage.setItem(CACHED_CODES_KEY, JSON.stringify(cachedCodes));
        } catch (e) {}
    }

    function getCachedCode(code) {
        try {
            const cachedCodes = JSON.parse(localStorage.getItem(CACHED_CODES_KEY) || '{}');
            return cachedCodes[code] || null;
        } catch (e) {
            return null;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: التحقق من الكود
    // ═══════════════════════════════════════════════════════════

    async function verifyCodeWithFirebase(code) {
        if (!ensureFirebaseInitialized()) {
            return { valid: false, reason: 'no_firebase' };
        }

        try {
            const codeRef = firebase.database().ref(ACTIVATION_PATH + '/' + code);
            const snapshot = await codeRef.once('value');

            if (!snapshot.exists()) {
                return { valid: false, reason: 'not_found' };
            }

            const data = snapshot.val();
            const currentStoreId = getCurrentStoreId();

            if (data.storeId && data.storeId !== currentStoreId) {
                return { valid: false, reason: 'used_by_another_store' };
            }

            if (data.active === false) {
                return { valid: false, reason: 'deactivated' };
            }

            return { valid: true, data: data };
        } catch (e) {
            console.error('❌ خطأ في التحقق:', e);
            return { valid: false, reason: 'error', error: e.message };
        }
    }

    async function verifyCodeSmart(code) {
        if (navigator.onLine) {
            const result = await verifyCodeWithFirebase(code);
            if (result.valid) cacheActivationCode(code, result.data);
            return result;
        }

        const cached = getCachedCode(code);
        if (cached) {
            return { valid: true, data: cached, fromCache: true };
        }

        return { valid: false, reason: 'offline_no_cache' };
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: تسجيل الاستخدام
    // ═══════════════════════════════════════════════════════════

    async function registerCodeUsage(code) {
        if (!ensureFirebaseInitialized()) return false;
        if (!navigator.onLine) return false;

        try {
            const codeRef = firebase.database().ref(ACTIVATION_PATH + '/' + code);
            const currentStoreId = getCurrentStoreId();

            const snapshot = await codeRef.once('value');
            const existing = snapshot.val() || {};

            await codeRef.update({
                code: code,
                storeId: currentStoreId,
                activatedAt: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                active: existing.active !== false,
                customerName: existing.customerName || '',
                customerPhone: existing.customerPhone || '',
                usedCount: (existing.usedCount || 0) + 1
            });

            return true;
        } catch (e) {
            console.error('❌ خطأ في التسجيل:', e);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: التحقق من متجر موجود
    // ═══════════════════════════════════════════════════════════

    async function verifyExistingStore(storeId) {
        if (!storeId) return { valid: false, reason: 'empty' };
        if (storeId.indexOf('store_') !== 0) return { valid: false, reason: 'invalid_format' };
        if (!ensureFirebaseInitialized()) return { valid: false, reason: 'no_firebase' };
        if (!navigator.onLine) return { valid: false, reason: 'offline' };

        try {
            const storeRef = firebase.database().ref('stores/' + storeId);
            const snapshot = await storeRef.once('value');

            if (!snapshot.exists()) {
                return { valid: false, reason: 'not_found' };
            }

            const data = snapshot.val();

            if (!data.products && !data.sales && !data.companyData) {
                return { valid: false, reason: 'empty_store' };
            }

            return { valid: true, data: data, storeId: storeId };
        } catch (e) {
            console.error('❌ خطأ:', e);
            return { valid: false, reason: 'error' };
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: ربط المتجر
    // ═══════════════════════════════════════════════════════════

    function linkToExistingStore(storeId) {
        try {
            if (typeof window.setStoreId === 'function') {
                window.setStoreId(storeId);
            } else {
                localStorage.setItem('mizan_store_id_v18', storeId);
            }

            localStorage.setItem(ACTIVATION_KEY, JSON.stringify({
                code: 'EXISTING_STORE',
                storeId: storeId,
                activatedAt: new Date().toISOString(),
                type: 'existing'
            }));

            if (typeof window.DataStore !== 'undefined' && window.DataStore.clearAll) {
                window.DataStore.clearAll();
            }

            return true;
        } catch (e) {
            console.error('❌ فشل الربط:', e);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: شاشة التفعيل
    // ═══════════════════════════════════════════════════════════

    function showActivationScreen() {
        const loginContainer = document.getElementById('loginContainer');
        const appContent = document.getElementById('appContent');

        // 🔧 إخفاء قوي لكلا الشاشتين
        if (loginContainer) {
            loginContainer.style.display = 'none';
            loginContainer.classList.add('hidden');
        }
        if (appContent) appContent.style.display = 'none';

        // 🔧 علامة على body لمنع app.js من إظهار شاشة الدخول
        document.body.setAttribute('data-activation-screen', 'true');

        let activationScreen = document.getElementById('activationScreen');
        if (!activationScreen) {
            activationScreen = document.createElement('div');
            activationScreen.id = 'activationScreen';
            activationScreen.className = 'login-container';
            activationScreen.style.display = 'flex';

            activationScreen.innerHTML = `
                <div class="login-box">
                    <div class="logo">🔐</div>
                    <h1>تفعيل التطبيق</h1>
                    <p class="subtitle">ادخل كود التفعيل الخاص بك</p>

                    <div class="form-group">
                        <label>🔑 كود التفعيل</label>
                        <input type="text" id="activationCode"
                               placeholder="MIZAN-2026-XXXX"
                               style="text-align:center;font-family:Courier New,monospace;direction:ltr;font-size:15px;letter-spacing:2px;"
                               autocomplete="off" />
                    </div>

                    <button class="btn btn-primary btn-block" id="activateBtn">
                        ✅ تفعيل
                    </button>

                    <div class="error-msg" id="activationError"></div>

                    <div style="margin-top:20px;padding-top:15px;border-top:1px solid #3D3D3D;">
                        <button class="btn btn-info btn-block" id="loginExistingBtn"
                                style="background:linear-gradient(135deg,#4A8AB5,#3A7AA5);color:#fff;">
                            🔄 الدخول لمتجر موجود
                        </button>
                    </div>

                    <div style="margin-top:12px;">
                        <a href="https://wa.me/201158767633?text=مرحباً، أريد شراء الميزان Pro"
                           target="_blank"
                           style="display:block;padding:12px;background:#25D366;color:#fff;text-decoration:none;border-radius:8px;font-weight:800;font-size:13px;text-align:center;">
                            💬 تواصل معنا للشراء
                        </a>
                    </div>

                    <div class="hint" style="margin-top:15px;font-size:11px;color:#5D5D5D;">
                        💡 الكود يبدأ بـ <strong>MIZAN-</strong>
                    </div>
                </div>
            `;

            document.body.appendChild(activationScreen);
        } else {
            activationScreen.style.display = 'flex';
        }

        const input = document.getElementById('activationCode');
        const btn = document.getElementById('activateBtn');
        const loginExistingBtn = document.getElementById('loginExistingBtn');
        const errorEl = document.getElementById('activationError');

        if (btn) btn.onclick = handleActivation;
        if (loginExistingBtn) loginExistingBtn.onclick = showExistingStoreDialog;
        if (input) {
            input.onkeydown = function(e) {
                if (e.key === 'Enter') handleActivation();
            };
            setTimeout(function() { input.focus(); }, 300);
        }
        if (errorEl) errorEl.classList.remove('show');
    }

    // 🔧 دالة لإخفاء شاشة التفعيل عند النجاح
    function hideActivationScreen() {
        const activationScreen = document.getElementById('activationScreen');
        if (activationScreen) {
            activationScreen.style.display = 'none';
        }
        document.body.removeAttribute('data-activation-screen');
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 10: نافذة "الدخول لمتجر موجود"
    // ═══════════════════════════════════════════════════════════

    function showExistingStoreDialog() {
        let overlay = document.getElementById('existingStoreModal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'existingStoreModal';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:10000;padding:15px;box-sizing:border-box;direction:rtl;';

            overlay.innerHTML = `
                <div style="background:#1C1C1C;border-radius:16px;padding:24px 20px;max-width:420px;width:100%;border:2px solid #4A8AB5;box-shadow:0 20px 60px rgba(0,0,0,0.6);max-height:90vh;overflow-y:auto;box-sizing:border-box;">
                    <div style="text-align:center;font-size:48px;margin-bottom:12px;">🏢</div>
                    <h3 style="text-align:center;color:#4A8AB5;font-size:20px;font-weight:900;margin-bottom:8px;">الدخول لمتجر موجود</h3>
                    <p style="text-align:center;color:#A89070;font-size:13px;line-height:1.7;margin-bottom:20px;">ادخل كود المتجر (Store ID) عشان تدخل بياناتك من أي جهاز</p>

                    <div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:14px;border-right:4px solid #E6A830;">
                        <div style="color:#E6A830;font-size:12px;font-weight:800;margin-bottom:4px;">💡 فين ألاقي الكود؟</div>
                        <div style="color:#A89070;font-size:11px;line-height:1.6;">افتح التطبيق على الجهاز الأصلي → الإعدادات → معلومات المتجر → انسخ Store ID</div>
                    </div>

                    <div style="margin-bottom:14px;">
                        <label style="display:block;font-size:12px;font-weight:800;color:#A89070;margin-bottom:6px;">🔑 كود المتجر (Store ID)</label>
                        <input type="text" id="existingStoreIdInput"
                               placeholder="store_XXXXXXXXXXXXX_XXXX"
                               style="width:100%;padding:13px;border-radius:10px;border:2px solid #3D3D3D;background:#0D0D0D;color:#F5E6C8;font-size:13px;box-sizing:border-box;text-align:center;direction:ltr;letter-spacing:1px;font-family:Courier New,monospace;"
                               autocomplete="off" />
                    </div>

                    <div id="existingStoreError" style="display:none;color:#E06060;background:rgba(224,96,96,0.1);border:1px solid #E06060;border-radius:8px;padding:10px;font-size:12px;font-weight:800;text-align:center;margin-bottom:12px;"></div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <button id="closeExistingModal" style="padding:12px;background:#3D3D3D;color:#F5E6C8;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer;">❌ إلغاء</button>
                        <button id="confirmExistingStore" style="padding:12px;background:linear-gradient(135deg,#4A8AB5,#3A7AA5);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer;">✅ دخول</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
        } else {
            overlay.style.display = 'flex';
        }

        const errorBox = document.getElementById('existingStoreError');
        if (errorBox) errorBox.style.display = 'none';

        const input = document.getElementById('existingStoreIdInput');
        const confirmBtn = document.getElementById('confirmExistingStore');
        const closeBtn = document.getElementById('closeExistingModal');

        closeBtn.onclick = function() { overlay.style.display = 'none'; };

        overlay.onclick = function(e) {
            if (e.target === overlay) overlay.style.display = 'none';
        };

        confirmBtn.onclick = handleExistingStoreLogin;

        if (input) {
            input.value = '';
            input.onkeydown = function(e) {
                if (e.key === 'Enter') handleExistingStoreLogin();
            };
            setTimeout(function() { input.focus(); }, 300);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 11: معالجة الدخول لمتجر موجود
    // ═══════════════════════════════════════════════════════════

    async function handleExistingStoreLogin() {
        const input = document.getElementById('existingStoreIdInput');
        const confirmBtn = document.getElementById('confirmExistingStore');

        if (!input || !confirmBtn) return;

        const storeId = input.value.trim();

        if (!storeId) {
            showExistingError('⚠️ أدخل كود المتجر');
            return;
        }

        if (storeId.indexOf('store_') !== 0) {
            showExistingError('⚠️ الكود لازم يبدأ بـ store_');
            return;
        }

        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '⏳ جاري التحقق...';

        const result = await verifyExistingStore(storeId);

        if (!result.valid) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '✅ دخول';

            const reasons = {
                'empty': '⚠️ أدخل كود المتجر',
                'invalid_format': '⚠️ الكود غير صحيح (يبدأ بـ store_)',
                'no_firebase': '⚠️ لا يوجد اتصال بالإنترنت',
                'offline': '⚠️ لا يوجد اتصال بالإنترنت',
                'not_found': '❌ الكود غير موجود',
                'empty_store': '❌ المتجر فاضي',
                'error': '❌ حدث خطأ، حاول مرة أخرى'
            };

            showExistingError(reasons[result.reason] || '❌ الكود غير صحيح');
            return;
        }

        const linked = linkToExistingStore(storeId);

        if (!linked) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '✅ دخول';
            showExistingError('❌ فشل الربط، حاول مرة أخرى');
            return;
        }

        confirmBtn.innerHTML = '✅ تم الدخول';

        if (typeof window.showToast === 'function') {
            window.showToast('✅ جاري تحميل بيانات متجرك...', 'success');
        }

        // 🔧 أخفِ شاشة التفعيل قبل إعادة التحميل
        hideActivationScreen();
        setTimeout(function() { location.reload(); }, 1200);
    }

    function showExistingError(message) {
        const errorBox = document.getElementById('existingStoreError');
        if (errorBox) {
            errorBox.textContent = message;
            errorBox.style.display = 'block';
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 12: معالجة التفعيل بكود
    // ═══════════════════════════════════════════════════════════

    async function handleActivation() {
        const input = document.getElementById('activationCode');
        const btn = document.getElementById('activateBtn');

        if (!input || !btn) return;

        const code = input.value.trim().toUpperCase();

        if (!code) {
            showError('⚠️ أدخل كود التفعيل');
            return;
        }

        if (code.indexOf('MIZAN-') !== 0) {
            showError('⚠️ الكود لازم يبدأ بـ MIZAN-');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '⏳ جاري التحقق...';

        const result = await verifyCodeSmart(code);

        if (!result.valid) {
            btn.disabled = false;
            btn.innerHTML = '✅ تفعيل';

            const reasons = {
                'not_found': '❌ الكود غير صحيح',
                'used_by_another_store': '❌ الكود مستخدم من متجر آخر',
                'deactivated': '❌ الكود موقوف',
                'no_firebase': '⚠️ لا يوجد اتصال بالإنترنت',
                'offline_no_cache': '⚠️ لا يوجد اتصال',
                'error': '❌ حدث خطأ، حاول مرة أخرى'
            };

            showError(reasons[result.reason] || '❌ الكود غير صحيح');
            return;
        }

        // 🔧 التحقق من نجاح التسجيل — لكن لا نمنع التفعيل لو فشل (offline)
        if (!result.fromCache) {
            const registered = await registerCodeUsage(code);
            if (!registered) {
                console.warn('⚠️ فشل تسجيل الاستخدام سحابياً — سيتم الحفظ محلياً');
            }
        }

        saveActivation(code);

        btn.disabled = false;
        btn.innerHTML = '✅ تم التفعيل';

        if (typeof window.showToast === 'function') {
            window.showToast('✅ تم تفعيل التطبيق بنجاح', 'success');
        }

        // 🔧 أخفِ شاشة التفعيل وأبلغ النظام
        hideActivationScreen();
        window.__activationPassed = true;
        if (window.EventBus) window.EventBus.emit('activation:passed');

        setTimeout(function() {
            const finalCode = input.value.trim().toUpperCase();
            window.location.href = 'thanks.html?code=' + encodeURIComponent(finalCode);
        }, 1200);
    }

    function showError(message) {
        const errorEl = document.getElementById('activationError');
        if (!errorEl) return;

        errorEl.textContent = message;
        errorEl.classList.add('show');

        setTimeout(function() {
            errorEl.classList.remove('show');
        }, 4000);
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 13: فحص التفعيل عند البدء (مُعاد هيكلته)
    // ═══════════════════════════════════════════════════════════

    function checkActivation() {
        // 🔧 حالة 1: التطبيق مفعّل مسبقاً
        if (isActivated()) {
            console.log('✅ التطبيق مفعّل');
            hideActivationScreen();
            window.__activationPassed = true;
            window.__activationChecked = true;
            if (window.EventBus) window.EventBus.emit('activation:passed');
            return true;
        }

        // 🔧 حالة 2: تحقق من وجود كود معلّق من thanks.html
        try {
            const pendingCode = localStorage.getItem('mizan_pending_activation');
            if (pendingCode && pendingCode.indexOf('MIZAN-') === 0) {
                console.log('🔐 كود معلّق من thanks.html — تطبيقه تلقائياً:', pendingCode);
                saveActivation(pendingCode);
                localStorage.removeItem('mizan_pending_activation');
                hideActivationScreen();
                window.__activationPassed = true;
                window.__activationChecked = true;
                if (window.EventBus) window.EventBus.emit('activation:passed');
                return true;
            }
        } catch (e) {}

        // 🔧 حالة 3: التطبيق غير مفعّل
        console.log('🔐 عرض شاشة التفعيل');
        window.__activationPassed = false;
        window.__activationChecked = true;
        showActivationScreen();
        if (window.EventBus) window.EventBus.emit('activation:failed');
        return false;
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 14: مراقبة الاتصال
    // ═══════════════════════════════════════════════════════════

    window.addEventListener('online', function() {
        if (typeof window.showToast === 'function') {
            window.showToast('🟢 عاد الاتصال', 'success');
        }
    });

    window.addEventListener('offline', function() {
        if (typeof window.showToast === 'function') {
            window.showToast('🔴 انقطع الاتصال', 'warning');
        }
    });

    // ═══════════════════════════════════════════════════════════
    // الجزء 15: APIs عامة
    // ═══════════════════════════════════════════════════════════

    window.Activation = {
        isActivated: isActivated,
        getCode: function() {
            try {
                const data = JSON.parse(localStorage.getItem(ACTIVATION_KEY) || '{}');
                return data.code || '';
            } catch (e) {
                return '';
            }
        },
        getStoreId: getCurrentStoreId,
        clear: clearActivation,
        clearAll: function() {
            clearActivation();
            localStorage.removeItem(CACHED_CODES_KEY);
        },
        verify: verifyCodeSmart,
        verifyStore: verifyExistingStore,
        linkStore: linkToExistingStore,
        show: showActivationScreen,
        hide: hideActivationScreen,
        showExisting: showExistingStoreDialog,
        initFirebase: ensureFirebaseInitialized
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 16: التحميل — 🔧 فوري وليس بعد 1500ms
    // ═══════════════════════════════════════════════════════════

    function init() {
        // 🔧 فحص فوري — لا ننتظر
        checkActivation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 🔧 فحص احتياطي بعد 2 ثانية (في حال تغيّر localStorage من تاب آخر)
    setTimeout(function() {
        if (window.__activationPassed === false && isActivated()) {
            console.log('🔄 التفعيل تم من تاب آخر — إعادة التحميل');
            location.reload();
        }
    }, 2000);

    window.__activationLoaded = true;
    console.log('✅ activation.js v6.0 جاهز');

})();
