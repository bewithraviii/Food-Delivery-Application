const mongoose = require('mongoose');
const orderStatus = require('../utils/enums/status');

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
    },
    userAddress: {
        title: { type: String, require: true },
        details: { type: String, require: true }
    },
    paymentMethod: { type: String, require: true },
    paymentId: { type: String, require: true },
    cartData: { type: Object, require: true },
    cookingInstructions: { type: String, default: null },
    totalPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    cancelReason: { type: String, default: null },
    status: { type: String, enum: orderStatus, default: orderStatus.CONFIRMED },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;