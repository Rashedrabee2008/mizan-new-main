// ============================================================
// الميزان Pro - themes.js v2.0 (معدل عشان ميمسحش اللوجو)
// ============================================================

(function() {
    'use strict';

    console.log('🎨 themes.js v2.0 - بدء التحميل');

    const THEMES = {
        'gold': {
            name: 'ذهبي', icon: '⭐',
            colors: { primary: '#C9A94E', primaryDark: '#B8953A', primaryLight: '#E6C570', bg: '#0D0D0D', bg2: '#1C1C1C', bg3: '#2D2D2D', text: '#F5E6C8', textMuted: '#A89070', border: '#3D3D3D' }
        },
        'blue': {
            name: 'أزرق', icon: '💙',
            colors: { primary: '#3B82F6', primaryDark: '#2563EB', primaryLight: '#60A5FA', bg: '#0A1628', bg2: '#0F1F3A', bg3: '#1E3A5F', text: '#E0F2FE', textMuted: '#7DD3FC', border: '#1E3A5F' }
        },
        'green': {
            name: 'أخضر', icon: '💚',
            colors: { primary: '#10B981', primaryDark: '#059669', primaryLight: '#34D399', bg: '#062019', bg2: '#0A2D22', bg3: '#0F3D2E', text: '#D1FAE5', textMuted: '#6EE7B7', border: '#0F3D2E' }
        },
        'purple': {
            name: 'بنفسجي', icon: '💜',
            colors: { primary: '#8B5CF6', primaryDark: '#7C3AED', primaryLight: '#A78BFA', bg: '#1A0D2E', bg2: '#241340', bg3: '#321A54', text: '#EDE9FE', textMuted: '#C4B5FD', border: '#321A54' }
        },
        'red': {
            name: 'أحمر', icon: '❤️',
            colors: { primary: '#EF4444', primaryDark: '#DC2626', primaryLight: '#F87171', bg: '#2A0D0D', bg2: '#3A1212', bg3: '#4F1818', text: '#FEE2E2', textMuted: '#FCA5A5', border: '#4F1818' }
        },
        'orange': {
            name: 'برتقالي', icon: '🧡',
            colors: { primary: '#F97316', primaryDark: '#EA580C', primaryLight: '#FB923C', bg: '#2A1200', bg2: '#3D1A00', bg3: '#552400', text: '#FED7AA', textMuted: '#FDBA74', border: '#552400' }
        }
    };

    const THEME_KEY = 'mizan_theme_v1';

    function applyTheme(themeId) {
        if (!THEMES[themeId]) themeId = 'gold';
        const theme = THEMES[themeId];
        const root = document.documentElement;

        root.style.setProperty('--primary', theme.colors.primary);
        root.style.setProperty('--primary-dark', theme.colors.primaryDark);
        root.style.setProperty('--primary-light', theme.colors.primaryLight);
        root.style.setProperty('--bg', theme.colors.bg);
        root.style.setProperty('--bg-2', theme.colors.bg2);
        root.style.setProperty('--bg-3', theme.colors.bg3);
        root.style.setProperty('--text', theme.colors.text);
        root.style.setProperty('--text-muted', theme.colors.textMuted);
        root.style.setProperty('--border', theme.colors.border);

        try { localStorage.setItem(THEME_KEY, themeId); } catch (e) {}

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', theme.colors.bg);
    }

    function getCurrentTheme() {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            return saved && THEMES[saved] ? saved : 'gold';
        } catch (e) { return 'gold'; }
    }

    function renderThemesList() {
        const currentTheme = getCurrentTheme();
        let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px;">';

        Object.keys(THEMES).forEach(function(themeId) {
            const theme = THEMES[themeId];
            const isActive = themeId === currentTheme;

            html += `
                <div onclick="changeTheme('${themeId}')" 
                     style="position:relative; background:linear-gradient(135deg,${theme.colors.primary},${theme.colors.primaryDark}); border-radius:12px; padding:14px 8px; text-align:center; cursor:pointer; border:3px solid ${isActive ? '#fff' : 'transparent'}; transition:all 0.2s; box-shadow:${isActive ? '0 0 20px rgba(255,255,255,0.3)' : 'none'};">
                    <div style="font-size:28px;margin-bottom:4px;">${theme.icon}</div>
                    <div style="font-size:12px; font-weight:900; color:#0D0D0D; text-shadow:0 1px 2px rgba(255,255,255,0.3);">${theme.name}</div>
                    ${isActive ? '<div style="position:absolute;top:4px;left:4px;background:#fff;color:#0D0D0D;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;">✓</div>' : ''}
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    window.changeTheme = function(themeId) {
        if (!THEMES[themeId]) return;
        applyTheme(themeId);

        const container = document.getElementById('themeSelector');
        if (container) container.innerHTML = renderThemesList();

        if (typeof window.showToast === 'function') {
            window.showToast('🎨 تم تغيير الثيم إلى ' + THEMES[themeId].name, 'success');
        }
    };

    function addThemeSection() {
        const settingsPage = document.getElementById('page-settings');
        if (!settingsPage) return;
        if (document.getElementById('themeSection')) return;

        const companySection = settingsPage.querySelector('.settings-section');
        if (!companySection) return;

        const section = document.createElement('div');
        section.className = 'settings-section';
        section.id = 'themeSection';
        section.innerHTML = `
            <h3>🎨 مظهر التطبيق</h3>
            <p class="settings-desc">اختر الثيم المناسب لك — يتغير فوراً</p>
            <div id="themeSelector">${renderThemesList()}</div>
            <div style="margin-top:14px;padding:10px;background:#0D0D0D;border-radius:10px;border-right:3px solid var(--primary);">
                <div style="font-size:11px;color:var(--text-muted);line-height:1.7;">
                    💡 <strong style="color:var(--primary);">ملاحظة:</strong> الثيم بيتحفظ على جهازك. لما تفتح التطبيق تاني، هيتطبق تلقائياً.
                </div>
            </div>
        `;

        companySection.parentNode.insertBefore(section, companySection.nextSibling);
    }

    function init() {
        applyTheme(getCurrentTheme());
        setTimeout(addThemeSection, 2000);
    }

    init();
    setTimeout(addThemeSection, 3000);

    window.Themes = {
        apply: applyTheme,
        current: getCurrentTheme,
        list: THEMES,
        render: renderThemesList,
        show: function() {
            addThemeSection();
            if (typeof window.navigateTo === 'function') window.navigateTo('settings');
        }
    };

    window.__themesLoaded = true;
    console.log('✅ themes.js v2.0 جاهز');

})();
