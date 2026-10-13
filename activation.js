// ============================================================
// الميزان Pro - activation.js v2.0
// نظام كود التفعيل (Activation Code) مع دعم Offline
// ============================================================

(function() {
    'use strict';

    console.log('🔐 activation.js v2.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الإعدادات
    // ═══════════════════════════════════════════════════════════

    const ACTIVATION_KEY = 'mizan_activation_v1';
    const CACHED_CODES_KEY = 'mizan_cached_codes';
    const ACTIVATION_PATH = 'activations';

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: التحقق من التفعيل المحلي
    // ═══════════════════════════════════════════════════════════

    function isActivated() {
        try {
            const data = localStorage.getItem(ACTIVATION_KEY);
            if (!data) return false;

            const parsed = JSON.parse(data);
            if (!parsed.code || !parsed.storeId) return false;

            const currentStoreId = getCurrentStoreId();
            if (parsed.storeId !== currentStoreId) return false;

            return true;
        } catch (e) {
            return false;
        }
    }

    function getCurrentStoreId() {
        if (typeof window.getStoreId === 'function') {
            return window.getStoreId();
        }
        return localStorage.getItem('mizan_store_id_v18') || '';
    }

    function saveActivation(code) {
        try {
            const data = {
                code: code,
                storeId: getCurrentStoreId(),
                activatedAt: new Date().toISOString()
            };
            localStorage.setItem(ACTIVATION_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    }

    function clearActivation() {
        try {
            localStorage.removeItem(ACTIVATION_KEY);
        } catch (e) {}
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: التخزين المؤقت للأكواد (Offline Support)
    // ═══════════════════════════════════════════════════════════

    function cacheActivationCode(code, data) {
        try {
            const cachedCodes = JSON.parse(localStorage.getItem(CACHED_CODES_KEY) || '{}');
            cachedCodes[code] = Object.assign({}, data, {
                cachedAt: new Date().toISOString()
            });
            localStorage.setItem(CACHED_CODES_KEY, JSON.stringify(cachedCodes));
            console.log('💾 تم تخزين الكود محلياً:', code);
        } catch (e) {
            console.warn('⚠️ فشل تخزين الكود');
        }
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
    // الجزء 4: التحقق من Firebase
    // ═══════════════════════════════════════════════════════════

    async function verifyCodeWithFirebase(code) {
        if (typeof firebase === 'undefined') {
            return { valid: false, reason: 'no_firebase' };
        }

        try {
            if (!firebase.apps || firebase.apps.length === 0) {
                return { valid: false, reason: 'no_firebase' };
            }

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

            return {
                valid: true,
                data: data
            };

        } catch (e) {
            console.error('❌ خطأ في التحقق:', e);
            return { valid: false, reason: 'error', error: e.message };
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: التحقق الذكي (Firebase + Offline)
    // ═══════════════════════════════════════════════════════════

    async function verifyCodeSmart(code) {
        // 1. لو في نت و Firebase جاهز → استخدم Firebase
        if (navigator.onLine && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            const result = await verifyCodeWithFirebase(code);

            if (result.valid) {
                // خزّن الكود للاستخدام offline
                cacheActivationCode(code, result.data);
            }

            return result;
        }

        // 2. لو مفيش نت → استخدم الكاش
        console.log('📴 وضع Offline — البحث في الكاش');
        const cached = getCachedCode(code);

        if (cached) {
            return { valid: true, data: cached, fromCache: true };
        }

        return { valid: false, reason: 'offline_no_cache' };
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: تسجيل الكود على Firebase
    // ═══════════════════════════════════════════════════════════

    async function registerCodeUsage(code) {
        if (typeof firebase === 'undefined') return false;

        if (!navigator.onLine) {
            console.log('📴 وضع Offline — التسجيل سيتأخر');
            return false;
        }

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
    // الجزء 7: شاشة التفعيل
    // ═══════════════════════════════════════════════════════════

    function showActivationScreen() {
        const loginContainer = document.getElementById('loginContainer');
        const appContent = document.getElementById('appContent');
        if (loginContainer) loginContainer.style.display = 'none';
        if (appContent) appContent.style.display = 'none';

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
                        <p style="font-size:12px;color:#A89070;margin-bottom:10px;">
                            ليس لديك كود تفعيل؟
                        </p>
                        <a href="https://wa.me/201158767633?text=مرحباً، أريد شراء الميزان Pro"
                           target="_blank"
                           style="display:block;padding:12px;background:#25D366;color:#fff;text-decoration:none;border-radius:8px;font-weight:800;font-size:13px;">
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
        const errorEl = document.getElementById('activationError');

        if (btn) {
            btn.onclick = function() {
                handleActivation();
            };
        }

        if (input) {
            input.onkeydown = function(e) {
                if (e.key === 'Enter') {
                    handleActivation();
                }
            };
            setTimeout(function() {
                input.focus();
            }, 300);
        }

        if (errorEl) {
            errorEl.classList.remove('show');
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: معالجة التفعيل
    // ═══════════════════════════════════════════════════════════

    async function handleActivation() {
        const input = document.getElementById('activationCode');
        const btn = document.getElementById('activateBtn');
        const errorEl = document.getElementById('activationError');

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

        // تعطيل الزر
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';

        // ⚡ التحقق الذكي (Firebase أو Cache)
        const result = await verifyCodeSmart(code);

        if (!result.valid) {
            btn.disabled = false;
            btn.innerHTML = '✅ تفعيل';

            const reasons = {
                'not_found': '❌ الكود غير صحيح',
                'used_by_another_store': '❌ الكود مستخدم من متجر آخر',
                'deactivated': '❌ الكود موقوف',
                'no_firebase': '⚠️ لا يوجد اتصال بالإنترنت — يحتاج نت للتفعيل الأول',
                'offline_no_cache': '⚠️ لا يوجد اتصال — ادخل كودك الصحيح عندما يتوفر النت',
                'error': '❌ حدث خطأ، حاول مرة أخرى'
            };

            showError(reasons[result.reason] || '❌ الكود غير صحيح');
            return;
        }

        // ✅ الكود صحيح
        if (!result.fromCache) {
            await registerCodeUsage(code);
        }

        saveActivation(code);

        btn.disabled = false;
        btn.innerHTML = '✅ تم التفعيل';

        if (typeof window.showToast === 'function') {
            const message = result.fromCache
                ? '✅ تم التفعيل (بدون إنترنت)'
                : '✅ تم تفعيل التطبيق بنجاح';
            window.showToast(message, 'success');
        }

        setTimeout(function() {
            const activationScreen = document.getElementById('activationScreen');
            if (activationScreen) {
                activationScreen.style.display = 'none';
            }

            const loginContainer = document.getElementById('loginContainer');
            if (loginContainer) {
                loginContainer.style.display = 'flex';
                loginContainer.classList.remove('hidden');
            }

            if (typeof window.populateLoginUsers === 'function') {
                window.populateLoginUsers();
            }
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
    // الجزء 9: فحص عند بدء التطبيق
    // ═══════════════════════════════════════════════════════════

    function checkActivation() {
        if (isActivated()) {
            console.log('✅ التطبيق مفعّل');
            return true;
        }

        console.log('🔐 التطبيق مش مفعّل — جاري عرض شاشة التفعيل');

        let attempts = 0;
        const maxAttempts = 20;

        const tryShow = function() {
            attempts++;

            if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
                showActivationScreen();
                return;
            }

            if (attempts < maxAttempts) {
                setTimeout(tryShow, 500);
            } else {
                showActivationScreen();
            }
        };

        tryShow();
        return false;
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 10: مراقبة حالة الاتصال
    // ═══════════════════════════════════════════════════════════

    window.addEventListener('online', function() {
        console.log('🟢 عاد الاتصال');
        if (typeof window.showToast === 'function') {
            window.showToast('🟢 عاد الاتصال', 'success');
        }
    });

    window.addEventListener('offline', function() {
        console.log('🔴 انقطع الاتصال');
        if (typeof window.showToast === 'function') {
            window.showToast('🔴 انقطع الاتصال — التطبيق شغال محلياً', 'warning');
        }
    });

    // ═══════════════════════════════════════════════════════════
    // الجزء 11: APIs عامة
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
        clear: function() {
            clearActivation();
        },
        clearAll: function() {
            clearActivation();
            localStorage.removeItem(CACHED_CODES_KEY);
        },
        verify: verifyCodeSmart,
        show: showActivationScreen,
        getCachedCodes: function() {
            try {
                return JSON.parse(localStorage.getItem(CACHED_CODES_KEY) || '{}');
            } catch (e) {
                return {};
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 12: التحميل
    // ═══════════════════════════════════════════════════════════

    function init() {
        setTimeout(function() {
            checkActivation();
        }, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.__activationLoaded = true;
    console.log('✅ activation.js v2.0 جاهز (يدعم Offline)');

})();
