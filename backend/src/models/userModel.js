const mongoose = require('mongoose');
const Orders = require('./orderModel');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        address: [
            {
                title: { type: String, default: 'Home' },
                details: { type: String },
            }
        ],
        cards: [
            {
                cardHolderName: { type: String },
                cardNumber: { type: String },
                cardExpiry: { 
                    expireDate: { type: String },
                    expireMonth: { type: String }
                },
                cvc: { type: String}
            }
        ],
        phoneNumber: { type: Number, required: true },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
