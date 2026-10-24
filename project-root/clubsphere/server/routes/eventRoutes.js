const express = require('express');
const router = express.Router();
const { createEvent, getEvents, updateEvent, deleteEvent, registerEvent, checkRegistration, getRegistrations } = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.post('/', auth, createEvent);
router.get('/', auth, getEvents);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);
router.post('/registrations', auth, registerEvent);
router.get('/registrations/check', auth, checkRegistration);
router.get('/registrations', auth, getRegistrations);

module.exports = router;