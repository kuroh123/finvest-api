const prisma = require('../prisma/client');

// Record a payment
exports.recordPayment = async (req, res) => {
  try {
    const { invoiceId, amount, method } = req.body;
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
      },
    });
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

// View payments for an invoice
exports.getPaymentsForInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { invoiceId: parseInt(invoiceId) }
    });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};
