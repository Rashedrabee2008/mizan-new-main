// ============================================================
// الميزان Pro - sharabar.js v2.7
// شريط إعلانات متحرك — من اليسار لليمين + آخر الشريط + رفع
// ============================================================

(function() {
    'use strict';

    console.log('📢 sharabar.js v2.7 - بدء التحميل');

    const STORAGE_KEY = 'mizan_sharabar_v2';
    const BAR_HEIGHT = 40; // ارتفاع الشريط التقريبي بالبكسل

    const DEFAULT_SETTINGS = {
        enabled: false,
        text: '',
        speed: 30,
        color: '#C9A94E',
        position: 'top'
    };

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
    // ضبط المسافة العلوية للـ body عشان اللوجو ميتغطاش
    // ═══════════════════════════════════════════════════════════
    function adjustBodySpacing(enable, position) {
        // نستخدم style مباشر بدل class عشان نتحكم بسهولة
        const body = document.body;
        const html = document.documentElement;
        
        if (enable && position === 'top') {
            // لو الشريط فوق: نضيف padding-top للـ body
            body.style.setProperty('padding-top', BAR_HEIGHT + 'px', 'important');
            html.style.setProperty('padding-top', BAR_HEIGHT + 'px', 'important');
            console.log('📏 تم إضافة ' + BAR_HEIGHT + 'px فوق للـ body');
        } else if (enable && position === 'bottom') {
            // لو الشريط تحت: نضيف padding-bottom للـ body
            body.style.setProperty('padding-bottom', BAR_HEIGHT + 'px', 'important');
            html.style.setProperty('padding-bottom', BAR_HEIGHT + 'px', 'important');
            console.log('📏 تم إضافة ' + BAR_HEIGHT + 'px تحت للـ body');
        } else {
            // إزالة الـ padding
            body.style.removeProperty('padding-top');
            body.style.removeProperty('padding-bottom');
            html.style.removeProperty('padding-top');
            html.style.removeProperty('padding-bottom');
            console.log('📏 تم إزالة المسافات الإضافية');
        }
    }

    function removeSharabar() {
        const old = document.getElementById('mizanSharabar');
        if (old) old.remove();
        const oldCSS = document.getElementById('mizanSharabarCSS');
        if (oldCSS) oldCSS.remove();
        // إزالة المسافات القديمة
        adjustBodySpacing(false, 'top');
    }

    // ═══════════════════════════════════════════════════════════
    // إنشاء الشريط
    // ═══════════════════════════════════════════════════════════
    function createSharabar() {
        removeSharabar();

        const s = getSettings();
        console.log('📋 الإعدادات:', s);

        if (!s.enabled) {
            console.log('⏸️ الشريط غير مفعّل');
            return false;
        }
        if (!s.text || s.text.trim() === '') {
            console.log('⚠️ لا يوجد نص');
            return false;
        }

        // ─────────────────────────────────────────────────────
        // CSS
        // ─────────────────────────────────────────────────────
        const style = document.createElement('style');
        style.id = 'mizanSharabarCSS';
        style.textContent = `
            /* الحركة من اليسار لليمين — بنسبة عرض النص الفعلي */
            @keyframes mizanSharabarScroll {
                0%   { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(50%, 0, 0); }
            }

            #mizanSharabar {
                position: fixed !important;
                left: 0 !important;
                right: 0 !important;
                width: 100vw !important;
                max-width: 100vw !important;
                min-width: 100% !important;
                background: linear-gradient(90deg, ${s.color}, ${s.color}CC) !important;
                color: #0D0D0D !important;
                padding: 9px 0 !important;
                overflow: hidden !important;
                z-index: 999999 !important;
                box-shadow: 0 2px 10px rgba(0,0,0,0.4) !important;
                font-weight: 800 !important;
                font-size: 13px !important;
                font-family: Tajawal, sans-serif !important;
                pointer-events: none !important;
                direction: rtl !important;
                display: block !important;
                box-sizing: border-box !important;
                margin: 0 !important;
                visibility: visible !important;
                opacity: 1 !important;
                transform: translateZ(0) !important;
            }

            #mizanSharabar.position-top {
                top: 0 !important;
                bottom: auto !important;
            }

            #mizanSharabar.position-bottom {
                top: auto !important;
                bottom: 0 !important;
            }

            #mizanSharabar .bar-inner {
                display: inline-flex !important;
                white-space: nowrap !important;
                animation: mizanSharabarScroll ${s.speed}s linear infinite !important;
                direction: rtl !important;
                will-change: transform !important;
            }

            #mizanSharabar .bar-text {
                display: inline-block !important;
                padding: 0 40px !important;
                direction: rtl !important;
                text-align: right !important;
                flex-shrink: 0 !important;
                white-space: nowrap !important;
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* موبايل */
            @media (max-width: 480px) {
                #mizanSharabar {
                    font-size: 12px !important;
                    padding: 9px 0 !important;
                }
                #mizanSharabar .bar-text {
                    padding: 0 25px !important;
                }
            }

            /* تابلت */
            @media (min-width: 481px) and (max-width: 1024px) {
                #mizanSharabar {
                    font-size: 14px !important;
                    padding: 11px 0 !important;
                }
            }

            /* كمبيوتر */
            @media (min-width: 1025px) {
                #mizanSharabar {
                    font-size: 15px !important;
                    padding: 12px 0 !important;
                }
                #mizanSharabar .bar-text {
                    padding: 0 60px !important;
                }
            }
        `;
        document.head.appendChild(style);

        // ─────────────────────────────────────────────────────
        // عنصر الشريط
        // ─────────────────────────────────────────────────────
        const bar = document.createElement('div');
        bar.id = 'mizanSharabar';

        if (s.position === 'top') {
            bar.classList.add('position-top');
        } else {
            bar.classList.add('position-bottom');
        }

        // النص — نكرر 4 نسخ عشان الحركة تستمر بدون فراغ
        const inner = document.createElement('div');
        inner.className = 'bar-inner';

        for (let i = 0; i < 4; i++) {
            const span = document.createElement('span');
            span.className = 'bar-text';
            span.textContent = '🎉 ' + s.text + '   ⭐   ';
            inner.appendChild(span);
        }

        bar.appendChild(inner);
        document.body.appendChild(bar);

        // ─────────────────────────────────────────────────────
        // ضبط المسافة العلوية للـ body عشان اللوجو ميتغطاش
        // ─────────────────────────────────────────────────────
        adjustBodySpacing(true, s.position);

        // ─────────────────────────────────────────────────────
        // ضبط عرض الشريط على الموبايل
        // ─────────────────────────────────────────────────────
        function fixMobileWidth() {
            const barEl = document.getElementById('mizanSharabar');
            if (!barEl) return;
            const screenW = Math.max(
                document.documentElement.clientWidth,
                window.innerWidth || 0
            );
            barEl.style.setProperty('width', screenW + 'px', 'important');
            barEl.style.setProperty('min-width', screenW + 'px', 'important');
            barEl.style.setProperty('max-width', screenW + 'px', 'important');
            barEl.style.setProperty('left', '0', 'important');
            barEl.style.setProperty('right', 'auto', 'important');
        }

        fixMobileWidth();
        window.addEventListener('resize', fixMobileWidth);
        window.addEventListener('orientationchange', function() {
            setTimeout(fixMobileWidth, 200);
        });

        // ─────────────────────────────────────────────────────
        // التأكد من أن الحركة تعمل
        // ─────────────────────────────────────────────────────
        setTimeout(function() {
            const innerEl = bar.querySelector('.bar-inner');
            if (innerEl) {
                const computed = window.getComputedStyle(innerEl);
                console.log('🎬 animation:', computed.animationName);
                console.log('🎬 duration:', computed.animationDuration);
                console.log('🎬 play-state:', computed.animationPlayState);
                console.log('🎬 bar width:', bar.offsetWidth);
                console.log('🎬 inner width:', innerEl.offsetWidth);

                if (computed.animationName === 'none' || computed.animationPlayState === 'paused') {
                    console.log('⚠️ الحركة مش شغالة — نحاول إصلاحها');
                    innerEl.style.animation = 'none';
                    setTimeout(function() {
                        innerEl.style.animation = 'mizanSharabarScroll ' + s.speed + 's linear infinite';
                    }, 50);
                }
            }
        }, 100);

        console.log('✅ تم إنشاء الشريط — من اليسار لليمين');
        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // قسم الإعدادات
    // ═══════════════════════════════════════════════════════════
    function addSettingsSection() {
        const page = document.getElementById('page-settings');
        if (!page) return false;

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
            <p class="settings-desc">اعرض عروضك للعملاء في شريط متحرك (اتجاه عربي)</p>

            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#0D0D0D;border-radius:10px;margin-bottom:12px;">
                <input type="checkbox" id="sbEnabled" style="width:auto;transform:scale(1.4);cursor:pointer;" ${s.enabled ? 'checked' : ''} />
                <label for="sbEnabled" style="cursor:pointer;font-weight:800;font-size:14px;">تفعيل الشريط</label>
            </div>

            <div class="form-group">
                <label>📝 نص الإعلان</label>
                <input type="text" id="sbText" value="${s.text.replace(/"/g, '&quot;')}" 
                       placeholder="🎉 عرض خاص! خصم 20%" maxlength="200" dir="rtl" />
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
                    <option value="top" ${s.position === 'top' ? 'selected' : ''}>⬆️ فوق خالص</option>
                    <option value="bottom" ${s.position === 'bottom' ? 'selected' : ''}>⬇️ تحت خالص</option>
                </select>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;">
                <button class="btn btn-primary" onclick="SharabarAPI.save()">💾 حفظ</button>
                <button class="btn btn-info" onclick="SharabarAPI.preview()">👁️ معاينة</button>
            </div>
        `;

        const firstSection = page.querySelector('.settings-section');
        if (firstSection && firstSection.nextSibling) {
            firstSection.parentNode.insertBefore(section, firstSection.nextSibling);
        } else if (firstSection) {
            firstSection.parentNode.appendChild(section);
        } else {
            page.appendChild(section);
        }

        bindEvents();
        console.log('✅ تم إضافة قسم الإعدادات');
        return true;
    }

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
    // APIs
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

            if (settings.enabled && !settings.text) {
                if (window.showToast) window.showToast('⚠️ أدخل نص الإعلان أولاً', 'error');
                return;
            }

            saveSettings(settings);
            createSharabar();

            if (window.showToast) {
                window.showToast(
                    settings.enabled ? '✅ تم تفعيل الشريط' : '⏸️ تم إيقاف الشريط',
                    'success'
                );
            }
        },
        preview: function() {
            const textEl = document.getElementById('sbText');
            const text = textEl ? textEl.value.trim() : '';

            if (!text) {
                if (window.showToast) window.showToast('⚠️ أدخل نص الإعلان', 'warning');
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
            if (window.showToast) window.showToast('👁️ معاينة لمدة 5 ثواني', 'info');

            setTimeout(function() {
                saveSettings(old);
                createSharabar();
            }, 5000);
        },
        setColor: function(color) {
            const el = document.getElementById('sbColor');
            if (el) el.value = color;

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
    // التهيئة
    // ═══════════════════════════════════════════════════════════
    function init() {
        setTimeout(createSharabar, 500);
        setTimeout(addSettingsSection, 2000);
        setTimeout(addSettingsSection, 4000);
        setTimeout(addSettingsSection, 6000);
        console.log('✅ sharabar.js v2.7 جاهز');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    if (window.EventBus) {
        window.EventBus.on('page:navigated', function(page) {
            if (page === 'settings') {
                setTimeout(addSettingsSection, 200);
            }
        });
    }

    window.__sharabarLoaded = true;

})();
