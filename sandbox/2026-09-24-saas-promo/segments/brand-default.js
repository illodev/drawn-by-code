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
        base: 'Subtotal', baseValue: '2,890.00', tax: 'VAT 21%', taxValue: '606.90', notes: 'Notes', payNote: 'Payment by bank transfer · due 07/04/2026',
        chaosLine: 'Spreadsheets, email, the bank app and the accountant…',
        onePlace: 'All your paperwork. One platform.',
        photoTicket: 'Snap a photo of the receipt', ticketShop: 'PETROL STATION', ticketBase: '56.53', ticketTax: '11.87', ticketTotal: '68.40', vendor: 'Supplier', read: 'Read and booked',
        collectMore: 'Get paid sooner, chase less.', youApprove: 'you approve them', overdue: 'Overdue 12 days', reminder: 'Payment reminder', send: 'Send', debtor: 'Nordic Café', debtAmount: '312.00',
        quarter: 'The quarter, seen coming.', taxForms: [['303', 'VAT'], ['130', 'Income tax']], taxDue: 'no surprises on the 20th',
        askAI: 'Which client pays off?', margin: 'Margin per client', clients: [['Studio Mirlo', 38], ['Vera Shoes', 31], ['Hotel Albor', 24], ['Nordic Café', 12]],
        comply: 'Compliance, no scares.', deadlines: [['1 Jan 2027', 'Companies'], ['1 Jul 2027', 'Freelancers']],
        closeLine: 'Less admin. More business.', startFree: 'Start free.', includedAll: 'Compliance included in every plan', web: 'example.com',
        newInvoice: 'New invoice', client: 'Client', clientName: 'Acme Ltd', total: 'Total',
        amount: '3,496.90', issue: 'Issue', invoice: 'INVOICE', number: 'F-0118',
        office: 'TAX', issued: 'Issued in 30 seconds', compliance: 'Compliance built in',
        lines: [['Design', '1,450.00'], ['Printing', '980.00'], ['Delivery', '460.00']],
    },
    // the logo mark as paper pieces, centred on (0, 0), about 100 units wide
    mark(c, cut) {
        cut(c, Paper.circleUnion([[-22, 4, 26], [8, -12, 32], [34, 8, 20]]), BRAND.col.brand, 'mark-cloud');
    },
};
