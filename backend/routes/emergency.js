const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.post('/', auth, emergencyController.createEmergency);
router.get('/', auth, rbac('staff', 'admin', 'superadmin'), emergencyController.getActiveEmergencies);
router.put('/:id/resolve', auth, rbac('staff', 'admin', 'superadmin'), emergencyController.resolveEmergency);

module.exports = router;
