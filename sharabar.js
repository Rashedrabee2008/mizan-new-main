/* ============================================================
   sharabar.js - إدارة الإعلانات (v16.0)
   - إزالة زر الإغلاق (X) نهائياً
   - دعم تغيير الألوان للإعلانات
   ============================================================ */

(function() {
    'use strict';

    const DEFAULT_ADS = [
        { text: "🎉 السلام عليكم ورحمة الله وبركاته 🎉", icon: "⭐", link: "", color: "#1E3A8A" }
    ];

    const STORAGE_KEY = 'sharabar_ads';
    const MOTION_KEY = 'sharabar_motion';
    const SPEED_KEY = 'sharabar_speed';

    let rotationTimer = null;
    let currentBarElement = null;

    function getAds() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map(function(ad) {
                        return {
                            text: ad.text || '',
                            icon: ad.icon || '⭐',
                            link: ad.link || '',
                            color: ad.color || '#1E3A8A'
                        };
                    });
                }
            }
        } catch (e) {}
        return DEFAULT_ADS;
    }

    function getMotionMode() {
        return localStorage.getItem(MOTION_KEY) || 'marquee';
    }

    function getSpeed() {
        return parseInt(localStorage.getItem(SPEED_KEY)) || 20;
    }

    function saveAds(ads) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
        } catch (e) {}
    }

    function applyColorToBar(bar, color) {
        if (!bar || !color) return;
        const bgColor = color;
        bar.style.background = `linear-gradient(90deg, ${bgColor}, ${bgColor}dd, ${bgColor})`;
        bar.setAttribute('data-color', bgColor);
    }

    function createAdBar() {
        const container = document.getElementById('sharabarContainer');
        if (!container) return;

        container.innerHTML = '';

        const ads = getAds();
        if (ads.length === 0) return;

        const mode = getMotionMode();
        const firstAd = ads[0];
        const bgColor = firstAd.color || '#1E3A8A';

        const bar = document.createElement('div');
        bar.id = 'sharabar';
        bar.setAttribute('data-color', bgColor);
        bar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 45px;
            background: linear-gradient(90deg, ${bgColor}, ${bgColor}dd, ${bgColor});
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            z-index: 999999;
            overflow: hidden;
            font-family: 'Tajawal', sans-serif;
            font-weight: 800;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            padding: 0 20px;
            box-sizing: border-box;
            transition: background 0.6s ease;
        `;

        const content = document.createElement('div');
        content.id = 'sharabarContent';
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            white-space: nowrap;
            direction: rtl;
            width: max-content;
            will-change: transform;
        `;

        // ⚡ إضافة المحتوى فقط بدون زر إغلاق
        bar.appendChild(content);
        container.appendChild(bar);

        currentBarElement = bar;

        document.body.style.paddingTop = '50px';

        if (mode === 'marquee') {
            startMarquee(content, ads, bar);
        } else {
            startStatic(content, ads, bar);
        }
    }

    function startMarquee(container, ads, bar) {
        if (rotationTimer) clearInterval(rotationTimer);

        let adIndex = 0;
        const speedSeconds = getSpeed();

        function showNextAd() {
            const ad = ads[adIndex];
            if (!ad) return;

            applyColorToBar(bar, ad.color || '#1E3A8A');

            const icon = ad.icon || '⭐';
            const text = ad.text;

            let repeatedContent = '';
            for (let i = 0; i < 4; i++) {
                repeatedContent += `
                    <span style="font-size:18px;">${icon}</span>
                    <span style="padding: 0 15px;">${text}</span>
                    <span style="font-size:18px;">${icon}</span>
                    <span style="display:inline-block; width: 100px;"></span>
                `;
            }
            container.innerHTML = repeatedContent;

            if (ad.link) {
                bar.style.cursor = 'pointer';
                bar.onclick = function() {
                    window.open(ad.link, '_blank');
                };
            } else {
                bar.style.cursor = 'default';
                bar.onclick = null;
            }

            container.style.animation = 'none';
            void container.offsetWidth;
            container.style.animation = `marqueeScrollLTR ${speedSeconds}s linear infinite`;

            adIndex = (adIndex + 1) % ads.length;
        }

        showNextAd();

        if (ads.length > 1) {
            rotationTimer = setInterval(showNextAd, speedSeconds * 1000);
        }
    }

    function startStatic(container, ads, bar) {
        if (rotationTimer) clearInterval(rotationTimer);

        let adIndex = 0;
        function showNextAd() {
            const ad = ads[adIndex];
            if (!ad) return;

            applyColorToBar(bar, ad.color || '#1E3A8A');

            container.style.animation = 'none';
            container.innerHTML = `
                <span style="font-size:18px;">${ad.icon || '⭐'}</span>
                <span>${ad.text}</span>
                <span style="font-size:18px;">${ad.icon || '⭐'}</span>
            `;

            if (ad.link) {
                bar.style.cursor = 'pointer';
                bar.onclick = function() {
                    window.open(ad.link, '_blank');
                };
            } else {
                bar.style.cursor = 'default';
                bar.onclick = null;
            }

            adIndex = (adIndex + 1) % ads.length;
        }

        showNextAd();

        if (ads.length > 1) {
            rotationTimer = setInterval(showNextAd, 8000);
        }
    }

    // ⚡ إعادة بناء فورية للشريط
    function restartAdBar() {
        if (rotationTimer) {
            clearInterval(rotationTimer);
            rotationTimer = null;
        }

        const container = document.getElementById('sharabarContainer');
        if (container) container.innerHTML = '';

        currentBarElement = null;
        createAdBar();
    }

    // ═══════════════ الإضافة ═══════════════

    window.addNewAd = function() {
        const textEl = document.getElementById('newAdText');
        const iconEl = document.getElementById('newAdIcon');
        const linkEl = document.getElementById('newAdLink');
        const colorEl = document.getElementById('newAdColor');

        const text = textEl ? textEl.value.trim() : '';
        const icon = iconEl ? iconEl.value.trim() : '⭐';
        const link = linkEl ? linkEl.value.trim() : '';
        const color = colorEl ? colorEl.value : '#1E3A8A';

        if (!text) {
            alert('⚠️ اكتب نص الإعلان الأول!');
            return;
        }

        const finalColor = (color && color !== '') ? color : '#1E3A8A';

        const ads = getAds();
        ads.unshift({
            text: text,
            icon: icon || '⭐',
            link: link || '',
            color: finalColor
        });

        saveAds(ads);
        restartAdBar();

        if (typeof window.renderAdsList === 'function') {
            window.renderAdsList();
        }

        if (textEl) textEl.value = '';
        if (linkEl) linkEl.value = '';
        if (colorEl) colorEl.value = '#1E3A8A';

        if (typeof window.showToast === 'function') {
            window.showToast('✅ تم إضافة الإعلان', 'success');
        }
    };

    window.deleteAd = function(index) {
        if (!confirm('⚠️ حذف الإعلان ده؟')) return;
        const ads = getAds();
        ads.splice(index, 1);
        saveAds(ads);
        restartAdBar();
        if (typeof window.renderAdsList === 'function') {
            window.renderAdsList();
        }
    };

    window.renderAdsList = function() {
        const container = document.getElementById('adsListContainer');
        if (!container) return;

        const ads = getAds();
        if (ads.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#A89070;font-size:12px;padding:10px;">لا توجد إعلانات</div>';
            return;
        }

        container.innerHTML = ads.map(function(ad, i) {
            const bgColor = ad.color || '#1E3A8A';
            return '<div style="display:flex;justify-content:space-between;align-items:center;background:#1C1C1C;padding:10px 12px;border-radius:8px;margin-bottom:6px;border:1px solid #3D3D3D;border-right:4px solid ' + bgColor + ';">' +
                '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#F5E6C8;flex:1;min-width:0;">' +
                    '<span style="width:22px;height:22px;border-radius:6px;background:' + bgColor + ';border:1px solid #3D3D3D;flex-shrink:0;"></span>' +
                    '<span>' + (ad.icon || '⭐') + '</span>' +
                    '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + ad.text + '</span>' +
                '</div>' +
                '<button onclick="deleteAd(' + i + ')" style="background:#E06060;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:800;">✕</button>' +
            '</div>';
        }).join('');
    };

    window.toggleAdMotion = function() {
        const mode = getMotionMode();
        const newMode = mode === 'marquee' ? 'static' : 'marquee';
        localStorage.setItem(MOTION_KEY, newMode);
        restartAdBar();
        if (typeof window.showToast === 'function') {
            window.showToast(newMode === 'marquee' ? '✅ تم تفعيل التحريك' : '✅ تم إيقاف التحريك', 'info');
        }
    };

    window.setAdSpeed = function(seconds) {
        localStorage.setItem(SPEED_KEY, seconds);
        restartAdBar();
    };

    function addAnimationStyles() {
        if (document.getElementById('sharabarStyles')) return;
        const style = document.createElement('style');
        style.id = 'sharabarStyles';
        style.textContent = '@keyframes marqueeScrollLTR { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } }';
        document.head.appendChild(style);
    }

    function init() {
        addAnimationStyles();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                createAdBar();
                if (typeof window.renderAdsList === 'function') window.renderAdsList();
            });
        } else {
            createAdBar();
            if (typeof window.renderAdsList === 'function') window.renderAdsList();
        }
    }

    init();

    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY) {
            restartAdBar();
            if (typeof window.renderAdsList === 'function') window.renderAdsList();
        }
    });

})();
