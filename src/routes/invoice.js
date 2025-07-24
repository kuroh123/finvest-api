const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice");
const auth = require("../middleware/auth");

router.post("/", auth, invoiceController.createInvoice);
router.get("/seller", auth, invoiceController.getSellerInvoices);
router.get("/available", invoiceController.getAvailableInvoices);
router.get("/:id", auth, invoiceController.getInvoiceById);

module.exports = router;
