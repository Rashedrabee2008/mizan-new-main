/* ============================================================
   sharabar.js - إدارة الإعلانات (الإصدار 6.0 - حركة ناعمة)
   ============================================================ */

(function() {
    'use strict';

    const DEFAULT_ADS = [
        { text: "🎉 السلام عليكم ورحمة الله وبركاته 🎉", icon: "⭐", link: "" }
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
        return parseInt(localStorage.getItem(SPEED_KEY)) || 15;
    }

    function saveAds(ads) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
        restartAdBar();
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
            justify-content: center;
            z-index: 999999;
            overflow: hidden;
            font-family: 'Tajawal', sans-serif;
            font-weight: 800;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            padding: 0 40px;
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
            transition: opacity 0.3s ease;
            width: 100%;
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

        if (mode === 'marquee') {
            startMarquee(content, ads);
        } else {
            startStatic(content, ads);
        }
    }

    // ═══════════════ وضع التحريك (Marquee) الناعم ═══════════════
    function startMarquee(container, ads) {
        if (rotationTimer) clearInterval(rotationTimer);

        let adIndex = 0;
        const speed = getSpeed();

        function showNextAd() {
            const ad = ads[adIndex];
            if (!ad) return;

            // تكرار النص مرتين ورا بعض عشان الحركة تبقى ناعمة ومستمرة
            const icon = ad.icon || '⭐';
            const text = ad.text;
            
            // بنكرر النص مرتين عشان ميبقاش فيه فراغ في الآخر
            const repeatedText = `
                <span style="font-size:18px;">${icon}</span>
                <span class="ad-marquee-text">${text}</span>
                <span style="font-size:18px;">${icon}</span>
                <span style="display:inline-block; width: 50px;"></span>
                <span style="font-size:18px;">${icon}</span>
                <span class="ad-marquee-text">${text}</span>
                <span style="font-size:18px;">${icon}</span>
            `;

            container.innerHTML = repeatedText;

            // إعداد الرابط
            const bar = document.getElementById('sharabar');
            if (ad.link) {
                bar.style.cursor = 'pointer';
                bar.onclick = (e) => {
                    if (e.target.tagName !== 'BUTTON') window.open(ad.link, '_blank');
                };
            } else {
                bar.style.cursor = 'default';
                bar.onclick = null;
            }

            // تحريك النص
            const textEls = container.querySelectorAll('.ad-marquee-text');
            textEls.forEach(el => {
                el.style.display = 'inline-block';
                el.style.whiteSpace = 'nowrap';
                el.style.animation = 'none';
                void el.offsetWidth;
                el.style.animation = `marquee ${speed}s linear infinite`;
            });

            adIndex = (adIndex + 1) % ads.length;
        }

        showNextAd();

        if (ads.length > 1) {
            rotationTimer = setInterval(showNextAd, speed * 1000);
        }
    }

    // ═══════════════ الوضع الثابت ═══════════════
    function startStatic(container, ads) {
        if (rotationTimer) clearInterval(rotationTimer);

        let adIndex = 0;
        function showNextAd() {
            const ad = ads[adIndex];
            if (!ad) return;

            container.innerHTML = `
                <span style="font-size:18px;">${ad.icon || '⭐'}</span>
                <span>${ad.text}</span>
                <span style="font-size:18px;">${ad.icon || '⭐'}</span>
            `;

            const bar = document.getElementById('sharabar');
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
        const container = document.getElementById('sharabarContainer');
        if (container) container.innerHTML = '';
        if (rotationTimer) clearInterval(rotationTimer);
        localStorage.removeItem(CLOSED_KEY);
        createAdBar();
    }

    window.addNewAd = function() {
        const text = document.getElementById('newAdText')?.value.trim();
        const icon = document.getElementById('newAdIcon')?.value.trim() || '⭐';
        const link = document.getElementById('newAdLink')?.value.trim() || '';

        if (!text) {
            alert('⚠️ اكتب نص الإعلان الأول!');
            return;
        }

        const ads = getAds();
        ads.push({ text, icon, link });
        saveAds(ads);

        document.getElementById('newAdText').value = '';
        document.getElementById('newAdLink').value = '';
        
        if (typeof renderAdsList === 'function') renderAdsList();
        alert('✅ تم إضافة الإعلان بنجاح!');
    };

    window.deleteAd = function(index) {
        if (!confirm('⚠️ هل أنت متأكد من حذف الإعلان ده؟')) return;
        const ads = getAds();
        ads.splice(index, 1);
        saveAds(ads);
        if (typeof renderAdsList === 'function') renderAdsList();
    };

    window.renderAdsList = function() {
        const container = document.getElementById('adsListContainer');
        if (!container) return;

        const ads = getAds();
        if (ads.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#A89070;font-size:12px;padding:10px;">لا توجد إعلانات</div>';
            return;
        }

        container.innerHTML = ads.map((ad, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;background:#1C1C1C;padding:8px 12px;border-radius:8px;margin-bottom:6px;border:1px solid #3D3D3D;">
                <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#F5E6C8;flex:1;min-width:0;">
                    <span>${ad.icon || '⭐'}</span>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ad.text}</span>
                </div>
                <button onclick="deleteAd(${i})" style="background:#E06060;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:800;">✕</button>
            </div>
        `).join('');
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

    // ═══════════════ إضافة CSS للأنيميشن الناعم ═══════════════
    function addAnimationStyles() {
        if (document.getElementById('sharabarStyles')) return;
        const style = document.createElement('style');
        style.id = 'sharabarStyles';
        style.textContent = `
            @keyframes marquee {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(0%); }
            }
            .ad-marquee-text {
                display: inline-block;
                white-space: nowrap;
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
