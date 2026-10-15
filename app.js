// ================================
// تبديل التبويبات
// ================================
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // إخفاء جميع التبويبات
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // إزالة فئة active من جميع الأزرار
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // إظهار التبويب المختار
        document.getElementById(tabName).classList.add('active');
        this.classList.add('active');
    });
});

// ================================
// إدارة المنتجات
// ================================

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';
    
    products.forEach((product, index) => {
        const row = `
            <tr>
                <td>${product.code}</td>
                <td>${product.name}</td>
                <td>${product.price} ريال</td>
                <td>${product.qty}</td>
                <td>
                    <button onclick="deleteProduct(${index})" style="background-color: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updateDashboard();
}

function addProduct() {
    const code = document.getElementById('product-code').value.trim();
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const qty = parseInt(document.getElementById('product-qty').value);
    
    if (!code || !name || isNaN(price) || isNaN(qty)) {
        alert('⚠️ يرجى ملء جميع الحقول بشكل صحيح');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // تحقق من وجود الكود مسبقاً
    if (products.some(p => p.code === code)) {
        alert('❌ هذا الكود موجود بالفعل');
        return;
    }
    
    products.push({ code, name, price, qty });
    localStorage.setItem('products', JSON.stringify(products));
    
    // مسح الحقول
    document.getElementById('product-code').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-qty').value = '';
    
    loadProducts();
    alert('✅ تم إضافة المنتج بنجاح');
}

function deleteProduct(index) {
    if (confirm('هل تريد حذف هذا المنتج؟')) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
    }
}

// ================================
// إدارة المبيعات
// ================================

function loadSales() {
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const tbody = document.getElementById('sales-tbody');
    tbody.innerHTML = '';
    
    sales.forEach((sale, index) => {
        const total = sale.qty * sale.price;
        const row = `
            <tr>
                <td>${sale.date}</td>
                <td>${sale.code}</td>
                <td>${sale.name}</td>
                <td>${sale.qty}</td>
                <td>${sale.price} ريال</td>
                <td>${total} ريال</td>
                <td>${sale.type}</td>
                <td>
                    <button onclick="deleteSale(${index})" style="background-color: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updateDashboard();
}

function addSale() {
    const date = document.getElementById('sale-date').value;
    const code = document.getElementById('sale-product-code').value.trim();
    const qty = parseInt(document.getElementById('sale-qty').value);
    const type = document.getElementById('sale-type').value;
    
    if (!date || !code || isNaN(qty) || qty <= 0) {
        alert('⚠️ يرجى ملء جميع الحقول بشكل صحيح');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.code === code);
    
    if (!product) {
        alert('❌ المنتج غير موجود');
        return;
    }
    
    if (product.qty < qty) {
        alert('❌ الكمية غير كافية. الكمية المتاحة: ' + product.qty);
        return;
    }
    
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    sales.push({
        date,
        code,
        name: product.name,
        qty,
        price: product.price,
        type
    });
    
    product.qty -= qty;
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('sales', JSON.stringify(sales));
    
    // إذا كانت المبيعة آجل، أضفها للمدينين
    if (type === 'آجل') {
        const debtors = JSON.parse(localStorage.getItem('debtors')) || [];
        debtors.push({
            name: `عميل - ${product.name}`,
            amount: qty * product.price,
            date,
            paid: 0,
            notes: `مبيعة من ${product.name}`
        });
        localStorage.setItem('debtors', JSON.stringify(debtors));
    }
    
    document.getElementById('sale-date').value = '';
    document.getElementById('sale-product-code').value = '';
    document.getElementById('sale-qty').value = '';
    
    loadSales();
    loadProducts();
    alert('✅ تم تسجيل المبيعة بنجاح');
}

function deleteSale(index) {
    if (confirm('هل تريد حذف هذه المبيعة؟')) {
        const sales = JSON.parse(localStorage.getItem('sales')) || [];
        const sale = sales[index];
        
        // إرجاع الكمية للمنتج
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.code === sale.code);
        if (product) {
            product.qty += sale.qty;
            localStorage.setItem('products', JSON.stringify(products));
        }
        
        sales.splice(index, 1);
        localStorage.setItem('sales', JSON.stringify(sales));
        loadSales();
        loadProducts();
    }
}

// ================================
// إدارة العملاء المدينون
// ================================

function loadDebtors() {
    const debtors = JSON.parse(localStorage.getItem('debtors')) || [];
    const tbody = document.getElementById('debtors-tbody');
    tbody.innerHTML = '';
    
    debtors.forEach((debtor, index) => {
        const remaining = debtor.amount - (debtor.paid || 0);
        const row = `
            <tr>
                <td>${debtor.name}</td>
                <td>${debtor.amount} ريال</td>
                <td>${debtor.date}</td>
                <td>${remaining} ريال</td>
                <td>${debtor.notes || '-'}</td>
                <td>
                    <button onclick="payDebtor(${index})" style="background-color: #4CAF50; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">تسديد</button>
                    <button onclick="deleteDebtor(${index})" style="background-color: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updateDashboard();
}

function addDebtor() {
    const name = document.getElementById('debtor-name').value.trim();
    const amount = parseFloat(document.getElementById('debtor-amount').value);
    const date = document.getElementById('debtor-date').value;
    const notes = document.getElementById('debtor-notes').value.trim();
    
    if (!name || isNaN(amount) || !date || amount <= 0) {
        alert('⚠️ يرجى ملء الحقول المطلوبة بشكل صحيح');
        return;
    }
    
    const debtors = JSON.parse(localStorage.getItem('debtors')) || [];
    debtors.push({ name, amount, date, paid: 0, notes });
    localStorage.setItem('debtors', JSON.stringify(debtors));
    
    document.getElementById('debtor-name').value = '';
    document.getElementById('debtor-amount').value = '';
    document.getElementById('debtor-date').value = '';
    document.getElementById('debtor-notes').value = '';
    
    loadDebtors();
    alert('✅ تم إضافة العميل بنجاح');
}

function payDebtor(index) {
    const debtors = JSON.parse(localStorage.getItem('debtors')) || [];
    const debtor = debtors[index];
    const remaining = debtor.amount - (debtor.paid || 0);
    
    const payment = prompt(`اسم العميل: ${debtor.name}\nالمتبقي: ${remaining} ريال\n\nكم تريد أن تسدد؟`);
    if (payment !== null && !isNaN(payment) && parseFloat(payment) > 0) {
        const amount = parseFloat(payment);
        if (amount > remaining) {
            alert('❌ المبلغ أكثر من المتبقي');
            return;
        }
        debtor.paid = (debtor.paid || 0) + amount;
        localStorage.setItem('debtors', JSON.stringify(debtors));
        loadDebtors();
        alert('✅ تم تسديد المبلغ بنجاح');
    }
}

function deleteDebtor(index) {
    if (confirm('هل تريد حذف هذا العميل؟')) {
        const debtors = JSON.parse(localStorage.getItem('debtors')) || [];
        debtors.splice(index, 1);
        localStorage.setItem('debtors', JSON.stringify(debtors));
        loadDebtors();
    }
}

// ================================
// إدارة الموردون الدائنون
// ================================

function loadCreditors() {
    const creditors = JSON.parse(localStorage.getItem('creditors')) || [];
    const tbody = document.getElementById('creditors-tbody');
    tbody.innerHTML = '';
    
    creditors.forEach((creditor, index) => {
        const remaining = creditor.amount - (creditor.paid || 0);
        const row = `
            <tr>
                <td>${creditor.name}</td>
                <td>${creditor.amount} ريال</td>
                <td>${creditor.date}</td>
                <td>${remaining} ريال</td>
                <td>${creditor.notes || '-'}</td>
                <td>
                    <button onclick="payCreditor(${index})" style="background-color: #4CAF50; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">تسديد</button>
                    <button onclick="deleteCreditor(${index})" style="background-color: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updateDashboard();
}

function addCreditor() {
    const name = document.getElementById('creditor-name').value.trim();
    const amount = parseFloat(document.getElementById('creditor-amount').value);
    const date = document.getElementById('creditor-date').value;
    const notes = document.getElementById('creditor-notes').value.trim();
    
    if (!name || isNaN(amount) || !date || amount <= 0) {
        alert('⚠️ يرجى ملء الحقول المطلوبة بشكل صحيح');
        return;
    }
    
    const creditors = JSON.parse(localStorage.getItem('creditors')) || [];
    creditors.push({ name, amount, date, paid: 0, notes });
    localStorage.setItem('creditors', JSON.stringify(creditors));
    
    document.getElementById('creditor-name').value = '';
    document.getElementById('creditor-amount').value = '';
    document.getElementById('creditor-date').value = '';
    document.getElementById('creditor-notes').value = '';
    
    loadCreditors();
    alert('✅ تم إضافة المورد بنجاح');
}

function payCreditor(index) {
    const creditors = JSON.parse(localStorage.getItem('creditors')) || [];
    const creditor = creditors[index];
    const remaining = creditor.amount - (creditor.paid || 0);
    
    const payment = prompt(`اسم المورد: ${creditor.name}\nالمتبقي: ${remaining} ريال\n\nكم تريد أن تسدد؟`);
    if (payment !== null && !isNaN(payment) && parseFloat(payment) > 0) {
        const amount = parseFloat(payment);
        if (amount > remaining) {
            alert('❌ المبلغ أكثر من المتبقي');
            return;
        }
        creditor.paid = (creditor.paid || 0) + amount;
        localStorage.setItem('creditors', JSON.stringify(creditors));
        loadCreditors();
        alert('✅ تم تسديد المبلغ بنجاح');
    }
}

function deleteCreditor(index) {
    if (confirm('هل تريد حذف هذا المورد؟')) {
        const creditors = JSON.parse(localStorage.getItem('creditors')) || [];
        creditors.splice(index, 1);
        localStorage.setItem('creditors', JSON.stringify(creditors));
        loadCreditors();
    }
}

// ================================
// لوحة التحكم والتقارير
// ================================

function updateDashboard() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const debtors = JSON.parse(localStorage.getItem('debtors')) || [];
    const creditors = JSON.parse(localStorage.getItem('creditors')) || [];
    
    // لوحة التحكم
    document.getElementById('total-products').textContent = products.length;
    
    const totalSales = sales.reduce((sum, sale) => sum + (sale.qty * sale.price), 0);
    document.getElementById('total-sales').textContent = totalSales.toFixed(2) + ' ريال';
    
    const totalDebts = debtors.reduce((sum, debtor) => sum + (debtor.amount - (debtor.paid || 0)), 0);
    document.getElementById('total-debts').textContent = totalDebts.toFixed(2) + ' ريال';
    
    const totalCredits = creditors.reduce((sum, creditor) => sum + (creditor.amount - (creditor.paid || 0)), 0);
    const balance = totalSales - totalDebts - totalCredits;
    document.getElementById('balance').textContent = balance.toFixed(2) + ' ريال';
    // التقارير
const cashSales = sales.filter(s => s.type === 'نقدي').reduce((sum, s) => sum + s.amount, 0);
const creditSales = sales.filter(s => s.type === 'آجل').reduce((sum, s) => sum + s.amount, 0);
const totalSales = cashSales + creditSales;

const debtorsList = debtors.map(d => ({
    ...d,
    outstanding: sales.filter(s => s.debtor === d.id && s.type === 'آجل').reduce((sum, s) => sum + s.amount, 0)
}));

const creditorsList = creditors.map(c => ({
    ...c,
    outstanding: sales.filter(s => s.creditor === c.id && s.type === 'آجل').reduce((sum, s) => sum + s.amount, 0)
}));

// عرض التقارير
function displayReports() {
    const reportsDiv = document.getElementById('reports-content');
    reportsDiv.innerHTML = `
        <div class="report-card">
            <h3>ملخص المبيعات</h3>
            <p>إجمالي المبيعات النقدية: <strong>${cashSales.toFixed(2)}</strong> ريال</p>
            <p>إجمالي المبيعات الآجلة: <strong>${creditSales.toFixed(2)}</strong> ريال</p>
            <p>إجمالي المبيعات: <strong>${totalSales.toFixed(2)}</strong> ريال</p>
        </div>
        
        <div class="report-card">
            <h3>المدينون</h3>
            ${debtorsList.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>الرقم</th>
                            <th>المبلغ المتبقي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${debtorsList.map(d => `
                            <tr>
                                <td>${d.name}</td>
                                <td>${d.id}</td>
                                <td>${d.outstanding.toFixed(2)} ريال</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>لا توجد بيانات</p>'}
        </div>
        
        <div class="report-card">
            <h3>الدائنون</h3>
            ${creditorsList.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>الرقم</th>
                            <th>المبلغ المتبقي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${creditorsList.map(c => `
                            <tr>
                                <td>${c.name}</td>
                                <td>${c.id}</td>
                                <td>${c.outstanding.toFixed(2)} ريال</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>لا توجد بيانات</p>'}
        </div>
    `;
}

// تحديث البيانات المحفوظة
function saveData() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('debtors', JSON.stringify(debtors));
    localStorage.setItem('creditors', JSON.stringify(creditors));
}

// تحميل البيانات
function loadData() {
    products = JSON.parse(localStorage.getItem('products')) || [];
    sales = JSON.parse(localStorage.getItem('sales')) || [];
    debtors = JSON.parse(localStorage.getItem('debtors')) || [];
    creditors = JSON.parse(localStorage.getItem('creditors')) || [];
}

// تصدير CSV
function exportToCSV() {
    const headers = ['معرّف المبيعة', 'المنتج', 'الكمية', 'السعر', 'الإجمالي', 'النوع', 'التاريخ'];
    const rows = sales.map(s => [s.id, s.product, s.quantity, s.price, s.amount, s.type, s.date]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = 'المبيعات.csv';
    link.click();
}

// حدث الترتيب الأولي للعناصر
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    displayDashboard();
    
    // أحداث الأزرار
    document.getElementById('dashboard-btn').addEventListener('click', displayDashboard);
    document.getElementById('products-btn').addEventListener('click', displayProducts);
    document.getElementById('sales-btn').addEventListener('click', displaySales);
    document.getElementById('debtors-btn').addEventListener('click', displayDebtors);
    document.getElementById('creditors-btn').addEventListener('click', displayCreditors);
    document.getElementById('reports-btn').addEventListener('click', displayReports);
});

