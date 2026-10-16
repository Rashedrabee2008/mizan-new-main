/* ============================================================
   sharabar.js - إدارة الإعلانات (الإصدار 14.0 - نهائي)
   - لون مخصص لكل إعلان يعمل بشكل صحيح
   - حفظ فوري + إعادة بناء الشريط
   ============================================================ */

(function() {
    'use strict';

    const DEFAULT_ADS = [
        { text: "🎉 السلام عليكم ورحمة الله وبركاته 🎉", icon: "⭐", link: "", color: "#1E3A8A" }
    ];

    const STORAGE_KEY = 'sharabar_ads';
    const CLOSED_KEY = 'sharabar_closed';
    const MOTION_KEY = 'sharabar_motion';
    const SPEED_KEY = 'sharabar_speed';

    let rotationTimer = null;

    function getAds() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
        restartAdBar();
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
            padding: 0 40px;
            box-sizing: border-box;
            transition: background 0.5s ease;
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

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255,255,255,0.2);
            border: none;
            color: #fff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
            z-index: 10;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255,255,255,0.4)';
        closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255,255,255,0.2)';
        closeBtn.onclick = closeAdBar;

        bar.appendChild(content);
        bar.appendChild(closeBtn);
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

            // ⚡ تحديث اللون لكل إعلان
            const bgColor = ad.color || '#1E3A8A';
            bar.style.background = `linear-gradient(90deg, ${bgColor}, ${bgColor}dd, ${bgColor})`;
            bar.setAttribute('data-color', bgColor);

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
                bar.onclick = (e) => {
                    if (e.target.tagName !== 'BUTTON') window.open(ad.link, '_blank');
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

            // ⚡ تحديث اللون
            const bgColor = ad.color || '#1E3A8A';
            bar.style.background = `linear-gradient(90deg, ${bgColor}, ${bgColor}dd, ${bgColor})`;
            bar.setAttribute('data-color', bgColor);

            container.style.animation = 'none';
            container.innerHTML = `
                <span style="font-size:18px;">${ad.icon || '⭐'}</span>
                <span>${ad.text}</span>
                <span style="font-size:18px;">${ad.icon || '⭐'}</span>
            `;

            if (ad.link) {
                bar.style.cursor = 'pointer';
                bar.onclick = (e) => {
                    if (e.target.tagName !== 'BUTTON') window.open(ad.link, '_blank');
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

    function closeAdBar() {
        const bar = document.getElementById('sharabar');
        if (!bar) return;

        bar.style.display = 'none';
        localStorage.setItem(CLOSED_KEY, 'true');

        if (rotationTimer) clearInterval(rotationTimer);
    }

    function restartAdBar() {
        if (rotationTimer) {
            clearInterval(rotationTimer);
            rotationTimer = null;
        }

        const container = document.getElementById('sharabarContainer');
        if (container) container.innerHTML = '';

        localStorage.removeItem(CLOSED_KEY);

        setTimeout(function() {
            createAdBar();
        }, 50);
    }

    // ═══════════════ إدارة الإعلانات ═══════════════

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
        ads.push({
            text: text,
            icon: icon || '⭐',
            link: link || '',
            color: finalColor
        });

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
        } catch (e) {
            alert('⚠️ فشل الحفظ');
            return;
        }

        // ⚡ إعادة بناء الشريط
        restartAdBar();

        // ⚡ مسح الحقول
        if (textEl) textEl.value = '';
        if (linkEl) linkEl.value = '';
        if (colorEl) colorEl.value = '#1E3A8A';

        if (typeof window.renderAdsList === 'function') window.renderAdsList();

        alert('✅ تم إضافة الإعلان بنجاح!');
    };

    window.deleteAd = function(index) {
        if (!confirm('⚠️ هل أنت متأكد من حذف الإعلان ده؟')) return;
        const ads = getAds();
        ads.splice(index, 1);
        saveAds(ads);
        if (typeof window.renderAdsList === 'function') window.renderAdsList();
    };

    window.renderAdsList = function() {
        const container = document.getElementById('adsListContainer');
        if (!container) return;

        const ads = getAds();
        if (ads.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#A89070;font-size:12px;padding:10px;">لا توجد إعلانات</div>';
            return;
        }

        container.innerHTML = ads.map((ad, i) => {
            const bgColor = ad.color || '#1E3A8A';
            return `
            <div style="display:flex;justify-content:space-between;align-items:center;background:#1C1C1C;padding:10px 12px;border-radius:8px;margin-bottom:6px;border:1px solid #3D3D3D;border-right:4px solid ${bgColor};">
                <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#F5E6C8;flex:1;min-width:0;">
                    <span>${ad.icon || '⭐'}</span>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ad.text}</span>
                    <span style="width:20px;height:20px;border-radius:4px;background:${bgColor};border:1px solid #3D3D3D;flex-shrink:0;"></span>
                </div>
                <button onclick="deleteAd(${i})" style="background:#E06060;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:800;">✕</button>
            </div>
            `;
        }).join('');
    };

    window.toggleAdMotion = function() {
        const mode = getMotionMode();
        const newMode = mode === 'marquee' ? 'static' : 'marquee';
        localStorage.setItem(MOTION_KEY, newMode);
        restartAdBar();
        alert(newMode === 'marquee' ? '✅ تم تفعيل التحريك' : '✅ تم إيقاف التحريك (ثابت)');
    };

    window.setAdSpeed = function(seconds) {
        localStorage.setItem(SPEED_KEY, seconds);
        restartAdBar();
    };

    function addAnimationStyles() {
        if (document.getElementById('sharabarStyles')) return;
        const style = document.createElement('style');
        style.id = 'sharabarStyles';
        style.textContent = `
            @keyframes marqueeScrollLTR {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0%); }
            }
        `;
        document.head.appendChild(style);
    }

    function init() {
        if (localStorage.getItem(CLOSED_KEY) === 'true') return;

        addAnimationStyles();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                createAdBar();
                if (typeof window.renderAdsList === 'function') window.renderAdsList();
            });
        } else {
            createAdBar();
            if (typeof window.renderAdsList === 'function') window.renderAdsList();
        }
    }

    init();

})();
