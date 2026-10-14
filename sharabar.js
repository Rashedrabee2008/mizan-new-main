// ============================================================
// الميزان Pro - sharabar.js v2.0
// شريط إعلانات متحرك (نسخة مبسّطة ومضمونة)
// ============================================================

(function() {
    'use strict';

    console.log('📢 sharabar.js v2.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الإعدادات الافتراضية
    // ═══════════════════════════════════════════════════════════

    const STORAGE_KEY = 'mizan_sharabar_v2';

    const DEFAULT_SETTINGS = {
        enabled: false,
        text: '',
        speed: 30,
        color: '#C9A94E',
        position: 'top'
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: قراءة وحفظ الإعدادات
    // ═══════════════════════════════════════════════════════════

    function getSettings() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return Object.assign({}, DEFAULT_SETTINGS);
            return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(data));
        } catch (e) {
            console.error('❌ خطأ في قراءة الإعدادات:', e);
            return Object.assign({}, DEFAULT_SETTINGS);
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            console.log('💾 تم حفظ الإعدادات:', settings);
            return true;
        } catch (e) {
            console.error('❌ فشل الحفظ:', e);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: إزالة الشريط القديم
    // ═══════════════════════════════════════════════════════════

    function removeSharabar() {
        const old = document.getElementById('mizanSharabar');
        if (old) old.remove();
        const oldCSS = document.getElementById('mizanSharabarCSS');
        if (oldCSS) oldCSS.remove();
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: إنشاء الشريط
    // ═══════════════════════════════════════════════════════════

    function createSharabar() {
        // 1. احذف القديم
        removeSharabar();

        // 2. اقرأ الإعدادات
        const s = getSettings();
        console.log('📋 الإعدادات الحالية:', s);

        // 3. فحص
        if (!s.enabled) {
            console.log('⏸️ الشريط غير مفعّل');
            return false;
        }

        if (!s.text || s.text.trim() === '') {
            console.log('⚠️ لا يوجد نص');
            return false;
        }

        // 4. أنشئ CSS للحركة
        const style = document.createElement('style');
        style.id = 'mizanSharabarCSS';
        style.textContent = `
            @keyframes mizanSharabarScroll {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
            }
            #mizanSharabar {
                position: fixed !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                width: 100% !important;
                max-width: 480px !important;
                background: linear-gradient(90deg, ${s.color}, ${s.color}CC) !important;
                color: #0D0D0D !important;
                padding: 10px 0 !important;
                overflow: hidden !important;
                z-index: 99999 !important;
                box-shadow: 0 2px 10px rgba(0,0,0,0.4) !important;
                font-weight: 800 !important;
                font-size: 13px !important;
                font-family: Tajawal, sans-serif !important;
                pointer-events: none !important;
            }
            #mizanSharabar .bar-inner {
                display: inline-block !important;
                white-space: nowrap !important;
                padding-right: 50% !important;
                animation: mizanSharabarScroll ${s.speed}s linear infinite !important;
            }
            #mizanSharabar .bar-text {
                display: inline-block !important;
                padding: 0 40px !important;
            }
        `;
        document.head.appendChild(style);

        // 5. أنشئ الشريط
        const bar = document.createElement('div');
        bar.id = 'mizanSharabar';

        // المكان
        if (s.position === 'top') {
            bar.style.setProperty('top', '85px', 'important');
            bar.style.setProperty('border-radius', '0 0 10px 10px', 'important');
        } else {
            bar.style.setProperty('bottom', '75px', 'important');
            bar.style.setProperty('border-radius', '10px 10px 0 0', 'important');
        }

        // النص
        const inner = document.createElement('div');
        inner.className = 'bar-inner';

        // كرر النص 3 مرات للتمرير المستمر
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            span.className = 'bar-text';
            span.textContent = '🎉 ' + s.text + '   ⭐   ';
            inner.appendChild(span);
        }

        bar.appendChild(inner);
        document.body.appendChild(bar);

        console.log('✅ تم إنشاء الشريط بنجاح');
        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: قسم الإعدادات في الصفحة
    // ═══════════════════════════════════════════════════════════

    function addSettingsSection() {
        const page = document.getElementById('page-settings');
        if (!page) {
            console.log('⚠️ صفحة الإعدادات مش موجودة');
            return false;
        }

        // لو موجود، حدّث القيم
        if (document.getElementById('sharabarSection')) {
            updateInputs();
            return true;
        }

        const s = getSettings();

        const section = document.createElement('div');
        section.className = 'settings-section';
        section.id = 'sharabarSection';

        section.innerHTML = `
            <h3>📢 شريط الإعلانات</h3>
            <p class="settings-desc">اعرض عروضك للعملاء في شريط متحرك</p>

            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#0D0D0D;border-radius:10px;margin-bottom:12px;">
                <input type="checkbox" id="sbEnabled" style="width:auto;transform:scale(1.4);cursor:pointer;" ${s.enabled ? 'checked' : ''} />
                <label for="sbEnabled" style="cursor:pointer;font-weight:800;font-size:14px;">تفعيل الشريط</label>
            </div>

            <div class="form-group">
                <label>📝 نص الإعلان</label>
                <input type="text" id="sbText" value="${s.text.replace(/"/g, '&quot;')}" 
                       placeholder="🎉 عرض خاص! خصم 20%" maxlength="200" />
            </div>

            <div class="form-group">
                <label>⏱️ السرعة (ثانية)</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:11px;color:#A89070;">سريع</span>
                    <input type="range" id="sbSpeed" min="10" max="60" step="5" value="${s.speed}" style="flex:1;" />
                    <span style="font-size:11px;color:#A89070;">بطيء</span>
                </div>
                <div style="text-align:center;font-size:11px;color:#A89070;margin-top:4px;">القيمة: <span id="sbSpeedValue">${s.speed}</span> ثانية</div>
            </div>

            <div class="form-group">
                <label>🎨 اللون</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;" id="sbColors">
                    ${['#C9A94E', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F97316'].map(function(c) {
                        return '<button type="button" onclick="SharabarAPI.setColor(\'' + c + '\')" ' +
                               'data-color="' + c + '" ' +
                               'style="width:44px;height:44px;border-radius:50%;border:3px solid ' +
                               (s.color === c ? c : '#3D3D3D') + ';background:' + c + ';cursor:pointer;"></button>';
                    }).join('')}
                </div>
                <input type="hidden" id="sbColor" value="${s.color}" />
            </div>

            <div class="form-group">
                <label>📍 المكان</label>
                <select id="sbPosition">
                    <option value="top" ${s.position === 'top' ? 'selected' : ''}>⬆️ فوق (تحت الهيدر)</option>
                    <option value="bottom" ${s.position === 'bottom' ? 'selected' : ''}>⬇️ تحت (فوق التنقل)</option>
                </select>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;">
                <button class="btn btn-primary" onclick="SharabarAPI.save()">💾 حفظ</button>
                <button class="btn btn-info" onclick="SharabarAPI.preview()">👁️ معاينة</button>
            </div>
        `;

        // إدخال القسم
        const firstSection = page.querySelector('.settings-section');
        if (firstSection && firstSection.nextSibling) {
            firstSection.parentNode.insertBefore(section, firstSection.nextSibling);
        } else if (firstSection) {
            firstSection.parentNode.appendChild(section);
        } else {
            page.appendChild(section);
        }

        // ربط الأحداث
        bindEvents();

        console.log('✅ تم إضافة قسم الإعدادات');
        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    function bindEvents() {
        const speedEl = document.getElementById('sbSpeed');
        if (speedEl) {
            speedEl.addEventListener('input', function() {
                const val = document.getElementById('sbSpeedValue');
                if (val) val.textContent = this.value;
            });
        }
    }

    function updateInputs() {
        const s = getSettings();
        const enabledEl = document.getElementById('sbEnabled');
        const textEl = document.getElementById('sbText');
        const speedEl = document.getElementById('sbSpeed');
        const colorEl = document.getElementById('sbColor');
        const positionEl = document.getElementById('sbPosition');
        const speedValueEl = document.getElementById('sbSpeedValue');

        if (enabledEl) enabledEl.checked = s.enabled;
        if (textEl) textEl.value = s.text;
        if (speedEl) speedEl.value = s.speed;
        if (colorEl) colorEl.value = s.color;
        if (positionEl) positionEl.value = s.position;
        if (speedValueEl) speedValueEl.textContent = s.speed;
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: APIs عامة
    // ═══════════════════════════════════════════════════════════

    window.SharabarAPI = {
        get: getSettings,
        save: function() {
            const enabledEl = document.getElementById('sbEnabled');
            const textEl = document.getElementById('sbText');
            const speedEl = document.getElementById('sbSpeed');
            const colorEl = document.getElementById('sbColor');
            const positionEl = document.getElementById('sbPosition');

            const settings = {
                enabled: enabledEl ? enabledEl.checked : false,
                text: textEl ? textEl.value.trim() : '',
                speed: speedEl ? parseInt(speedEl.value) : 30,
                color: colorEl ? colorEl.value : '#C9A94E',
                position: positionEl ? positionEl.value : 'top'
            };

            // فحص
            if (settings.enabled && !settings.text) {
                window.showToast('⚠️ أدخل نص الإعلان أولاً', 'error');
                return;
            }

            saveSettings(settings);
            createSharabar();

            window.showToast(
                settings.enabled ? '✅ تم تفعيل الشريط' : '⏸️ تم إيقاف الشريط',
                'success'
            );
        },
        preview: function() {
            const textEl = document.getElementById('sbText');
            const text = textEl ? textEl.value.trim() : '';

            if (!text) {
                window.showToast('⚠️ أدخل نص الإعلان', 'warning');
                return;
            }

            const old = getSettings();
            const temp = {
                enabled: true,
                text: text,
                speed: 30,
                color: (document.getElementById('sbColor') || {}).value || '#C9A94E',
                position: (document.getElementById('sbPosition') || {}).value || 'top'
            };

            saveSettings(temp);
            createSharabar();
            window.showToast('👁️ معاينة لمدة 5 ثواني', 'info');

            setTimeout(function() {
                saveSettings(old);
                createSharabar();
            }, 5000);
        },
        setColor: function(color) {
            const el = document.getElementById('sbColor');
            if (el) el.value = color;

            // تحديث الحدود
            document.querySelectorAll('#sbColors button').forEach(function(btn) {
                btn.style.borderColor = btn.dataset.color === color ? color : '#3D3D3D';
            });
        },
        render: createSharabar,
        show: function() {
            addSettingsSection();
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('settings');
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: التهيئة
    // ═══════════════════════════════════════════════════════════

    function init() {
        // حاول إنشاء الشريط فوراً
        setTimeout(createSharabar, 500);

        // حاول إضافة القسم
        setTimeout(addSettingsSection, 2000);
        setTimeout(addSettingsSection, 4000);
        setTimeout(addSettingsSection, 6000);

        console.log('✅ sharabar.js v2.0 جاهز');
        console.log('💡 للتجربة في Console:');
        console.log('   SharabarAPI.get()      — شوف الإعدادات');
        console.log('   SharabarAPI.render()   — اعرض الشريط');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ربط مع التنقل
    if (window.EventBus) {
        window.EventBus.on('page:navigated', function(page) {
            if (page === 'settings') {
                setTimeout(addSettingsSection, 200);
            }
        });
    }

    window.__sharabarLoaded = true;

})();
