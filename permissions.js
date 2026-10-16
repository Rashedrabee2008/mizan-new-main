// ============================================================
// الميزان Pro - permissions.js v2.0 (مُصلَّح)
// نظام الصلاحيات - متكامل مع core.js
// ============================================================

(function() {
    'use strict';

    console.log('🔐 permissions.js v2.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: تعريف الأدوار والصلاحيات
    // ═══════════════════════════════════════════════════════════

    window.PERMISSIONS = {
        admin: {
            name: 'مدير',
            icon: '👑',
            color: '#E06060',
            pages: 'all',
            canManageUsers: true,
            canDelete: true,
            canEdit: true,
            canAdd: true,
            canViewReports: true,
            canViewAccounts: true,
            canChangeSettings: true,
            canManageCompany: true,
            canManageWarehouses: true,
            canManageHR: true,
            canDeleteData: true,
            canViewAllData: true
        },
        manager: {
            name: 'مشرف',
            icon: '📊',
            color: '#C9A94E',
            pages: [
                'dashboard', 'inventory', 'cashier', 'purchases',
                'customers', 'suppliers', 'cash-boxes', 'expenses',
                'treasury', 'invoices', 'payments', 'returns',
                'accounts', 'erp', 'warehouses', 'reports',
                'employees', 'company'
            ],
            canManageUsers: false,
            canDelete: true,
            canEdit: true,
            canAdd: true,
            canViewReports: true,
            canViewAccounts: true,
            canChangeSettings: false,
            canManageCompany: false,
            canManageWarehouses: true,
            canManageHR: true,
            canDeleteData: false,
            canViewAllData: true
        },
        cashier: {
            name: 'كاشير',
            icon: '💰',
            color: '#4A8AB5',
            pages: ['dashboard', 'inventory', 'cashier', 'invoices', 'customers'],
            canManageUsers: false,
            canDelete: false,
            canEdit: false,
            canAdd: true,
            canViewReports: false,
            canViewAccounts: false,
            canChangeSettings: false,
            canManageCompany: false,
            canManageWarehouses: false,
            canManageHR: false,
            canDeleteData: false,
            canViewAllData: false
        },
        seller: {
            name: 'بائع',
            icon: '🛒',
            color: '#E6A830',
            pages: ['dashboard', 'cashier'],
            canManageUsers: false,
            canDelete: false,
            canEdit: false,
            canAdd: true,
            canViewReports: false,
            canViewAccounts: false,
            canChangeSettings: false,
            canManageCompany: false,
            canManageWarehouses: false,
            canManageHR: false,
            canDeleteData: false,
            canViewAllData: false
        },
        viewer: {
            name: 'مشاهد',
            icon: '👁️',
            color: '#5D5D5D',
            pages: ['dashboard', 'inventory', 'reports', 'invoices'],
            canManageUsers: false,
            canDelete: false,
            canEdit: false,
            canAdd: false,
            canViewReports: true,
            canViewAccounts: false,
            canChangeSettings: false,
            canManageCompany: false,
            canManageWarehouses: false,
            canManageHR: false,
            canDeleteData: false,
            canViewAllData: false
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: دوال مساعدة (لا تكرر core.js)
    // ═══════════════════════════════════════════════════════════

    function getCurrentRole() {
        if (!window.currentUser) return null;
        return window.currentUser.role || 'viewer';
    }

    function getPermissions() {
        const role = getCurrentRole();
        if (!role) return null;
        return window.PERMISSIONS[role] || window.PERMISSIONS.viewer;
    }

    // ⚡ canAccessPage — الدالة الوحيدة الفريدة هنا
    window.canAccessPage = function(pageName) {
        const perms = getPermissions();
        if (!perms) return false;
        if (perms.pages === 'all') return true;
        if (!Array.isArray(perms.pages)) return false;
        return perms.pages.indexOf(pageName) > -1;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: تطبيق الصلاحيات على الواجهة
    // ═══════════════════════════════════════════════════════════

    window.applyPagePermissions = function() {
        if (!window.currentUser) return;

        const perms = getPermissions();
        if (!perms) return;

        // إخفاء عناصر التنقل السفلي
        document.querySelectorAll('.nav-item').forEach(function(item) {
            const page = item.dataset.page;
            if (!page || page === 'more') return;

            item.style.display = window.canAccessPage(page) ? '' : 'none';
        });

        // إخفاء أزرار قائمة "المزيد"
        document.querySelectorAll('#moreMenu .more-item').forEach(function(item) {
            const onclick = item.getAttribute('onclick') || '';
            const match = onclick.match(/navigateTo\('([^']+)'\)/);

            if (match) {
                item.style.display = window.canAccessPage(match[1]) ? '' : 'none';
            } else if (onclick.indexOf('index.html') > -1) {
                item.style.display = '';
            }
        });

        // إخفاء أزرار الصلاحيات الخاصة
        const hiddenButtons = [
            { check: 'canManageUsers', selector: '[onclick*="navigateTo(\'users\')"]' },
            { check: 'canChangeSettings', selector: '[onclick*="navigateTo(\'settings\')"]' },
            { check: 'canManageCompany', selector: '[onclick*="navigateTo(\'company\')"]' },
            { check: 'canManageHR', selector: '[onclick*="navigateTo(\'employees\')"]' },
            { check: 'canViewAccounts', selector: '[onclick*="navigateTo(\'accounts\')"]' }
        ];

        hiddenButtons.forEach(function(item) {
            const allowed = perms[item.check] === true;
            document.querySelectorAll(item.selector).forEach(function(el) {
                el.style.display = allowed ? '' : 'none';
            });
        });

        // منع الحذف
        if (perms.canDelete !== true) {
            document.body.classList.add('no-delete-permission');
        } else {
            document.body.classList.remove('no-delete-permission');
        }

        console.log('✅ تم تطبيق الصلاحيات');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: عرض معلومات الدور
    // ═══════════════════════════════════════════════════════════

    window.showRoleInfo = function() {
        if (!window.currentUser) return;

        const role = getCurrentRole();
        const perms = getPermissions();
        const roleData = window.PERMISSIONS[role] || {};

        let pagesList = '';
        if (perms.pages === 'all') {
            pagesList = 'كل صفحات التطبيق';
        } else if (Array.isArray(perms.pages)) {
            const pageNames = {
                'dashboard': 'الرئيسية', 'inventory': 'المخزون', 'cashier': 'الكاشير',
                'purchases': 'المشتريات', 'customers': 'العملاء', 'suppliers': 'الموردين',
                'cash-boxes': 'الخزائن', 'expenses': 'المصروفات', 'treasury': 'حركة الخزنة',
                'invoices': 'الفواتير', 'payments': 'التحصيل/السداد', 'returns': 'المرتجعات',
                'accounts': 'الحسابات', 'erp': 'الموارد', 'warehouses': 'المخازن',
                'reports': 'التقارير', 'employees': 'الموظفين', 'company': 'بيانات الشركة',
                'users': 'المستخدمين', 'settings': 'الإعدادات'
            };
            pagesList = perms.pages.map(function(p) {
                return '• ' + (pageNames[p] || p);
            }).join('<br>');
        }

        const permissionsList = [
            { name: '➕ الإضافة', value: perms.canAdd },
            { name: '✏️ التعديل', value: perms.canEdit },
            { name: '🗑️ الحذف', value: perms.canDelete },
            { name: '👥 إدارة المستخدمين', value: perms.canManageUsers },
            { name: '📊 التقارير', value: perms.canViewReports },
            { name: '📚 الحسابات', value: perms.canViewAccounts },
            { name: '⚙️ الإعدادات', value: perms.canChangeSettings },
            { name: '🏢 بيانات الشركة', value: perms.canManageCompany },
            { name: '🏭 المخازن', value: perms.canManageWarehouses },
            { name: '👔 الموظفين', value: perms.canManageHR }
        ];

        const permissionsHtml = permissionsList.map(function(p) {
            return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#A89070;font-size:13px;">' + p.name + '</span>' +
                '<span style="color:' + (p.value ? '#2D8F5E' : '#E06060') + ';font-weight:900;font-size:14px;">' +
                    (p.value ? '✅' : '❌') +
                '</span>' +
            '</div>';
        }).join('');

        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🔐 صلاحياتك</h3>' +
            '<div style="background:linear-gradient(135deg,' + roleData.color + ',' + roleData.color + 'CC);border-radius:12px;padding:20px;text-align:center;color:#0D0D0D;margin-bottom:16px;">' +
                '<div style="font-size:48px;margin-bottom:8px;">' + roleData.icon + '</div>' +
                '<div style="font-size:20px;font-weight:900;">' + (window.currentUser.name || '') + '</div>' +
                '<div style="font-size:14px;margin-top:4px;font-weight:700;">' + roleData.name + '</div>' +
            '</div>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:14px;">' +
                '<div style="color:#C9A94E;font-weight:900;font-size:14px;margin-bottom:10px;">📄 الصفحات المتاحة</div>' +
                '<div style="color:#A89070;font-size:12px;line-height:2;">' + pagesList + '</div>' +
            '</div>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">' +
                '<div style="color:#C9A94E;font-weight:900;font-size:14px;margin-bottom:10px;">✅ الأذونات</div>' +
                permissionsHtml +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:14px;">إغلاق</button>';

        window.openModal(html);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: hook على navigateTo
    // ═══════════════════════════════════════════════════════════

    function hookNavigateTo() {
        if (typeof window.navigateTo !== 'function') {
            setTimeout(hookNavigateTo, 300);
            return;
        }

        // منع الـ hook المزدوج
        if (window.navigateTo.__permissionHooked) return;

        const originalNavigate = window.navigateTo;

        const newNavigate = function(page) {
            if (window.currentUser && !window.canAccessPage(page)) {
                if (typeof window.showToast === 'function') {
                    window.showToast('🚫 ليس لديك صلاحية الوصول لهذه الصفحة', 'error');
                }
                return;
            }

            originalNavigate(page);
            setTimeout(window.applyPagePermissions, 100);
        };

        newNavigate.__permissionHooked = true;
        window.navigateTo = newNavigate;

        console.log('✅ تم ربط فحص الصلاحيات بالتنقل');
    }

    hookNavigateTo();

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: دوال require (تستخدم core.js)
    // ═══════════════════════════════════════════════════════════

    window.requireDelete = function(actionName) {
        if (!window.canDelete()) {
            window.showToast('🚫 ليس لديك صلاحية ' + (actionName || 'الحذف'), 'error');
            return false;
        }
        return true;
    };

    window.requireEdit = function(actionName) {
        if (!window.canEdit()) {
            window.showToast('🚫 ليس لديك صلاحية ' + (actionName || 'التعديل'), 'error');
            return false;
        }
        return true;
    };

    window.requireAdd = function(actionName) {
        if (!window.canAdd()) {
            window.showToast('🚫 ليس لديك صلاحية ' + (actionName || 'الإضافة'), 'error');
            return false;
        }
        return true;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: التهيئة بعد الدخول
    // ═══════════════════════════════════════════════════════════

    window.initPermissionsAfterLogin = function() {
        if (!window.currentUser) return;

        console.log('🔐 تطبيق صلاحيات:', window.currentUser.name, '(' + window.currentUser.role + ')');

        setTimeout(window.applyPagePermissions, 500);
        setTimeout(window.applyPagePermissions, 1500);
        setTimeout(window.applyPagePermissions, 3000);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    if (window.EventBus) {
        window.EventBus.on('data:users:changed', function() {
            if (window.currentUser) {
                const updated = (window.users || []).find(function(u) {
                    return u.id == window.currentUser.id;
                });
                if (updated) {
                    window.currentUser = updated;
                    if (typeof window.updateUserUI === 'function') window.updateUserUI();
                    window.applyPagePermissions();
                }
            }
        });

        window.EventBus.on('app:ready', function() {
            window.initPermissionsAfterLogin();
        });
    }

    window.__permissionsLoaded = true;
    console.log('✅ permissions.js v2.0 جاهز');

})();
