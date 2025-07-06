const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const auth = require('../middleware/auth');

router.post('/', auth, paymentController.recordPayment);
router.get('/:invoiceId', auth, paymentController.getPaymentsForInvoice);

module.exports = router;
