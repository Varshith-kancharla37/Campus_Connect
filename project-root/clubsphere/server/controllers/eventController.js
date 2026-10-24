const Event = require('../models/Event');
const mongoose = require('mongoose');

const createEvent = async (req, res) => {
  const { title, description, event_date, event_time, location, place } = req.body;
  console.log('Create event request:', { title, description, event_date, event_time, location, place, club: req.user.club });
  if (!['CLUB_ADMIN', 'CLUB_MEMBER'].includes(req.user.role)) {
    return res.status(403).json({ status: 'error', message: 'Only CLUB_ADMIN and CLUB_MEMBER can create events' });
  }
  try {
    const event = new Event({
      title,
      description,
      event_date,
      event_time,
      location,
      place,
      club: req.user.club,
    });
    await event.save();
    console.log('Event created:', event);
    res.status(201).json({ status: 'success', message: 'Event created successfully', data: event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

const getEvents = async (req, res) => {
  const { upcoming } = req.query;
  const query = {};
  if (upcoming === 'true') {
    query.event_date = { $gte: new Date() };
  }
  try {
    const events = await Event.find(query).sort({ event_date: 1 });
    res.json({ status: 'success', data: events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, event_date, event_time, location, place } = req.body;
  console.log('Update event request:', { id, title, description, event_date, event_time, location, place });
  if (!['CLUB_ADMIN', 'CLUB_MEMBER'].includes(req.user.role)) {
    return res.status(403).json({ status: 'error', message: 'Only CLUB_ADMIN and CLUB_MEMBER can update events' });
  }
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }
    const event = await Event.findOne({ _id: id });
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }
    if (event.club !== req.user.club) {
      return res.status(403).json({ status: 'error', message: 'You can only update events of your own club' });
    }
    event.title = title || event.title;
    event.description = description || event.description;
    event.event_date = event_date || event.event_date;
    event.event_time = event_time || event.event_time;
    event.location = location || event.location;
    event.place = place || event.place;
    await event.save();
    res.json({ status: 'success', message: 'Event updated successfully', data: event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  console.log('Delete event request:', { id });
  if (!['CLUB_ADMIN', 'CLUB_MEMBER'].includes(req.user.role)) {
    return res.status(403).json({ status: 'error', message: 'Only CLUB_ADMIN and CLUB_MEMBER can delete events' });
  }
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }
    const event = await Event.findOneAndDelete({ _id: id, club: req.user.club });
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found or unauthorized' });
    }
    res.json({ status: 'success', message: 'Event deleted successfully', data: {} });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const registerEvent = async (req, res) => {
  const { eventId, name, email, branch, registrationNumber, phoneNumber } = req.body;
  console.log('Register event request:', { eventId, name, email, branch, registrationNumber, phoneNumber });
  if (req.user.role === 'CLUB_ADMIN') {
    return res.status(403).json({ status: 'error', message: 'CLUB_ADMIN cannot register for events' });
  }
  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }
    if (req.user.role === 'CLUB_MEMBER' && event.club === req.user.club) {
      return res.status(403).json({ status: 'error', message: 'Club members cannot register for their own club events' });
    }
    if (req.user.club === 'ISTE' && event.club === 'Page Turners') {
      return res.status(403).json({ status: 'error', message: 'ISTE members cannot register for Page Turners events' });
    }
    const existingRegistration = event.registrations.find(reg => reg.userId && reg.userId.toString() === req.user._id.toString());
    if (existingRegistration) {
      return res.status(400).json({ status: 'error', message: 'Already registered for this event' });
    }
    const existingByRegNumber = event.registrations.find(reg => !reg.userId && reg.registration_number === req.user.username);
    if (existingByRegNumber) {
      return res.status(400).json({ status: 'error', message: 'Already registered for this event (legacy registration)' });
    }
    const serial_number = event.registrations.length + 1;
    event.registrations.push({
      userId: req.user._id,
      serial_number,
      name,
      email,
      branch,
      registration_number: registrationNumber,
      phone_number: phoneNumber,
    });
    await event.save();
    res.json({ status: 'success', message: 'Registered successfully', data: event });
  } catch (error) {
    console.error('Register event error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

const checkRegistration = async (req, res) => {
  const { eventId } = req.query;
  console.log('Check registration request:', { eventId });
  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }
    const isRegistered = event.registrations.some(reg => {
      if (reg.userId) {
        return reg.userId.toString() === req.user._id.toString();
      }
      return reg.registration_number === req.user.username;
    });
    res.json({ status: 'success', isRegistered });
  } catch (error) {
    console.error('Check registration error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getRegistrations = async (req, res) => {
  const { eventId } = req.query;
  console.log('Get registrations request:', { eventId });
  if (!['CLUB_ADMIN', 'CLUB_MEMBER'].includes(req.user.role)) {
    return res.status(403).json({ status: 'error', message: 'Unauthorized to view registrations' });
  }
  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }
    if (event.club !== req.user.club) {
      return res.status(403).json({ status: 'error', message: 'You can only view registrations for your own club' });
    }
    res.json({ status: 'success', data: event.registrations });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { createEvent, getEvents, updateEvent, deleteEvent, registerEvent, checkRegistration, getRegistrations };