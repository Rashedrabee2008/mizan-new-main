// ============================================================
// الميزان Pro - search.js
// مكون بحث ذكي للحقول المنسدلة (بديل <select>)
// ============================================================

(function() {
    'use strict';

    console.log('🔍 search.js v1.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: الإعدادات
    // ═══════════════════════════════════════════════════════════

    // الحقول اللي هتتحول لبحث ذكي
    const SEARCH_TARGETS = {
        'saleProduct':    { type: 'products',  placeholder: '🔍 ابحث باسم المنتج أو الباركود...' },
        'saleCustomer':   { type: 'customers', placeholder: '🔍 ابحث باسم العميل أو الموبايل...' },
        'purProduct':     { type: 'products',  placeholder: '🔍 ابحث باسم المنتج أو الباركود...' },
        'purSupplier':    { type: 'suppliers', placeholder: '🔍 ابحث باسم المورد أو الموبايل...' },
        'retProduct':     { type: 'products',  placeholder: '🔍 ابحث باسم المنتج أو الباركود...' },
        'retParty':       { type: 'mixed',     placeholder: '🔍 ابحث باسم العميل أو المورد...' }
    };

    // خريطة البحث لكل نوع
    function getSearchFields(type) {
        if (type === 'products') return ['name', 'barcode'];
        if (type === 'customers') return ['name', 'phone', 'whatsapp'];
        if (type === 'suppliers') return ['name', 'phone', 'whatsapp'];
        if (type === 'mixed') return ['name', 'phone', 'whatsapp'];
        return ['name'];
    }

    // الحصول على البيانات حسب النوع
    function getDataByType(type) {
        if (type === 'products') return window.products || [];
        if (type === 'customers') return window.customers || [];
        if (type === 'suppliers') return window.suppliers || [];

        // mixed = عملاء + موردين (للمرتجعات)
        if (type === 'mixed') {
            const customers = (window.customers || []).map(function(c) {
                return Object.assign({}, c, { _isCustomer: true });
            });
            const suppliers = (window.suppliers || []).map(function(s) {
                return Object.assign({}, s, { _isSupplier: true });
            });
            return customers.concat(suppliers);
        }

        return [];
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: تحويل <select> إلى بحث ذكي
    // ═══════════════════════════════════════════════════════════

    function transformSelect(selectId) {
        const selectEl = document.getElementById(selectId);
        if (!selectEl) return;

        const config = SEARCH_TARGETS[selectId];
        if (!config) return;

        // منع التحويل المزدوج
        if (selectEl.dataset.searchTransformed === 'true') return;
        selectEl.dataset.searchTransformed = 'true';

        // إخفاء الـ select الأصلي (مش مسحه)
selectEl.style.setProperty('display', 'none', 'important');
selectEl.style.setProperty('position', 'absolute', 'important');
selectEl.style.setProperty('opacity', '0', 'important');
selectEl.style.setProperty('pointer-events', 'none', 'important');
selectEl.style.setProperty('visibility', 'hidden', 'important');
selectEl.style.setProperty('width', '0', 'important');
selectEl.style.setProperty('height', '0', 'important');
selectEl.setAttribute('aria-hidden', 'true');
selectEl.setAttribute('tabindex', '-1');

        // إنشاء الغلاف
        const wrapper = document.createElement('div');
        wrapper.className = 'smart-search-wrapper';
        wrapper.dataset.targetId = selectId;

        // إنشاء حقل البحث
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'smart-search-input';
        input.placeholder = config.placeholder;
        input.autocomplete = 'off';

        // إنشاء قائمة النتائج
        const results = document.createElement('div');
        results.className = 'smart-search-results';

        wrapper.appendChild(input);
        wrapper.appendChild(results);

        // إدخال الغلاف بعد الـ select
        selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);

        // ═══ الأحداث ═══

        // عند الكتابة
        input.addEventListener('input', function() {
            const query = input.value.trim();
            showResults(selectId, query, results);
        });

        // عند التركيز
        input.addEventListener('focus', function() {
            const query = input.value.trim();
            showResults(selectId, query, results);
        });

        // عند النقر على نتيجة
        results.addEventListener('click', function(e) {
            const item = e.target.closest('.smart-search-item');
            if (!item) return;

            const value = item.dataset.value;
            const label = item.dataset.label;

            // تعيين القيمة في الـ select الأصلي
            selectEl.value = value;

            // إظهار النص في حقل البحث
            input.value = label;

            // إخفاء النتائج
            results.classList.remove('show');
            results.innerHTML = '';

            // إطلاق حدث change للأكواد الموجودة
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
            selectEl.dispatchEvent(new Event('input', { bubbles: true }));

            // إخفاء الـ input (اختياري - لو عايزه يفضل يظهر)
            // input.blur();
        });

        // إغلاق النتائج عند النقر خارج المكون
        document.addEventListener('click', function(e) {
            if (!wrapper.contains(e.target)) {
                results.classList.remove('show');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: عرض النتائج
    // ═══════════════════════════════════════════════════════════

    function showResults(selectId, query, resultsContainer) {
        const config = SEARCH_TARGETS[selectId];
        if (!config) return;

        const data = getDataByType(config.type);
        const fields = getSearchFields(config.type);

        if (data.length === 0) {
            resultsContainer.innerHTML = '<div class="smart-search-empty">لا توجد بيانات</div>';
            resultsContainer.classList.add('show');
            return;
        }

        // فلترة البيانات
        const q = query.toLowerCase();
        let filtered = data;

        if (q) {
            filtered = data.filter(function(item) {
                return fields.some(function(field) {
                    const val = String(item[field] || '').toLowerCase();
                    return val.indexOf(q) > -1;
                });
            });
        }

        // تحديد الحد الأقصى
        const MAX_RESULTS = 50;
        const total = filtered.length;
        const limited = filtered.slice(0, MAX_RESULTS);

        if (limited.length === 0) {
            resultsContainer.innerHTML = '<div class="smart-search-empty">لا توجد نتائج للبحث "' + query + '"</div>';
            resultsContainer.classList.add('show');
            return;
        }

        // بناء HTML
        let html = '';

        limited.forEach(function(item) {
            const label = buildLabel(item, config.type);
            const icon = getIcon(config.type, item);
            const sub = buildSubtitle(item, config.type);

            html += '<div class="smart-search-item" ' +
                'data-value="' + escapeAttr(item.name) + '" ' +
                'data-id="' + escapeAttr(String(item.id || '')) + '" ' +
                'data-label="' + escapeAttr(item.name) + '">' +
                '<div class="smart-search-icon">' + icon + '</div>' +
                '<div class="smart-search-info">' +
                    '<div class="smart-search-name">' + escapeHtml(item.name) + '</div>' +
                    (sub ? '<div class="smart-search-sub">' + escapeHtml(sub) + '</div>' : '') +
                '</div>' +
            '</div>';
        });

        // لو في نتائج أكتر
        if (total > MAX_RESULTS) {
            html += '<div class="smart-search-more">و ' + (total - MAX_RESULTS) + ' نتيجة أخرى... اكتب أكثر للتصفية</div>';
        }

        resultsContainer.innerHTML = html;
        resultsContainer.classList.add('show');
    }

    // بناء النص الفرعي
    function buildSubtitle(item, type) {
        const parts = [];

        if (item.phone) parts.push('📱 ' + item.phone);
        if (item.whatsapp && item.whatsapp !== item.phone) parts.push('💬 ' + item.whatsapp);
        if (item.barcode && type === 'products') parts.push('🏷️ ' + item.barcode);

        if (type === 'products') {
            parts.push('💰 ' + window.formatMoney(item.sell || 0));
            parts.push('📦 ' + (item.qty || 0));
        }

        if (item._isCustomer) parts.push('👤 عميل');
        if (item._isSupplier) parts.push('🚚 مورد');

        return parts.join(' • ');
    }

    // أيقونة النوع
    function getIcon(type, item) {
        if (type === 'products') return '📦';
        if (type === 'customers') return '👤';
        if (type === 'suppliers') return '🚚';
        if (item._isCustomer) return '👤';
        if (item._isSupplier) return '🚚';
        return '📋';
    }

    // بناء النص المعروض
    function buildLabel(item, type) {
        return item.name || '';
    }

    // دوال مساعدة
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
    // الجزء 4: تحديث القوائم الأصلية (لمزامنة البيانات)
    // ═══════════════════════════════════════════════════════════

    // بعد أي تحديث للبيانات، نعيد تحميل النتائج
    function refreshAllSearchFields() {
        // مسح النص في الحقول لو قيمتها اتغيرت
        Object.keys(SEARCH_TARGETS).forEach(function(selectId) {
            const selectEl = document.getElementById(selectId);
            if (!selectEl || selectEl.dataset.searchTransformed !== 'true') return;

            const wrapper = document.querySelector('.smart-search-wrapper[data-target-id="' + selectId + '"]');
            if (!wrapper) return;

            const input = wrapper.querySelector('.smart-search-input');
            if (!input) return;

            // لو القيمة في الـ select فاضية، نفرغ الـ input
            if (!selectEl.value) {
                input.value = '';
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: التهيئة
    // ═══════════════════════════════════════════════════════════

    window.initSmartSearch = function() {
        console.log('🔍 تفعيل البحث الذكي...');

        Object.keys(SEARCH_TARGETS).forEach(function(selectId) {
            try {
                transformSelect(selectId);
            } catch (e) {
                console.warn('⚠️ فشل تحويل ' + selectId + ':', e.message);
            }
        });

        console.log('✅ تم تفعيل البحث الذكي على ' + Object.keys(SEARCH_TARGETS).length + ' حقول');
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: ربط الأحداث
    // ═══════════════════════════════════════════════════════════

    // عند تغيير البيانات، نحدّث الحقول
    if (window.EventBus) {
        window.EventBus.on('data:products:changed', function() {
            setTimeout(refreshAllSearchFields, 100);
        });
        window.EventBus.on('data:customers:changed', function() {
            setTimeout(refreshAllSearchFields, 100);
        });
        window.EventBus.on('data:suppliers:changed', function() {
            setTimeout(refreshAllSearchFields, 100);
        });
    }

    // إضافة قائمة المرتجعات عند تغيير نوع المرتجع
    const originalToggleReturnParty = window.toggleReturnParty;
    if (typeof originalToggleReturnParty === 'function') {
        window.toggleReturnParty = function() {
            originalToggleReturnParty();

            // إعادة إنشاء البحث للمرتجعات
            setTimeout(function() {
                const retPartySelect = document.getElementById('retParty');
                if (retPartySelect) {
                    // مسح الحقل الحالي
                    const wrapper = document.querySelector('.smart-search-wrapper[data-target-id="retParty"]');
                    if (wrapper) {
                        const input = wrapper.querySelector('.smart-search-input');
                        if (input) input.value = '';
                    }
                }
            }, 100);
        };
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 7: التحميل التلقائي
    // ═══════════════════════════════════════════════════════════

    function tryInit() {
        // ننتظر لحد ما الصفحة تحمل
        const saleProductEl = document.getElementById('saleProduct');
        if (!saleProductEl) {
            setTimeout(tryInit, 500);
            return;
        }

        // نتأكد إن البيانات اتحملت
        window.initSmartSearch();
    }

    // نبدأ التهيئة بعد 2 ثانية من تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(tryInit, 1500);
        });
    } else {
        setTimeout(tryInit, 1500);
    }

    // نعيد التهيئة لو في حقول جديدة ظهرت (مثلاً في modal)
    setInterval(function() {
        Object.keys(SEARCH_TARGETS).forEach(function(selectId) {
            const selectEl = document.getElementById(selectId);
            if (selectEl && selectEl.dataset.searchTransformed !== 'true') {
                try {
                    transformSelect(selectId);
                } catch (e) {}
            }
        });
    }, 3000);

    window.__searchLoaded = true;
    console.log('✅ search.js v1.0 جاهز');

})();
