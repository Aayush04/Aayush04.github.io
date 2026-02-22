# Motor Pump Shop Management System

A comprehensive web-based software solution for managing a motor pump shop, including inventory management, billing, customer records, and sales reporting.

## Features

### 📊 Dashboard
- Quick overview of shop statistics
- Total items in stock
- Low stock alerts
- Today's sales summary
- Total customer count
- Real-time stock alerts

### 📦 Inventory Management
- Add new items with details (name, category, brand, model, etc.)
- Track purchase price and selling price
- Set minimum stock levels
- Update stock quantities
- Search and filter inventory
- Automatic low stock alerts
- Categories: Motor Pumps, Spare Parts, Accessories, Tools

### 💰 Billing System
- Create professional bills/invoices
- Add multiple items to a single bill
- Apply discounts (percentage-based)
- Print-friendly bill format
- Automatic stock deduction
- Sequential bill numbering
- Customer details on bill

### 👥 Customer Management
- Store customer information
- Track purchase history
- View total purchases per customer
- Last purchase date tracking
- Search customers by name or phone

### 📈 Sales Reports
- View sales history
- Filter by date range
- Total sales calculation
- Profit tracking
- Number of bills generated
- View and reprint old bills

## How to Use

### Installation
1. Download all files (`index.html`, `styles.css`, `app.js`, `README.md`)
2. Place them in a single folder
3. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)

### Getting Started

#### 1. Add Inventory Items
- Go to the "Inventory" tab
- Fill in the item details:
  - Item Name (e.g., "1 HP Submersible Pump")
  - Category (Motor Pump, Spare Parts, etc.)
  - Brand (e.g., "Kirloskar", "Crompton")
  - Model Number
  - Initial Quantity
  - Purchase Price (what you paid)
  - Selling Price (what you sell for)
  - Minimum Stock Level (for alerts)
- Click "Add Item"

#### 2. Create a Bill
- Go to the "Billing" tab
- Enter customer details:
  - Customer Name
  - Phone Number
  - Address (optional)
- Add items to bill:
  - Select item from dropdown
  - Enter quantity
  - Click "Add to Bill"
- Apply discount if needed (optional)
- Click "Generate Bill"
- Print the bill for customer

#### 3. View Reports
- Go to the "Reports" tab
- Select date range
- Click "Filter" to see sales for that period
- View total sales, bills, and profit
- Click "View" on any bill to see details or reprint

### Tips for Best Use

1. **Regular Stock Updates**: Update stock levels regularly when receiving new inventory
2. **Set Proper Min Stock**: Set minimum stock levels to get alerts before items run out
3. **Accurate Pricing**: Enter correct purchase and selling prices to track profit accurately
4. **Customer Details**: Always collect customer phone numbers for future reference
5. **Daily Reports**: Check dashboard daily for low stock alerts
6. **Backup Data**: Periodically export data (see backup section below)

## Data Storage

All data is stored locally in your browser using `localStorage`. This means:
- ✅ Works offline
- ✅ No internet required
- ✅ Fast and secure
- ⚠️ Data is browser-specific (don't clear browser data)
- ⚠️ Use same browser and device for consistency

### Backup Your Data

To backup your data:
1. Open browser console (F12)
2. Type: `localStorage.getItem('inventory')`
3. Copy the output and save to a text file
4. Repeat for 'customers' and 'sales'

To restore:
1. Open browser console
2. Type: `localStorage.setItem('inventory', 'YOUR_SAVED_DATA')`

## Customization

### Change Shop Name
Edit line 13 in `index.html`:
```html
<span id="shopName">Your Shop Name</span>
```

### Add More Categories
Edit the category dropdown in `index.html` (lines 58-64) and add new options.

### Change Currency
Replace all instances of `₹` with your currency symbol in `app.js`.

### Add Tax/GST
Modify the billing section in `app.js` to include tax calculations.

## Browser Compatibility

- ✅ Google Chrome (Recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ✅ Opera

## System Requirements

- Any modern web browser
- No internet connection required
- Works on Windows, Mac, Linux
- Responsive design (works on tablets too)

## Troubleshooting

**Data not saving?**
- Check if browser cookies/localStorage are enabled
- Don't use incognito/private browsing mode

**Bill not printing?**
- Allow popups in browser settings
- Check printer connection
- Use Print button in bill modal

**Search not working?**
- Clear search box and try again
- Refresh the page

## Future Enhancements (Optional)

You can extend this system with:
- Multi-user support
- Cloud backup
- SMS notifications
- Email invoices
- Barcode scanning
- GST calculations
- Vendor management
- Purchase order tracking
- Expenses tracking

## Support

For customizations or issues, please note:
- All data is stored locally in your browser
- Keep regular backups of important data
- Test thoroughly before daily use
- Customize as per your business needs

## License

Free to use for personal and commercial purposes.

---

**Made with ❤️ for Motor Pump Shop Owners**
