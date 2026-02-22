// Data Storage
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let billItems = [];
let billCounter = parseInt(localStorage.getItem('billCounter')) || 1000;

// Voice Recognition
let recognition = null;
let isListening = false;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    renderInventoryTable();
    renderCustomersTable();
    renderSalesTable();
    updateBillItemSelect();
    updateCurrentDate();
    initVoiceRecognition();
    
    // Event Listeners
    document.getElementById('addItemForm').addEventListener('submit', addItem);
    document.getElementById('searchInventory').addEventListener('input', searchInventory);
    document.getElementById('searchCustomers').addEventListener('input', searchCustomers);
    
    // Set default date for reports
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportToDate').value = today;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    document.getElementById('reportFromDate').value = monthAgo.toISOString().split('T')[0];
});

// Update current date
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-IN', options);
}

// Voice Recognition Functions
function initVoiceRecognition() {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        document.getElementById('voiceStatus').innerHTML = 
            '⚠️ Voice input not supported in this browser. Please use Chrome, Edge, or Safari.';
        document.getElementById('voiceButton').disabled = true;
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = function() {
        isListening = true;
        document.getElementById('voiceButton').classList.add('listening');
        document.getElementById('voiceIcon').textContent = '🎙️';
        document.getElementById('voiceButton').innerHTML = '<span id="voiceIcon">🎙️</span> Listening...';
        document.getElementById('voiceStatus').textContent = '🎧 Listening... Speak now!';
        document.getElementById('voiceTranscript').textContent = 'Waiting for your voice...';
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('voiceTranscript').textContent = '📝 You said: "' + transcript + '"';
        processVoiceInput(transcript);
    };
    
    recognition.onerror = function(event) {
        document.getElementById('voiceStatus').textContent = '❌ Error: ' + event.error;
        resetVoiceButton();
    };
    
    recognition.onend = function() {
        resetVoiceButton();
    };
}

function startVoiceInput() {
    if (!recognition) {
        alert('Voice recognition not available. Please use Chrome, Edge, or Safari.');
        return;
    }
    
    if (isListening) {
        recognition.stop();
        return;
    }
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting recognition:', error);
        alert('Please wait a moment before trying again.');
    }
}

function resetVoiceButton() {
    isListening = false;
    document.getElementById('voiceButton').classList.remove('listening');
    document.getElementById('voiceIcon').textContent = '🎤';
    document.getElementById('voiceButton').innerHTML = '<span id="voiceIcon">🎤</span> Start Voice Input';
    document.getElementById('voiceStatus').textContent = '';
}

function processVoiceInput(transcript) {
    const text = transcript.toLowerCase();
    
    // Extract information using keywords
    const item = {
        name: '',
        category: '',
        brand: '',
        model: '',
        quantity: 1,
        price: 0,
        sellingPrice: 0,
        minStock: 1
    };
    
    // Extract category
    if (text.includes('motor pump') || text.includes('motor') || text.includes('pump')) {
        item.category = 'Motor Pump';
        // Extract name around motor pump
        const motorPumpMatch = text.match(/add\s+(.*?)\s*(?:motor pump|pump|motor)/i);
        if (motorPumpMatch) item.name = motorPumpMatch[1].trim();
    } else if (text.includes('spare part') || text.includes('part')) {
        item.category = 'Spare Parts';
        const partMatch = text.match(/add\s+(.*?)\s*(?:spare part|part)/i);
        if (partMatch) item.name = partMatch[1].trim();
    } else if (text.includes('accessory') || text.includes('accessories')) {
        item.category = 'Accessories';
        const accMatch = text.match(/add\s+(.*?)\s*(?:accessory|accessories)/i);
        if (accMatch) item.name = accMatch[1].trim();
    } else if (text.includes('tool') || text.includes('tools')) {
        item.category = 'Tools';
        const toolMatch = text.match(/add\s+(.*?)\s*(?:tool|tools)/i);
        if (toolMatch) item.name = toolMatch[1].trim();
    }
    
    // Extract brand (common Indian motor pump brands)
    const brands = ['kirloskar', 'crompton', 'havells', 'v-guard', 'cri', 'submersible', 'centrifugal'];
    for (const brand of brands) {
        if (text.includes(brand)) {
            item.brand = brand.charAt(0).toUpperCase() + brand.slice(1);
            if (!item.name) item.name = item.brand;
        }
    }
    
    // Extract model
    const modelMatch = text.match(/model\s+([a-z0-9]+)/i);
    if (modelMatch) {
        item.model = modelMatch[1].toUpperCase();
    }
    
    // Extract quantity
    const qtyMatch = text.match(/quantity\s+(\d+)|qty\s+(\d+)|(\d+)\s+(?:pieces|pcs|units)/i);
    if (qtyMatch) {
        item.quantity = parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3]);
    }
    
    // Extract purchase price
    const priceMatch = text.match(/(?:purchase\s+)?price\s+(\d+)|(?:cost|buy)\s+(?:price\s+)?(\d+)|(\d+)\s+rupees\s+purchase/i);
    if (priceMatch) {
        item.price = parseFloat(priceMatch[1] || priceMatch[2] || priceMatch[3]);
    }
    
    // Extract selling price
    const sellingMatch = text.match(/selling\s+(?:price\s+)?(\d+)|sell\s+(?:price\s+)?(\d+)|sale\s+(?:price\s+)?(\d+)|mrp\s+(\d+)/i);
    if (sellingMatch) {
        item.sellingPrice = parseFloat(sellingMatch[1] || sellingMatch[2] || sellingMatch[3] || sellingMatch[4]);
    }
    
    // Extract minimum stock
    const minMatch = text.match(/minimum\s+(?:stock\s+)?(\d+)|min\s+(?:stock\s+)?(\d+)|minimum\s+(\d+)/i);
    if (minMatch) {
        item.minStock = parseInt(minMatch[1] || minMatch[2] || minMatch[3]);
    }
    
    // If name is still empty, try to extract from beginning
    if (!item.name) {
        const nameMatch = text.match(/add\s+([a-z\s]+?)(?:\s+quantity|\s+price|\s+selling|\s+minimum|$)/i);
        if (nameMatch) {
            item.name = nameMatch[1].trim();
        }
    }
    
    // Validate required fields
    if (!item.name || !item.category) {
        document.getElementById('voiceStatus').innerHTML = 
            '❌ Could not understand. Please include item name and category.<br>Try: "Add motor pump Kirloskar quantity 5 price 5000 selling 7000"';
        return;
    }
    
    if (item.price === 0 || item.sellingPrice === 0) {
        document.getElementById('voiceStatus').innerHTML = 
            '❌ Please specify both purchase price and selling price.<br>Example: "price 5000 selling 7000"';
        return;
    }
    
    // Add item to inventory
    const newItem = {
        id: Date.now(),
        name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        category: item.category,
        brand: item.brand,
        model: item.model,
        quantity: item.quantity,
        price: item.price,
        sellingPrice: item.sellingPrice,
        minStock: item.minStock,
        addedDate: new Date().toISOString()
    };
    
    inventory.push(newItem);
    saveData();
    renderInventoryTable();
    updateBillItemSelect();
    updateDashboard();
    
    // Show success message
    document.getElementById('voiceStatus').innerHTML = 
        `✅ Item added successfully!<br>
        <strong>${newItem.name}</strong> - ${newItem.category}<br>
        Qty: ${newItem.quantity}, Price: ₹${newItem.price}, Selling: ₹${newItem.sellingPrice}`;
    
    // Clear transcript after 3 seconds
    setTimeout(() => {
        document.getElementById('voiceTranscript').textContent = '';
        document.getElementById('voiceStatus').textContent = '';
    }, 5000);
}

// Tab Management
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'reports') {
        filterReports();
    }
}

// Dashboard Functions
function updateDashboard() {
    // Total Items
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('totalItems').textContent = totalItems;
    
    // Low Stock Items
    const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
    document.getElementById('lowStockItems').textContent = lowStockItems.length;
    
    // Today's Sales
    const today = new Date().toDateString();
    const todaySales = sales
        .filter(sale => new Date(sale.date).toDateString() === today)
        .reduce((sum, sale) => sum + sale.total, 0);
    document.getElementById('todaySales').textContent = '₹' + todaySales.toFixed(2);
    
    // Total Customers
    document.getElementById('totalCustomers').textContent = customers.length;
    
    // Low Stock Alerts
    const alertsDiv = document.getElementById('lowStockAlerts');
    if (lowStockItems.length === 0) {
        alertsDiv.innerHTML = '<p>✅ All items are well stocked!</p>';
    } else {
        alertsDiv.innerHTML = lowStockItems.map(item => `
            <div class="alert-item">
                <span><strong>${item.name}</strong> - Only ${item.quantity} left (Min: ${item.minStock})</span>
                <button class="btn btn-info" onclick="editItem(${item.id})">Update Stock</button>
            </div>
        `).join('');
    }
}

// Inventory Functions
function addItem(e) {
    e.preventDefault();
    
    const item = {
        id: Date.now(),
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        brand: document.getElementById('itemBrand').value,
        model: document.getElementById('itemModel').value,
        quantity: parseInt(document.getElementById('itemQuantity').value),
        price: parseFloat(document.getElementById('itemPrice').value),
        sellingPrice: parseFloat(document.getElementById('itemSellingPrice').value),
        minStock: parseInt(document.getElementById('itemMinStock').value),
        addedDate: new Date().toISOString()
    };
    
    inventory.push(item);
    saveData();
    renderInventoryTable();
    updateBillItemSelect();
    document.getElementById('addItemForm').reset();
    alert('Item added successfully!');
}

function renderInventoryTable(items = inventory) {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = items.map(item => {
        const rowClass = item.quantity === 0 ? 'out-of-stock' : 
                        item.quantity <= item.minStock ? 'low-stock' : '';
        return `
            <tr class="${rowClass}">
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.brand}</td>
                <td>${item.model}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${item.sellingPrice.toFixed(2)}</td>
                <td>
                    <button class="btn btn-info" onclick="editItem(${item.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteItem(${item.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function searchInventory() {
    const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
    const filtered = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.brand.toLowerCase().includes(searchTerm) ||
        item.model.toLowerCase().includes(searchTerm)
    );
    renderInventoryTable(filtered);
}

function editItem(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    
    const newQuantity = prompt(`Update quantity for ${item.name} (Current: ${item.quantity}):`, item.quantity);
    if (newQuantity !== null && !isNaN(newQuantity)) {
        item.quantity = parseInt(newQuantity);
        saveData();
        renderInventoryTable();
        updateDashboard();
        alert('Stock updated successfully!');
    }
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventory = inventory.filter(i => i.id !== id);
        saveData();
        renderInventoryTable();
        updateBillItemSelect();
        updateDashboard();
    }
}

// Billing Functions
function updateBillItemSelect() {
    const select = document.getElementById('billItemSelect');
    select.innerHTML = '<option value="">Select Item</option>' + 
        inventory
            .filter(item => item.quantity > 0)
            .map(item => `
                <option value="${item.id}">
                    ${item.name} - ${item.brand} (Stock: ${item.quantity}) - ₹${item.sellingPrice}
                </option>
            `).join('');
}

function addItemToBill() {
    const itemId = parseInt(document.getElementById('billItemSelect').value);
    const quantity = parseInt(document.getElementById('billQuantity').value);
    
    if (!itemId || !quantity || quantity <= 0) {
        alert('Please select an item and enter valid quantity!');
        return;
    }
    
    const item = inventory.find(i => i.id === itemId);
    if (!item) {
        alert('Item not found!');
        return;
    }
    
    if (quantity > item.quantity) {
        alert(`Not enough stock! Available: ${item.quantity}`);
        return;
    }
    
    // Check if item already in bill
    const existingItem = billItems.find(bi => bi.id === itemId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        billItems.push({
            id: itemId,
            name: item.name,
            price: item.sellingPrice,
            purchasePrice: item.price,
            quantity: quantity
        });
    }
    
    renderBillItems();
    calculateBillTotal();
    document.getElementById('billQuantity').value = '';
}

function renderBillItems() {
    const tbody = document.getElementById('billItemsBody');
    tbody.innerHTML = billItems.map((item, index) => `
        <tr>
            <td>${item.name}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            <td>
                <button class="btn btn-danger" onclick="removeItemFromBill(${index})">Remove</button>
            </td>
        </tr>
    `).join('');
}

function removeItemFromBill(index) {
    billItems.splice(index, 1);
    renderBillItems();
    calculateBillTotal();
}

function calculateBillTotal() {
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;
    
    document.getElementById('billSubtotal').textContent = subtotal.toFixed(2);
    document.getElementById('billDiscount').textContent = discount.toFixed(2);
    document.getElementById('billTotal').textContent = total.toFixed(2);
}

function generateBill() {
    if (billItems.length === 0) {
        alert('Please add items to the bill!');
        return;
    }
    
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    
    if (!customerName || !customerPhone) {
        alert('Please enter customer details!');
        return;
    }
    
    const subtotal = parseFloat(document.getElementById('billSubtotal').textContent);
    const discount = parseFloat(document.getElementById('billDiscount').textContent);
    const total = parseFloat(document.getElementById('billTotal').textContent);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    
    // Calculate profit
    const profit = billItems.reduce((sum, item) => {
        const itemProfit = (item.price - item.purchasePrice) * item.quantity;
        return sum + itemProfit;
    }, 0);
    
    // Create sale record
    const sale = {
        billNo: billCounter++,
        date: new Date().toISOString(),
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: document.getElementById('customerAddress').value,
        items: [...billItems],
        subtotal: subtotal,
        discount: discount,
        discountPercent: discountPercent,
        total: total,
        profit: profit
    };
    
    sales.push(sale);
    
    // Update inventory
    billItems.forEach(billItem => {
        const item = inventory.find(i => i.id === billItem.id);
        if (item) {
            item.quantity -= billItem.quantity;
        }
    });
    
    // Update or add customer
    let customer = customers.find(c => c.phone === customerPhone);
    if (customer) {
        customer.totalPurchases += total;
        customer.lastPurchase = new Date().toISOString();
    } else {
        customers.push({
            id: Date.now(),
            name: customerName,
            phone: customerPhone,
            address: document.getElementById('customerAddress').value,
            totalPurchases: total,
            lastPurchase: new Date().toISOString()
        });
    }
    
    saveData();
    displayBillPrint(sale);
    
    // Clear form
    billItems = [];
    renderBillItems();
    calculateBillTotal();
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('discountPercent').value = '0';
    
    updateBillItemSelect();
    renderInventoryTable();
    updateDashboard();
}

function displayBillPrint(sale) {
    const billHtml = `
        <div class="bill-header">
            <h1>🔧 Motor Pump Shop</h1>
            <p>Your Shop Address Here</p>
            <p>Phone: Your Phone Number</p>
            <p>GSTIN: Your GSTIN (if applicable)</p>
        </div>
        
        <div class="bill-details">
            <p><strong>Bill No:</strong> ${sale.billNo}</p>
            <p><strong>Date:</strong> ${new Date(sale.date).toLocaleString('en-IN')}</p>
            <p><strong>Customer:</strong> ${sale.customerName}</p>
            <p><strong>Phone:</strong> ${sale.customerPhone}</p>
            ${sale.customerAddress ? `<p><strong>Address:</strong> ${sale.customerAddress}</p>` : ''}
        </div>
        
        <table class="bill-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${sale.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>₹${item.price.toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="bill-footer">
            <p><strong>Subtotal:</strong> ₹${sale.subtotal.toFixed(2)}</p>
            ${sale.discount > 0 ? `<p><strong>Discount (${sale.discountPercent}%):</strong> -₹${sale.discount.toFixed(2)}</p>` : ''}
            <h2><strong>Total:</strong> ₹${sale.total.toFixed(2)}</h2>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #333;">
            <p>Thank you for your business!</p>
            <p>Please visit again</p>
        </div>
    `;
    
    document.getElementById('billPrint').innerHTML = billHtml;
    document.getElementById('billModal').style.display = 'block';
}

function closeBillModal() {
    document.getElementById('billModal').style.display = 'none';
}

function printBill() {
    window.print();
}

// Customer Functions
function renderCustomersTable(customersToShow = customers) {
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = customersToShow.map(customer => `
        <tr>
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.address || 'N/A'}</td>
            <td>₹${customer.totalPurchases.toFixed(2)}</td>
            <td>${new Date(customer.lastPurchase).toLocaleDateString('en-IN')}</td>
        </tr>
    `).join('');
}

function searchCustomers() {
    const searchTerm = document.getElementById('searchCustomers').value.toLowerCase();
    const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm)
    );
    renderCustomersTable(filtered);
}

// Reports Functions
function filterReports() {
    const fromDate = new Date(document.getElementById('reportFromDate').value);
    const toDate = new Date(document.getElementById('reportToDate').value);
    toDate.setHours(23, 59, 59, 999); // End of day
    
    const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= fromDate && saleDate <= toDate;
    });
    
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalBills = filteredSales.length;
    const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    
    document.getElementById('reportTotalSales').textContent = '₹' + totalSales.toFixed(2);
    document.getElementById('reportTotalBills').textContent = totalBills;
    document.getElementById('reportTotalProfit').textContent = '₹' + totalProfit.toFixed(2);
    
    renderSalesTable(filteredSales);
}

function renderSalesTable(salesToShow = sales) {
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = salesToShow
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(sale => `
            <tr>
                <td>${sale.billNo}</td>
                <td>${new Date(sale.date).toLocaleString('en-IN')}</td>
                <td>${sale.customerName}</td>
                <td>${sale.items.length} items</td>
                <td>₹${sale.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-info" onclick="viewBill(${sale.billNo})">View</button>
                </td>
            </tr>
        `).join('');
}

function viewBill(billNo) {
    const sale = sales.find(s => s.billNo === billNo);
    if (sale) {
        displayBillPrint(sale);
    }
}

// Data Persistence
function saveData() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('billCounter', billCounter.toString());
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('billModal');
    if (event.target === modal) {
        closeBillModal();
    }
}
