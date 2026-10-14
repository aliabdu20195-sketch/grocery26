// ===== البيانات الأساسية =====
let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let debtors = JSON.parse(localStorage.getItem('debtors')) || [];
let creditors = JSON.parse(localStorage.getItem('creditors')) || [];

// ===== إعدادات البداية =====
document.addEventListener('DOMContentLoaded', function() {
    // ضبط التاريخ الحالي
    document.getElementById('sale-date').valueAsDate = new Date();
    document.getElementById('debtor-date').valueAsDate = new Date();
    document.getElementById('creditor-date').valueAsDate = new Date();

    // تحميل البيانات
    loadAllData();

    // إضافة مستمعي الأحداث للقوائم
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
});

// ===== التبديل بين التبويبات =====
function switchTab(tabName) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // إزالة الفئة active من جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // إظهار التبويب المطلوب
    document.getElementById(tabName).classList.add('active');

    // تفعيل الزر المطابق
    event.target.classList.add('active');

    // تحديث البيانات
    updateDashboard();
    if (tabName === 'reports') updateReports();
}

// ===== المنتجات =====
function addProduct() {
    const code = document.getElementById('product-code').value.trim();
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const qty = parseInt(document.getElementById('product-qty').value);

    // التحقق من البيانات
    if (!code || !name || !price || !qty) {
        alert('❌ يرجى ملء جميع الحقول!');
        return;
    }

    if (price < 0 || qty < 0) {
        alert('❌ السعر والكمية يجب أن تكون موجبة!');
        return;
    }

    // التحقق من عدم تكرار الكود
    if (products.some(p => p.code === code)) {
        alert('❌ هذا الكود موجود بالفعل!');
        return;
    }

    // إضافة المنتج
    products.push({
        code: code,
        name: name,
        price: price,
        qty: qty,
        date: new Date().toLocaleDateString('ar-SA')
    });

    saveData('products', products);
    renderProducts();
    clearProductForm();
    alert('✅ تم إضافة المنتج بنجاح!');
    updateDashboard();
}

function renderProducts() {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';

    products.forEach((product, index) => {
        const row = `
            <tr>
                <td>${product.code}</td>
                <td>${product.name}</td>
                <td>${product.price.toFixed(2)} ريال</td>
                <td>${product.qty}</td>
                <td>
                    <button class="delete-btn" onclick="deleteProduct(${index})">حذف</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function deleteProduct(index) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        products.splice(index, 1);
        saveData('products', products);
        renderProducts();
        updateDashboard();
    }
}

function clearProductForm() {
    document.getElementById('product-code').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-qty').value = '';
}

// ===== المبيعات =====
function addSale() {
    const date = document.getElementById('sale-date').value;
    const code = document.getElementById('sale-product-code').value.trim();
    const qty = parseInt(document.getElementById('sale-qty').value);
    const type = document.getElementById('sale-type').value;

    // التحقق من البيانات
    if (!date || !code || !qty) {
        alert('❌ يرجى ملء جميع الحقول!');
        return;
    }

    // البحث عن المنتج
    const product = products.find(p => p.code === code);
    if (!product) {
        alert('❌ المنتج غير موجود!');
        return;
    }

    if (qty < 1) {
        alert('❌ الكمية يجب أن تكون على الأقل 1!');
        return;
    }

    // التحقق من الكمية المتاحة
    if (qty > product.qty) {
        alert(`❌ الكمية المتاحة: ${product.qty}`);
        return;
    }

    // إضافة المبيعة
    const total = product.price * qty;
    sales.push({
        date: date,
        code: code,
        name: product.name,
        qty: qty,
        price: product.price,
        total: total,
        type: type
    });

    // تقليل الكمية
    product.qty -= qty;
    saveData('sales', sales);
    saveData('products', products);
    renderSales();
    clearSaleForm();
    alert('✅ تم تسجيل المبيعة بنجاح!');
    updateDashboard();
}

function renderSales() {
    const tbody = document.getElementById('sales-tbody');
    tbody.innerHTML = '';

    sales.forEach((sale, index) => {
        const row = `
            <tr>
                <td>${sale.date}</td>
                <td>${sale.code}</td>
                <td>${sale.name}</td>
                <td>${sale.qty}</td>
                <td>${sale.price.toFixed(2)} ريال</td>
                <td>${sale.total.toFixed(2)} ريال</td>
                <td>${sale.type === 'نقدي' ? '💵 نقدي' : '📋 آجل'}</td>
                <td>
                    <button class="delete-btn" onclick="deleteSale(${index})">حذف</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function deleteSale(index) {
    if (confirm('هل أنت متأكد من حذف هذه المبيعة؟')) {
        const sale = sales[index];
        const product = products.find(p => p.code === sale.code);
        
        if (product) {
            product.qty += sale.qty;
        }

        sales.splice(index, 1);
        saveData('sales', sales);
        saveData('products', products);
        renderSales();
        updateDashboard();
    }
}

function clearSaleForm() {
    document.getElementById('sale-product-code').value = '';
    document.getElementById('sale-qty').value = '';
}

// ===== العملاء المدينون =====
function addDebtor() {
    const name = document.getElementById('debtor-name').value.trim();
    const amount = parseFloat(document.getElementById('debtor-amount').value);
    const date = document.getElementById('debtor-date').value;
    const notes = document.getElementById('debtor-notes').value.trim();

    if (!name || !amount || !date) {
        alert('❌ يرجى ملء الحقول المطلوبة!');
        return;
    }

    if (amount < 0) {
        alert('❌ المبلغ يجب أن يكون موجباً!');
        return;
    }

    debtors.push({
        name: name,
        originalAmount: amount,
        date: date,
        remainingBalance: amount,
        lastPaymentDate: '',
        notes: notes
    });

    saveData('debtors', debtors);
    renderDebtors();
    clearDebtorForm();
    alert('✅ تم إضافة العميل بنجاح!');
    updateDashboard();
}

function renderDebtors() {
    const tbody = document.getElementById('debtors-tbody');
    tbody.innerHTML = '';

    debtors.forEach((debtor, index) => {
        const row = `
            <tr>
                <td>${debtor.name}</td>
                <td>${debtor.originalAmount.toFixed(2)} ريال</td>
                <td>${debtor.date}</td>
                <td>${debtor.remainingBalance.toFixed(2)} ريال</td>
                <td>${debtor.notes}</td>
                <td>
                    <button class="delete-btn" onclick="deleteDebtor(${index})">حذف</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function deleteDebtor(index) {
    if (confirm('هل أنت متأكد من حذف هذا الدين؟')) {
        debtors.splice(index, 1);
        saveData('debtors', debtors);
        renderDebtors();
        updateDashboard();
    }
}

function clearDebtorForm() {
    document.getElementById('debtor-name').value = '';
    document.getElementById('debtor-amount').value = '';
    document.getElementById('debtor-notes').value = '';
}

// ===== الموردون الدائنون =====
function addCreditor() {
    const name = document.getElementById('creditor-name').value.trim();
    const amount = parseFloat(document.getElementById('creditor-amount').value);
    const date = document.getElementById('creditor-date').value;
    const notes = document.getElementById('creditor-notes').value.trim();

    if (!name || !amount || !date) {
        alert('❌ يرجى ملء الحقول المطلوبة!');
        return;
    }

    if (amount < 0) {
        alert('❌ المبلغ يجب أن يكون موجباً!');
        return;
    }

    creditors.push({
        name: name,
        originalAmount: amount,
        date: date,
        remainingBalance: amount,
        lastPaymentDate: '',
        notes: notes
    });

    saveData('creditors', creditors);
    renderCreditors();
    clearCreditorForm();
    alert('✅ تم إضافة المورد بنجاح!');
    updateDashboard();
}

function renderCreditors() {
    const tbody = document.getElementById('creditors-tbody');
    tbody.innerHTML = '';

    creditors.forEach((creditor, index) => {
        const row = `
            <tr>
                <td>${creditor.name}</td>
                <td>${creditor.originalAmount.toFixed(2)} ريال</td>
                <td>${creditor.date}</td>
                <td>${creditor.remainingBalance.toFixed(2)} ريال</td>
                <td>${creditor.notes}</td>
                <td>
                    <button class="delete-btn" onclick="deleteCreditor(${index})">حذف</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function deleteCreditor(index) {
    if (confirm('هل أنت متأكد من حذف هذا الدين؟')) {
        creditors.splice(index, 1);
        saveData('creditors', creditors);
        renderCreditors();
        updateDashboard();
    }
}

function clearCreditorForm() {
    document.getElementById('creditor-name').value = '';
    document.getElementById('creditor-amount').value = '';
    document.getElementById('creditor-notes').value = '';
}

// ===== لوحة التحكم =====
function updateDashboard() {
    const totalProducts = products.length;
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalDebts = debtors.reduce((sum, d) => sum + d.remainingBalance, 0);
    const balance = totalSales - totalDebts;

    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-sales').textContent = totalSales.toFixed(2) + ' ريال';
    document.getElementById('total-debts').textContent = totalDebts.toFixed(2) + ' ريال';
    document.getElementById('balance').textContent = balance.toFixed(2) + ' ريال';
}

// ===== التقارير =====
function updateReports() {
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const cashSales = sales.filter(s => s.type === 'نقدي').reduce((sum, s) => sum + s.total, 0);
    const deferredSales = sales.filter(s => s.type === 'آجل').reduce((sum, s) => sum + s.total, 0);
    const totalDebtors = debtors.reduce((sum, d) => sum + d.remainingBalance, 0);
    const totalCreditors = creditors.reduce((sum, c) => sum + c.remainingBalance, 0);
    const difference = totalDebtors - totalCreditors;

    document.getElementById('report-total-sales').textContent = totalSales.toFixed(2) + ' ريال';
    document.getElementById('report-cash-sales').textContent = cashSales.toFixed(2) + ' ريال';
    document.getElementById('report-deferred-sales').textContent = deferredSales.toFixed(2) + ' ريال';
    document.getElementById('report-total-debtors').textContent = totalDebtors.toFixed(2) + ' ريال';
    document.getElementById('report-total-creditors').textContent = totalCreditors.toFixed(2) + ' ريال';
    document.getElementById('report-difference').textContent = difference.toFixed(2) + ' ريال';
}

// ===== حفظ واسترجاع البيانات =====
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadAllData() {
    renderProducts();
    renderSales();
    renderDebtors();
    renderCreditors();
    updateDashboard();
}

// ===== تحميل التقرير =====
function exportToCSV() {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    
    // الرأس
    csvContent += 'نظام البقالة - تقرير شامل\n\n';
    
    // الإحصائيات
    csvContent += 'الإحصائيات\n';
    csvContent += 'إجمالي المنتجات,' + products.length + '\n';
    csvContent += 'إجمالي المبيعات,' + sales.reduce((sum, s) => sum + s.total, 0).toFixed(2) + '\n';
    csvContent += 'المبيعات النقدية,' + sales.filter(s => s.type === 'نقدي').reduce((sum, s) => sum + s.total, 0).toFixed(2) + '\n';
    csvContent += 'المبيعات الآجلة,' + sales.filter(s => s.type === 'آجل').reduce((sum, s) => sum + s.total, 0).toFixed(2) + '\n';
    csvContent += 'إجمالي الديون على العملاء,' + debtors.reduce((sum, d) => sum + d.remainingBalance, 0).toFixed(2) + '\n';
    csvContent += 'إجمالي الديون على الموردين,' + creditors.reduce((sum, c) => sum + c.remainingBalance, 0).toFixed(2) + '\n\n';

    // المنتجات
    csvContent += 'المنتجات\n
