// ============================================================
// الميزان Pro - search.js v5.0 (مُصلَّح)
// بحث ذكي كامل مع ربط كامل مع pos.js و inventory.js
// ============================================================

(function() {
    'use strict';

    console.log('🔍 search.js v5.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الإعدادات
    // ═══════════════════════════════════════════════════════════

    const SEARCH_CONFIG = {
        'customers': {
            getData: function() { return window.customers || []; },
            searchFields: ['name', 'phone', 'whatsapp'],
            icon: '👤',
            placeholder: 'ابحث باسم العميل أو الموبايل...',
            emptyLabel: 'لا يوجد عملاء'
        },
        'suppliers': {
            getData: function() { return window.suppliers || []; },
            searchFields: ['name', 'phone', 'whatsapp'],
            icon: '🚚',
            placeholder: 'ابحث باسم المورد أو الموبايل...',
            emptyLabel: 'لا يوجد موردين'
        },
        'products': {
            getData: function() { return window.products || []; },
            searchFields: ['name', 'barcode'],
            icon: '📦',
            placeholder: 'ابحث باسم المنتج أو الباركود...',
            emptyLabel: 'لا توجد منتجات'
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: دوال مساعدة
    // ═══════════════════════════════════════════════════════════

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
    // الجزء 3: بناء نتائج البحث
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

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: ضبط الحقل المخفي
    // ═══════════════════════════════════════════════════════════

    function setSelectValue(selectEl, value, id) {
        if (!selectEl) return;

        const actualValue = id ? String(id) : String(value);

        Array.from(selectEl.options).forEach(function(opt) {
            opt.selected = false;
        });

        let foundIndex = -1;
        for (let i = 0; i < selectEl.options.length; i++) {
            if (String(selectEl.options[i].value) === actualValue) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex === -1) {
            const newOption = document.createElement('option');
            newOption.value = actualValue;
            newOption.text = value;
            selectEl.appendChild(newOption);
            foundIndex = selectEl.options.length - 1;
        }

        selectEl.selectedIndex = foundIndex;
        selectEl.value = actualValue;

        selectEl.dataset.selectedId = actualValue;
        selectEl.dataset.selectedName = value;

        try {
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) {
            const evt = document.createEvent('HTMLEvents');
            evt.initEvent('change', true, false);
            selectEl.dispatchEvent(evt);
        }

        try {
            selectEl.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (e) {
            const evt = document.createEvent('HTMLEvents');
            evt.initEvent('input', true, false);
            selectEl.dispatchEvent(evt);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: تهيئة مكون بحث واحد
    // ═══════════════════════════════════════════════════════════

    function initSearchComponent(container) {
        if (container.dataset.searchInit === 'true') return;
        container.dataset.searchInit = 'true';

        const type = container.dataset.searchType;
        const targetId = container.dataset.searchTarget;

        if (!type || !targetId) {
            console.warn('⚠️ مكون بحث بدون type أو target');
            return;
        }

        const config = SEARCH_CONFIG[type];
        if (!config) {
            console.warn('⚠️ نوع بحث غير معروف:', type);
            return;
        }

        const hiddenSelect = document.getElementById(targetId);

        // البحث/إنشاء الـ input
        let input = container.querySelector('.smart-search-input');
        if (!input) {
            input = document.createElement('input');
            input.type = 'text';
            input.className = 'smart-search-input';
            input.autocomplete = 'off';
            input.setAttribute('inputmode', 'search');
            container.insertBefore(input, container.firstChild);
        }

        input.placeholder = config.placeholder;

        // البحث/إنشاء قائمة النتائج
        let results = container.querySelector('.smart-search-results');
        if (!results) {
            results = document.createElement('div');
            results.className = 'smart-search-results';
            container.appendChild(results);
        }

        // ═══ الأحداث ═══

        input.addEventListener('input', function() {
            const html = getResultsHTML(type, input.value);
            results.innerHTML = html;
            results.classList.add('show');
        });

        input.addEventListener('focus', function() {
            const html = getResultsHTML(type, input.value);
            results.innerHTML = html;
            results.classList.add('show');
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                results.classList.remove('show');
                input.blur();
            }
        });

        // ⚡ الاختيار من النتائج
        results.addEventListener('click', function(e) {
            const item = e.target.closest('.smart-search-item');
            if (!item) return;

            const value = item.dataset.value;
            const id = item.dataset.id;

            if (hiddenSelect) {
                setSelectValue(hiddenSelect, value, id);
            }

            input.value = value;

            results.classList.remove('show');
            results.innerHTML = '';
            input.blur();

            setTimeout(function() {
                if (hiddenSelect) {
                    try {
                        hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    } catch (err) {}
                }
            }, 50);
        });

        // إغلاق النتائج عند النقر خارج المكون
        document.addEventListener('click', function(e) {
            if (!container.contains(e.target)) {
                results.classList.remove('show');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: دوال مساعدة عامة
    // ═══════════════════════════════════════════════════════════

    window.getSmartSearchValue = function(targetId) {
        const selectEl = document.getElementById(targetId);
        if (!selectEl) return '';

        if (selectEl.value) return selectEl.value;
        if (selectEl.dataset.selectedId) return selectEl.dataset.selectedId;

        const container = document.querySelector('.smart-search-container[data-search-target="' + targetId + '"]');
        if (container) {
            const input = container.querySelector('.smart-search-input');
            if (input && input.value) return input.value.trim();
        }

        return '';
    };

    window.getSmartSearchId = function(targetId) {
        const selectEl = document.getElementById(targetId);
        if (!selectEl) return '';

        if (selectEl.dataset.selectedId) return selectEl.dataset.selectedId;
        if (selectEl.value) return selectEl.value;

        const container = document.querySelector('.smart-search-container[data-search-target="' + targetId + '"]');
        if (!container) return '';

        const input = container.querySelector('.smart-search-input');
        if (!input || !input.value) return '';

        const searchValue = input.value.trim();
        const type = container.dataset.searchType;

        let data = [];
        if (type === 'products') data = window.products || [];
        if (type === 'customers') data = window.customers || [];
        if (type === 'suppliers') data = window.suppliers || [];

        const found = data.find(function(item) {
            return String(item.id) === searchValue || item.name === searchValue;
        });

        return found ? String(found.id) : searchValue;
    };

    window.resetSmartSearch = function(targetId) {
        const selectEl = document.getElementById(targetId);
        if (selectEl) {
            selectEl.value = '';
            delete selectEl.dataset.selectedId;
            delete selectEl.dataset.selectedName;
        }

        const container = document.querySelector('.smart-search-container[data-search-target="' + targetId + '"]');
        if (container) {
            const input = container.querySelector('.smart-search-input');
            if (input) input.value = '';
            const results = container.querySelector('.smart-search-results');
            if (results) {
                results.classList.remove('show');
                results.innerHTML = '';
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: التهيئة
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
    // الجزء 8: تحديث المرتجعات حسب النوع
    // ═══════════════════════════════════════════════════════════

    function updateRetPartySearch() {
        const retTypeEl = document.getElementById('retType');
        if (!retTypeEl) return;

        const container = document.getElementById('retPartySearch');
        if (!container) return;

        const type = retTypeEl.value === 'purchase' ? 'suppliers' : 'customers';
        const config = SEARCH_CONFIG[type];

        container.dataset.searchType = type;

        const input = container.querySelector('.smart-search-input');
        if (input && config) {
            input.placeholder = config.placeholder;
            input.value = '';
        }

        const results = container.querySelector('.smart-search-results');
        if (results) {
            results.classList.remove('show');
            results.innerHTML = '';
        }

        window.resetSmartSearch('retParty');
    }

    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'retType') {
            setTimeout(updateRetPartySearch, 100);
        }
    });

    // ═══════════════════════════════════════════════════════════
    // الجزء 9: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    if (window.EventBus) {
        ['products', 'customers', 'suppliers'].forEach(function(key) {
            window.EventBus.on('data:' + key + ':changed', function() {
                document.querySelectorAll('.smart-search-container').forEach(function(c) {
                    const results = c.querySelector('.smart-search-results');
                    if (results) results.classList.remove('show');
                });
            });
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 10: التحميل
    // ═══════════════════════════════════════════════════════════

    function tryInit() {
        const containers = document.querySelectorAll('.smart-search-container');
        if (containers.length === 0) {
            setTimeout(tryInit, 500);
            return;
        }
        window.initSmartSearch();
        setTimeout(updateRetPartySearch, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(tryInit, 800);
        });
    } else {
        setTimeout(tryInit, 800);
    }

    // إعادة الفحص كل 2 ثانية
    setInterval(function() {
        const containers = document.querySelectorAll('.smart-search-container:not([data-search-init="true"])');
        if (containers.length > 0) {
            containers.forEach(function(c) {
                try { initSearchComponent(c); } catch (e) {}
            });
        }
    }, 2000);

    window.__searchLoaded = true;
    console.log('✅ search.js v5.0 جاهز');

})();
