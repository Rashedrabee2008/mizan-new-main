// ============================================================
// الميزان Pro - extras.js v21.0 (إصلاح شامل)
// 🔧 HR + AI + Notifications + حماية شاملة
// ============================================================

(function() {
    'use strict';

    console.log('✨ extras.js v21.0 - بدء التحميل');

    // ═══════════════════════════════════════════════════════════
    // دوال مساعدة للوقت
    // ═══════════════════════════════════════════════════════════

    function timeToMinutes(time24) {
        if (!time24) return null;
        const parts = String(time24).split(':');
        if (parts.length !== 2) return null;
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }

    function time24To12(time24) {
        if (!time24) return '';
        const parts = String(time24).split(':');
        if (parts.length !== 2) return '';
        let hour = parseInt(parts[0]);
        const minutes = parts[1];
        const ampm = hour >= 12 ? 'م' : 'ص';
        hour = hour % 12 || 12;
        return hour + ':' + minutes + ' ' + ampm;
    }

    function getCurrentTime24() {
        const now = new Date();
        return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    }

    // ═══════════════════════════════════════════════════════════
    // الجزء 1: تبويبات الموظفين
    // ═══════════════════════════════════════════════════════════

    window.showHRTab = function(tab, btn) {
        ['employees', 'attendance', 'salaries'].forEach(function(t) {
            const el = document.getElementById('hrTab' + t.charAt(0).toUpperCase() + t.slice(1));
            if (el) el.style.display = 'none';
        });

        const target = document.getElementById('hrTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
        if (target) target.style.display = 'block';

        document.querySelectorAll('#page-employees .tab-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        if (btn) btn.classList.add('active');

        if (tab === 'employees') window.renderEmployees();
        if (tab === 'attendance') window.renderAttendanceList();
        if (tab === 'salaries') window.renderSalariesList();
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 2: إدارة الموظفين
    // ═══════════════════════════════════════════════════════════

    window.saveEmployee = function() {
        const id = document.getElementById('empId') ? document.getElementById('empId').value : '';
        const name = document.getElementById('empName') ? document.getElementById('empName').value.trim() : '';
        const phone = document.getElementById('empPhone') ? document.getElementById('empPhone').value.trim() : '';
        const jobTitle = document.getElementById('empJobTitle') ? document.getElementById('empJobTitle').value : 'موظف';
        const salaryType = document.getElementById('empSalaryType') ? document.getElementById('empSalaryType').value : 'monthly';
        const baseSalary = parseFloat(document.getElementById('empBaseSalary') ? document.getElementById('empBaseSalary').value : 0) || 0;
        const dailyHours = parseFloat(document.getElementById('empDailyHours') ? document.getElementById('empDailyHours').value : 8) || 8;
        const hireDate = document.getElementById('empHireDate') ? document.getElementById('empHireDate').value : window.getTodayDate();
        const address = document.getElementById('empAddress') ? document.getElementById('empAddress').value.trim() : '';
        const notes = document.getElementById('empNotes') ? document.getElementById('empNotes').value.trim() : '';

        if (!name) {
            window.showToast('⚠️ أدخل اسم الموظف', 'error');
            return;
        }
        if (baseSalary <= 0) {
            window.showToast('⚠️ أدخل الراتب', 'error');
            return;
        }

        if (id) {
            const idx = (window.employees || []).findIndex(function(e) { return e.id == id; });
            if (idx > -1) {
                window.employees[idx] = Object.assign({}, window.employees[idx], {
                    name: name, phone: phone, jobTitle: jobTitle,
                    salaryType: salaryType, baseSalary: baseSalary,
                    dailyHours: dailyHours, hireDate: hireDate,
                    address: address, notes: notes
                });
                window.DataStore.set('employees', window.employees);
                window.showToast('✅ تم التعديل', 'success');
            }
        } else {
            window.DataStore.add('employees', {
                id: window.generateId('emp_'),
                code: 'EMP-' + String((window.employees || []).length + 1).padStart(4, '0'),
                name: name, phone: phone, jobTitle: jobTitle,
                salaryType: salaryType, baseSalary: baseSalary,
                dailyHours: dailyHours, hireDate: hireDate,
                address: address, notes: notes,
                active: true
            });
            window.showToast('✅ تم الإضافة', 'success');
        }

        window.resetEmployeeForm();
    };

    window.resetEmployeeForm = function() {
        ['empId', 'empName', 'empPhone', 'empAddress', 'empNotes'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const jobEl = document.getElementById('empJobTitle');
        if (jobEl) jobEl.value = 'موظف';
        const typeEl = document.getElementById('empSalaryType');
        if (typeEl) typeEl.value = 'monthly';
        const salaryEl = document.getElementById('empBaseSalary');
        if (salaryEl) salaryEl.value = '';
        const hoursEl = document.getElementById('empDailyHours');
        if (hoursEl) hoursEl.value = '8';
        const dateEl = document.getElementById('empHireDate');
        if (dateEl) dateEl.value = window.getTodayDate();
        const titleEl = document.getElementById('empFormTitle');
        if (titleEl) titleEl.textContent = '➕ إضافة موظف جديد';
        const btnEl = document.getElementById('empSaveBtnText');
        if (btnEl) btnEl.textContent = 'إضافة';
    };

    window.editEmployee = function(id) {
        const emp = (window.employees || []).find(function(e) { return e.id == id; });
        if (!emp) return;

        const setVal = function(elId, val) {
            const el = document.getElementById(elId);
            if (el) el.value = val;
        };

        setVal('empId', emp.id);
        setVal('empName', emp.name);
        setVal('empPhone', emp.phone || '');
        setVal('empJobTitle', emp.jobTitle || 'موظف');
        setVal('empSalaryType', emp.salaryType || 'monthly');
        setVal('empBaseSalary', emp.baseSalary || 0);
        setVal('empDailyHours', emp.dailyHours || 8);
        setVal('empHireDate', emp.hireDate || window.getTodayDate());
        setVal('empAddress', emp.address || '');
        setVal('empNotes', emp.notes || '');

        const titleEl = document.getElementById('empFormTitle');
        if (titleEl) titleEl.textContent = '✏️ تعديل الموظف';
        const btnEl = document.getElementById('empSaveBtnText');
        if (btnEl) btnEl.textContent = 'حفظ';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteEmployee = async function(id) {
        const emp = (window.employees || []).find(function(e) { return e.id == id; });
        if (!emp) return;

        const confirmed = await window.confirmDialog('حذف "' + emp.name + '"؟');
        if (!confirmed) return;

        window.DataStore.remove('employees', id);
        window.showToast('🗑️ تم الحذف', 'info');
    };

    window.renderEmployees = function() {
        const c = document.getElementById('empList');
        if (!c) return;

        if ((window.employees || []).length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><span>لا يوجد موظفين</span></div>';
            return;
        }

        let html = '<div class="table-header" style="grid-template-columns: 0.7fr 1.2fr 0.9fr 1fr 1.3fr;">' +
            '<span>الكود</span><span>الاسم</span><span>الوظيفة</span><span>الراتب</span><span></span>' +
        '</div>';

        window.employees.forEach(function(emp) {
            const salaryText = emp.salaryType === 'monthly'
                ? window.formatMoney(emp.baseSalary) + ' ج.م/شهر'
                : window.formatMoney(emp.baseSalary) + ' ج.م/يوم';

            html += '<div class="table-row" style="grid-template-columns: 0.7fr 1.2fr 0.9fr 1fr 1.3fr;">' +
                '<span style="font-family:monospace;color:#C9A94E;font-size:11px;">' + emp.code + '</span>' +
                '<span><strong>' + window.escapeHtml(emp.name) + '</strong>' +
                    (emp.phone ? '<br><small style="color:#A89070;font-size:9px;">📞 ' + window.escapeHtml(emp.phone) + '</small>' : '') +
                '</span>' +
                '<span style="font-size:11px;color:#4A8AB5;">' + window.escapeHtml(emp.jobTitle) + '</span>' +
                '<span style="color:#2D8F5E;font-weight:700;font-size:11px;">' + salaryText + '</span>' +
                '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                    '<button class="btn btn-info btn-sm" onclick="showEmployeeDetails(\'' + emp.id + '\')"><i class="fas fa-eye"></i></button>' +
                    '<button class="btn btn-success btn-sm" onclick="showAttendanceDialog(\'' + emp.id + '\')"><i class="fas fa-clock"></i></button>' +
                    '<button class="btn btn-warning btn-sm" onclick="editEmployee(\'' + emp.id + '\')"><i class="fas fa-edit"></i></button>' +
                    '<button class="btn btn-danger btn-sm" onclick="deleteEmployee(\'' + emp.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.showEmployeeDetails = function(id) {
        const emp = (window.employees || []).find(function(e) { return e.id == id; });
        if (!emp) return;

        const empSalaries = (window.salaries || []).filter(function(s) { return s.employeeId == emp.id; });
        const totalPaid = empSalaries.reduce(function(sum, s) { return sum + (s.netSalary || 0); }, 0);

        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>👤 ' + window.escapeHtml(emp.name) + '</h3>' +
            '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:12px;padding:16px;text-align:center;color:#0D0D0D;margin-bottom:12px;">' +
                '<div style="font-size:48px;margin-bottom:8px;">👤</div>' +
                '<div style="font-size:20px;font-weight:900;">' + window.escapeHtml(emp.name) + '</div>' +
                '<div style="font-size:13px;margin-top:4px;">' + emp.code + ' • ' + window.escapeHtml(emp.jobTitle) + '</div>' +
            '</div>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;">' +
                '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2D2D2D;">' +
                    '<span style="color:#A89070;">📞 الهاتف:</span>' +
                    '<strong style="color:#F5E6C8;">' + (emp.phone || '-') + '</strong>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2D2D2D;">' +
                    '<span style="color:#A89070;">💰 الراتب:</span>' +
                    '<strong style="color:#2D8F5E;">' + window.formatMoney(emp.baseSalary) + ' ج.م/' +
                        (emp.salaryType === 'monthly' ? 'شهر' : 'يوم') + '</strong>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:6px 0;">' +
                    '<span style="color:#A89070;">💵 المدفوع:</span>' +
                    '<strong style="color:#C9A94E;">' + window.formatMoney(totalPaid) + '</strong>' +
                '</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
                '<button class="btn btn-success" onclick="showAttendanceDialog(\'' + emp.id + '\')">' +
                    '<i class="fas fa-clock"></i> تسجيل حضور' +
                '</button>' +
                '<button class="btn btn-primary" onclick="showSalaryDialog(\'' + emp.id + '\')">' +
                    '<i class="fas fa-money-bill-wave"></i> دفع الراتب' +
                '</button>' +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

        window.openModal(html);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 3: الحضور والانصراف
    // ═══════════════════════════════════════════════════════════

    window.showAttendanceDialog = function(employeeId) {
        const emp = (window.employees || []).find(function(e) { return e.id == employeeId; });
        if (!emp) return;

        const today = window.getTodayDate();
        const existing = (window.attendance || []).find(function(a) {
            return a.employeeId == emp.id && a.date === today;
        });

        const currentTime24 = getCurrentTime24();

        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>⏰ تسجيل حضور - ' + window.escapeHtml(emp.name) + '</h3>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;">' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                    '<span style="color:#A89070;">📅 التاريخ:</span>' +
                    '<strong style="color:#C9A94E;">' + today + '</strong>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;">' +
                    '<span style="color:#A89070;">⏰ الوقت الحالي:</span>' +
                    '<strong style="color:#4A8AB5;">' + window.getNowTime() + '</strong>' +
                '</div>' +
            '</div>';

        if (existing) {
            html += '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:10px;border-right:4px solid #2D8F5E;">' +
                '<div style="color:#2D8F5E;font-size:13px;font-weight:900;margin-bottom:10px;">🟢 حضور مسجل</div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;">' +
                    '<span style="color:#A89070;">وقت الحضور:</span>' +
                    '<strong style="color:#2D8F5E;">' + existing.checkIn + '</strong>' +
                '</div>' +
                (existing.checkOut ?
                    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px;">' +
                        '<span style="color:#A89070;">وقت الانصراف:</span>' +
                        '<strong style="color:#E06060;">' + existing.checkOut + '</strong>' +
                    '</div>' +
                    (existing.workHours ?
                        '<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px;">' +
                            '<span style="color:#A89070;">ساعات العمل:</span>' +
                            '<strong style="color:#C9A94E;">' + existing.workHours + ' ساعة</strong>' +
                        '</div>' : '')
                    :
                    '<button class="btn btn-danger btn-block" onclick="checkOutEmployee(\'' + existing.id + '\')" style="margin-top:10px;">' +
                        '🚪 تسجيل الانصراف' +
                    '</button>') +
            '</div>';
        } else {
            html += '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;border-right:4px solid #2D8F5E;">' +
                '<div style="color:#2D8F5E;font-size:13px;font-weight:900;margin-bottom:10px;">🟢 تسجيل حضور جديد</div>' +
                '<div class="form-group">' +
                    '<label style="font-size:11px;color:#A89070;">⏰ وقت الحضور</label>' +
                    '<input type="time" id="checkInTime" value="' + currentTime24 + '" style="padding:12px;font-size:16px;text-align:center;font-family:monospace;font-weight:900;background:#1A1A1A;color:#F5E6C8;border:2px solid #2D8F5E;border-radius:8px;width:100%;box-sizing:border-box;" />' +
                '</div>' +
                '<button class="btn btn-success btn-block" onclick="checkInEmployee(\'' + emp.id + '\')">' +
                    '✅ تسجيل الحضور' +
                '</button>' +
            '</div>';
        }

        html += '<button class="btn btn-secondary btn-block" onclick="closeModal()">إغلاق</button>';
        window.openModal(html);
    };

    window.checkInEmployee = function(employeeId) {
        const emp = (window.employees || []).find(function(e) { return e.id == employeeId; });
        if (!emp) return;

        const today = window.getTodayDate();
        const time24 = document.getElementById('checkInTime') ? document.getElementById('checkInTime').value : getCurrentTime24();
        const displayTime = time24To12(time24);

        window.DataStore.add('attendance', {
            id: window.generateId('att_'),
            employeeId: emp.id,
            employeeName: emp.name,
            date: today,
            checkIn: displayTime,
            checkIn24: time24,
            checkOut: null,
            checkOut24: null,
            status: 'present'
        });

        window.showToast('✅ تم تسجيل الحضور: ' + displayTime, 'success');
        window.closeModal();
        setTimeout(window.renderEmployees, 300);
    };

    window.checkOutEmployee = function(attendanceId) {
        const att = (window.attendance || []).find(function(a) { return a.id == attendanceId; });
        if (!att) return;

        const time24 = getCurrentTime24();
        const displayTime = time24To12(time24);

        att.checkOut = displayTime;
        att.checkOut24 = time24;

        const inMin = timeToMinutes(att.checkIn24);
        const outMin = timeToMinutes(time24);
        if (inMin !== null && outMin !== null) {
            let diff = outMin - inMin;
            if (diff < 0) diff += 24 * 60;
            att.workHours = (diff / 60).toFixed(2);
        }

        window.DataStore.set('attendance', window.attendance);
        window.showToast('✅ تم تسجيل الانصراف: ' + displayTime, 'success');
        window.closeModal();
        setTimeout(window.renderEmployees, 300);
    };

    window.renderAttendanceList = function() {
        const c = document.getElementById('attendanceList');
        if (!c) return;

        const records = (window.attendance || []).slice().sort(function(a, b) {
            return (b.date || '').localeCompare(a.date || '');
        }).slice(0, 100);

        if (records.length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><span>لا يوجد سجل حضور</span></div>';
            return;
        }

        let html = '<div class="table-header" style="grid-template-columns: 1fr 0.9fr 0.9fr 0.8fr;">' +
            '<span>الموظف</span><span>الحضور</span><span>الانصراف</span><span>ساعات</span>' +
        '</div>';

        records.forEach(function(rec) {
            html += '<div class="table-row" style="grid-template-columns: 1fr 0.9fr 0.9fr 0.8fr;">' +
                '<span><strong>' + window.escapeHtml(rec.employeeName) + '</strong>' +
                    '<br><small style="color:#A89070;font-size:9px;">' + rec.date + '</small></span>' +
                '<span style="color:#2D8F5E;font-size:11px;">' + rec.checkIn + '</span>' +
                '<span style="color:' + (rec.checkOut ? '#E06060' : '#E6A830') + ';font-size:11px;">' +
                    (rec.checkOut || '⏳') + '</span>' +
                '<span style="color:#4A8AB5;font-size:11px;">' + (rec.workHours || '-') + '</span>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 4: الرواتب
    // ═══════════════════════════════════════════════════════════

    window.showSalaryDialog = function(employeeId) {
        const emp = (window.employees || []).find(function(e) { return e.id == employeeId; });
        if (!emp) return;

        const now = new Date();
        const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

        const monthAttendance = (window.attendance || []).filter(function(a) {
            return a.employeeId == emp.id && (a.date || '').startsWith(currentMonth);
        });
        const daysWorked = monthAttendance.filter(function(a) { return a.status === 'present'; }).length;

        let baseAmount = emp.baseSalary;
        if (emp.salaryType === 'daily') {
            baseAmount = emp.baseSalary * daysWorked;
        }

        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>💰 دفع راتب - ' + window.escapeHtml(emp.name) + '</h3>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;">' +
                '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2D2D2D;">' +
                    '<span style="color:#A89070;">📅 الشهر:</span>' +
                    '<strong style="color:#C9A94E;">' + currentMonth + '</strong>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2D2D2D;">' +
                    '<span style="color:#A89070;">⏰ أيام العمل:</span>' +
                    '<strong style="color:#4A8AB5;">' + daysWorked + ' يوم</strong>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:6px 0;">' +
                    '<span style="color:#A89070;">💰 الراتب الأساسي:</span>' +
                    '<strong style="color:#2D8F5E;">' + window.formatMoney(baseAmount) + ' ج.م</strong>' +
                '</div>' +
            '</div>' +
            '<div class="form-row">' +
                '<div class="form-group"><label>🎁 مكافآت</label><input type="number" id="salBonus" value="0" min="0" step="0.01" oninput="calcSalary()" /></div>' +
                '<div class="form-group"><label>💸 خصومات</label><input type="number" id="salDeduction" value="0" min="0" step="0.01" oninput="calcSalary()" /></div>' +
            '</div>' +
            '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:10px;padding:14px;text-align:center;color:#0D0D0D;margin-bottom:12px;">' +
                '<div style="font-size:12px;margin-bottom:4px;">صافي الراتب</div>' +
                '<div id="salNetAmount" style="font-size:28px;font-weight:900;font-family:monospace;">' + window.formatMoney(baseAmount) + '</div>' +
                '<div style="font-size:11px;">ج.م</div>' +
            '</div>' +
            '<input type="hidden" id="salBaseAmount" value="' + baseAmount + '" />' +
            '<input type="hidden" id="salDaysWorked" value="' + daysWorked + '" />' +
            '<input type="hidden" id="salMonth" value="' + currentMonth + '" />' +
            '<div class="form-group"><label>💰 الخزنة</label><select id="salCashBox" class="inv-select"><option value="">اختر...</option></select></div>' +
            '<div id="salCashBoxBalance" style="background:#0D0D0D;border-radius:8px;padding:8px;margin-bottom:12px;font-size:11px;text-align:center;color:#A89070;display:none;"></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
                '<button class="btn btn-success" onclick="saveSalary(\'' + emp.id + '\')"><i class="fas fa-check"></i> دفع</button>' +
                '<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>' +
            '</div>';

        window.openModal(html);

        setTimeout(function() {
            const sel = document.getElementById('salCashBox');
            if (!sel) return;
            let opts = '<option value="">اختر...</option>';
            (window.cashBoxes || []).filter(function(b) { return b.active !== false; }).forEach(function(box) {
                opts += '<option value="' + box.id + '">' + (box.icon || '') + ' ' + window.escapeHtml(box.name) +
                    (box.isDefault ? ' ⭐' : '') + '</option>';
            });
            sel.innerHTML = opts;

            const defaultBox = (window.cashBoxes || []).find(function(b) { return b.isDefault; });
            if (defaultBox) sel.value = defaultBox.id;

            sel.onchange = function() {
                window.updateSalaryCashBoxBalance();
            };
            window.updateSalaryCashBoxBalance();
        }, 100);
    };

    window.updateSalaryCashBoxBalance = function() {
        const cashBoxId = document.getElementById('salCashBox') ? document.getElementById('salCashBox').value : '';
        const balanceBox = document.getElementById('salCashBoxBalance');

        if (!cashBoxId || !balanceBox) {
            if (balanceBox) balanceBox.style.display = 'none';
            return;
        }

        const balance = window.Balance.cashBox(cashBoxId);
        const netAmount = parseFloat(document.getElementById('salNetAmount') ? document.getElementById('salNetAmount').textContent : 0) || 0;

        balanceBox.style.display = 'block';

        const isEnough = balance >= netAmount;
        balanceBox.innerHTML =
            '<span style="color:#A89070;">💰 رصيد الخزنة:</span> ' +
            '<strong style="color:' + (balance >= 0 ? '#2D8F5E' : '#E06060') + ';font-family:monospace;">' +
                window.formatMoney(balance) + ' ج.م</strong>' +
            (netAmount > 0 ?
                ' | <span style="color:' + (isEnough ? '#2D8F5E' : '#E06060') + ';">' +
                    (isEnough ? '✅ كافي' : '⚠️ غير كافي') +
                '</span>' : '');
    };

    window.calcSalary = function() {
        const base = parseFloat(document.getElementById('salBaseAmount') ? document.getElementById('salBaseAmount').value : 0) || 0;
        const bonus = parseFloat(document.getElementById('salBonus') ? document.getElementById('salBonus').value : 0) || 0;
        const deduction = parseFloat(document.getElementById('salDeduction') ? document.getElementById('salDeduction').value : 0) || 0;
        const net = base + bonus - deduction;
        const el = document.getElementById('salNetAmount');
        if (el) el.textContent = window.formatMoney(net);

        window.updateSalaryCashBoxBalance();
    };

    window.saveSalary = function(employeeId) {
        const emp = (window.employees || []).find(function(e) { return e.id == employeeId; });
        if (!emp) return;

        const base = parseFloat(document.getElementById('salBaseAmount') ? document.getElementById('salBaseAmount').value : 0) || 0;
        const bonus = parseFloat(document.getElementById('salBonus') ? document.getElementById('salBonus').value : 0) || 0;
        const deduction = parseFloat(document.getElementById('salDeduction') ? document.getElementById('salDeduction').value : 0) || 0;
        const cashBoxId = document.getElementById('salCashBox') ? document.getElementById('salCashBox').value : '';
        const month = document.getElementById('salMonth') ? document.getElementById('salMonth').value : '';
        const daysWorked = parseInt(document.getElementById('salDaysWorked') ? document.getElementById('salDaysWorked').value : 0) || 0;

        const net = base + bonus - deduction;

        if (net <= 0) {
            window.showToast('⚠️ صافي الراتب غير صحيح', 'error');
            return;
        }
        if (!cashBoxId) {
            window.showToast('⚠️ اختر الخزنة', 'error');
            return;
        }

        const boxBalance = window.Balance.cashBox(cashBoxId);
        if (boxBalance < net) {
            window.showToast('⚠️ رصيد الخزنة غير كافٍ (المتاح: ' + window.formatMoney(boxBalance) + ' ج.م)', 'error');
            return;
        }

        const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });

        const salary = {
            id: window.generateId('sal_'),
            employeeId: emp.id,
            employeeName: emp.name,
            employeeCode: emp.code,
            month: month,
            daysWorked: daysWorked,
            baseAmount: base,
            bonus: bonus,
            deduction: deduction,
            netSalary: net,
            cashBoxId: cashBoxId,
            cashBoxName: box ? box.name : '',
            date: window.getTodayDate(),
            time: window.getNowTime(),
            paidBy: window.currentUser ? window.currentUser.name : ''
        };

        window.DataStore.add('salaries', salary);
        window.DataStore.add('treasury', {
            id: window.generateId('tr_'),
            type: 'withdraw',
            amount: net,
            note: 'راتب ' + emp.name + ' - شهر ' + month,
            cashBoxId: cashBoxId,
            cashBoxName: box ? box.name : '',
            refType: 'salary',
            refId: salary.id,
            date: window.getTodayDate(),
            time: window.getNowTime()
        });

        const salaryAcc = window.Accounting.findByCode('5200');
        const cashAcc = window.Accounting.findByCode('1110');
        if (salaryAcc && cashAcc) {
            window.Accounting.createEntry(window.getTodayDate(),
                'راتب ' + emp.name + ' - شهر ' + month,
                [
                    { accountId: salaryAcc.id, debit: net, credit: 0 },
                    { accountId: cashAcc.id, debit: 0, credit: net }
                ], 'SAL-' + salary.id);
        }

        window.showToast('✅ تم دفع الراتب: ' + window.formatMoney(net) + ' ج.م', 'success');
        window.closeModal();

        setTimeout(function() {
            if (typeof window.renderSalariesList === 'function') window.renderSalariesList();
            if (typeof window.updateDashboard === 'function') window.updateDashboard();
        }, 300);
    };

    window.renderSalariesList = function() {
        const c = document.getElementById('salariesList');
        if (!c) return;

        const records = (window.salaries || []).slice().sort(function(a, b) {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }).slice(0, 100);

        if (records.length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-money-bill-wave"></i><span>لا يوجد سجل رواتب</span></div>';
            return;
        }

        const total = records.reduce(function(s, r) { return s + (parseFloat(r.netSalary) || 0); }, 0);

        let html = '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:10px;padding:14px;text-align:center;color:#0D0D0D;margin-bottom:12px;">' +
            '<div style="font-size:11px;">إجمالي الرواتب المدفوعة</div>' +
            '<div style="font-size:22px;font-weight:900;">' + window.formatMoney(total) + ' ج.م</div>' +
        '</div>';

        html += '<div class="table-header" style="grid-template-columns: 1fr 1fr 1fr 1fr;">' +
            '<span>الموظف</span><span>الشهر</span><span>الراتب</span><span>التاريخ</span>' +
        '</div>';

        records.forEach(function(rec) {
            html += '<div class="table-row" style="grid-template-columns: 1fr 1fr 1fr 1fr;">' +
                '<span><strong>' + window.escapeHtml(rec.employeeName) + '</strong></span>' +
                '<span style="color:#4A8AB5;font-size:11px;">' + rec.month + '</span>' +
                '<span style="color:#2D8F5E;font-weight:700;">' + window.formatMoney(rec.netSalary) + '</span>' +
                '<span style="color:#A89070;font-size:10px;">' + rec.date + '</span>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 5: التنبؤ بالمبيعات
    // ═══════════════════════════════════════════════════════════

    window.predictNextWeekSales = function() {
        const salesByDay = {};
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        (window.sales || []).forEach(function(s) {
            const saleDate = new Date(s.date);
            if (saleDate >= thirtyDaysAgo) {
                const dayOfWeek = saleDate.getDay();
                if (!salesByDay[dayOfWeek]) salesByDay[dayOfWeek] = { total: 0, count: 0 };
                salesByDay[dayOfWeek].total += parseFloat(s.total) || 0;
                salesByDay[dayOfWeek].count++;
            }
        });

        const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const predictions = [];

        for (let i = 0; i < 7; i++) {
            const data = salesByDay[i] || { total: 0, count: 0 };
            const avg = data.count > 0 ? data.total / data.count : 0;
            predictions.push({
                dayIndex: i,
                dayName: dayNames[i],
                avgSales: avg,
                totalSales: data.total,
                count: data.count
            });
        }

        return predictions;
    };

    window.showSalesPredictions = function() {
        const predictions = window.predictNextWeekSales();
        const totalPredicted = predictions.reduce(function(s, p) { return s + p.avgSales; }, 0);
        const maxSales = Math.max.apply(null, predictions.map(function(p) { return p.avgSales; }).concat([1]));

        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🤖 توقع المبيعات - الأسبوع القادم</h3>' +
            '<div style="background:linear-gradient(135deg,#0D0D0D,#1A1A1A);border-radius:14px;padding:14px;margin-bottom:12px;border:2px solid #C9A94E;">' +
                '<div style="text-align:center;padding:10px 0;">' +
                    '<div style="color:#A89070;font-size:11px;font-weight:700;margin-bottom:6px;">📊 إجمالي التوقع</div>' +
                    '<div style="color:#C9A94E;font-size:28px;font-weight:900;font-family:monospace;direction:ltr;">' +
                        window.formatMoney(totalPredicted) + ' ج.م</div>' +
                '</div>' +
            '</div>';

        predictions.forEach(function(p) {
            const percentage = maxSales > 0 ? (p.avgSales / maxSales) * 100 : 0;
            const barColor = percentage > 70 ? '#2D8F5E' : percentage > 40 ? '#C9A94E' : '#E06060';

            html += '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:8px;border-right:4px solid ' + barColor + ';">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<span style="color:#F5E6C8;font-weight:900;font-size:14px;">' + p.dayName + '</span>' +
                    '<span style="color:' + barColor + ';font-weight:900;font-size:14px;font-family:monospace;">' +
                        window.formatMoney(p.avgSales) + ' ج.م</span>' +
                '</div>' +
                '<div style="background:#1A1A1A;height:6px;border-radius:3px;overflow:hidden;">' +
                    '<div style="background:' + barColor + ';height:100%;width:' + percentage + '%;"></div>' +
                '</div>' +
            '</div>';
        });

        html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
        window.openModal(html);
    };

    // ═══════════════════════════════════════════════════════════
    // الجزء 6: الإشعارات
    // ═══════════════════════════════════════════════════════════

    window.requestNotificationPermission = async function() {
        if (!('Notification' in window)) {
            window.showToast('⚠️ المتصفح لا يدعم الإشعارات', 'warning');
            return false;
        }
        if (Notification.permission === 'granted') return true;
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                window.showToast('✅ تم تفعيل الإشعارات', 'success');
                return true;
            }
        }
        return false;
    };

    window.sendNotification = function(title, body, options) {
        options = options || {};
        if (typeof window.showToast === 'function') {
            window.showToast(title + ' - ' + body, options.type || 'info');
        }
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
                const notif = new Notification(title, {
                    body: body,
                    tag: options.tag || 'mizan-' + Date.now()
                });
                notif.onclick = function() {
                    window.focus();
                    notif.close();
                };
                setTimeout(function() { notif.close(); }, 10000);
                return notif;
            } catch (e) {}
        }
    };

    window.notifyNewInvoice = function(invoice) {
        window.sendNotification('💰 فاتورة جديدة #' + invoice.number,
            'العميل: ' + (invoice.customer || 'نقدي') + ' | المبلغ: ' + window.formatMoney(invoice.total) + ' ج.م',
            { type: 'success', tag: 'invoice-' + invoice.number });
    };

    window.__extrasLoaded = true;
    console.log('✅ extras.js v21.0 جاهز');

})();
