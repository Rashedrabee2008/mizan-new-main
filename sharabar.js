// ============================================================
// الميزان Pro - sharabar.js v1.0
// شريط إعلانات متحرك
// ============================================================

(function() {
    'use strict';

    console.log('📢 sharabar.js v1.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الإعدادات
    // ═══════════════════════════════════════════════════════════

    const SHARABAR_KEY = 'mizan_sharabar_v1';

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
            const data = localStorage.getItem(SHARABAR_KEY);
            if (!data) return Object.assign({}, DEFAULT_SETTINGS);

            const parsed = JSON.parse(data);
            return Object.assign({}, DEFAULT_SETTINGS, parsed);
        } catch (e) {
            return Object.assign({}, DEFAULT_SETTINGS);
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(SHARABAR_KEY, JSON.stringify(settings));

            // مزامنة مع Firebase
            if (window.DataStore && window.DataStore.set) {
                const companyData = window.companyData || {};
                companyData.sharabar = settings;
                window.DataStore.set('companyData', companyData);
            }

            return true;
        } catch (e) {
            console.error('❌ فشل حفظ الإعدادات:', e);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: عرض الشريط
    // ═══════════════════════════════════════════════════════════

    function renderSharabar() {
        // إزالة الشريط القديم لو موجود
        const oldBar = document.getElementById('sharabar');
        if (oldBar) oldBar.remove();

        const settings = getSettings();

        // لو مش مفعّل، مش نعرضه
        if (!settings.enabled || !settings.text) {
            return;
        }

        // إنشاء الشريط
        const bar = document.createElement('div');
        bar.id = 'sharabar';
        bar.style.cssText = `
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 480px;
            background: linear-gradient(90deg, ${settings.color}, ${settings.color}DD);
            color: #0D0D0D;
            padding: 10px 0;
            overflow: hidden;
            z-index: 9998;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            font-weight: 800;
            font-size: 13px;
        `;

        // المكان
        if (settings.position === 'top') {
            bar.style.top = '85px';
            bar.style.borderRadius = '0 0 10px 10px';
        } else {
            bar.style.bottom = '75px';
            bar.style.borderRadius = '10px 10px 0 0';
        }

        // النص المتحرك
        const inner = document.createElement('div');
        inner.style.cssText = `
            display: inline-block;
            white-space: nowrap;
            padding-right: 100%;
            animation: sharabarScroll ${settings.speed}s linear infinite;
        `;
        inner.textContent = '🎉 ' + settings.text + '   ⭐   ' + settings.text + '   ⭐   ';

        bar.appendChild(inner);
        document.body.appendChild(bar);
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: الـ CSS للحركة
    // ═══════════════════════════════════════════════════════════

    function injectCSS() {
        if (document.getElementById('sharabarCSS')) return;

        const style = document.createElement('style');
        style.id = 'sharabarCSS';
        style.textContent = `
            @keyframes sharabarScroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
        `;
        document.head.appendChild(style);
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: قسم الإعدادات
    // ═══════════════════════════════════════════════════════════

    function addSharabarSection() {
        const settingsPage = document.getElementById('page-settings');
        if (!settingsPage) return;

        // لو موجود، مش نضيفه تاني
        if (document.getElementById('sharabarSection')) {
            // بس نحدّث القيم
            updateSharabarInputs();
            return;
        }

        const settings = getSettings();

        // نضيف قسم جديد
        const section = document.createElement('div');
        section.className = 'settings-section';
        section.id = 'sharabarSection';

        section.innerHTML = `
            <h3>📢 شريط الإعلانات</h3>
            <p class="settings-desc">اعرض عروضك للعملاء في شريط متحرك يظهر في كل الصفحات</p>

            <!-- تفعيل -->
            <div class="form-group" style="display:flex;align-items:center;gap:10px;padding:10px;background:#0D0D0D;border-radius:10px;margin-bottom:12px;">
                <input type="checkbox" id="sharabarEnabled" style="width:auto;transform:scale(1.3);cursor:pointer;" />
                <label for="sharabarEnabled" style="cursor:pointer;font-weight:800;color:#F5E6C8;">تفعيل الشريط</label>
            </div>

            <!-- النص -->
            <div class="form-group">
                <label>📝 نص الإعلان</label>
                <input type="text" id="sharabarText" 
                       placeholder="🎉 عرض خاص! خصم 20% على كل منتجاتك"
                       maxlength="200" />
                <div style="font-size:10px;color:#5D5D5D;margin-top:4px;">الحد الأقصى 200 حرف</div>
            </div>

            <!-- السرعة -->
            <div class="form-group">
                <label>⏱️ سرعة التمرير</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:11px;color:#A89070;">بطيء</span>
                    <input type="range" id="sharabarSpeed" 
                           min="10" max="60" step="5" value="30"
                           style="flex:1;" />
                    <span style="font-size:11px;color:#A89070;">سريع</span>
                </div>
            </div>

            <!-- اللون -->
            <div class="form-group">
                <label>🎨 لون الشريط</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button onclick="setSharabarColor('#C9A94E')" 
                            style="width:42px;height:42px;border-radius:50%;border:3px solid #C9A94E;background:#C9A94E;cursor:pointer;"
                            title="ذهبي"></button>
                    <button onclick="setSharabarColor('#3B82F6')" 
                            style="width:42px;height:42px;border-radius:50%;border:3px solid #3D3D3D;background:#3B82F6;cursor:pointer;"
                            title="أزرق"></button>
                    <button onclick="setSharabarColor('#10B981')" 
                            style="width:42px;height:42px;border-radius:50%;border:3px solid #3D3D3D;background:#10B981;cursor:pointer;"
                            title="أخضر"></button>
                    <button onclick="setSharabarColor('#8B5CF6')" 
                            style="width:42px;height:42px;border-radius:50%;border:3px solid #3D3D3D;background:#8B5CF6;cursor:pointer;"
                            title="بنفسجي"></button>
                    <button onclick="setSharabarColor('#EF4444')" 
                            style="width:42px;height:42px;border-radius:50%;border:3px solid #3D3D3D;background:#EF4444;cursor:pointer;"
                            title="أحمر"></button>
                    <button onclick="setSharabarColor('#F97316')" 
                            style="width:42px;height:42px;border-radius:50%;border:3px solid #3D3D3D;background:#F97316;cursor:pointer;"
                            title="برتقالي"></button>
                </div>
                <input type="hidden" id="sharabarColor" value="#C9A94E" />
            </div>

            <!-- المكان -->
            <div class="form-group">
                <label>📍 مكان الشريط</label>
                <select id="sharabarPosition">
                    <option value="top">⬆️ فوق (تحت الهيدر)</option>
                    <option value="bottom">⬇️ تحت (فوق الشريط السفلي)</option>
                </select>
            </div>

            <!-- معاينة -->
            <div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-top:12px;">
                <div style="font-size:11px;color:#A89070;margin-bottom:8px;">👁️ معاينة:</div>
                <div id="sharabarPreview" 
                     style="background:linear-gradient(90deg,#C9A94E,#C9A94EDD);color:#0D0D0D;padding:10px 14px;border-radius:8px;font-weight:800;font-size:12px;text-align:center;">
                    🎉 عرض خاص
                </div>
            </div>

            <!-- أزرار -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;">
                <button class="btn btn-primary" onclick="saveSharabarSettings()">
                    💾 حفظ
                </button>
                <button class="btn btn-secondary" onclick="previewSharabar()">
                    👁️ معاينة
                </button>
            </div>
        `;

        // إدخاله في الصفحة
        const firstSection = settingsPage.querySelector('.settings-section');
        if (firstSection) {
            firstSection.parentNode.insertBefore(section, firstSection.nextSibling);
        } else {
            settingsPage.appendChild(section);
        }

        // تحديث القيم
        updateSharabarInputs();

        // ربط الأحداث
        bindSharabarEvents();
    }

    function updateSharabarInputs() {
        const settings = getSettings();

        const enabledEl = document.getElementById('sharabarEnabled');
        const textEl = document.getElementById('sharabarText');
        const speedEl = document.getElementById('sharabarSpeed');
        const colorEl = document.getElementById('sharabarColor');
        const positionEl = document.getElementById('sharabarPosition');

        if (enabledEl) enabledEl.checked = settings.enabled;
        if (textEl) textEl.value = settings.text;
        if (speedEl) speedEl.value = settings.speed;
        if (colorEl) colorEl.value = settings.color;
        if (positionEl) positionEl.value = settings.position;

        updatePreview();
    }

    function bindSharabarEvents() {
        const textEl = document.getElementById('sharabarText');
        const speedEl = document.getElementById('sharabarSpeed');
        const positionEl = document.getElementById('sharabarPosition');

        if (textEl) {
            textEl.addEventListener('input', updatePreview);
        }
        if (speedEl) {
            speedEl.addEventListener('input', updatePreview);
        }
        if (positionEl) {
            positionEl.addEventListener('change', updatePreview);
        }
    }

    function updatePreview() {
        const preview = document.getElementById('sharabarPreview');
        const textEl = document.getElementById('sharabarText');
        const colorEl = document.getElementById('sharabarColor');

        if (!preview) return;

        const text = textEl ? textEl.value.trim() : '';
        const color = colorEl ? colorEl.value : '#C9A94E';

        preview.style.background = 'linear-gradient(90deg, ' + color + ', ' + color + 'DD)';
        preview.textContent = text ? '🎉 ' + text : '🎉 عرض خاص';
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: APIs عامة
    // ═══════════════════════════════════════════════════════════

    window.setSharabarColor = function(color) {
        const el = document.getElementById('sharabarColor');
        if (el) el.value = color;

        // تحديث الأزرار
        document.querySelectorAll('#sharabarSection button[onclick^="setSharabarColor"]').forEach(function(btn) {
            const btnColor = btn.style.background;
            const isActive = btnColor === color || rgbToHex(btnColor) === color.toLowerCase();
            btn.style.borderColor = isActive ? color : '#3D3D3D';
        });

        updatePreview();
    };

    function rgbToHex(rgb) {
        if (!rgb || rgb.indexOf('rgb') === -1) return rgb;
        const parts = rgb.match(/\d+/g);
        if (!parts || parts.length < 3) return rgb;
        return '#' + parts.slice(0, 3).map(function(x) {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    window.saveSharabarSettings = function() {
        const enabledEl = document.getElementById('sharabarEnabled');
        const textEl = document.getElementById('sharabarText');
        const speedEl = document.getElementById('sharabarSpeed');
        const colorEl = document.getElementById('sharabarColor');
        const positionEl = document.getElementById('sharabarPosition');

        const settings = {
            enabled: enabledEl ? enabledEl.checked : false,
            text: textEl ? textEl.value.trim() : '',
            speed: speedEl ? parseInt(speedEl.value) : 30,
            color: colorEl ? colorEl.value : '#C9A94E',
            position: positionEl ? positionEl.value : 'top'
        };

        if (settings.enabled && !settings.text) {
            window.showToast('⚠️ أدخل نص الإعلان أولاً', 'error');
            return;
        }

        saveSettings(settings);
        renderSharabar();

        window.showToast('✅ تم حفظ الإعدادات', 'success');
    };

    window.previewSharabar = function() {
        const textEl = document.getElementById('sharabarText');
        const text = textEl ? textEl.value.trim() : '';

        if (!text) {
            window.showToast('⚠️ أدخل نص الإعلان', 'warning');
            return;
        }

        // عرض مؤقت
        const tempSettings = {
            enabled: true,
            text: text,
            speed: 30,
            color: (document.getElementById('sharabarColor') || {}).value || '#C9A94E',
            position: (document.getElementById('sharabarPosition') || {}).value || 'top'
        };

        const oldSettings = getSettings();
        saveSettings(tempSettings);
        renderSharabar();

        window.showToast('👁️ معاينة لمدة 5 ثواني', 'info');

        // رجوع بعد 5 ثواني
        setTimeout(function() {
            saveSettings(oldSettings);
            renderSharabar();
        }, 5000);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: ربط مع Firebase
    // ═══════════════════════════════════════════════════════════

    function loadFromCompanyData() {
        if (!window.companyData) return;

        if (window.companyData.sharabar) {
            const cloudSettings = window.companyData.sharabar;
            const localSettings = getSettings();

            // لو الإعدادات السحابية أحدث
            if (cloudSettings.text && cloudSettings.text !== localSettings.text) {
                localStorage.setItem(SHARABAR_KEY, JSON.stringify(cloudSettings));
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: التهيئة
    // ═══════════════════════════════════════════════════════════

    function init() {
        injectCSS();
        loadFromCompanyData();
        renderSharabar();

        // إضافة قسم الإعدادات
        setTimeout(function() {
            addSharabarSection();
        }, 2500);

        console.log('✅ sharabar.js جاهز');
    }

    // نبدأ فوراً
    init();

    // نعيد المحاولة (لو الصفحة لسه ما اتحملتش)
    setTimeout(addSharabarSection, 3500);
    setTimeout(addSharabarSection, 5000);

    // ربط الأحداث
    if (window.EventBus) {
        window.EventBus.on('data:companyData:changed', function() {
            loadFromCompanyData();
            renderSharabar();

            // تحديث الحقول
            const section = document.getElementById('sharabarSection');
            if (section) updateSharabarInputs();
        });

        window.EventBus.on('page:navigated', function(page) {
            if (page === 'settings') {
                setTimeout(addSharabarSection, 200);
            }
        });
    }

    window.Sharabar = {
        get: getSettings,
        save: saveSettings,
        render: renderSharabar,
        show: function() {
            addSharabarSection();
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('settings');
            }
        }
    };

    window.__sharabarLoaded = true;
    console.log('✅ sharabar.js v1.0 جاهز');

})();
