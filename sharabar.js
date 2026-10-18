/* ============================================================
   sharabar.js - إدارة الإعلانات (v19.0 - إصلاح شامل)
   🔧 حركة مضمونة + بدون أزرار إغلاق + لون ثابت
   ============================================================ */

(function() {
    'use strict';

    const DEFAULT_ADS = [
        { text: "🎉 السلام عليكم ورحمة الله وبركاته 🎉", icon: "⭐", link: "" }
    ];

    const STORAGE_KEY = 'sharabar_ads_v2';
    const MOTION_KEY = 'sharabar_motion';
    const SPEED_KEY = 'sharabar_speed';

    let rotationTimer = null;

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
                            link: ad.link || ''
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

    function addAnimationStyles() {
        if (document.getElementById('sharabarStyles')) return;
        const style = document.createElement('style');
        style.id = 'sharabarStyles';
        style.textContent = `
            @keyframes marqueeScrollLTR {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0%); }
            }
            .sharabar-animated {
                animation: marqueeScrollLTR linear infinite;
            }
        `;
        document.head.appendChild(style);
    }

    function createAdBar() {
        const container = document.getElementById('sharabarContainer');
        if (!container) return;

        container.innerHTML = '';

        const ads = getAds();
        if (ads.length === 0) return;

        const mode = getMotionMode();

        const bar = document.createElement('div');
        bar.id = 'sharabar';

        bar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 45px;
            background: linear-gradient(90deg, #1E3A8A, #3B82F6, #1E3A8A);
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
        `;

        bar.appendChild(content);
        container.appendChild(bar);

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
                bar.onclick = function() { window.open(ad.link, '_blank'); };
            } else {
                bar.style.cursor = 'default';
                bar.onclick = null;
            }

            container.classList.remove('sharabar-animated');
            void container.offsetWidth;
            container.style.animationDuration = speedSeconds + 's';
            container.classList.add('sharabar-animated');

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

            container.classList.remove('sharabar-animated');
            container.innerHTML = `
                <span style="font-size:18px;">${ad.icon || '⭐'}</span>
                <span>${ad.text}</span>
                <span style="font-size:18px;">${ad.icon || '⭐'}</span>
            `;

            if (ad.link) {
                bar.style.cursor = 'pointer';
                bar.onclick = function() { window.open(ad.link, '_blank'); };
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

    function restartAdBar() {
        if (rotationTimer) {
            clearInterval(rotationTimer);
            rotationTimer = null;
        }

        const container = document.getElementById('sharabarContainer');
        if (container) container.innerHTML = '';

        setTimeout(createAdBar, 50);
    }

    // ═══════════════ الإضافة ═══════════════

    window.addNewAd = function() {
        const textEl = document.getElementById('newAdText');
        const iconEl = document.getElementById('newAdIcon');
        const linkEl = document.getElementById('newAdLink');

        const text = textEl ? textEl.value.trim() : '';
        const icon = iconEl ? iconEl.value.trim() : '⭐';
        const link = linkEl ? linkEl.value.trim() : '';

        if (!text) {
            alert('⚠️ اكتب نص الإعلان الأول!');
            return;
        }

        const ads = getAds();
        ads.unshift({
            text: text,
            icon: icon || '⭐',
            link: link || ''
        });

        saveAds(ads);
        restartAdBar();

        if (typeof window.renderAdsList === 'function') {
            window.renderAdsList();
        }

        if (textEl) textEl.value = '';
        if (linkEl) linkEl.value = '';

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
            return '<div style="display:flex;justify-content:space-between;align-items:center;background:#1C1C1C;padding:10px 12px;border-radius:8px;margin-bottom:6px;border:1px solid #3D3D3D;border-right:4px solid #3B82F6;">' +
                '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#F5E6C8;flex:1;min-width:0;">' +
                    '<span>' + (ad.icon || '⭐') + '</span>' +
                    '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + window.escapeHtml(ad.text) + '</span>' +
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
        if (e.key === STORAGE_KEY || e.key === MOTION_KEY) {
            restartAdBar();
            if (typeof window.renderAdsList === 'function') window.renderAdsList();
        }
    });

    console.log('✅ sharabar.js v19.0 جاهز');

})();
