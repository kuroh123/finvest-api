const prisma = require("../prisma/client");

// Financier submits an offer
exports.createOffer = async (req, res) => {
  try {
    const { invoiceId, amountRequested, interestRate } = req.body;
    const offer = await prisma.financingRequest.create({
      data: {
        invoiceId,
        financierId: req.user.id,
        amountRequested,
        interestRate,
      },
    });
    res.json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create offer" });
  }
};

// Seller accepts an offer
exports.acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.body;

    // Approve offer
    const offer = await prisma.financingRequest.update({
      where: { id: offerId },
      data: {
        status: "approved",
        acceptedAt: new Date(),
      },
    });

    // Mark invoice as financed if needed
    await prisma.invoice.update({
      where: { id: offer.invoiceId },
      data: { isFinanced: true, status: "funded" },
    });

    res.json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept offer" });
  }
};

// Financier sees their offers
exports.getMyOffers = async (req, res) => {
  console.log(req.user);
  try {
    const offers = await prisma.financingRequest.findMany({
      where: { financierId: req.user.userId },
      include: { invoice: true },
    });
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
};
