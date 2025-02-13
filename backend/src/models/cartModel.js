const mongoose = require('mongoose');
const CartStatus = require('../utils/enums/cartStatus');

const cartSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    cartItems: [
        {
            restaurant: {
                restaurantId: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'Restaurant', 
                    required: true 
                },
                name: { type: String, required: true },
                address:{ type: String, required: true },
                restaurantCharges: { type: Number, required: true},
                deliveryFeeApplicable: { type: Boolean, required: true},
                gstApplicable: { type: Boolean, required: true},
                orderItem: [
                    {
                        itemId: { type: Number, required: true },
                        name: { type: String, required: true },
                        price: { type: Number, required: true },
                        quantity: { type: Number, required: true}
                    }
                ]
            },
        }
    ],
    couponApplied:  { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Deal',
        default: null
    },
    status: { type: String, enum: CartStatus.CartStatus, default: CartStatus.CartStatus.PENDING },
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;