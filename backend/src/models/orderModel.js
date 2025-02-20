const mongoose = require('mongoose');
const orderStatus = require('../utils/enums/status');

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
    },
    cartData: { type: Array, require: true },
    totalPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: orderStatus, default: orderStatus.CONFIRMED },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;