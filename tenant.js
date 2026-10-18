// ============================================================
// الميزان Pro - tenant.js v2.0 (مُحسَّن)
// إدارة Store ID (Multi-Tenant) والتنقل بين المتاجر
// ============================================================

(function() {
    'use strict';

    console.log('🏢 tenant.js v2.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الحصول على Store ID
    // ═══════════════════════════════════════════════════════════

    function getStoreId() {
        if (typeof window.getStoreId === 'function') {
            return window.getStoreId();
        }
        return localStorage.getItem('mizan_store_id_v18') || '—';
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: نسخ Store ID
    // ═══════════════════════════════════════════════════════════

    window.copyStoreId = function() {
        const storeId = getStoreId();
        if (!storeId || storeId === '—') {
            if (typeof window.showToast === 'function') window.showToast('⚠️ لا يوجد Store ID', 'warning');
            return;
        }

        try {
            // للموبايل
            const tempInput = document.createElement('textarea');
            tempInput.value = storeId;
            tempInput.style.position = 'fixed';
            tempInput.style.opacity = '0';
            document.body.appendChild(tempInput);
            tempInput.select();
            tempInput.setSelectionRange(0, 99999);
            document.execCommand('copy');
            document.body.removeChild(tempInput);

            if (typeof window.showToast === 'function') window.showToast('✅ تم نسخ Store ID', 'success');
        } catch (e) {
            // بديل للمتصفحات الحديثة
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(storeId)
                    .then(function() {
                        if (typeof window.showToast === 'function') window.showToast('✅ تم نسخ Store ID', 'success');
                    })
                    .catch(function() {
                        if (typeof window.showToast === 'function') window.showToast('⚠️ فشل النسخ', 'warning');
                    });
            } else {
                if (typeof window.showToast === 'function') window.showToast('⚠️ انسخه يدوياً: ' + storeId, 'info');
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: مشاركة Store ID (واتساب)
    // ═══════════════════════════════════════════════════════════

    window.shareStoreIdWhatsApp = function() {
        const storeId = getStoreId();
        const companyName = (window.companyData || {}).name || 'الميزان';

        const message = '🏢 *' + companyName + '*\n\n' +
            '💾 *كود المتجر الخاص بك:*\n' +
            '`' + storeId + '`\n\n' +
            '⚠️ احتفظ بهذا الكود في مكان آمن.\n' +
            'ستحتاجه للدخول إلى بياناتك من أي جهاز آخر.';

        window.copyStoreId();

        setTimeout(function() {
            const url = 'https://wa.me/?text=' + encodeURIComponent(message);
            window.open(url, '_blank');
        }, 500);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: نافذة "معلومات متجري"
    // ═══════════════════════════════════════════════════════════

    window.showTenantInfo = function() {
        const storeId = getStoreId();
        const companyName = (window.companyData || {}).name || 'الميزان';

        const stats = {
            products: (window.products || []).length,
            sales: (window.sales || []).length,
            customers: (window.customers || []).length,
            purchases: (window.purchases || []).length
        };

        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🏢 معلومات متجري</h3>' +

            // معلومات الشركة
            '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:12px;padding:16px;text-align:center;color:#0D0D0D;margin-bottom:14px;">' +
                '<div style="font-size:14px;font-weight:700;opacity:0.85;">متجرك الحالي</div>' +
                '<div style="font-size:22px;font-weight:900;margin-top:4px;">' + window.escapeHtml(companyName) + '</div>' +
            '</div>' +

            // Store ID
            '<div style="background:#0D0D0D;border-radius:12px;padding:14px;margin-bottom:12px;border:2px solid #C9A94E;">' +
                '<div style="color:#A89070;font-size:11px;font-weight:800;margin-bottom:8px;">🔑 كود المتجر (Store ID)</div>' +
                '<div style="background:#1A1A1A;border-radius:8px;padding:12px;font-family:Courier New,monospace;font-size:12px;color:#C9A94E;word-break:break-all;direction:ltr;text-align:center;font-weight:900;">' +
                    storeId +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;">' +
                    '<button onclick="copyStoreId()" style="background:#2D8F5E;border:none;color:#fff;padding:10px;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:12px;">' +
                        '📋 نسخ' +
                    '</button>' +
                    '<button onclick="shareStoreIdWhatsApp()" style="background:#25D366;border:none;color:#fff;padding:10px;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:12px;">' +
                        '💬 واتساب' +
                    '</button>' +
                '</div>' +
            '</div>' +

            // تحذير
            '<div style="background:#2D1500;border-radius:10px;padding:12px;margin-bottom:12px;border-right:4px solid #E6A830;">' +
                '<div style="color:#E6A830;font-size:12px;font-weight:800;margin-bottom:4px;">⚠️ مهم جداً</div>' +
                '<div style="color:#A89070;font-size:11px;line-height:1.7;">' +
                    'احفظ الكود ده في مكان آمن. ستحتاجه للدخول إلى بياناتك من أي جهاز آخر.<br>' +
                    '<strong style="color:#E06060;">تحذير:</strong> لو الكود ده ضاع، هتفقد الوصول لبياناتك.' +
                '</div>' +
            '</div>' +

            // إحصائيات
            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:12px;">' +
                '<div style="color:#C9A94E;font-size:12px;font-weight:800;margin-bottom:8px;">📊 بيانات المتجر</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;">' +
                    '<div style="color:#A89070;">📦 المنتجات: <strong style="color:#F5E6C8;">' + stats.products + '</strong></div>' +
                    '<div style="color:#A89070;">🧾 الفواتير: <strong style="color:#F5E6C8;">' + stats.sales + '</strong></div>' +
                    '<div style="color:#A89070;">👥 العملاء: <strong style="color:#F5E6C8;">' + stats.customers + '</strong></div>' +
                    '<div style="color:#A89070;">🛒 المشتريات: <strong style="color:#F5E6C8;">' + stats.purchases + '</strong></div>' +
                '</div>' +
            '</div>' +

            // أزرار
            '<div style="display:grid;grid-template-columns:1fr;gap:6px;">' +
                '<button onclick="showSwitchStoreDialog()" style="background:#4A8AB5;border:none;color:#fff;padding:12px;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:13px;">' +
                    '🔄 الدخول لمتجر آخر' +
                '</button>' +
                '<button onclick="closeModal()" style="background:#3D3D3D;border:none;color:#F5E6C8;padding:12px;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:13px;">' +
                    'إغلاق' +
                '</button>' +
            '</div>';

        if (typeof window.openModal === 'function') {
            window.openModal(html);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: نافذة "الدخول لمتجر آخر"
    // ═══════════════════════════════════════════════════════════

    window.showSwitchStoreDialog = function() {
        const currentId = getStoreId();

        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🔄 الدخول لمتجر آخر</h3>' +

            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:12px;border-right:4px solid #E6A830;">' +
                '<div style="color:#E6A830;font-size:11px;font-weight:800;margin-bottom:4px;">⚠️ تنبيه</div>' +
                '<div style="color:#A89070;font-size:11px;line-height:1.6;">' +
                    'التطبيق هيشتغل بالبيانات الخاصة بالكود اللي هتدخله.<br>' +
                    'بيانات المتجر الحالي مش هتتأثر.' +
                '</div>' +
            '</div>' +

            '<div class="form-group">' +
                '<label>🔑 كود المتجر</label>' +
                '<input type="text" id="newStoreIdInput" placeholder="store_..." ' +
                    'style="text-align:center;font-family:Courier New,monospace;direction:ltr;font-size:13px;" />' +
            '</div>' +

            '<div style="background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:12px;font-size:11px;">' +
                '<div style="color:#A89070;">كودك الحالي:</div>' +
                '<div style="color:#C9A94E;font-family:Courier New,monospace;word-break:break-all;direction:ltr;font-size:10px;margin-top:4px;">' +
                    currentId +
                '</div>' +
            '</div>' +

            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
                '<button onclick="closeModal()" style="background:#3D3D3D;border:none;color:#F5E6C8;padding:12px;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:13px;">' +
                    '❌ إلغاء' +
                '</button>' +
                '<button onclick="confirmSwitchStore()" style="background:#4A8AB5;border:none;color:#fff;padding:12px;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:13px;">' +
                    '✅ دخول' +
                '</button>' +
            '</div>';

        if (typeof window.openModal === 'function') {
            window.openModal(html);
        }

        setTimeout(function() {
            const input = document.getElementById('newStoreIdInput');
            if (input) input.focus();
        }, 200);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: تأكيد تغيير المتجر
    // ═══════════════════════════════════════════════════════════

    window.confirmSwitchStore = function() {
        const input = document.getElementById('newStoreIdInput');
        if (!input) return;

        const newId = input.value.trim();
        if (!newId) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ أدخل كود المتجر', 'error');
            return;
        }

        if (newId.indexOf('store_') !== 0) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ الكود لازم يبدأ بـ store_', 'error');
            return;
        }

        const currentId = getStoreId();
        if (newId === currentId) {
            if (typeof window.showToast === 'function') window.showToast('ℹ️ إنت بالفعل في هذا المتجر', 'info');
            return;
        }

        const msg = 'سيتم تحميل بيانات المتجر:\n\n' + newId + '\n\nهل أنت متأكد؟';

        const doSwitch = function(confirmed) {
            if (!confirmed) return;
            try {
                if (typeof window.setStoreId === 'function') {
                    window.setStoreId(newId);
                } else {
                    localStorage.setItem('mizan_store_id_v18', newId);
                }
                if (typeof window.showToast === 'function') window.showToast('✅ جاري تحميل البيانات...', 'success');
                setTimeout(function() { location.reload(); }, 1000);
            } catch (e) {
                if (typeof window.showToast === 'function') window.showToast('❌ فشل تغيير المتجر', 'error');
            }
        };

        if (typeof window.confirmDialog === 'function') {
            window.confirmDialog(msg).then(doSwitch);
        } else {
            doSwitch(confirm(msg));
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: قسم في الإعدادات
    // ═══════════════════════════════════════════════════════════

    function addTenantSection() {
        const settingsPage = document.getElementById('page-settings');
        if (!settingsPage) return;

        if (document.getElementById('tenantSection')) return;

        const firebaseSection = settingsPage.querySelector('.settings-section:nth-child(2)');
        if (!firebaseSection) return;

        const section = document.createElement('div');
        section.className = 'settings-section';
        section.id = 'tenantSection';

        section.innerHTML =
            '<h3>🏢 متجري</h3>' +
            '<p class="settings-desc">كود المتجر الخاص بك للاحتفاظ بالبيانات والتنقل بين الأجهزة.</p>' +
            '<div class="settings-info-row">' +
                '<span>Store ID</span>' +
                '<span id="tenantStoreId" style="font-family:monospace;font-size:10px;direction:ltr;color:#C9A94E;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
                    getStoreId() +
                '</span>' +
            '</div>' +
            '<button class="btn btn-primary btn-block" onclick="showTenantInfo()" style="margin-top:10px;">' +
                '🔑 معلومات المتجر' +
            '</button>';

        firebaseSection.parentNode.insertBefore(section, firebaseSection);
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: التهيئة
    // ═══════════════════════════════════════════════════════════

    function tryInit() {
        const settingsPage = document.getElementById('page-settings');
        if (!settingsPage) {
            setTimeout(tryInit, 500);
            return;
        }

        addTenantSection();

        const storeEl = document.getElementById('tenantStoreId');
        if (storeEl) storeEl.textContent = getStoreId();

        console.log('✅ tenant.js v2.0 جاهز - Store ID:', getStoreId());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(tryInit, 2000);
        });
    } else {
        setTimeout(tryInit, 2000);
    }

    setInterval(function() {
        addTenantSection();
        const storeEl = document.getElementById('tenantStoreId');
        if (storeEl) storeEl.textContent = getStoreId();
    }, 3000);

    window.__tenantLoaded = true;
    console.log('✅ tenant.js v2.0 جاهز');

})();
