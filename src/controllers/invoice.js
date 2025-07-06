const prisma = require('../prisma/client');

// Create Invoice
exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, buyerName, buyerEmail, buyerGSTIN, amount, dueDate } = req.body;
    const sellerId = req.user.id; // assuming auth middleware sets req.user
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        buyerName,
        buyerEmail,
        buyerGSTIN,
        amount,
        dueDate: new Date(dueDate),
        sellerId,
      },
    });
    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// Get all invoices for seller
exports.getSellerInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { sellerId: req.user.id },
      include: { offers: true, payments: true }
    });
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Public - financiers browse unfunded invoices
exports.getAvailableInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { isFinanced: false, status: 'pending' },
      include: { seller: true }
    });
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch available invoices' });
  }
};
