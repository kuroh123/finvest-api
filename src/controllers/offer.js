const prisma = require("../prisma/client");

// Financier submits an offer
exports.createOffer = async (req, res) => {
  try {
    const { invoiceId, amountRequested, interestRate } = req.body;

    // Fetch the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Fetch all existing offers for this invoice
    const existingOffers = await prisma.financingRequest.findMany({
      where: {
        invoiceId,
        status: {
          in: ["approved", "pending"],
        },
      },
    });

    const totalOffered = existingOffers.reduce(
      (sum, offer) => sum + offer.amountRequested,
      0
    );

    if (totalOffered + amountRequested > invoice.amount) {
      return res.status(400).json({
        error: `Offer exceeds invoice funding limit. Already offered: ₹${totalOffered}, Invoice amount: ₹${invoice.amount}`,
      });
    }

    // Create the offer
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

    // 1. Fetch the offer and associated invoice
    const offer = await prisma.financingRequest.findUnique({
      where: { id: offerId },
      include: { invoice: true },
    });

    if (!offer || offer.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Invalid or already approved offer." });
    }

    const invoice = offer.invoice;

    // 2. Calculate disbursed amount and interest
    const days = Math.ceil(
      (new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    const interest =
      (offer.amountRequested * offer.interestRate * days) / (100 * 365);
    const disbursedAmount = offer.amountRequested - interest;

    // Optional: subtract platform fee from seller’s received amount if needed

    // 3. Check total approved funding so far
    const approvedOffers = await prisma.financingRequest.findMany({
      where: {
        invoiceId: invoice.id,
        status: "approved",
      },
    });

    const currentFunded = approvedOffers.reduce(
      (sum, o) => sum + o.amountRequested,
      0
    );
    const newTotal = currentFunded + offer.amountRequested;

    if (newTotal > invoice.amount) {
      return res.status(400).json({
        error: `Cannot approve. This offer would exceed invoice amount (₹${invoice.amount}). Currently funded: ₹${currentFunded}`,
      });
    }

    // 4. Approve offer and store financials
    const updatedOffer = await prisma.financingRequest.update({
      where: { id: offerId },
      data: {
        status: "approved",
        acceptedAt: new Date(),
        interestAmount: interest,
        disbursedAmount: disbursedAmount,
      },
    });

    // 5. If funding target reached or exceeded, update invoice status
    const finalTotal = newTotal;
    if (finalTotal >= invoice.amount) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          isFinanced: true,
          status: "funded",
        },
      });
    }

    res.json(updatedOffer);
  } catch (err) {
    console.error("Error accepting offer:", err);
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
