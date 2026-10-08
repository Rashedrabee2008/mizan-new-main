// ============================================================
// الميزان 17.0 - extras.js
// الميزات الإضافية: HR + Charts + AI + Notifications + QR + Tools
// يدمج: hr.js + charts.js + ai-predictions.js + notifications.js
//        + qrcode.js + mobile-tools.js + extra-features.js + full-reset.js
// ============================================================

console.log('✨ تحميل extras.js v17.0');

// ═══════════════════════════════════════════════════════════
// الجزء 1: إدارة الموظفين (HR)
// ═══════════════════════════════════════════════════════════

window.employees = window.employees || [];
window.attendance = window.attendance || [];
window.salaries = window.salaries || [];
window.leaves = window.leaves || [];
window.currentEmployeeTab = 'employees';

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

window.loadHRData = function() {
    try {
        window.employees = window.toArray(window.getData('employees', []));
        window.attendance = window.toArray(window.getData('attendance', []));
        window.salaries = window.toArray(window.getData('salaries', []));
        window.leaves = window.toArray(window.getData('leaves', []));
    } catch (e) {
        window.employees = [];
        window.attendance = [];
        window.salaries = [];
        window.leaves = [];
    }
};

window.updateSalaryLabel = function() {
    const type = document.getElementById('empSalaryType') ? document.getElementById('empSalaryType').value : 'monthly';
    const label = document.getElementById('salaryLabel');
    if (label) {
        label.textContent = type === 'monthly' ? 'الراتب الشهري *' : 'الراتب اليومي *';
    }
};

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

    if (!name) { window.showToast('⚠️ أدخل اسم الموظف', 'error'); return; }
    if (baseSalary <= 0) { window.showToast('⚠️ أدخل الراتب', 'error'); return; }

    if (id) {
        const idx = window.employees.findIndex(function(e) { return e.id == id; });
        if (idx > -1) {
            window.employees[idx] = Object.assign({}, window.employees[idx], {
                name: name, phone: phone, jobTitle: jobTitle,
                salaryType: salaryType, baseSalary: baseSalary,
                dailyHours: dailyHours, hireDate: hireDate,
                address: address, notes: notes
            });
            window.showToast('✅ تم التعديل', 'success');
        }
    } else {
        window.employees.push({
            id: Date.now(),
            code: 'EMP-' + String(window.employees.length + 1).padStart(4, '0'),
            name: name, phone: phone, jobTitle: jobTitle,
            salaryType: salaryType, baseSalary: baseSalary,
            dailyHours: dailyHours, hireDate: hireDate,
            address: address, notes: notes,
            active: true,
            createdAt: new Date().toISOString()
        });
        window.showToast('✅ تم الإضافة', 'success');
    }

    window.setData('employees', window.employees);
    window.resetEmployeeForm();
    window.renderEmployees();
    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();
};

window.resetEmployeeForm = function() {
    ['empId','empName','empPhone','empAddress','empNotes'].forEach(function(id) {
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
    window.updateSalaryLabel();
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
    window.updateSalaryLabel();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteEmployee = function(id) {
    const emp = (window.employees || []).find(function(e) { return e.id == id; });
    if (!emp) return;
    if (!confirm('⚠️ حذف "' + emp.name + '"؟')) return;
    window.employees = window.employees.filter(function(e) { return e.id !== id; });
    window.setData('employees', window.employees);
    window.renderEmployees();
    window.showToast('🗑️ تم الحذف', 'info');
};

window.renderEmployees = function() {
    const c = document.getElementById('empList');
    if (!c) return;
    if ((window.employees || []).length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><span>لا يوجد موظفين</span></div>';
        return;
    }
    let html = '<div class="table-header" style="grid-template-columns: 0.7fr 1.2fr 0.9fr 1fr 1.3fr;"><span>الكود</span><span>الاسم</span><span>الوظيفة</span><span>الراتب</span><span></span></div>';
    window.employees.forEach(function(emp) {
        const salaryText = emp.salaryType === 'monthly' 
            ? window.formatMoney(emp.baseSalary) + ' ج.م/شهر' 
            : window.formatMoney(emp.baseSalary) + ' ج.م/يوم';
        html += '<div class="table-row" style="grid-template-columns: 0.7fr 1.2fr 0.9fr 1fr 1.3fr;">' +
            '<span style="font-family:monospace;color:#C9A94E;font-size:11px;">' + emp.code + '</span>' +
            '<span><strong>' + emp.name + '</strong>' +
                (emp.phone ? '<br><small style="color:#A89070;font-size:9px;">📞 ' + emp.phone + '</small>' : '') +
            '</span>' +
            '<span style="font-size:11px;color:#4A8AB5;">' + emp.jobTitle + '</span>' +
            '<span style="color:#2D8F5E;font-weight:700;font-size:11px;">' + salaryText + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-info btn-sm" onclick="showEmployeeDetails(' + emp.id + ')" title="التفاصيل"><i class="fas fa-eye"></i></button>' +
                '<button class="btn btn-success btn-sm" onclick="showAttendanceDialog(' + emp.id + ')" title="حضور"><i class="fas fa-clock"></i></button>' +
                '<button class="btn btn-warning btn-sm" onclick="editEmployee(' + emp.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteEmployee(' + emp.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.showEmployeeDetails = function(id) {
    const emp = (window.employees || []).find(function(e) { return e.id == id; });
    if (!emp) return;

    const empAttendance = window.attendance.filter(function(a) { return a.employeeId == emp.id; });
    const empSalaries = window.salaries.filter(function(s) { return s.employeeId == emp.id; });
    const totalPaid = empSalaries.reduce(function(sum, s) { return sum + (s.netSalary || 0); }, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAttendance = empAttendance.filter(function(a) {
        return new Date(a.date) >= thirtyDaysAgo;
    });

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>👤 ' + emp.name + '</h3>' +
        
        '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:12px;padding:16px;text-align:center;color:#0D0D0D;margin-bottom:12px;">' +
            '<div style="font-size:48px;margin-bottom:8px;">👤</div>' +
            '<div style="font-size:20px;font-weight:900;">' + emp.name + '</div>' +
            '<div style="font-size:13px;margin-top:4px;">' + emp.code + ' • ' + emp.jobTitle + '</div>' +
        '</div>' +

        '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;">' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#A89070;">📞 الهاتف:</span>' +
                '<strong style="color:#F5E6C8;">' + (emp.phone || '-') + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#A89070;">🏢 الوظيفة:</span>' +
                '<strong style="color:#4A8AB5;">' + emp.jobTitle + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#A89070;">💰 الراتب:</span>' +
                '<strong style="color:#2D8F5E;">' + window.formatMoney(emp.baseSalary) + ' ج.م/' + (emp.salaryType === 'monthly' ? 'شهر' : 'يوم') + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2D2D2D;">' +
                '<span style="color:#A89070;">📅 تاريخ التعيين:</span>' +
                '<strong style="color:#C9A94E;">' + emp.hireDate + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0;">' +
                '<span style="color:#A89070;">📍 العنوان:</span>' +
                '<strong style="color:#F5E6C8;font-size:11px;">' + (emp.address || '-') + '</strong>' +
            '</div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:10px;text-align:center;border-right:4px solid #2D8F5E;">' +
                '<div style="color:#A89070;font-size:10px;">⏰ حضور (30 يوم)</div>' +
                '<div style="color:#2D8F5E;font-size:18px;font-weight:900;">' + recentAttendance.length + '</div>' +
            '</div>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:10px;text-align:center;border-right:4px solid #4A8AB5;">' +
                '<div style="color:#A89070;font-size:10px;">📅 إجازات</div>' +
                '<div style="color:#4A8AB5;font-size:18px;font-weight:900;">' + window.leaves.filter(function(l) { return l.employeeId == emp.id; }).length + '</div>' +
            '</div>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:10px;text-align:center;border-right:4px solid #C9A94E;">' +
                '<div style="color:#A89070;font-size:10px;">💵 مدفوعات</div>' +
                '<div style="color:#C9A94E;font-size:14px;font-weight:900;">' + window.formatMoney(totalPaid) + '</div>' +
            '</div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
            '<button class="btn btn-success" onclick="showAttendanceDialog(' + emp.id + ')">' +
                '<i class="fas fa-clock"></i> تسجيل حضور' +
            '</button>' +
            '<button class="btn btn-primary" onclick="showSalaryDialog(' + emp.id + ')">' +
                '<i class="fas fa-money-bill-wave"></i> دفع الراتب' +
            '</button>' +
            '<button class="btn btn-info" onclick="showAttendanceHistory(' + emp.id + ')">' +
                '<i class="fas fa-history"></i> سجل الحضور' +
            '</button>' +
            '<button class="btn btn-warning" onclick="showSalaryHistory(' + emp.id + ')">' +
                '<i class="fas fa-receipt"></i> سجل الرواتب' +
            '</button>' +
        '</div>' +

        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

    window.openModal(html);
};

// ═══════════════════════════════════════════════════════════
// حضور وانصراف
// ═══════════════════════════════════════════════════════════

window.showAttendanceDialog = function(employeeId) {
    const emp = (window.employees || []).find(function(e) { return e.id == employeeId; });
    if (!emp) return;

    const today = window.getTodayDate();
    const existing = window.attendance.find(function(a) {
        return a.employeeId == emp.id && a.date === today;
    });

    const currentTime24 = getCurrentTime24();

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>⏰ تسجيل حضور - ' + emp.name + '</h3>' +
        
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
            '<div style="color:#2D8F5E;font-size:13px;font-weight:900;margin-bottom:10px;">🟢 تسجيل الحضور</div>' +
            '<div class="form-row">' +
                '<div class="form-group" style="margin-bottom:0;">' +
                    '<label style="font-size:10px;color:#A89070;">تعديل وقت الحضور</label>' +
                    '<input type="time" id="checkInTime" value="' + (existing.checkIn24 || currentTime24) + '" style="padding:10px;font-size:15px;text-align:center;font-family:monospace;font-weight:900;background:#1A1A1A;color:#F5E6C8;border:2px solid #3D3D3D;border-radius:8px;width:100%;box-sizing:border-box;" />' +
                '</div>' +
                '<div class="form-group" style="margin-bottom:0;">' +
                    '<label style="font-size:10px;color:#A89070;">الحالي</label>' +
                    '<div style="padding:10px;background:#1A1A1A;border-radius:8px;text-align:center;color:#2D8F5E;font-weight:900;font-family:monospace;border:2px solid #2D8F5E;">' + existing.checkIn + '</div>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-warning btn-block" onclick="updateCheckIn(' + existing.id + ')" style="margin-top:10px;font-size:12px;">' +
                '✏️ تحديث وقت الحضور' +
            '</button>' +
        '</div>';

        html += '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:10px;border-right:4px solid #E06060;">' +
            '<div style="color:#E06060;font-size:13px;font-weight:900;margin-bottom:10px;">🔴 تسجيل الانصراف</div>';

        if (existing.checkOut) {
            html += '<div class="form-row">' +
                '<div class="form-group" style="margin-bottom:0;">' +
                    '<label style="font-size:10px;color:#A89070;">تعديل وقت الانصراف</label>' +
                    '<input type="time" id="checkOutTime" value="' + (existing.checkOut24 || currentTime24) + '" style="padding:10px;font-size:15px;text-align:center;font-family:monospace;font-weight:900;background:#1A1A1A;color:#F5E6C8;border:2px solid #3D3D3D;border-radius:8px;width:100%;box-sizing:border-box;" />' +
                '</div>' +
                '<div class="form-group" style="margin-bottom:0;">' +
                    '<label style="font-size:10px;color:#A89070;">الحالي</label>' +
                    '<div style="padding:10px;background:#1A1A1A;border-radius:8px;text-align:center;color:#E06060;font-weight:900;font-family:monospace;border:2px solid #E06060;">' + existing.checkOut + '</div>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-warning btn-block" onclick="updateCheckOut(' + existing.id + ')" style="margin-top:10px;font-size:12px;">' +
                '✏️ تحديث وقت الانصراف' +
            '</button>';
        } else {
            html += '<div class="form-row">' +
                '<div class="form-group" style="margin-bottom:0;">' +
                    '<label style="font-size:10px;color:#A89070;">وقت الانصراف</label>' +
                    '<input type="time" id="checkOutTime" value="' + currentTime24 + '" style="padding:10px;font-size:15px;text-align:center;font-family:monospace;font-weight:900;background:#1A1A1A;color:#F5E6C8;border:2px solid #3D3D3D;border-radius:8px;width:100%;box-sizing:border-box;" />' +
                '</div>' +
                '<div class="form-group" style="margin-bottom:0;">' +
                    '<label style="font-size:10px;color:#A89070;">أو استخدم</label>' +
                    '<button class="btn btn-info btn-block" onclick="setCheckOutNow()" style="padding:10px;font-size:12px;">' +
                        '⏰ الآن' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="form-group" style="margin-top:10px;">' +
                '<label style="font-size:10px;color:#A89070;">ملاحظات الانصراف</label>' +
                '<input type="text" id="checkOutNotes" placeholder="اختياري" style="padding:10px;" />' +
            '</div>' +
            '<button class="btn btn-danger btn-block" onclick="checkOutEmployee(' + existing.id + ')" style="margin-top:6px;">' +
                '🚪 تسجيل الانصراف' +
            '</button>';
        }
        html += '</div>';

        // ملخص اليوم
        html += '<div style="background:#1A1A1A;border-radius:10px;padding:12px;margin-bottom:10px;">' +
            '<div style="color:#C9A94E;font-size:12px;font-weight:900;margin-bottom:10px;text-align:center;">📊 ملخص اليوم</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<div style="text-align:center;">' +
                    '<div style="color:#2D8F5E;font-size:11px;">🟢 حضور</div>' +
                    '<div style="color:#F5E6C8;font-size:16px;font-weight:900;font-family:monospace;">' + existing.checkIn + '</div>' +
                '</div>' +
                '<div style="text-align:center;">' +
                    '<div style="color:#E06060;font-size:11px;">🔴 انصراف</div>' +
                    '<div style="color:' + (existing.checkOut ? '#F5E6C8' : '#E6A830') + ';font-size:16px;font-weight:900;font-family:monospace;">' + (existing.checkOut || '⏳ لم يسجل') + '</div>' +
                '</div>' +
            '</div>' +
            (existing.workHours ? '<div style="text-align:center;margin-top:10px;padding-top:10px;border-top:1px dashed #3D3D3D;">' +
                '<div style="color:#A89070;font-size:10px;">⏱️ ساعات العمل</div>' +
                '<div style="color:#C9A94E;font-size:22px;font-weight:900;font-family:monospace;">' + existing.workHours + ' ساعة</div>' +
            '</div>' : '') +
        '</div>';

        html += '<button class="btn btn-danger btn-block" onclick="deleteAttendance(' + existing.id + ')" style="margin-bottom:6px;font-size:12px;">' +
            '🗑️ حذف تسجيل اليوم' +
        '</button>';
    } else {
        html += '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;border-right:4px solid #2D8F5E;">' +
            '<div style="color:#2D8F5E;font-size:13px;font-weight:900;margin-bottom:10px;">🟢 تسجيل حضور جديد</div>' +
            '<div class="form-group">' +
                '<label style="font-size:11px;color:#A89070;">⏰ وقت الحضور</label>' +
                '<input type="time" id="checkInTime" value="' + currentTime24 + '" style="padding:12px;font-size:18px;text-align:center;font-family:monospace;font-weight:900;background:#1A1A1A;color:#F5E6C8;border:2px solid #2D8F5E;border-radius:8px;width:100%;box-sizing:border-box;" />' +
            '</div>' +
            '<div class="form-group">' +
                '<label style="font-size:11px;color:#A89070;">📝 ملاحظات</label>' +
                '<input type="text" id="checkInNotes" placeholder="اختياري" style="padding:10px;" />' +
            '</div>' +
            '<button class="btn btn-success btn-block" onclick="checkInEmployee(' + emp.id + ')">' +
                '✅ تسجيل الحضور' +
            '</button>' +
        '</div>';
    }

    html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:6px;">إغلاق</button>';
    window.openModal(html);
};

window.checkInEmployee = function(employeeId) {
    const emp = (window.employees || []).find(function(e) { return e.id == employeeId; });
    if (!emp) return;

    const today = window.getTodayDate();
    const notes = document.getElementById('checkInNotes') ? document.getElementById('checkInNotes').value.trim() : '';
    const time24 = document.getElementById('checkInTime') ? document.getElementById('checkInTime').value : getCurrentTime24();
    const displayTime = time24To12(time24);

    window.attendance.push({
        id: Date.now(),
        employeeId: emp.id,
        employeeName: emp.name,
        date: today,
        checkIn: displayTime,
        checkIn24: time24,
        checkOut: null,
        checkOut24: null,
        status: 'present',
        notes: notes,
        createdAt: new Date().toISOString()
    });

    window.setData('attendance', window.attendance);
    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    window.showToast('✅ تم تسجيل الحضور: ' + displayTime, 'success');
    window.closeModal();
    setTimeout(function() {
        window.renderEmployees();
        if (typeof window.renderAttendanceList === 'function') window.renderAttendanceList();
    }, 300);
};

window.checkOutEmployee = function(attendanceId) {
    const att = window.attendance.find(function(a) { return a.id == attendanceId; });
    if (!att) return;

    const notes = document.getElementById('checkOutNotes') ? document.getElementById('checkOutNotes').value.trim() : '';
    const time24 = document.getElementById('checkOutTime') ? document.getElementById('checkOutTime').value : getCurrentTime24();
    const displayTime = time24To12(time24);

    att.checkOut = displayTime;
    att.checkOut24 = time24;
    if (notes) att.notes = (att.notes ? att.notes + ' | ' : '') + notes;

    const inMin = timeToMinutes(att.checkIn24);
    const outMin = timeToMinutes(att.checkOut24);
    if (inMin !== null && outMin !== null) {
        let diff = outMin - inMin;
        if (diff < 0) diff += 24 * 60;
        att.workHours = (diff / 60).toFixed(2);
    }

    window.setData('attendance', window.attendance);
    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    window.showToast('✅ تم تسجيل الانصراف: ' + displayTime, 'success');
    window.closeModal();
    setTimeout(function() {
        window.renderEmployees();
        if (typeof window.renderAttendanceList === 'function') window.renderAttendanceList();
    }, 300);
};

window.updateCheckIn = function(attendanceId) {
    const att = window.attendance.find(function(a) { return a.id == attendanceId; });
    if (!att) return;

    const time24 = document.getElementById('checkInTime') ? document.getElementById('checkInTime').value : '';
    if (!time24) { window.showToast('⚠️ أدخل الوقت', 'error'); return; }

    att.checkIn = time24To12(time24);
    att.checkIn24 = time24;

    if (att.checkOut24) {
        const inMin = timeToMinutes(att.checkIn24);
        const outMin = timeToMinutes(att.checkOut24);
        if (inMin !== null && outMin !== null) {
            let diff = outMin - inMin;
            if (diff < 0) diff += 24 * 60;
            att.workHours = (diff / 60).toFixed(2);
        }
    }

    window.setData('attendance', window.attendance);
    window.showToast('✅ تم تحديث وقت الحضور', 'success');
    window.closeModal();
    setTimeout(function() {
        window.renderEmployees();
    }, 300);
};

window.updateCheckOut = function(attendanceId) {
    const att = window.attendance.find(function(a) { return a.id == attendanceId; });
    if (!att) return;

    const time24 = document.getElementById('checkOutTime') ? document.getElementById('checkOutTime').value : '';
    if (!time24) { window.showToast('⚠️ أدخل الوقت', 'error'); return; }

    att.checkOut = time24To12(time24);
    att.checkOut24 = time24;

    const inMin = timeToMinutes(att.checkIn24);
    const outMin = timeToMinutes(att.checkOut24);
    if (inMin !== null && outMin !== null) {
        let diff = outMin - inMin;
        if (diff < 0) diff += 24 * 60;
        att.workHours = (diff / 60).toFixed(2);
    }

    window.setData('attendance', window.attendance);
    window.showToast('✅ تم تحديث وقت الانصراف', 'success');
    window.closeModal();
    setTimeout(function() {
        window.renderEmployees();
    }, 300);
};

window.setCheckOutNow = function() {
    const el = document.getElementById('checkOutTime');
    if (el) el.value = getCurrentTime24();
    window.showToast('⏰ تم تعيين الوقت الحالي', 'info');
};

window.deleteAttendance = function(attendanceId) {
    if (!confirm('⚠️ حذف تسجيل اليوم؟')) return;
    
    window.attendance = window.attendance.filter(function(a) { return a.id !== attendanceId; });
    window.setData('attendance', window.attendance);
    
    window.showToast('🗑️ تم الحذف', 'info');
    window.closeModal();
    setTimeout(function() {
        window.renderEmployees();
    }, 300);
};

window.showAttendanceHistory = function(employeeId) {
    const emp = (window.employees || []).find(function(e) { return e.id == employeeId; });
    if (!emp) return;

    const records = window.attendance.filter(function(a) { return a.employeeId == emp.id; })
        .sort(function(a, b) { return b.date.localeCompare(a.date); })
        .slice(0, 60);

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>📅 سجل حضور - ' + emp.name + '</h3>';

    if (records.length === 0) {
        html += '<div style="text-align:center;padding:40px;color:#5D5D5D;">لا يوجد سجل حضور</div>';
    } else {
        const totalHours = records.reduce(function(sum, r) { return sum + parseFloat(r.workHours || 0); }, 0);
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;text-align:center;border-right:4px solid #2D8F5E;">' +
                '<div style="color:#A89070;font-size:11px;">📅 عدد الأيام</div>' +
                '<div style="color:#2D8F5E;font-size:20px;font-weight:900;">' + records.length + '</div>' +
            '</div>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;text-align:center;border-right:4px solid #C9A94E;">' +
                '<div style="color:#A89070;font-size:11px;">⏱️ ساعات العمل</div>' +
                '<div style="color:#C9A94E;font-size:20px;font-weight:900;">' + totalHours.toFixed(1) + '</div>' +
            '</div>' +
        '</div>';

        html += '<div style="max-height:400px;overflow-y:auto;">';
        records.forEach(function(rec) {
            html += '<div style="background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid ' + (rec.checkOut ? '#2D8F5E' : '#E6A830') + ';">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
                    '<strong style="color:#C9A94E;font-size:12px;">📅 ' + rec.date + '</strong>' +
                    (rec.workHours ? '<span style="color:#2D8F5E;font-size:11px;font-weight:900;">⏱️ ' + rec.workHours + ' ساعة</span>' : '<span style="color:#E6A830;font-size:10px;">⏳ مفتوح</span>') +
                '</div>' +
                '<div style="display:flex;gap:12px;font-size:11px;color:#A89070;flex-wrap:wrap;">' +
                    '<span>🟢 حضور: <strong style="color:#2D8F5E;">' + rec.checkIn + '</strong></span>' +
                    (rec.checkOut ? '<span>🔴 انصراف: <strong style="color:#E06060;">' + rec.checkOut + '</strong></span>' : '') +
                '</div>' +
            '</div>';
        });
        html += '</div>';
    }

    html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

window.showSalaryDialog = function(employeeId) {
    const emp = (window.employees || []).find(function(e) { return e.id == employeeId; });
    if (!emp) return;

    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

    const monthAttendance = window.attendance.filter(function(a) {
        return a.employeeId == emp.id && (a.date || '').startsWith(currentMonth);
    });
    const daysWorked = monthAttendance.filter(function(a) { return a.status === 'present'; }).length;
    
    let baseAmount = emp.baseSalary;
    if (emp.salaryType === 'daily') {
        baseAmount = emp.baseSalary * daysWorked;
    }

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>💰 دفع راتب - ' + emp.name + '</h3>' +

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
            '<div class="form-group">' +
                '<label>🎁 مكافآت</label>' +
                '<input type="number" id="salBonus" value="0" min="0" step="0.01" oninput="calcSalary()" />' +
            '</div>' +
            '<div class="form-group">' +
                '<label>💸 خصومات</label>' +
                '<input type="number" id="salDeduction" value="0" min="0" step="0.01" oninput="calcSalary()" />' +
            '</div>' +
        '</div>' +

        '<div class="form-group">' +
            '<label>📝 ملاحظات</label>' +
            '<input type="text" id="salNotes" placeholder="اختياري" />' +
        '</div>' +

        '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:10px;padding:14px;text-align:center;color:#0D0D0D;margin-bottom:12px;">' +
            '<div style="font-size:12px;margin-bottom:4px;">صافي الراتب</div>' +
            '<div id="salNetAmount" style="font-size:28px;font-weight:900;font-family:monospace;">' + window.formatMoney(baseAmount) + '</div>' +
            '<div style="font-size:11px;">ج.م</div>' +
        '</div>' +

        '<input type="hidden" id="salBaseAmount" value="' + baseAmount + '" />' +
        '<input type="hidden" id="salDaysWorked" value="' + daysWorked + '" />' +
        '<input type="hidden" id="salMonth" value="' + currentMonth + '" />' +

        '<div class="form-group">' +
            '<label>💰 الخزنة</label>' +
            '<select id="salCashBox" class="inv-select"><option value="">اختر...</option></select>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
            '<button class="btn btn-success" onclick="saveSalary(' + emp.id + ')">' +
                '<i class="fas fa-check"></i> دفع' +
            '</button>' +
            '<button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>' +
        '</div>';

    window.openModal(html);

    setTimeout(function() {
        const sel = document.getElementById('salCashBox');
        if (!sel) return;
        let opts = '<option value="">اختر...</option>';
        (window.cashBoxes || []).filter(function(b) { return b.active !== false; }).forEach(function(box) {
            opts += '<option value="' + box.id + '">' + (box.icon || '') + ' ' + box.name + (box.isDefault ? ' ⭐' : '') + '</option>';
        });
        sel.innerHTML = opts;
        
        const defaultBox = (window.cashBoxes || []).find(function(b) { return b.isDefault; });
        if (defaultBox) sel.value = defaultBox.id;
    }, 100);
};

window.calcSalary = function() {
    const base = parseFloat(document.getElementById('salBaseAmount') ? document.getElementById('salBaseAmount').value : 0) || 0;
    const bonus = parseFloat(document.getElementById('salBonus') ? document.getElementById('salBonus').value : 0) || 0;
    const deduction = parseFloat(document.getElementById('salDeduction') ? document.getElementById('salDeduction').value : 0) || 0;
    const net = base + bonus - deduction;
    const el = document.getElementById('salNetAmount');
    if (el) el.textContent = window.formatMoney(net);
};

window.saveSalary = function(employeeId) {
    const emp = (window.employees || []).find(function(e) { return e.id == employeeId; });
    if (!emp) return;

    const base = parseFloat(document.getElementById('salBaseAmount') ? document.getElementById('salBaseAmount').value : 0) || 0;
    const bonus = parseFloat(document.getElementById('salBonus') ? document.getElementById('salBonus').value : 0) || 0;
    const deduction = parseFloat(document.getElementById('salDeduction') ? document.getElementById('salDeduction').value : 0) || 0;
    const notes = document.getElementById('salNotes') ? document.getElementById('salNotes').value.trim() : '';
    const cashBoxId = document.getElementById('salCashBox') ? document.getElementById('salCashBox').value : '';
    const month = document.getElementById('salMonth') ? document.getElementById('salMonth').value : '';
    const daysWorked = parseInt(document.getElementById('salDaysWorked') ? document.getElementById('salDaysWorked').value : 0) || 0;

    const net = base + bonus - deduction;

    if (net <= 0) { window.showToast('⚠️ صافي الراتب غير صحيح', 'error'); return; }
    if (!cashBoxId) { window.showToast('⚠️ اختر الخزنة', 'error'); return; }

    const box = (window.cashBoxes || []).find(function(b) { return b.id == cashBoxId; });

    const salary = {
        id: Date.now(),
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
        notes: notes,
        paidBy: window.currentUser ? window.currentUser.name : ''
    };
    window.salaries.push(salary);

    window.treasury.push({
        id: Date.now() + 1,
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

    window.setData('salaries', window.salaries);
    window.setData('treasury', window.treasury);

    if (typeof window.scheduleAutoSync === 'function') window.scheduleAutoSync();

    window.showToast('✅ تم دفع الراتب: ' + window.formatMoney(net) + ' ج.م', 'success');
    window.closeModal();
    
    if (typeof window.renderTreasury === 'function') window.renderTreasury();
    if (typeof window.renderCashBoxes === 'function') window.renderCashBoxes();
    if (typeof window.updateDashboard === 'function') window.updateDashboard();
    if (typeof window.renderSalariesList === 'function') window.renderSalariesList();
};

window.showSalaryHistory = function(employeeId) {
    const emp = (window.employees || []).find(function(e) { return e.id == employeeId; });
    if (!emp) return;

    const records = window.salaries.filter(function(s) { return s.employeeId == emp.id; })
        .sort(function(a, b) { return b.id - a.id; });

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>💰 سجل رواتب - ' + emp.name + '</h3>';

    if (records.length === 0) {
        html += '<div style="text-align:center;padding:40px;color:#5D5D5D;">لا يوجد سجل رواتب</div>';
    } else {
        const total = records.reduce(function(s, r) { return s + (r.netSalary || 0); }, 0);
        html += '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:10px;padding:14px;text-align:center;color:#0D0D0D;margin-bottom:12px;">' +
            '<div style="font-size:11px;">إجمالي المدفوع</div>' +
            '<div style="font-size:22px;font-weight:900;">' + window.formatMoney(total) + ' ج.م</div>' +
        '</div>';
        html += '<div style="max-height:400px;overflow-y:auto;">';
        records.forEach(function(rec) {
            html += '<div style="background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid #C9A94E;">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
                    '<strong style="color:#C9A94E;font-size:12px;">' + rec.month + '</strong>' +
                    '<strong style="color:#2D8F5E;font-size:13px;">' + window.formatMoney(rec.netSalary) + ' ج.م</strong>' +
                '</div>' +
                '<div style="font-size:11px;color:#A89070;">' +
                    '📅 ' + rec.date + ' • ⏰ ' + rec.time +
                '</div>' +
                (rec.bonus > 0 ? '<div style="font-size:10px;color:#2D8F5E;">🎁 مكافأة: +' + window.formatMoney(rec.bonus) + '</div>' : '') +
                (rec.deduction > 0 ? '<div style="font-size:10px;color:#E06060;">💸 خصم: -' + window.formatMoney(rec.deduction) + '</div>' : '') +
            '</div>';
        });
        html += '</div>';
    }

    html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

window.showHRTab = function(tab, btn) {
    window.currentEmployeeTab = tab;

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

window.renderAttendanceList = function() {
    const c = document.getElementById('attendanceList');
    if (!c) return;

    const records = (window.attendance || []).slice().sort(function(a, b) {
        return b.date.localeCompare(a.date);
    }).slice(0, 100);

    if (records.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><span>لا يوجد سجل حضور</span></div>';
        return;
    }

    let html = '<div class="table-header" style="grid-template-columns: 1fr 0.9fr 0.9fr 0.8fr 0.7fr;"><span>الموظف</span><span>الحضور</span><span>الانصراف</span><span>ساعات</span><span></span></div>';
    records.forEach(function(rec) {
        html += '<div class="table-row" style="grid-template-columns: 1fr 0.9fr 0.9fr 0.8fr 0.7fr;">' +
            '<span><strong>' + rec.employeeName + '</strong><br><small style="color:#A89070;font-size:9px;">' + rec.date + '</small></span>' +
            '<span style="color:#2D8F5E;font-size:11px;">' + rec.checkIn + '</span>' +
            '<span style="color:' + (rec.checkOut ? '#E06060' : '#E6A830') + ';font-size:11px;">' + (rec.checkOut || '⏳') + '</span>' +
            '<span style="color:#4A8AB5;font-size:11px;">' + (rec.workHours || '-') + '</span>' +
            '<button class="btn btn-warning btn-sm" onclick="showAttendanceDialog(' + rec.employeeId + ')"><i class="fas fa-edit"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.renderSalariesList = function() {
    const c = document.getElementById('salariesList');
    if (!c) return;

    const records = (window.salaries || []).slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 100);

    if (records.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-money-bill-wave"></i><span>لا يوجد سجل رواتب</span></div>';
        return;
    }

    const total = records.reduce(function(s, r) { return s + (r.netSalary || 0); }, 0);

    let html = '<div style="background:linear-gradient(135deg,#C9A94E,#B8953A);border-radius:10px;padding:14px;text-align:center;color:#0D0D0D;margin-bottom:12px;">' +
        '<div style="font-size:11px;">إجمالي الرواتب المدفوعة</div>' +
        '<div style="font-size:22px;font-weight:900;">' + window.formatMoney(total) + ' ج.م</div>' +
    '</div>';

    html += '<div class="table-header" style="grid-template-columns: 1fr 1fr 1fr 1fr;"><span>الموظف</span><span>الشهر</span><span>الراتب</span><span>التاريخ</span></div>';
    records.forEach(function(rec) {
        html += '<div class="table-row" style="grid-template-columns: 1fr 1fr 1fr 1fr;">' +
            '<span><strong>' + rec.employeeName + '</strong></span>' +
            '<span style="color:#4A8AB5;font-size:11px;">' + rec.month + '</span>' +
            '<span style="color:#2D8F5E;font-weight:700;">' + window.formatMoney(rec.netSalary) + '</span>' +
            '<span style="color:#A89070;font-size:10px;">' + rec.date + '</span>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// الجزء 2: الرسوم البيانية (Charts)
// ═══════════════════════════════════════════════════════════

window.drawLineChart = function(canvasId, data, options) {
    options = options || {};
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.offsetWidth || 300;
    const height = rect.height || canvas.offsetHeight || 200;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) {
        ctx.fillStyle = '#A89070';
        ctx.font = '14px Tajawal, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('لا توجد بيانات', width / 2, height / 2);
        return;
    }

    const maxValue = Math.max.apply(null, data.map(function(d) { return d.value; }).concat([1]));

    // الشبكة
    ctx.strokeStyle = '#2D2D2D';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        const value = maxValue - (maxValue / 4) * i;
        ctx.fillStyle = '#A89070';
        ctx.font = '10px Tajawal, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatShortNumber(value), padding.left - 5, y);
    }

    // النقاط
    const points = data.map(function(d, i) {
        const x = padding.left + (chartWidth / Math.max(data.length - 1, 1)) * i;
        const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
        return { x: x, y: y, value: d.value, label: d.label };
    });

    // التدرج
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, (options.color || '#C9A94E') + '80');
    gradient.addColorStop(1, (options.color || '#C9A94E') + '00');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    points.forEach(function(p) { ctx.lineTo(p.x, p.y); });
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // الخط
    ctx.beginPath();
    ctx.strokeStyle = options.color || '#C9A94E';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    points.forEach(function(p, i) {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // النقاط
    points.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = options.color || '#C9A94E';
        ctx.fill();
        ctx.strokeStyle = '#0D0D0D';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // التسميات
    ctx.fillStyle = '#A89070';
    ctx.font = '10px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const step = Math.max(1, Math.floor(data.length / 7));
    data.forEach(function(d, i) {
        if (i % step === 0 || i === data.length - 1) {
            ctx.fillText(d.label, points[i].x, padding.top + chartHeight + 10);
        }
    });
};

window.drawBarChart = function(canvasId, data, options) {
    options = options || {};
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.offsetWidth || 300;
    const height = rect.height || canvas.offsetHeight || 200;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) {
        ctx.fillStyle = '#A89070';
        ctx.font = '14px Tajawal, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('لا توجد بيانات', width / 2, height / 2);
        return;
    }

    const maxValue = Math.max.apply(null, data.map(function(d) { return d.value; }).concat([1]));

    // الشبكة
    ctx.strokeStyle = '#2D2D2D';
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        const value = maxValue - (maxValue / 4) * i;
        ctx.fillStyle = '#A89070';
        ctx.font = '10px Tajawal, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatShortNumber(value), padding.left - 5, y);
    }

    // الأعمدة
    const barWidth = chartWidth / data.length * 0.7;
    const barGap = chartWidth / data.length * 0.3;

    data.forEach(function(d, i) {
        const x = padding.left + (chartWidth / data.length) * i + barGap / 2;
        const barHeight = (d.value / maxValue) * chartHeight;
        const y = padding.top + chartHeight - barHeight;

        const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartHeight);
        const color = d.color || options.color || '#C9A94E';
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '40');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        if (d.value > 0) {
            ctx.fillStyle = '#F5E6C8';
            ctx.font = 'bold 10px Tajawal, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(formatShortNumber(d.value), x + barWidth / 2, y - 3);
        }

        ctx.fillStyle = '#A89070';
        ctx.font = '10px Tajawal, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(d.label, x + barWidth / 2, padding.top + chartHeight + 10);
    });
};

window.drawPieChart = function(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.offsetWidth || 300;
    const height = rect.height || canvas.offsetHeight || 200;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) {
        ctx.fillStyle = '#A89070';
        ctx.font = '14px Tajawal, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('لا توجد بيانات', width / 2, height / 2);
        return;
    }

    const total = data.reduce(function(s, d) { return s + d.value; }, 0);
    if (total === 0) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;
    const innerRadius = radius * 0.5;

    let currentAngle = -Math.PI / 2;

    data.forEach(function(d) {
        const sliceAngle = (d.value / total) * Math.PI * 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        
        ctx.fillStyle = d.color || '#C9A94E';
        ctx.fill();
        
        ctx.strokeStyle = '#0D0D0D';
        ctx.lineWidth = 2;
        ctx.stroke();

        currentAngle += sliceAngle;
    });

    ctx.fillStyle = '#C9A94E';
    ctx.font = 'bold 14px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('الإجمالي', centerX, centerY - 10);
    
    ctx.fillStyle = '#F5E6C8';
    ctx.font = 'bold 16px Courier New, monospace';
    ctx.fillText(formatShortNumber(total), centerX, centerY + 12);
};

function formatShortNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
}

window.showChartsDashboard = function() {
    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>📊 التقارير البيانية</h3>';

    html += '<div style="background:#0D0D0D;border-radius:12px;padding:14px;margin-bottom:12px;">' +
        '<div style="color:#C9A94E;font-size:13px;font-weight:900;margin-bottom:10px;">📈 المبيعات - آخر 7 أيام</div>' +
        '<div style="position:relative;height:220px;"><canvas id="chartDailySales" style="width:100%;height:100%;"></canvas></div>' +
    '</div>';

    html += '<div style="background:#0D0D0D;border-radius:12px;padding:14px;margin-bottom:12px;">' +
        '<div style="color:#4A8AB5;font-size:13px;font-weight:900;margin-bottom:10px;">📊 المبيعات - آخر 6 شهور</div>' +
        '<div style="position:relative;height:220px;"><canvas id="chartMonthlySales" style="width:100%;height:100%;"></canvas></div>' +
    '</div>';

    html += '<div style="background:#0D0D0D;border-radius:12px;padding:14px;margin-bottom:12px;">' +
        '<div style="color:#2D8F5E;font-size:13px;font-weight:900;margin-bottom:10px;">💳 توزيع طرق الدفع</div>' +
        '<div style="position:relative;height:250px;"><canvas id="chartPaymentMethods" style="width:100%;height:100%;"></canvas></div>' +
    '</div>';

    html += '<div style="background:#0D0D0D;border-radius:12px;padding:14px;margin-bottom:12px;">' +
        '<div style="color:#E6A830;font-size:13px;font-weight:900;margin-bottom:10px;">🏆 أفضل 5 منتجات</div>' +
        '<div style="position:relative;height:250px;"><canvas id="chartTopProducts" style="width:100%;height:100%;"></canvas></div>' +
    '</div>';

    html += '<button class="btn btn-secondary btn-block" onclick="closeModal()">إغلاق</button>';

    window.openModal(html);

    setTimeout(function() {
        renderAllCharts();
    }, 300);
};

function renderAllCharts() {
    const dailySales = getDailySales();
    if (document.getElementById('chartDailySales')) window.drawLineChart('chartDailySales', dailySales, { color: '#C9A94E' });

    const monthlySales = getMonthlySales();
    if (document.getElementById('chartMonthlySales')) window.drawBarChart('chartMonthlySales', monthlySales, { color: '#4A8AB5' });

    const paymentMethods = getPaymentMethodsData();
    if (document.getElementById('chartPaymentMethods')) window.drawPieChart('chartPaymentMethods', paymentMethods);

    const topProducts = getTopProducts(5);
    if (document.getElementById('chartTopProducts')) window.drawBarChart('chartTopProducts', topProducts, { color: '#E6A830' });
}

function getDailySales() {
    const days = [];
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const total = (window.sales || []).filter(function(s) { return s.date === dateStr; })
            .reduce(function(sum, s) { return sum + (s.total || 0); }, 0);
        days.push({
            label: dayNames[d.getDay()].substring(0, 5),
            value: total
        });
    }
    return days;
}

function getMonthlySales() {
    const months = [];
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        const total = (window.sales || []).filter(function(s) { return (s.date || '').startsWith(monthStr); })
            .reduce(function(sum, s) { return sum + (s.total || 0); }, 0);
        months.push({
            label: monthNames[d.getMonth()].substring(0, 6),
            value: total
        });
    }
    return months;
}

function getPaymentMethodsData() {
    const methods = {
        'cash': { name: 'نقدي', color: '#2D8F5E', value: 0 },
        'credit': { name: 'آجل', color: '#E06060', value: 0 },
        'wallet': { name: 'محفظة', color: '#4A8AB5', value: 0 },
        'visa': { name: 'فيزا', color: '#9B59B6', value: 0 },
        'bank': { name: 'بنك', color: '#E6A830', value: 0 }
    };
    
    (window.sales || []).forEach(function(s) {
        if (methods[s.paymentMethod]) {
            methods[s.paymentMethod].value += (s.total || 0);
        }
    });
    
    return Object.values(methods).filter(function(m) { return m.value > 0; })
        .map(function(m) { return { label: m.name, value: m.value, color: m.color }; });
}

function getTopProducts(limit) {
    const stats = {};
    (window.sales || []).forEach(function(s) {
        (s.items || []).forEach(function(item) {
            if (!stats[item.name]) stats[item.name] = { name: item.name, total: 0 };
            stats[item.name].total += item.total;
        });
    });
    
    return Object.values(stats).sort(function(a, b) { return b.total - a.total; })
        .slice(0, limit)
        .map(function(p) { 
            return { label: p.name.substring(0, 8), value: p.total, color: '#E6A830' }; 
        });
}

// ═══════════════════════════════════════════════════════════
// الجزء 3: الذكاء الاصطناعي (AI)
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
            salesByDay[dayOfWeek].total += (s.total || 0);
            salesByDay[dayOfWeek].count++;
        }
    });
    
    const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
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
                '<div style="color:#C9A94E;font-size:28px;font-weight:900;font-family:monospace;direction:ltr;">' + window.formatMoney(totalPredicted) + ' ج.م</div>' +
            '</div>' +
        '</div>' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:10px;margin-bottom:12px;font-size:11px;color:#A89070;text-align:center;">' +
            '🧠 الحساب بناءً على متوسط آخر 30 يوم' +
        '</div>';

    predictions.forEach(function(p) {
        const percentage = maxSales > 0 ? (p.avgSales / maxSales) * 100 : 0;
        const barColor = percentage > 70 ? '#2D8F5E' : percentage > 40 ? '#C9A94E' : '#E06060';

        html += '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:8px;border-right:4px solid ' + barColor + ';">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                '<span style="color:#F5E6C8;font-weight:900;font-size:14px;">' + p.dayName + '</span>' +
                '<span style="color:' + barColor + ';font-weight:900;font-size:14px;font-family:monospace;">' + window.formatMoney(p.avgSales) + ' ج.م</span>' +
            '</div>' +
            '<div style="background:#1A1A1A;height:6px;border-radius:3px;overflow:hidden;">' +
                '<div style="background:' + barColor + ';height:100%;width:' + percentage + '%;"></div>' +
            '</div>' +
        '</div>';
    });

    html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

window.predictStockOut = function() {
    const products = window.products || [];
    const sales = window.sales || [];
    const predictions = [];

    products.forEach(function(p) {
        let totalSold = 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        sales.forEach(function(s) {
            const saleDate = new Date(s.date);
            if (saleDate >= thirtyDaysAgo) {
                (s.items || []).forEach(function(it) {
                    if (it.productId == p.id) totalSold += (it.qty || 0);
                });
            }
        });

        const avgDailySales = totalSold / 30;
        const daysUntilOut = avgDailySales > 0 ? Math.floor(p.qty / avgDailySales) : 999;

        if (daysUntilOut <= 14 && p.qty > 0) {
            predictions.push({
                product: p,
                daysUntilOut: daysUntilOut,
                avgDailySales: avgDailySales,
                severity: daysUntilOut <= 3 ? 'critical' : daysUntilOut <= 7 ? 'high' : 'medium'
            });
        } else if (p.qty === 0) {
            predictions.push({
                product: p, daysUntilOut: 0,
                avgDailySales: avgDailySales, severity: 'out'
            });
        }
    });

    predictions.sort(function(a, b) { return a.daysUntilOut - b.daysUntilOut; });
    return predictions;
};

window.showStockPredictions = function() {
    const predictions = window.predictStockOut();

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>⚠️ توقع نفاذ المخزون</h3>';

    if (predictions.length === 0) {
        html += '<div style="text-align:center;padding:40px 20px;">' +
            '<div style="font-size:64px;margin-bottom:16px;">✅</div>' +
            '<div style="color:#2D8F5E;font-size:16px;font-weight:900;">المخزون في حالة ممتازة</div>' +
        '</div>';
    } else {
        predictions.forEach(function(pred) {
            const colors = {
                'out': { bg: '#3D0D0D', border: '#E06060', text: '#E06060', icon: '🚨' },
                'critical': { bg: '#2D0D0D', border: '#E06060', text: '#E06060', icon: '🚨' },
                'high': { bg: '#2D1F0D', border: '#E6A830', text: '#E6A830', icon: '⚠️' },
                'medium': { bg: '#0D1A2D', border: '#4A8AB5', text: '#4A8AB5', icon: 'ℹ️' }
            };
            const c = colors[pred.severity] || colors.medium;
            const daysText = pred.daysUntilOut === 0 ? 'نفد المخزون!' :
                             pred.daysUntilOut === 1 ? 'يوم واحد' :
                             pred.daysUntilOut + ' يوم';

            html += '<div style="background:' + c.bg + ';border-radius:10px;padding:12px;margin-bottom:8px;border-right:4px solid ' + c.border + ';">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                    '<strong style="color:#F5E6C8;font-size:13px;">' + c.icon + ' ' + pred.product.name + '</strong>' +
                    '<span style="color:' + c.text + ';font-weight:900;font-size:13px;">' + daysText + '</span>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;font-size:11px;color:#A89070;">' +
                    '<div>📦 <strong style="color:#F5E6C8;">' + pred.product.qty + '</strong> متاح</div>' +
                    '<div>📊 <strong style="color:#F5E6C8;">' + pred.avgDailySales.toFixed(2) + '</strong> /يوم</div>' +
                    '<div>💡 اشترِ <strong style="color:#C9A94E;">' + Math.ceil(pred.avgDailySales * 30) + '</strong></div>' +
                '</div>' +
            '</div>';
        });
    }

    html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
    window.openModal(html);
};

window.showAIDashboard = function() {
    const predictions = window.predictNextWeekSales();
    const stockWarnings = window.predictStockOut();

    const totalPredicted = predictions.reduce(function(s, p) { return s + p.avgSales; }, 0);
    const criticalStock = stockWarnings.filter(function(p) { 
        return p.severity === 'critical' || p.severity === 'out'; 
    }).length;

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>🤖 مساعد الميزان الذكي</h3>' +
        '<div style="background:linear-gradient(135deg,#1A1500,#0D0D0D);border-radius:14px;padding:14px;margin-bottom:12px;border:2px solid #C9A94E;text-align:center;">' +
            '<div style="font-size:48px;margin-bottom:8px;">🧠</div>' +
            '<div style="color:#C9A94E;font-size:14px;font-weight:900;">تحليلات ذكية</div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;border-right:4px solid #2D8F5E;">' +
                '<div style="color:#A89070;font-size:10px;">📈 توقع الأسبوع</div>' +
                '<div style="color:#2D8F5E;font-size:16px;font-weight:900;font-family:monospace;">' + window.formatMoney(totalPredicted) + '</div>' +
            '</div>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:12px;border-right:4px solid #E06060;">' +
                '<div style="color:#A89070;font-size:10px;">⚠️ مخزون حرج</div>' +
                '<div style="color:#E06060;font-size:16px;font-weight:900;">' + criticalStock + '</div>' +
            '</div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr;gap:8px;">' +
            '<button class="btn btn-primary btn-block" onclick="closeModal(); setTimeout(showSalesPredictions, 300);" style="justify-content:flex-start;padding:14px;">' +
                '<i class="fas fa-chart-line"></i><span style="margin-right:auto;">📊 توقع المبيعات الأسبوع القادم</span>' +
            '</button>' +
            '<button class="btn btn-warning btn-block" onclick="closeModal(); setTimeout(showStockPredictions, 300);" style="justify-content:flex-start;padding:14px;">' +
                '<i class="fas fa-exclamation-triangle"></i><span style="margin-right:auto;">⚠️ المنتجات على وشك النفاذ</span>' +
            '</button>' +
        '</div>' +
        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

    window.openModal(html);
};

// ═══════════════════════════════════════════════════════════
// الجزء 4: الإشعارات
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
    if (Notification.permission === 'granted') {
        try {
            const notif = new Notification(title, {
                body: body,
                vibrate: [200, 100, 200],
                tag: options.tag || 'mizan-' + Date.now()
            });
            notif.onclick = function() { window.focus(); notif.close(); };
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

window.notifyLowStock = function(product) {
    window.sendNotification('⚠️ انخفاض المخزون',
        product.name + ' - الكمية: ' + product.qty,
        { type: 'warning', tag: 'stock-' + product.id });
};

// ═══════════════════════════════════════════════════════════
// الجزء 5: QR Code
// ═══════════════════════════════════════════════════════════

function loadQRCodeLibrary() {
    return new Promise(function(resolve, reject) {
        if (typeof qrcode !== 'undefined') { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
        script.onload = function() { resolve(); };
        script.onerror = function() { reject(); };
        document.head.appendChild(script);
    });
}

window.showInvoiceQR = async function(invoiceId) {
    try {
        await loadQRCodeLibrary();
        const invoice = (window.sales || []).find(function(s) { return s.id == invoiceId; });
        if (!invoice) { window.showToast('⚠️ الفاتورة غير موجودة', 'error'); return; }

        const company = window.companyData || { name: 'الميزان' };
        const qrText = [
            company.name || 'Mizan',
            'INV#' + invoice.number,
            'Date: ' + invoice.date,
            'Customer: ' + (invoice.customer || 'Cash'),
            'TOTAL: ' + window.formatMoney(invoice.total) + ' EGP'
        ].join('\n');

        let qr = qrcode(0, 'L');
        qr.addData(qrText);
        qr.make();
        const qrSvg = qr.createSvgTag({ cellSize: 6, margin: 4, scalable: true });

        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>📱 QR Code - فاتورة #' + invoice.number + '</h3>' +
            '<div style="background:#fff;padding:20px;border-radius:12px;text-align:center;">' +
                '<div id="qrContainer" style="display:inline-block;padding:10px;background:#fff;border-radius:8px;">' + qrSvg + '</div>' +
                '<div style="margin-top:15px;color:#0D0D0D;font-size:12px;font-weight:800;">📱 امسح الكود</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

        window.openModal(html);
    } catch (e) {
        window.showToast('❌ فشل توليد QR', 'error');
    }
};

// ═══════════════════════════════════════════════════════════
// الجزء 6: النسخ الاحتياطي التلقائي
// ═══════════════════════════════════════════════════════════

function createAutoBackup() {
    try {
        const keys = ['products', 'sales', 'purchases', 'expenses', 
                     'cashBoxes', 'customers', 'suppliers', 'users',
                     'treasury', 'journalEntries', 'returns'];
        const data = {};
        
        keys.forEach(function(key) {
            const value = window.getData(key, null);
            if (value) data[key] = value;
        });

        let backups = JSON.parse(localStorage.getItem('mizan_backups') || '[]');
        backups.unshift({
            timestamp: Date.now(),
            date: new Date().toISOString(),
            data: data
        });

        if (backups.length > 3) backups.length = 3;
        localStorage.setItem('mizan_backups', JSON.stringify(backups));
        console.log('💾 نسخة احتياطية تلقائية');
    } catch (e) {
        console.warn('⚠️ فشل النسخ الاحتياطي:', e.message);
    }
}

setInterval(createAutoBackup, 5 * 60 * 1000);
setTimeout(createAutoBackup, 30000);

// ═══════════════════════════════════════════════════════════
// الجزء 7: أدوات التشخيص (Mobile Tools)
// ═══════════════════════════════════════════════════════════

window.showSystemStatus = function() {
    const status = {
        coreLoaded: window.__coreLoaded === true,
        appLoaded: window.__appLoaded === true,
        dashboardLoaded: window.__dashboardLoaded === true,
        firebaseLoaded: window.__firebaseLoaded === true,
        posLoaded: window.__posLoaded === true,
        accountingLoaded: window.__accountingLoaded === true,
        inventoryLoaded: window.__inventoryLoaded === true,
        extrasLoaded: window.__extrasLoaded === true,
        firebase: window.firebaseReady === true,
        user: window.currentUser ? window.currentUser.name : 'غير مسجل',
        products: (window.products || []).length,
        sales: (window.sales || []).length,
        customers: (window.customers || []).length
    };

    let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>📊 حالة النظام</h3>' +
        '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">';

    Object.keys(status).forEach(function(key) {
        const val = status[key];
        const isOk = val === true || (typeof val === 'number' && val >= 0) || (typeof val === 'string');
        const display = typeof val === 'boolean' ? (val ? '✅' : '❌') : val;
        const color = typeof val === 'boolean' ? (val ? '#2D8F5E' : '#E06060') : '#F5E6C8';
        
        html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2D2D2D;">' +
            '<span style="color:#A89070;">' + key + ':</span>' +
            '<strong style="color:' + color + ';">' + display + '</strong>' +
        '</div>';
    });

    html += '</div>' +
        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

    window.openModal(html);
};

// ═══════════════════════════════════════════════════════════
// الجزء 8: إعادة التصفير الشاملة
// ═══════════════════════════════════════════════════════════

window.fullReset = {
    confirm: function(message, title) {
        return new Promise(function(resolve) {
            const overlay = document.getElementById('modalOverlay');
            if (!overlay) { resolve(confirm(message)); return; }

            overlay.innerHTML = '<div class="modal-box" style="max-width: 420px; text-align: center;">' +
                '<div style="font-size: 52px; margin-bottom: 12px;">⚠️</div>' +
                '<h3 style="color: #E06060; margin-bottom: 14px;">' + (title || 'تأكيد') + '</h3>' +
                '<p style="color: #F5E6C8; margin-bottom: 20px; line-height: 1.7;">' + message + '</p>' +
                '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">' +
                    '<button class="btn btn-secondary" id="resetNo">❌ إلغاء</button>' +
                    '<button class="btn btn-danger" id="resetYes">🗑️ حذف الكل</button>' +
                '</div>' +
            '</div>';

            overlay.classList.add('show');

            document.getElementById('resetNo').onclick = function() {
                overlay.classList.remove('show');
                resolve(false);
            };
            document.getElementById('resetYes').onclick = function() {
                overlay.classList.remove('show');
                resolve(true);
            };
        });
    },

    run: async function() {
        const confirmed = await window.fullReset.confirm(
            'سيتم مسح كل شيء من:\n• localStorage\n• Firebase\n• Cache\n\nهل أنت متأكد؟',
            'تأكيد الحذف الكامل'
        );
        
        if (!confirmed) return false;

        console.log('🔄 بدء إعادة التصفير...');
        
        localStorage.clear();
        sessionStorage.clear();
        
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
            try {
                const db = firebase.database();
                const paths = ['products','sales','purchases','customers','suppliers',
                              'expenses','cashBoxes','treasury','journalEntries','returns'];
                
                await Promise.all(paths.map(function(p) {
                    return db.ref('mizan/' + p).remove().catch(function() {});
                }));
            } catch (e) {}
        }
        
        if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(function(n) { return caches.delete(n); }));
        }
        
        setTimeout(function() {
            location.href = location.origin + location.pathname + '?reset=' + Date.now();
        }, 2000);
        
        return true;
    }
};

// ═══════════════════════════════════════════════════════════
// إضافة أزرار في قائمة المزيد
// ═══════════════════════════════════════════════════════════

function addExtraButtons() {
    const menu = document.getElementById('moreMenu');
    if (!menu) return;
    const grid = menu.querySelector('div[style*="grid"]');
    if (!grid) return;

    // زر الموظفين
    if (!grid.querySelector('[data-hr="true"]')) {
        const btn = document.createElement('button');
        btn.className = 'more-item';
        btn.setAttribute('data-hr', 'true');
        btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;background:linear-gradient(135deg,#0D1A2D,#0D0D0D);border:2px solid #4A8AB5;color:#F5E6C8;padding:12px 6px;border-radius:10px;font-family:inherit;font-size:12px;cursor:pointer;';
        btn.innerHTML = '<i class="fas fa-user-tie" style="color:#4A8AB5;font-size:20px;"></i>' +
            '<span style="font-weight:900;">الموظفين</span>';
        btn.onclick = function() {
            if (typeof window.toggleMoreMenu === 'function') window.toggleMoreMenu();
            setTimeout(function() { window.navigateTo('employees'); }, 300);
        };
        grid.insertBefore(btn, grid.firstChild);
    }

    // زر الرسوم البيانية
    if (!grid.querySelector('[data-charts="true"]')) {
        const btn = document.createElement('button');
        btn.className = 'more-item';
        btn.setAttribute('data-charts', 'true');
        btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;background:linear-gradient(135deg,#1A0D1F,#0D0D0D);border:2px solid #9B59B6;color:#F5E6C8;padding:12px 6px;border-radius:10px;font-family:inherit;font-size:12px;cursor:pointer;';
        btn.innerHTML = '<i class="fas fa-chart-line" style="color:#9B59B6;font-size:20px;"></i>' +
            '<span style="font-weight:900;">رسوم بيانية</span>';
        btn.onclick = function() {
            if (typeof window.toggleMoreMenu === 'function') window.toggleMoreMenu();
            setTimeout(window.showChartsDashboard, 300);
        };
        grid.insertBefore(btn, grid.firstChild);
    }

    // زر المساعد الذكي
    if (!grid.querySelector('[data-ai="true"]')) {
        const btn = document.createElement('button');
        btn.className = 'more-item';
        btn.setAttribute('data-ai', 'true');
        btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;background:linear-gradient(135deg,#1A1500,#0D0D0D);border:2px solid #C9A94E;color:#F5E6C8;padding:12px 6px;border-radius:10px;font-family:inherit;font-size:12px;cursor:pointer;';
        btn.innerHTML = '<i class="fas fa-brain" style="color:#C9A94E;font-size:20px;"></i>' +
            '<span style="font-weight:900;">مساعد ذكي</span>';
        btn.onclick = function() {
            if (typeof window.toggleMoreMenu === 'function') window.toggleMoreMenu();
            setTimeout(window.showAIDashboard, 300);
        };
        grid.insertBefore(btn, grid.firstChild);
    }
}

// ═══════════════════════════════════════════════════════════
// التهيئة
// ═══════════════════════════════════════════════════════════

window.initExtras = function() {
    window.loadHRData();
    setTimeout(addExtraButtons, 2000);
    console.log('✅ الميزات الإضافية جاهزة');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(window.initExtras, 1500);
    });
} else {
    setTimeout(window.initExtras, 1500);
}

// ═══════════════════════════════════════════════════════════
// علم التحميل
// ═══════════════════════════════════════════════════════════
window.__extrasLoaded = true;

console.log('✅ extras.js v17.0 جاهز');
