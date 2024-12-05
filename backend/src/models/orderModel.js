const mongoose = require('mongoose');
const orderStatus = require('../utils/enums/status');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    items: [
        {
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
    totalPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: orderStatus, default: orderStatus.PENDING },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;