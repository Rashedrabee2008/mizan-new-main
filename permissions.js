// ============================================================
// الميزان Pro - permissions.js v1.0
// نظام الصلاحيات والأذونات
// ============================================================

(function() {
    'use strict';

    console.log('🔐 permissions.js v1.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: تعريف الأدوار والصلاحيات
    // ═══════════════════════════════════════════════════════════

    window.PERMISSIONS = {
        admin: {
            name: 'مدير',
            icon: '👑',
            color: '#E06060',
            pages: 'all', // كل الصفحات
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
            pages: [
                'dashboard', 'inventory', 'cashier', 'invoices', 'customers'
            ],
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
            pages: [
                'dashboard', 'cashier'
            ],
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
            pages: [
                'dashboard', 'inventory', 'reports', 'invoices'
            ],
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
    // الجزء 2: دوال الصلاحيات
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

    // هل عند المستخدم صلاحية معينة؟
    window.hasPermission = function(permission) {
        const perms = getPermissions();
        if (!perms) return false;
        return perms[permission] === true;
    };

    // هل يمكن الوصول للصفحة؟
    window.canAccessPage = function(pageName) {
        const perms = getPermissions();
        if (!perms) return false;
        if (perms.pages === 'all') return true;
        if (!Array.isArray(perms.pages)) return false;
        return perms.pages.indexOf(pageName) > -1;
    };

    // هل المستخدم مدير؟
    window.isAdmin = function() {
        return getCurrentRole() === 'admin';
    };

    // هل يمكن الإضافة؟
    window.canAdd = function() {
        return window.hasPermission('canAdd');
    };

    // هل يمكن التعديل؟
    window.canEdit = function() {
        return window.hasPermission('canEdit');
    };

    // هل يمكن الحذف؟
    window.canDelete = function() {
        return window.hasPermission('canDelete');
    };

    // هل يمكن إدارة المستخدمين؟
    window.canManageUsers = function() {
        return window.hasPermission('canManageUsers');
    };

    // هل يمكن عرض الحسابات؟
    window.canViewAccounts = function() {
        return window.hasPermission('canViewAccounts');
    };

    // هل يمكن تغيير الإعدادات؟
    window.canChangeSettings = function() {
        return window.hasPermission('canChangeSettings');
    };

    // هل يمكن إدارة الشركة؟
    window.canManageCompany = function() {
        return window.hasPermission('canManageCompany');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: إخفاء عناصر الواجهة حسب الصلاحية
    // ═══════════════════════════════════════════════════════════

    window.applyPagePermissions = function() {
        if (!window.currentUser) return;

        const perms = getPermissions();
        if (!perms) return;

        // 1. إخفاء عناصر التنقل السفلي اللي مش مسموح بيها
        document.querySelectorAll('.nav-item').forEach(function(item) {
            const page = item.dataset.page;
            if (!page || page === 'more') return; // "المزيد" يفضل دايماً

            if (!window.canAccessPage(page)) {
                item.style.display = 'none';
            } else {
                item.style.display = '';
            }
        });

        // 2. إخفاء أزرار قائمة "المزيد"
        document.querySelectorAll('#moreMenu .more-item').forEach(function(item) {
            const onclick = item.getAttribute('onclick') || '';
            const match = onclick.match(/navigateTo\('([^']+)'\)/);

            if (match) {
                const page = match[1];
                if (!window.canAccessPage(page)) {
                    item.style.display = 'none';
                } else {
                    item.style.display = '';
                }
            } else if (onclick.indexOf('index.html') > -1) {
                // رابط الصفحة الرئيسية - يظهر دايماً
                item.style.display = '';
            }
        });

        // 3. إخفاء زر "المستخدمين" لو مش مدير
        if (!window.canManageUsers()) {
            document.querySelectorAll('[onclick*="navigateTo(\'users\')"]').forEach(function(el) {
                el.style.display = 'none';
            });
        }

        // 4. إخفاء زر "الإعدادات" لو مش مدير
        if (!window.canChangeSettings()) {
            document.querySelectorAll('[onclick*="navigateTo(\'settings\')"]').forEach(function(el) {
                el.style.display = 'none';
            });
        }

        // 5. إخفاء زر "بيانات الشركة" لو مش مدير
        if (!window.canManageCompany()) {
            document.querySelectorAll('[onclick*="navigateTo(\'company\')"]').forEach(function(el) {
                el.style.display = 'none';
            });
        }

        // 6. إخفاء تبويب "الموظفين" لو مش مسموح
        if (!window.hasPermission('canManageHR')) {
            document.querySelectorAll('[onclick*="navigateTo(\'employees\')"]').forEach(function(el) {
                el.style.display = 'none';
            });
        }

        // 7. إخفاء تبويب "الحسابات" لو مش مسموح
        if (!window.canViewAccounts()) {
            document.querySelectorAll('[onclick*="navigateTo(\'accounts\')"]').forEach(function(el) {
                el.style.display = 'none';
            });
        }

        // 8. إخفاء أزرار الحذف لو مش مسموح
        if (!window.canDelete()) {
            // نخفيها بس مش نشيلها (عشان لو الأدمن اتفتح)
            document.body.classList.add('no-delete-permission');
        } else {
            document.body.classList.remove('no-delete-permission');
        }

        console.log('✅ تم تطبيق الصلاحيات على الواجهة');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: عرض معلومات الدور الحالي
    // ═══════════════════════════════════════════════════════════

    window.showRoleInfo = function() {
        if (!window.currentUser) return;

        const role = getCurrentRole();
        const perms = getPermissions();
        const roleData = window.PERMISSIONS[role] || {};

        // عد الصفحات المتاحة
        let pagesCount = 0;
        let pagesList = '';
        if (perms.pages === 'all') {
            pagesCount = 'الكل';
            pagesList = 'كل صفحات التطبيق';
        } else if (Array.isArray(perms.pages)) {
            pagesCount = perms.pages.length;
            const pageNames = {
                'dashboard': 'الرئيسية',
                'inventory': 'المخزون',
                'cashier': 'الكاشير',
                'purchases': 'المشتريات',
                'customers': 'العملاء',
                'suppliers': 'الموردين',
                'cash-boxes': 'الخزائن',
                'expenses': 'المصروفات',
                'treasury': 'حركة الخزنة',
                'invoices': 'الفواتير',
                'payments': 'التحصيل/السداد',
                'returns': 'المرتجعات',
                'accounts': 'الحسابات',
                'erp': 'الموارد',
                'warehouses': 'المخازن',
                'reports': 'التقارير',
                'employees': 'الموظفين',
                'company': 'بيانات الشركة',
                'users': 'المستخدمين',
                'settings': 'الإعدادات'
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

            // بطاقة الدور
            '<div style="background:linear-gradient(135deg,' + roleData.color + ',' + roleData.color + 'CC);' +
                'border-radius:12px;padding:20px;text-align:center;color:#0D0D0D;margin-bottom:16px;">' +
                '<div style="font-size:48px;margin-bottom:8px;">' + roleData.icon + '</div>' +
                '<div style="font-size:20px;font-weight:900;">' + (window.currentUser.name || '') + '</div>' +
                '<div style="font-size:14px;margin-top:4px;font-weight:700;">' + roleData.name + '</div>' +
            '</div>' +

            // الصفحات المتاحة
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:14px;">' +
                '<div style="color:#C9A94E;font-weight:900;font-size:14px;margin-bottom:10px;">' +
                    '📄 الصفحات المتاحة (' + pagesCount + ')' +
                '</div>' +
                '<div style="color:#A89070;font-size:12px;line-height:2;">' + pagesList + '</div>' +
            '</div>' +

            // الأذونات
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">' +
                '<div style="color:#C9A94E;font-weight:900;font-size:14px;margin-bottom:10px;">' +
                    '✅ الأذونات' +
                '</div>' +
                permissionsHtml +
            '</div>' +

            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:14px;">إغلاق</button>';

        window.openModal(html);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: اعتراض التنقل لفحص الصلاحيات
    // ═══════════════════════════════════════════════════════════

    // نستنى لحد ما navigateTo يتحمّل
    function hookNavigateTo() {
        if (typeof window.navigateTo !== 'function') {
            setTimeout(hookNavigateTo, 300);
            return;
        }

        const originalNavigate = window.navigateTo;

        window.navigateTo = function(page) {
            // فحص الصلاحية
            if (window.currentUser && !window.canAccessPage(page)) {
                window.showToast('🚫 ليس لديك صلاحية الوصول لهذه الصفحة', 'error');
                return;
            }

            // كمل عادي
            originalNavigate(page);

            // أعد تطبيق الصلاحيات
            setTimeout(window.applyPagePermissions, 100);
        };

        console.log('✅ تم ربط فحص الصلاحيات بالتنقل');
    }

    hookNavigateTo();

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: عرض الدور في الهيدر
    // ═══════════════════════════════════════════════════════════

    window.updateUserUI = function() {
        if (!window.currentUser) return;

        const roleInfo = window.ROLES[window.currentUser.role] || window.PERMISSIONS[window.currentUser.role] || { icon: '❓', name: 'مستخدم' };

        // عنصر عرض المستخدم
        const el = document.getElementById('currentUserName');
        if (el) {
            el.textContent = roleInfo.icon + ' ' + window.currentUser.name;
        }

        // اسم الشركة
        const headerCompany = document.getElementById('headerCompanyName');
        if (headerCompany && window.companyData && window.companyData.name) {
            headerCompany.textContent = window.companyData.name;
        }

        // ملء معلومات جديدة
        const roleDisplay = document.getElementById('userRoleDisplay');
        if (roleDisplay) {
            roleDisplay.textContent = roleInfo.icon + ' ' + roleInfo.name;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: فحص الصلاحية قبل أي عملية
    // ═══════════════════════════════════════════════════════════

    // فحص قبل الحذف (من كل الدوال)
    window.requireDelete = function(actionName) {
        if (!window.canDelete()) {
            window.showToast('🚫 ليس لديك صلاحية ' + (actionName || 'الحذف'), 'error');
            return false;
        }
        return true;
    };

    // فحص قبل التعديل
    window.requireEdit = function(actionName) {
        if (!window.canEdit()) {
            window.showToast('🚫 ليس لديك صلاحية ' + (actionName || 'التعديل'), 'error');
            return false;
        }
        return true;
    };

    // فحص قبل الإضافة
    window.requireAdd = function(actionName) {
        if (!window.canAdd()) {
            window.showToast('🚫 ليس لديك صلاحية ' + (actionName || 'الإضافة'), 'error');
            return false;
        }
        return true;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: التهيئة عند تسجيل الدخول
    // ═══════════════════════════════════════════════════════════

    window.initPermissionsAfterLogin = function() {
        if (!window.currentUser) return;

        console.log('🔐 تطبيق صلاحيات المستخدم:', window.currentUser.name, '(' + window.currentUser.role + ')');

        // تطبيق الصلاحيات على الواجهة
        setTimeout(window.applyPagePermissions, 500);
        setTimeout(window.applyPagePermissions, 1500);
        setTimeout(window.applyPagePermissions, 3000);

        // تحديث UI المستخدم
        window.updateUserUI();
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    if (window.EventBus) {
        window.EventBus.on('data:users:changed', function() {
            if (window.currentUser) {
                // حدّث بيانات المستخدم الحالي
                const updated = (window.users || []).find(function(u) {
                    return u.id == window.currentUser.id;
                });
                if (updated) {
                    window.currentUser = updated;
                    window.updateUserUI();
                    window.applyPagePermissions();
                }
            }
        });

        window.EventBus.on('app:ready', function() {
            window.initPermissionsAfterLogin();
        });
    }

    window.__permissionsLoaded = true;
    console.log('✅ permissions.js v1.0 جاهز');

})();
