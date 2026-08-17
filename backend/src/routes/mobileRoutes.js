const express = require('express');
const router = express.Router();
const {
  addMobile,
  getMobiles,
  getMobileByImei,
  getMobileById,
  updateMobile,
  deleteMobile,
  exportPdf,
} = require('../controllers/mobileController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addMobile);
router.get('/export/pdf', exportPdf);
router.get('/imei/:imei', getMobileByImei);
router.get('/', getMobiles);
router.get('/:id', getMobileById);
router.put('/:id', updateMobile);
router.delete('/:id', deleteMobile);

module.exports = router;
