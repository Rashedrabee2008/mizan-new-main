// ============================================================
// الميزان Pro - core.js v19.0 (مُصلَّح)
// ============================================================

(function() {
    'use strict';

    console.log('🚀 core.js v19.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: EventBus
    // ═══════════════════════════════════════════════════════════

    const _listeners = {};

    window.EventBus = {
        on: function(event, callback) {
            if (typeof callback !== 'function') return;
            if (!_listeners[event]) _listeners[event] = [];
            _listeners[event].push(callback);
            return function unsubscribe() {
                window.EventBus.off(event, callback);
            };
        },

        off: function(event, callback) {
            if (!_listeners[event]) return;
            _listeners[event] = _listeners[event].filter(function(cb) {
                return cb !== callback;
            });
        },

        emit: function(event, data) {
            if (!_listeners[event]) return;
            _listeners[event].forEach(function(cb) {
                try { cb(data); } catch (e) {
                    console.error('❌ خطأ في listener لـ ' + event + ':', e.message);
                }
            });
        },

        once: function(event, callback) {
            const wrapper = function(data) {
                window.EventBus.off(event, wrapper);
                callback(data);
            };
            window.EventBus.on(event, wrapper);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: الأدوات الأساسية
    // ═══════════════════════════════════════════════════════════

    window.$ = function(id) { return document.getElementById(id); };
    window.$$ = function(selector) { return Array.from(document.querySelectorAll(selector)); };

    window.getTodayDate = function() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    };

    window.getNowTime = function() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12 || 12;
        return hours + ':' + minutes + ' ' + ampm;
    };

    window.formatMoney = function(n) {
        const num = parseFloat(n);
        if (!isFinite(num) || isNaN(num)) return '0.00';
        return num.toFixed(2);
    };

    window.formatNumber = function(n) {
        const num = parseFloat(n);
        if (!isFinite(num) || isNaN(num)) return '0';
        return num.toLocaleString('ar-EG');
    };

    window.toArray = function(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object') {
            return Object.keys(data).map(function(k) {
                const item = data[k];
                if (item && typeof item === 'object') {
                    if (!item.id) item.id = k;
                    return item;
                }
                return null;
            }).filter(function(item) { return item !== null; });
        }
        return [];
    };

    window.getRadioValue = function(name, defaultValue) {
        const el = document.querySelector('input[name="' + name + '"]:checked');
        return el ? el.value : (defaultValue || '');
    };

    window.setRadioValue = function(name, value) {
        const el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
        if (el) el.checked = true;
    };

    window.escapeHtml = function(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    window.getPaymentMethodLabel = function(method) {
        const labels = {
            'cash': '💵 نقدي', 'credit': '📝 آجل', 'wallet': '📱 موبايل',
            'visa': '💳 فيزا', 'bank': '🏦 تحويل', 'installment': '📅 تقسيط'
        };
        return labels[method] || method;
    };

    window.getPaymentIcon = function(method) {
        const icons = {
            'cash': '💵', 'credit': '📝', 'wallet': '📱',
            'visa': '💳', 'bank': '🏦', 'installment': '📅'
        };
        return icons[method] || '💵';
    };

    window.generateId = function(prefix) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return (prefix || '') + timestamp + '_' + random;
    };

    window.shortId = function(id) {
        if (!id) return '—';
        return '#' + String(id).slice(-6);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: الأدوار والصلاحيات
    // ═══════════════════════════════════════════════════════════

    window.ROLES = {
        admin:   { name: 'مدير',   icon: '👑', color: '#E06060',
                   permissions: ['add', 'edit', 'delete', 'view', 'manage_users',
                                 'settings', 'view_reports', 'clear_data', 'view_accounts',
                                 'manage_warehouses', 'manage_hr', 'approve_discount'] },
        manager: { name: 'مشرف',   icon: '📊', color: '#C9A94E',
                   permissions: ['add', 'edit', 'view', 'view_reports', 'settings',
                                 'view_accounts', 'manage_warehouses', 'manage_hr',
                                 'approve_discount'] },
        cashier: { name: 'كاشير',  icon: '💰', color: '#4A8AB5',
                   permissions: ['add', 'add_sale', 'view'] },
        seller:  { name: 'بائع',   icon: '🛒', color: '#E6A830',
                   permissions: ['add_sale', 'view'] },
        viewer:  { name: 'مشاهد',  icon: '👁️', color: '#5D5D5D',
                   permissions: ['view'] }
    };

    window.hasPermission = function(permission) {
        if (!window.currentUser) return false;
        const role = window.currentUser.role || 'viewer';
        const permissions = (window.ROLES[role] || {}).permissions || [];
        return permissions.indexOf(permission) > -1;
    };

    window.isAdmin = function() {
        return window.currentUser && window.currentUser.role === 'admin';
    };

    window.canAdd = function() {
        return window.hasPermission('add') || window.hasPermission('add_sale');
    };

    window.canEdit = function() { return window.hasPermission('edit'); };
    window.canDelete = function() { return window.hasPermission('delete'); };
    window.canManageUsers = function() { return window.hasPermission('manage_users'); };
    window.canViewAccounts = function() { return window.hasPermission('view_accounts'); };
    window.canViewReports = function() { return window.hasPermission('view_reports'); };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: التشفير
    // ═══════════════════════════════════════════════════════════

    window.generateSalt = function() {
        try {
            const array = new Uint8Array(16);
            crypto.getRandomValues(array);
            return Array.from(array, function(b) {
                return b.toString(16).padStart(2, '0');
            }).join('');
        } catch (e) {
            let salt = '';
            for (let i = 0; i < 32; i++) {
                salt += Math.floor(Math.random() * 16).toString(16);
            }
            return salt;
        }
    };

    window.hashPassword = async function(password, salt) {
        if (!password) return '';
        if (!salt) salt = window.generateSalt();

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(salt + ':' + password + ':mizan');
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hash = hashArray.map(function(b) {
                return b.toString(16).padStart(2, '0');
            }).join('');
            return 'sha256_' + salt + '_' + hash;
        } catch (e) {
            let simple = '';
            const combined = salt + password;
            for (let i = 0; i < combined.length; i++) {
                simple += combined.charCodeAt(i).toString(16);
            }
            return 'simple_' + salt + '_' + simple;
        }
    };

    window.verifyPassword = async function(password, storedHash) {
        if (!password || !storedHash) return false;

        try {
            if (storedHash.indexOf('sha256_') === 0) {
                const parts = storedHash.split('_');
                if (parts.length !== 3) return false;
                const salt = parts[1];
                const newHash = await window.hashPassword(password, salt);
                return newHash === storedHash;
            }

            if (storedHash.indexOf('simple_') === 0) {
                const parts = storedHash.split('_');
                if (parts.length !== 3) return false;
                const salt = parts[1];
                const newHash = await window.hashPassword(password, salt);
                return newHash === storedHash;
            }

            return storedHash === password;
        } catch (e) {
            return false;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: الجلسات
    // ═══════════════════════════════════════════════════════════

    const SESSION_KEY = 'mizan_session_v18';
    const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

    window.saveSession = function(user) {
        const session = {
            userId: user.id,
            userName: user.name,
            role: user.role,
            storeId: user.storeId,
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
        try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
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
    // الجزء 6: Rate Limiting
    // ═══════════════════════════════════════════════════════════

    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_TIME = 15 * 60 * 1000;

    window.getLoginAttempts = function() {
        try {
            const data = localStorage.getItem('mizan_login_attempts_v18');
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

        if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
            attempts.lockedUntil = Date.now() + LOCKOUT_TIME;
        }

        try {
            localStorage.setItem('mizan_login_attempts_v18', JSON.stringify(attempts));
        } catch (e) {}
    };

    window.recordSuccessfulLogin = function() {
        try {
            localStorage.setItem('mizan_login_attempts_v18', JSON.stringify({
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
    // الجزء 7: تنسيقات
    // ═══════════════════════════════════════════════════════════

    window.getArabicDayName = function(dateStr) {
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const d = new Date(dateStr);
        return days[d.getDay()] || '';
    };

    window.getArabicMonthName = function(monthIndex) {
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                       'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return months[monthIndex] || '';
    };

    window.formatDate = function(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return day + '/' + month + '/' + year;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: التحقق
    // ═══════════════════════════════════════════════════════════

    window.isValidEmail = function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    window.isValidPhone = function(phone) {
        const clean = String(phone).replace(/[^0-9]/g, '');
        return clean.length >= 10 && clean.length <= 15;
    };

    window.sanitizeNumber = function(n, defaultValue, min, max) {
        let num = parseFloat(n);
        if (!isFinite(num) || isNaN(num)) num = defaultValue || 0;
        if (min !== undefined && num < min) num = min;
        if (max !== undefined && num > max) num = max;
        return num;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: الثوابت
    // ═══════════════════════════════════════════════════════════

    window.VAT_SETTINGS = { defaultVAT: 14 };

    window.LOYALTY_CONFIG = {
        POINTS_PER_100: 1,
        POINT_VALUE: 0.1,
        MIN_REDEEM_POINTS: 50,
        LEVELS: [
            { name: 'عادي',    min: 0,    icon: '🥉', color: '#A89070', discount: 0 },
            { name: 'فضي',     min: 500,  icon: '🥈', color: '#A8A8A8', discount: 2 },
            { name: 'ذهبي',    min: 2000, icon: '🥇', color: '#C9A94E', discount: 5 },
            { name: 'بلاتيني', min: 5000, icon: '💎', color: '#4A8AB5', discount: 10 }
        ]
    };

    window.WAREHOUSE_TYPES = {
        'main':    { name: 'رئيسي',   icon: '🏭' },
        'branch':  { name: 'فرع',     icon: '🏪' },
        'storage': { name: 'مخزن',    icon: '📦' },
        'returns': { name: 'مرتجعات', icon: '🔄' }
    };

    window.ACCOUNT_TYPES = {
        asset:     { name: 'أصول',        icon: '💎', color: '#2D8F5E' },
        liability: { name: 'التزامات',    icon: '📋', color: '#E06060' },
        equity:    { name: 'حقوق ملكية',  icon: '👑', color: '#C9A94E' },
        revenue:   { name: 'إيرادات',     icon: '💰', color: '#4A8AB5' },
        expense:   { name: 'مصروفات',     icon: '💸', color: '#E6A830' }
    };

    window.DEFAULT_CURRENCIES = [
        { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', rate: 1, isDefault: true },
        { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 50.00, isDefault: false },
        { code: 'EUR', name: 'يورو', symbol: '€', rate: 54.00, isDefault: false },
        { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 13.33, isDefault: false },
        { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 13.60, isDefault: false }
    ];

    // ═══════════════════════════════════════════════════════════
    // الجزء 10: updateUserUI — النسخة الوحيدة
    // ═══════════════════════════════════════════════════════════

    window.updateUserUI = function() {
        if (!window.currentUser) return;

        const roleInfo = window.ROLES[window.currentUser.role] || { icon: '❓', name: 'مستخدم' };

        const el = document.getElementById('currentUserName');
        if (el) {
            el.textContent = roleInfo.icon + ' ' + window.currentUser.name;
        }

        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany && window.companyData && window.companyData.name) {
            headerCompany.textContent = window.companyData.name;
        }

        const roleDisplay = document.getElementById('userRoleDisplay');
        if (roleDisplay) {
            roleDisplay.textContent = roleInfo.icon + ' ' + roleInfo.name;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 11: Console Filter
    // ═══════════════════════════════════════════════════════════

    const BLOCKED_KEYWORDS = [
        'manifest', 'favicon', 'apple-touch-icon',
        'failed to load resource', 'net::err', 'devtools',
        'sockjs', 'websocket'
    ];

    const filterEnabled = localStorage.getItem('mizan_console_filter_v18') !== 'off';
    const originalLog = console.log.bind(console);
    const originalWarn = console.warn.bind(console);
    const originalError = console.error.bind(console);

    function shouldFilter(args) {
        const msg = Array.from(args).join(' ').toLowerCase();
        return BLOCKED_KEYWORDS.some(function(k) {
            return msg.indexOf(k.toLowerCase()) > -1;
        });
    }

    if (filterEnabled) {
        console.log = function() {
            if (!shouldFilter(arguments)) originalLog.apply(console, arguments);
        };
        console.warn = function() {
            if (!shouldFilter(arguments)) originalWarn.apply(console, arguments);
        };
        console.error = function() {
            if (!shouldFilter(arguments)) originalError.apply(console, arguments);
        };
    }

    window.toggleConsoleFilter = function() {
        const current = localStorage.getItem('mizan_console_filter_v18') !== 'off';
        localStorage.setItem('mizan_console_filter_v18', current ? 'off' : 'on');
        location.reload();
    };

    window.__coreLoaded = true;
    originalLog.call(console, '✅ core.js v19.0 جاهز');

})();
