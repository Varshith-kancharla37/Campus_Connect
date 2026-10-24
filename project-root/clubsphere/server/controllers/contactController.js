const Contact = require('../models/Contact');

const submitContact = async (req, res) => {
  const { name, email, branch, registration, message } = req.body;
  try {
    const contact = new Contact({ name, email, branch, registration_number: registration, message });
    await contact.save();
    res.json({ status: 'success', message: 'Message submitted successfully' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

module.exports = { submitContact };