const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const clubRoutes = require('./routes/clubRoutes');
const eventRoutes = require('./routes/eventRoutes');
const contactRoutes = require('./routes/contactRoutes');
const errorHandler = require('./middleware/errorHandler');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Serve other HTML files
app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/home.html'));
});
app.get('/events_student.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/events_student.html'));
});
app.get('/events_admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/events_admin.html'));
});
app.get('/contactUs.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/contactUs.html'));
});
app.get('/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/profile.html'));
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));