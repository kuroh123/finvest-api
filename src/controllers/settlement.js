const prisma = require('../prisma/client');

// Automatically calculate settlement
exports.generateSettlementsForInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(invoiceId) },
      include: {
        offers: { where: { status: 'approved' }},
        payments: true,
      }
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const daysFunded = (new Date() - new Date(invoice.uploadedAt)) / (1000 * 60 * 60 * 24);

    const settlements = [];

    for (const offer of invoice.offers) {
      const interest = offer.amountRequested * (offer.interestRate / 100) * (daysFunded / 365);
      console.log("INTEREST", interest)
      const totalDue = offer.amountRequested + interest;

      // Create settlement record
      const payment = invoice.payments[0]; // simplistic, could distribute across multiple
      const settlement = await prisma.settlement.create({
        data: {
          amountSettled: totalDue,
          platformFee: 0,
          financingRequestId: offer.id,
          paymentId: payment.id
        }
      });

      settlements.push(settlement);
    }

    res.json({ totalPaid, settlements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate settlements' });
  }
};
