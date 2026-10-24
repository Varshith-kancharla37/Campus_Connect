const Club = require('../models/Club');

const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find({}, 'name');
    res.json({ status: 'success', data: clubs.map(club => club.name) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getClubs };