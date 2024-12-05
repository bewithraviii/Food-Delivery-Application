const mongoose = require('mongoose');
const Orders = require('./orderModel');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        phoneNumber: { type: Number, required: true },
        otp: { type: String, required: false, default: null },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
