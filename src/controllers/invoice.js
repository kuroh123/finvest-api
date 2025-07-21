const prisma = require("../prisma/client");

// Create Invoice
exports.createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      buyerName,
      buyerEmail,
      buyerGSTIN,
      amount,
      dueDate,
    } = req.body;
    const sellerId = req.user.userId; // assuming auth middleware sets req.user
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
    res.status(500).json({ error: "Failed to create invoice" });
  }
};

exports.getInvoiceById = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        offers: { include: { financier: true } },
        payments: true,
        seller: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
};

// Get all invoices for seller
exports.getSellerInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { sellerId: req.user.userId },
      include: { offers: { include: { financier: true } }, payments: true },
    });
    console.log(req.user);
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

// Public - financiers browse unfunded invoices
exports.getAvailableInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { isFinanced: false, status: "pending" },
      include: { offers: true, seller: true },
    });
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch available invoices" });
  }
};
