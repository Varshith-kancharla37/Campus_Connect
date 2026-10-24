const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');
const auth = require('../middleware/auth');

router.post('/', auth, submitContact);

module.exports = router;