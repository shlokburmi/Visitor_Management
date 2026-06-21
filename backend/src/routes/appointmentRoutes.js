const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  approveAppointment,
  rejectAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('admin', 'host'), createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.put('/:id', authorize('admin', 'host'), updateAppointment);
router.put('/:id/approve', authorize('admin', 'host'), approveAppointment);
router.put('/:id/reject', authorize('admin', 'host'), rejectAppointment);

module.exports = router;
