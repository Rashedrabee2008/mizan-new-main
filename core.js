// ============================================================
// الميزان 17.0 - core.js
// الأساسيات: أدوات + أمان + جلسات
// يدمج: fixes.js + crypto.js + session.js + security.js + 2fa.js + console-cleaner.js
// ============================================================

(function() {
    'use strict';
    
    console.log('🚀 تحميل core.js v17.0');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الأدوات الأساسية (من fixes.js)
    // ═══════════════════════════════════════════════════════════
    
    // اختصار getElementById
    if (typeof window.$ !== 'function') {
        window.$ = function(id) { return document.getElementById(id); };
    }

    // التاريخ الحالي
    if (typeof window.getTodayDate !== 'function') {
        window.getTodayDate = function() { 
            return new Date().toISOString().split('T')[0]; 
        };
    }

    // الوقت الحالي بصيغة عربية
    if (typeof window.getNowTime !== 'function') {
        window.getNowTime = function() { 
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'م' : 'ص';
            hours = hours % 12 || 12;
            return hours + ':' + minutes + ' ' + ampm;
        };
    }

    // تنسيق المبالغ
    if (typeof window.formatMoney !== 'function') {
        window.formatMoney = function(n) { 
            const num = parseFloat(n);
            if (!isFinite(num) || isNaN(num)) return '0.00';
            return num.toFixed(2); 
        };
    }

    // تحويل الكائنات لمصفوفات
    if (typeof window.toArray !== 'function') {
        window.toArray = function(data) {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            return Object.values(data).filter(function(item) { 
                return item !== null && item !== undefined; 
            });
        };
    }

    // قراءة من localStorage
    if (typeof window.getData !== 'function') {
        window.getData = function(key, def) {
            if (def === undefined) def = [];
            try {
                const d = localStorage.getItem('mizan_' + key);
                return d ? JSON.parse(d) : def;
            } catch (e) { return def; }
        };
    }

    // كتابة في localStorage
    if (typeof window.setData !== 'function') {
        window.setData = function(key, data) {
            try { 
                localStorage.setItem('mizan_' + key, JSON.stringify(data)); 
                return true;
            } catch (e) {
                console.error('❌ خطأ في حفظ ' + key + ':', e.message);
                return false;
            }
        };
    }

    // قراءة radio button
    if (typeof window.getRadioValue !== 'function') {
        window.getRadioValue = function(name, defaultValue) {
            defaultValue = defaultValue || '';
            const el = document.querySelector('input[name="' + name + '"]:checked');
            return el ? el.value : defaultValue;
        };
    }

    // تعيين radio button
    if (typeof window.setRadioValue !== 'function') {
        window.setRadioValue = function(name, value) {
            const el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
            if (el) el.checked = true;
        };
    }

    // أسماء طرق الدفع
    if (typeof window.getPaymentMethodLabel !== 'function') {
        window.getPaymentMethodLabel = function(method) {
            const labels = {
                'cash': '💵 نقدي', 
                'credit': '📝 آجل', 
                'wallet': '📱 موبايل',
                'visa': '💳 فيزا', 
                'bank': '🏦 تحويل', 
                'installment': '📅 تقسيط'
            };
            return labels[method] || method;
        };
    }

    // الرسائل المنبثقة
    if (typeof window.showToast !== 'function') {
        window.showToast = function(msg, type) {
            type = type || 'info';
            const t = document.getElementById('toast');
            if (!t) { 
                console.log('[' + type + '] ' + msg); 
                return; 
            }
            t.textContent = msg;
            t.className = 'toast show ' + type;
            clearTimeout(t._t);
            t._t = setTimeout(function() { t.className = 'toast'; }, 3000);
        };
    }

    // النوافذ المنبثقة
    if (typeof window.openModal !== 'function') {
        window.openModal = function(html) {
            const overlay = document.getElementById('modalOverlay');
            if (!overlay) return;
            let box = overlay.querySelector('.modal-box');
            if (!box) {
                box = document.createElement('div');
                box.className = 'modal-box';
                overlay.appendChild(box);
            }
            box.innerHTML = html;
            overlay.classList.add('show');
            overlay.onclick = function(e) { 
                if (e.target === overlay) window.closeModal(); 
            };
        };
    }

    if (typeof window.closeModal !== 'function') {
        window.closeModal = function() {
            const overlay = document.getElementById('modalOverlay');
            if (overlay) overlay.classList.remove('show');
        };
    }

    // تنفيذ دالة لو موجودة
    window.callIfExists = function(fnName, arg1, arg2) {
        if (typeof window[fnName] === 'function') {
            try {
                if (arg2 !== undefined) return window[fnName](arg1, arg2);
                if (arg1 !== undefined) return window[fnName](arg1);
                return window[fnName]();
            } catch (e) {
                console.error('❌ خطأ في ' + fnName + ':', e.message);
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: التشفير (من crypto.js - مبسّط)
    // ═══════════════════════════════════════════════════════════
    
    const CRYPTO_CONFIG = {
        SALT_LENGTH: 16,
        ITERATIONS: 50000,  // مبسّط من 100000
        KEY_LENGTH: 32
    };

    // توليد Salt عشوائي
    window.generateSalt = function() {
        try {
            const array = new Uint8Array(CRYPTO_CONFIG.SALT_LENGTH);
            crypto.getRandomValues(array);
            return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // بديل لو crypto غير متاح
            let salt = '';
            for (let i = 0; i < 32; i++) {
                salt += Math.floor(Math.random() * 16).toString(16);
            }
            return salt;
        }
    };

    // تشفير كلمة المرور
    window.hashPasswordPBKDF2 = async function(password, salt) {
        if (!password) return '';
        if (!salt) salt = window.generateSalt();

        try {
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            const saltBuffer = encoder.encode(salt);

            const baseKey = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                { name: 'PBKDF2' },
                false,
                ['deriveBits']
            );

            const derivedBits = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: CRYPTO_CONFIG.ITERATIONS,
                    hash: 'SHA-256'
                },
                baseKey,
                CRYPTO_CONFIG.KEY_LENGTH * 8
            );

            const hashArray = Array.from(new Uint8Array(derivedBits));
            const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            return 'pbkdf2_' + CRYPTO_CONFIG.ITERATIONS + '_' + salt + '_' + hash;

        } catch (e) {
            console.error('❌ خطأ تشفير:', e);
            return '';
        }
    };

    // التحقق من كلمة المرور
    window.verifyPasswordPBKDF2 = async function(password, storedHash) {
        if (!password || !storedHash) return false;

        try {
            const parts = storedHash.split('_');
            if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
                return false;
            }

            const iterations = parseInt(parts[1]);
            const salt = parts[2];
            const originalHash = parts[3];

            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            const saltBuffer = encoder.encode(salt);

            const baseKey = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                { name: 'PBKDF2' },
                false,
                ['deriveBits']
            );

            const derivedBits = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: iterations,
                    hash: 'SHA-256'
                },
                baseKey,
                CRYPTO_CONFIG.KEY_LENGTH * 8
            );

            const hashArray = Array.from(new Uint8Array(derivedBits));
            const newHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            return newHash === originalHash;

        } catch (e) {
            console.error('❌ خطأ تحقق:', e);
            return false;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: إدارة الجلسات (من session.js - مبسّط)
    // ═══════════════════════════════════════════════════════════
    
    const SESSION_KEY = 'mizan_session';
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 دقيقة

    window.saveSession = function(user) {
        const session = {
            userId: user.id,
            userName: user.name,
            role: user.role,
            createdAt: Date.now(),
            expiresAt: Date.now() + SESSION_TIMEOUT
        };
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return true;
        } catch (e) {
            return false;
        }
    };

    window.getSession = function() {
        try {
            const data = localStorage.getItem(SESSION_KEY);
            if (!data) return null;

            const session = JSON.parse(data);

            if (session.expiresAt < Date.now()) {
                window.clearSession();
                return null;
            }

            return session;
        } catch (e) {
            return null;
        }
    };

    window.clearSession = function() {
        try {
            localStorage.removeItem(SESSION_KEY);
        } catch (e) {}
    };

    window.refreshSession = function() {
        const session = window.getSession();
        if (!session) return false;

        session.expiresAt = Date.now() + SESSION_TIMEOUT;
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return true;
        } catch (e) {
            return false;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: Rate Limiting (من security.js)
    // ═══════════════════════════════════════════════════════════
    
    const SECURITY_CONFIG = {
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_TIME: 15 * 60 * 1000
    };

    window.getLoginAttempts = function() {
        try {
            const data = localStorage.getItem('mizan_login_attempts');
            if (!data) return { count: 0, lastAttempt: 0, lockedUntil: 0 };
            return JSON.parse(data);
        } catch (e) {
            return { count: 0, lastAttempt: 0, lockedUntil: 0 };
        }
    };

    window.recordFailedLogin = function() {
        const attempts = window.getLoginAttempts();
        attempts.count = (attempts.count || 0) + 1;
        attempts.lastAttempt = Date.now();
        
        if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
            attempts.lockedUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_TIME;
            console.warn('🚫 تم قفل الحساب مؤقتاً');
        }
        
        try {
            localStorage.setItem('mizan_login_attempts', JSON.stringify(attempts));
        } catch (e) {}
    };

    window.recordSuccessfulLogin = function() {
        try {
            localStorage.setItem('mizan_login_attempts', JSON.stringify({
                count: 0, lastAttempt: Date.now(), lockedUntil: 0
            }));
        } catch (e) {}
    };

    window.isAccountLocked = function() {
        const attempts = window.getLoginAttempts();
        if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
            const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
            return { locked: true, remaining: remaining };
        }
        return { locked: false };
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: التحقق الثنائي (من 2fa.js - مبسّط)
    // ═══════════════════════════════════════════════════════════
    
    const TWOFA_KEY = 'mizan_2fa';
    const OTP_VALIDITY = 5 * 60 * 1000; // 5 دقائق

    window.generateOTP = function() {
        try {
            const array = new Uint32Array(1);
            crypto.getRandomValues(array);
            return String(array[0] % 1000000).padStart(6, '0');
        } catch (e) {
            return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        }
    };

    window.sendOTP = function(user) {
        const otp = window.generateOTP();
        const expiresAt = Date.now() + OTP_VALIDITY;

        try {
            sessionStorage.setItem(TWOFA_KEY, JSON.stringify({
                code: otp,
                userId: user.id,
                userName: user.name,
                expiresAt: expiresAt,
                attempts: 0,
                maxAttempts: 3
            }));
        } catch (e) {}

        if (typeof window.showToast === 'function') {
            window.showToast('📱 الرمز: ' + otp, 'info');
        }

        return otp;
    };

    window.verifyOTP = function(inputCode) {
        try {
            const data = sessionStorage.getItem(TWOFA_KEY);
            if (!data) return { valid: false, reason: 'NO_OTP' };

            const otpData = JSON.parse(data);

            if (otpData.expiresAt < Date.now()) {
                sessionStorage.removeItem(TWOFA_KEY);
                return { valid: false, reason: 'EXPIRED' };
            }

            if (otpData.attempts >= otpData.maxAttempts) {
                sessionStorage.removeItem(TWOFA_KEY);
                return { valid: false, reason: 'MAX_ATTEMPTS' };
            }

            otpData.attempts++;
            sessionStorage.setItem(TWOFA_KEY, JSON.stringify(otpData));

            if (inputCode === otpData.code) {
                sessionStorage.removeItem(TWOFA_KEY);
                return { valid: true };
            }

            return { valid: false, reason: 'WRONG_CODE' };

        } catch (e) {
            return { valid: false, reason: 'ERROR' };
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: سجل الأحداث الأمنية (من security.js)
    // ═══════════════════════════════════════════════════════════
    
    window.logSecurityEvent = function(event, data) {
        try {
            let logs = JSON.parse(localStorage.getItem('mizan_security_logs') || '[]');
            logs.push({
                event: event,
                data: data,
                timestamp: new Date().toISOString()
            });
            if (logs.length > 100) logs = logs.slice(-100);
            localStorage.setItem('mizan_security_logs', JSON.stringify(logs));
        } catch (e) {}
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: Default Currencies (للـ ERP)
    // ═══════════════════════════════════════════════════════════
    
    if (typeof window.DEFAULT_CURRENCIES === 'undefined') {
        window.DEFAULT_CURRENCIES = [
            { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', rate: 1, isDefault: true },
            { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 50.00, isDefault: false },
            { code: 'EUR', name: 'يورو', symbol: '€', rate: 54.00, isDefault: false },
            { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 13.33, isDefault: false },
            { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 13.60, isDefault: false }
        ];
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: Console Cleaner (مبسّط - اختياري)
    // ═══════════════════════════════════════════════════════════
    
    const BLOCKED_KEYWORDS = [
        'manifest',
        'favicon',
        'apple-touch-icon',
        'failed to load resource',
        'net::err',
        'devtools',
        'sockjs',
        'websocket'
    ];

    let filterEnabled = localStorage.getItem('mizan_console_filter') !== 'off';

    const originalLog = console.log.bind(console);
    const originalWarn = console.warn.bind(console);
    const originalError = console.error.bind(console);

    function shouldFilter(msg) {
        const str = String(msg).toLowerCase();
        return BLOCKED_KEYWORDS.some(function(k) {
            return str.indexOf(k.toLowerCase()) > -1;
        });
    }

    console.log = function() {
        if (!filterEnabled) return originalLog.apply(console, arguments);
        const msg = Array.from(arguments).join(' ');
        if (!shouldFilter(msg)) originalLog.apply(console, arguments);
    };

    console.warn = function() {
        if (!filterEnabled) return originalWarn.apply(console, arguments);
        const msg = Array.from(arguments).join(' ');
        if (!shouldFilter(msg)) originalWarn.apply(console, arguments);
    };

    console.error = function() {
        if (!filterEnabled) return originalError.apply(console, arguments);
        const msg = Array.from(arguments).join(' ');
        if (shouldFilter(msg)) return;
        originalError.apply(console, arguments);
    };

    window.toggleConsoleFilter = function() {
        filterEnabled = !filterEnabled;
        localStorage.setItem('mizan_console_filter', filterEnabled ? 'on' : 'off');
        if (typeof window.showToast === 'function') {
            window.showToast(filterEnabled ? '🧹 تم تفعيل الفلتر' : '🔊 تم إيقاف الفلتر', 'success');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // تسجيل الجاهزية
    // ═══════════════════════════════════════════════════════════
    
    originalLog.call(console, '✅ core.js v17.0 جاهز — كل الأساسيات محمّلة');
    
    // علم إن الملف محمّل
    window.__coreLoaded = true;

})();
