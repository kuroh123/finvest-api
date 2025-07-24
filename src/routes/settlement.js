const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlement');
const auth = require('../middleware/auth');

router.post('/:invoiceId/generate', auth, settlementController.generateSettlementsForInvoice);

module.exports = router;
