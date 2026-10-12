// ============================================================
// الميزان Pro - landing.js
// الصفحة الإعلانية
// ============================================================

(function() {
    'use strict';

    console.log('📢 landing.js - بدء التحميل');

    // رقم الواتساب
    const WHATSAPP_NUMBER = '201158767633';

    
// ═══════════════════════════════════════════════════════════
// الجزء: نسخ النصوص (حساب InstaPay + رقم فودافون)
// ═══════════════════════════════════════════════════════════

window.copyToClipboard = function(text, btn) {
    try {
        // للموبايل
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999);
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        // تأثير بصري
        if (btn) {
            const originalText = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
            setTimeout(function() {
                btn.classList.remove('copied');
                btn.innerHTML = originalText;
            }, 2000);
        }

        return true;
    } catch (e) {
        // بديل للمتصفحات الحديثة
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                if (btn) {
                    const originalText = btn.innerHTML;
                    btn.classList.add('copied');
                    btn.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
                    setTimeout(function() {
                        btn.classList.remove('copied');
                        btn.innerHTML = originalText;
                    }, 2000);
                }
            });
            return true;
        }
        return false;
    }
};
    
    // ═══════════════════════════════════════════════════════════
    // الجزء 1: روابط واتساب ديناميكية
    // ═══════════════════════════════════════════════════════════

    window.openWhatsApp = function(message) {
        const defaultMessage = 'مرحباً، أريد الاستفسار عن الميزان Pro';
        const text = message || defaultMessage;
        const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
        window.open(url, '_blank');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: تتبع مصدر الزيارة (Analytics بسيط)
    // ═══════════════════════════════════════════════════════════

    function trackPageView() {
        try {
            let visits = parseInt(localStorage.getItem('landing_visits') || '0');
            visits++;
            localStorage.setItem('landing_visits', visits);
            localStorage.setItem('landing_last_visit', new Date().toISOString());

            console.log('👁️ عدد الزيارات:', visits);
        } catch (e) {}
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: Animation on Scroll
    // ═══════════════════════════════════════════════════════════

    function initScrollAnimations() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.feature-card, .device-card, .faq-item').forEach(function(el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: تحديث روابط الواتساب
    // ═══════════════════════════════════════════════════════════

    function updateWhatsAppLinks() {
        // تحديث رابط الطلب الرئيسي
        const buyLinks = document.querySelectorAll('a[href*="wa.me"]');
        buyLinks.forEach(function(link) {
            // نضمن إن الرقم صح
            if (!link.href.includes(WHATSAPP_NUMBER)) {
                link.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' +
                    encodeURIComponent('مرحباً، أريد شراء الميزان Pro بـ 500 ج.م');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: تأثير Header عند التمرير
    // ═══════════════════════════════════════════════════════════

    function initHeaderScroll() {
        const header = document.querySelector('.landing-header');
        if (!header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.style.background = 'rgba(13, 13, 13, 0.98)';
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
            } else {
                header.style.background = 'rgba(13, 13, 13, 0.95)';
                header.style.boxShadow = 'none';
            }

            lastScroll = currentScroll;
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: Smooth Scroll للروابط الداخلية
    // ═══════════════════════════════════════════════════════════

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || targetId.length < 2) return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerOffset = 70;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: عداد أرقام متحرك (اختياري)
    // ═══════════════════════════════════════════════════════════

    function animateNumbers() {
        const counters = document.querySelectorAll('[data-count]');

        counters.forEach(function(counter) {
            const target = parseInt(counter.dataset.count) || 0;
            let current = 0;
            const increment = target / 50;

            const updateCounter = function() {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            updateCounter();
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 8: التهيئة
    // ═══════════════════════════════════════════════════════════

    function init() {
        console.log('🚀 الصفحة الإعلانية جاهزة');

        trackPageView();
        updateWhatsAppLinks();
        initHeaderScroll();
        initSmoothScroll();

        // بعد تحميل الصفحة
        setTimeout(function() {
            initScrollAnimations();
            animateNumbers();
        }, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.__landingLoaded = true;
    console.log('✅ landing.js جاهز');

})();
