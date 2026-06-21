const express = require('express');
const router = express.Router();
const { issuePass, getPasses, getPass, verifyPass, downloadPass, revokePass } = require('../controllers/passController');
const { protect, authorize } = require('../middleware/auth');

// Public route — verify pass by code (used by QR scanner)
router.get('/verify/:passCode', verifyPass);

// Protected routes
router.use(protect);

router.post('/', authorize('admin', 'security'), issuePass);
router.get('/', getPasses);
router.get('/:id', getPass);
router.get('/:id/download', downloadPass);
router.put('/:id/revoke', authorize('admin', 'security'), revokePass);

module.exports = router;
