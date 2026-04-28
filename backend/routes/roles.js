const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/', auth, rbac('admin', 'superadmin'), roleController.getUsers);
router.put('/:id', auth, rbac('admin', 'superadmin'), roleController.updateRole);

module.exports = router;
