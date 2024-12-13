const mongoose = require('mongoose');

const qrSchema = new mongoose.Schema({
    restaurantsEmail: { type: String, required: true },
    ownerPhoneNumber: { type: String, required: true },
    qrSecret: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const QR = mongoose.model('QR', qrSchema);

module.exports = QR;