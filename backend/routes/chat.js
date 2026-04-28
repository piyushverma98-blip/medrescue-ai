const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/', auth, chatController.sendMessage);
router.get('/', auth, chatController.getChatHistory);

module.exports = router;
