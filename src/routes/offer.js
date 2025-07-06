const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer');
const auth = require('../middleware/auth');

router.post('/', auth, offerController.createOffer);
router.post('/accept', auth, offerController.acceptOffer);
router.get('/my', auth, offerController.getMyOffers);

module.exports = router;
