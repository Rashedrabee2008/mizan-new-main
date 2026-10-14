/* ============================================================
   sharabar.js - إدارة الإعلانات (الشريط الإعلاني)
   الإصدار: 2.0
   المميزات:
   - حركة الشريط من الشمال لليمين (عشان النص يبان مظبوط)
   - تبديل تلقائي بين الإعلانات
   - إمكانية إغلاق الإعلان
   - حفظ حالة الإغلاق في localStorage
   ============================================================ */

(function() {
    'use strict';

    // ═══════════════ إعدادات الإعلان ═══════════════
    const AD_CONFIG = {
        // سرعة الحركة (كل ما الرقم يقل، الحركة تبقى أسرع)
        speed: 25, 
        // مدة ظهور كل إعلان قبل ما يتغير (بالثواني)
        rotateInterval: 8,
        // هل الإعلان يتحرك من الشمال لليمين؟ (true = من الشمال لليمين)
        directionLTR: true,
        // قائمة الإعلانات
        ads: [
            {
                text: "🎉 السلام عليكم ورحمة الله وبركاته 🎉",
                icon: "⭐",
                link: "" // يمكن وضع رابط هنا
            },
            {
                text: "🚀 خصم 10% على جميع المنتجات لفترة محدودة!",
                icon: "🔥",
                link: "#"
            },
            {
                text: "📞 للاستفسار: 01000000000",
                icon: "📱",
                link: ""
            }
        ]
    };

    // ═══════════════ إنشاء شريط الإعلان ═══════════════
    function createAdBar() {
        // لو الشريط موجود بالفعل، متعملش حاجة
        if (document.getElementById('sharabar')) return;

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
            direction: ${AD_CONFIG.directionLTR ? 'ltr' : 'rtl'};
            padding: 0 40px 0 40px;
            box-sizing: border-box;
            transition: top 0.3s ease;
        `;

        // محتوى الشريط (النص + الأيقونات)
        const content = document.createElement('div');
        content.id = 'sharabarContent';
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            white-space: nowrap;
            animation: slideInLTR 1s ease-out;
            direction: rtl; /* النص العربي يفضل مظبوط */
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

        // إضافة العناصر
        bar.appendChild(content);
        bar.appendChild(closeBtn);

        // إضافة الشريط لأول الصفحة
        document.body.prepend(bar);

        // إضافة الـ CSS للأنيميشن (لو مش موجود)
        addAnimationStyles();

        // بدء تبديل الإعلانات
        startAdRotation(content);

        // ضبط باقي الصفحة عشان الشريط ميبقاش فوق المحتوى
        adjustPagePadding();
    }

    // ═══════════════ إضافة أنماط الأنيميشن ═══════════════
    function addAnimationStyles() {
        if (document.getElementById('sharabarStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'sharabarStyles';
        style.textContent = `
            @keyframes slideInLTR {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideInRTL {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            #sharabar {
                animation: slideInLTR 0.8s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    // ═══════════════ تبديل الإعلانات ═══════════════
    let currentAdIndex = 0;
    let rotationTimer = null;

    function startAdRotation(container) {
        // عرض أول إعلان
        displayAd(container, currentAdIndex);

        // تبديل الإعلانات كل فترة
        if (AD_CONFIG.ads.length > 1) {
            rotationTimer = setInterval(() => {
                currentAdIndex = (currentAdIndex + 1) % AD_CONFIG.ads.length;
                displayAd(container, currentAdIndex);
            }, AD_CONFIG.rotateInterval * 1000);
        }
    }

    function displayAd(container, index) {
        const ad = AD_CONFIG.ads[index];
        
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
            
            // لو فيه رابط، نخلي الشريط كله قابل للضغط
            const bar = document.getElementById('sharabar');
            if (ad.link) {
                bar.style.cursor = 'pointer';
                bar.onclick = (e) => {
                    if (e.target.tagName !== 'BUTTON') {
                        window.open(ad.link, '_blank');
                    }
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

        // تأثير الإغلاق
        bar.style.top = '-50px';
        bar.style.opacity = '0';
        
        // حفظ حالة الإغلاق
        localStorage.setItem('sharabar_closed', 'true');
        
        // إخفاء العنصر بعد الأنيميشن
        setTimeout(() => {
            bar.style.display = 'none';
            // إرجاع المسافة الطبيعية للصفحة
            document.body.style.paddingTop = '0';
        }, 300);

        // إيقاف التبديل
        if (rotationTimer) {
            clearInterval(rotationTimer);
            rotationTimer = null;
        }
    }

    // ═══════════════ ضبط المسافة للصفحة ═══════════════
    function adjustPagePadding() {
        // نضيف مسافة علوية للـ body عشان الشريط ميبقاش فوق المحتوى
        document.body.style.paddingTop = '50px';
    }

    // ═══════════════ التهيئة عند تحميل الصفحة ═══════════════
    function init() {
        // لو المستخدم قفل الإعلان قبل كده في نفس الجلسة، منعرضوش
        if (localStorage.getItem('sharabar_closed') === 'true') {
            return;
        }

        // انتظر تحميل الصفحة
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createAdBar);
        } else {
            createAdBar();
        }
    }

    // بدء التشغيل
    init();

})();
