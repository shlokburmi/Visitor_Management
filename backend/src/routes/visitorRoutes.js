const express = require('express');
const router = express.Router();
const { createVisitor, getVisitors, getVisitor, updateVisitor, preRegister } = require('../controllers/visitorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route — visitor self pre-registration
router.post('/pre-register', preRegister);
router.post('/verify-otp', require('../controllers/visitorController').verifyOtp);

// Protected routes
router.use(protect);

router.post('/', authorize('admin', 'security'), upload.single('photo'), createVisitor);
router.get('/', getVisitors);
router.get('/:id', getVisitor);
router.put('/:id', authorize('admin', 'security'), upload.single('photo'), updateVisitor);

module.exports = router;
