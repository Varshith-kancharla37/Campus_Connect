const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  event_date: { type: Date, required: true },
  event_time: { type: String, required: true },
  location: { type: String, required: true, trim: true, maxlength: 100 },
  place: { type: String, required: true, trim: true, maxlength: 100 },
  club: { type: String, required: true },
  registrations: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    serial_number: { type: Number },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    registration_number: { type: String, required: true, trim: true },
    phone_number: { type: String, required: true, trim: true },
    registered_at: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

// Transform the _id field to event_id in the API response
eventSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.event_id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Event', eventSchema);