// ============================================================
// الميزان Pro - search.js v2.0
// مكون بحث ذكي للحقول المنسدلة (يستبدل select من HTML)
// ============================================================

(function() {
    'use strict';

    console.log('🔍 search.js v2.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الإعدادات
    // ═══════════════════════════════════════════════════════════

    // خريطة: نوع البحث لكل حقل
    const SEARCH_CONFIG = {
        'customers': {
            getData: function() { return window.customers || []; },
            searchFields: ['name', 'phone', 'whatsapp'],
            icon: '👤',
            placeholder: '🔍 ابحث باسم العميل أو الموبايل...',
            emptyLabel: 'لا يوجد عملاء'
        },
        'suppliers': {
            getData: function() { return window.suppliers || []; },
            searchFields: ['name', 'phone', 'whatsapp'],
            icon: '🚚',
            placeholder: '🔍 ابحث باسم المورد أو الموبايل...',
            emptyLabel: 'لا يوجد موردين'
        },
        'products': {
            getData: function() { return window.products || []; },
            searchFields: ['name', 'barcode'],
            icon: '📦',
            placeholder: '🔍 ابحث باسم المنتج أو الباركود...',
            emptyLabel: 'لا توجد منتجات'
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: توليد قائمة النتائج
    // ═══════════════════════════════════════════════════════════

    function getResultsHTML(type, query) {
        const config = SEARCH_CONFIG[type];
        if (!config) return '<div class="smart-search-empty">نوع غير معروف</div>';

        const data = config.getData();

        if (data.length === 0) {
            return '<div class="smart-search-empty">' + config.emptyLabel + '</div>';
        }

        const q = String(query || '').trim().toLowerCase();

        let filtered = data;
        if (q) {
            filtered = data.filter(function(item) {
                return config.searchFields.some(function(field) {
                    const val = String(item[field] || '').toLowerCase();
                    return val.indexOf(q) > -1;
                });
            });
        }

        if (filtered.length === 0) {
            return '<div class="smart-search-empty">لا توجد نتائج لـ "' + escapeHtml(query) + '"</div>';
        }

        // حد أقصى 50 نتيجة
        const MAX = 50;
        const total = filtered.length;
        const limited = filtered.slice(0, MAX);

        let html = '';

        limited.forEach(function(item) {
            const subtitle = buildSubtitle(item, type);

            html += '<div class="smart-search-item" ' +
                'data-value="' + escapeAttr(item.name) + '" ' +
                'data-id="' + escapeAttr(String(item.id || '')) + '">' +
                '<div class="smart-search-icon">' + config.icon + '</div>' +
                '<div class="smart-search-info">' +
                    '<div class="smart-search-name">' + escapeHtml(item.name) + '</div>' +
                    (subtitle ? '<div class="smart-search-sub">' + subtitle + '</div>' : '') +
                '</div>' +
            '</div>';
        });

        if (total > MAX) {
            html += '<div class="smart-search-more">و ' + (total - MAX) + ' نتيجة أخرى... اكتب أكثر للتصفية</div>';
        }

        return html;
    }

    function buildSubtitle(item, type) {
        const parts = [];

        if (item.phone) parts.push('📱 ' + escapeHtml(item.phone));
        if (item.whatsapp && item.whatsapp !== item.phone) parts.push('💬 ' + escapeHtml(item.whatsapp));

        if (type === 'products') {
            if (item.barcode) parts.push('🏷️ ' + escapeHtml(item.barcode));
            parts.push('💰 ' + (window.formatMoney ? window.formatMoney(item.sell || 0) : item.sell || 0));
            parts.push('📦 ' + (item.qty || 0));
        }

        return parts.join(' • ');
    }

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: تهيئة مكون بحث واحد
    // ═══════════════════════════════════════════════════════════

    function initSearchComponent(container) {
        if (container.dataset.searchInit === 'true') return;
        container.dataset.searchInit = 'true';

        const type = container.dataset.searchType;
        const targetId = container.dataset.searchTarget;
        const hiddenValue = container.dataset.searchValue || '';

        if (!type || !targetId) {
            console.warn('⚠️ مكون بحث بدون type أو target:', container);
            return;
        }

        const config = SEARCH_CONFIG[type];
        if (!config) {
            console.warn('⚠️ نوع بحث غير معروف:', type);
            return;
        }

        // البحث عن الحقل المخفي (الـ select الأصلي)
        const hiddenSelect = document.getElementById(targetId);

        // البحث عن الـ input
        let input = container.querySelector('.smart-search-input');
        if (!input) {
            input = document.createElement('input');
            input.type = 'text';
            input.className = 'smart-search-input';
            input.placeholder = config.placeholder;
            input.autocomplete = 'off';
            input.setAttribute('inputmode', 'search');
            container.insertBefore(input, container.firstChild);
        }

        // البحث عن قائمة النتائج
        let results = container.querySelector('.smart-search-results');
        if (!results) {
            results = document.createElement('div');
            results.className = 'smart-search-results';
            container.appendChild(results);
        }

        // ═══ الأحداث ═══

        // عند الكتابة
        input.addEventListener('input', function() {
            const html = getResultsHTML(type, input.value);
            results.innerHTML = html;
            results.classList.add('show');
        });

        // عند التركيز
        input.addEventListener('focus', function() {
            const html = getResultsHTML(type, input.value);
            results.innerHTML = html;
            results.classList.add('show');
        });

        // عند الضغط على ESC
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                results.classList.remove('show');
                input.blur();
            }
        });

        // عند اختيار نتيجة
        results.addEventListener('click', function(e) {
            const item = e.target.closest('.smart-search-item');
            if (!item) return;

            const value = item.dataset.value;
            const id = item.dataset.id;

            // ضبط الـ select المخفي
            if (hiddenSelect) {
                // البحث عن option بالقيمة
                let found = false;
                Array.from(hiddenSelect.options).forEach(function(opt) {
                    if (opt.value == value) {
                        opt.selected = true;
                        found = true;
                    }
                });

                // لو مفيش option، نضيف واحد جديد
                if (!found) {
                    const newOption = document.createElement('option');
                    newOption.value = value;
                    newOption.text = value;
                    newOption.selected = true;
                    hiddenSelect.appendChild(newOption);
                }

                // ضبط القيمة
                hiddenSelect.value = value;

                // إطلاق الأحداث
                hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));
                hiddenSelect.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // ضبط الـ input
            input.value = value;

            // إخفاء النتائج
            results.classList.remove('show');
            results.innerHTML = '';
            input.blur();
        });

        // إغلاق النتائج عند النقر خارج المكون
        document.addEventListener('click', function(e) {
            if (!container.contains(e.target)) {
                results.classList.remove('show');
            }
        });

        // تحديث placeholder
        if (config.placeholder) {
            input.placeholder = config.placeholder;
        }

        // لو في قيمة موجودة
        if (hiddenValue && !input.value) {
            input.value = hiddenValue;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: تحديث الحقول بعد تغيير البيانات
    // ═══════════════════════════════════════════════════════════

    function refreshAllSearches() {
        // تحديث placeholder والقيم لو اتغيرت
        document.querySelectorAll('.smart-search-container').forEach(function(container) {
            const input = container.querySelector('.smart-search-input');
            const results = container.querySelector('.smart-search-results');
            if (input && results) {
                results.classList.remove('show');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: التهيئة
    // ═══════════════════════════════════════════════════════════

    window.initSmartSearch = function() {
        const containers = document.querySelectorAll('.smart-search-container');
        let count = 0;

        containers.forEach(function(container) {
            try {
                initSearchComponent(container);
                count++;
            } catch (e) {
                console.warn('⚠️ فشل تهيئة مكون:', e.message);
            }
        });

        console.log('✅ تم تفعيل البحث الذكي على ' + count + ' حقل');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    if (window.EventBus) {
        ['products', 'customers', 'suppliers'].forEach(function(key) {
            window.EventBus.on('data:' + key + ':changed', function() {
                refreshAllSearches();
            });
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: التحميل التلقائي
    // ═══════════════════════════════════════════════════════════

    function tryInit() {
        const containers = document.querySelectorAll('.smart-search-container');
        if (containers.length === 0) {
            setTimeout(tryInit, 500);
            return;
        }

        window.initSmartSearch();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(tryInit, 800);
        });
    } else {
        setTimeout(tryInit, 800);
    }

    // إعادة الفحص كل ثانيتين (لو حقل جديد ظهر)
    setInterval(function() {
        const containers = document.querySelectorAll('.smart-search-container:not([data-search-init="true"])');
        if (containers.length > 0) {
            containers.forEach(function(c) {
                try { initSearchComponent(c); } catch (e) {}
            });
        }
    }, 2000);

    // ═══════════════════════════════════════════════════════════
// تحديث بحث المرتجعات حسب النوع (عميل/مورد)
// ═══════════════════════════════════════════════════════════

function updateRetPartySearch() {
    const retTypeEl = document.getElementById('retType');
    if (!retTypeEl) return;

    const container = document.getElementById('retPartySearch');
    if (!container) return;

    const type = retTypeEl.value === 'purchase' ? 'suppliers' : 'customers';
    const config = SEARCH_CONFIG[type];

    // تحديث الـ type
    container.dataset.searchType = type;

    // تحديث placeholder
    const input = container.querySelector('.smart-search-input');
    if (input && config) {
        input.placeholder = config.placeholder;
        input.value = '';
    }

    // إعادة تهيئة المكون
    container.dataset.searchInit = 'false';
    initSearchComponent(container);
}

// ربط التحديث مع تغيير نوع المرتجع
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'retType') {
        setTimeout(updateRetPartySearch, 100);
    }
});

// تحديث أولي
setTimeout(updateRetPartySearch, 2000);

    window.__searchLoaded = true;
    console.log('✅ search.js v2.0 جاهز');

})();
