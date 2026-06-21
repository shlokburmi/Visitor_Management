const express = require('express');
const router = express.Router();
const { getStats, getRecentActivity, getVisitorTrend, exportLogs } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.get('/recent-activity', getRecentActivity);
router.get('/visitor-trend', getVisitorTrend);
router.get('/export', authorize('admin'), exportLogs);

module.exports = router;
