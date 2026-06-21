const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getCheckLogs, getActiveCheckIns } = require('../controllers/checkLogController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/checkin', authorize('admin', 'security'), checkIn);
router.post('/checkout', authorize('admin', 'security'), checkOut);
router.get('/active', getActiveCheckIns);
router.get('/', getCheckLogs);

module.exports = router;
