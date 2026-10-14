/* ============================================================
   sharabar.js - إدارة الإعلانات الديناميكية
   الإصدار: 3.0
   ============================================================ */

(function() {
    'use strict';

    // ═══════════════ الإعدادات الافتراضية ═══════════════
    const DEFAULT_ADS = [
        { text: "🎉 السلام عليكم ورحمة الله وبركاته 🎉", icon: "⭐", link: "" }
    ];
    
    const STORAGE_KEY = 'sharabar_ads';
    const CLOSED_KEY = 'sharabar_closed';
    const ROTATE_INTERVAL = 8; // ثواني

    let currentAdIndex = 0;
    let rotationTimer = null;

    // ═══════════════ جلب الإعلانات ═══════════════
    function getAds() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('⚠️ خطأ في قراءة الإعلانات:', e);
        }
        return DEFAULT_ADS;
    }

    // ═══════════════ حفظ الإعلانات ═══════════════
    function saveAds(ads) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
        // إعادة تشغيل الشريط عشان يعرض الإعلانات الجديدة
        restartAdBar();
    }

    // ═══════════════ إنشاء الشريط ═══════════════
    function createAdBar() {
        // لو الشريط موجود، منعملش حاجة
        if (document.getElementById('sharabar')) return;

        const ads = getAds();
        if (ads.length === 0) return; // مفيش إعلانات

        // إنشاء العنصر
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
            transition: top 0.3s ease, opacity 0.3s ease;
        `;

        // محتوى الشريط
        const content = document.createElement('div');
        content.id = 'sharabarContent';
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            white-space: nowrap;
            direction: rtl;
            transition: opacity 0.3s ease, transform 0.3s ease;
        `;

        // زرار الإغلاق
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
        document.body.prepend(bar);

        // ضبط المسافة
        document.body.style.paddingTop = '50px';

        // بدء تبديل الإعلانات
        startAdRotation(content, ads);
    }

    // ═══════════════ تبديل الإعلانات ═══════════════
    function startAdRotation(container, ads) {
        // عرض أول إعلان
        displayAd(container, 0, ads);

        // إيقاف أي مؤقت قديم
        if (rotationTimer) clearInterval(rotationTimer);

        // لو فيه أكتر من إعلان، نبدل بينهم
        if (ads.length > 1) {
            rotationTimer = setInterval(() => {
                currentAdIndex = (currentAdIndex + 1) % ads.length;
                displayAd(container, currentAdIndex, ads);
            }, ROTATE_INTERVAL * 1000);
        }
    }

    function displayAd(container, index, ads) {
        const ad = ads[index];
        if (!ad) return;

        // تأثير الاختفاء والظهور
        container.style.opacity = '0';
        container.style.transform = 'translateY(-5px)';
        
        setTimeout(() => {
            container.innerHTML = `
                <span style="font-size:18px;">${ad.icon || '⭐'}</span>
                <span>${ad.text}</span>
                <span style="font-size:18px;">${ad.icon || '⭐'}</span>
            `;
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
            
            // لو فيه رابط
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
        }, 300);
    }

    // ═══════════════ إغلاق الشريط ═══════════════
    function closeAdBar() {
        const bar = document.getElementById('sharabar');
        if (!bar) return;

        bar.style.top = '-50px';
        bar.style.opacity = '0';
        localStorage.setItem(CLOSED_KEY, 'true');
        
        setTimeout(() => {
            bar.style.display = 'none';
            document.body.style.paddingTop = '0';
        }, 300);

        if (rotationTimer) {
            clearInterval(rotationTimer);
            rotationTimer = null;
        }
    }

    // ═══════════════ إعادة تشغيل الشريط ═══════════════
    function restartAdBar() {
        const oldBar = document.getElementById('sharabar');
        if (oldBar) oldBar.remove();
        if (rotationTimer) clearInterval(rotationTimer);
        
        // مسح حالة الإغلاق عشان يظهر بالإعلانات الجديدة
        localStorage.removeItem(CLOSED_KEY);
        
        createAdBar();
    }

    // ═══════════════ دوال مساعدة للـ UI ═══════════════
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

        // تفريغ الحقول
        document.getElementById('newAdText').value = '';
        document.getElementById('newAdLink').value = '';
        
        // تحديث القائمة
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

    // ═══════════════ التهيئة ═══════════════
    function init() {
        // لو المستخدم قفل الإعلان
        if (localStorage.getItem(CLOSED_KEY) === 'true') return;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createAdBar);
        } else {
            createAdBar();
        }
    }

    init();

})();
