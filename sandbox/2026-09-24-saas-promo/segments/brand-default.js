// Placeholder brand, so the committed scene runs without the client's material.
// private/brand.js (not committed) replaces BRAND with the real copy, colours, fonts and logo.
var BRAND = {
    name: 'Brand',
    font: 'Stack', // headings / UI; the real brand font is loaded as an optional font
    mono: 'Stack',
    col: {
        brand: '#d2563f', brandLight: '#f0826d', green: '#1c7048', navy: '#1f3a8a',
        cream: '#f5ecd4', paper: '#fbf8f1', ink: '#2a2530', grey: '#8d8a92',
    },
    copy: {
        date: 'Date', dateValue: '2026-06-04', item: 'Item', price: 'Amount',
        newInvoice: 'New invoice', client: 'Client', clientName: 'Acme Ltd', total: 'Total',
        amount: '2,890.00', issue: 'Issue', invoice: 'INVOICE', number: 'F-0118',
        office: 'TAX', issued: 'Issued in 30 seconds', compliance: 'Compliance built in',
        lines: [['Design', '1,450.00'], ['Printing', '980.00'], ['Delivery', '460.00']],
    },
    // the logo mark as paper pieces, centred on (0, 0), about 100 units wide
    mark(c, cut) {
        cut(c, Paper.circleUnion([[-22, 4, 26], [8, -12, 32], [34, 8, 20]]), BRAND.col.brand, 'mark-cloud');
    },
};
