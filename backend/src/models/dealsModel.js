const mongoose = require('mongoose');

const dealsSchema = new mongoose.Schema(
    {
        code: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        maxDiscount: {type: Number, require: true},
        minOrderValue: {type: Number, require: true},
        discountPercent: {type: Number, default: null}, 
        discountType: { type: String, required: true },
        termsAndCondition: {
            type: [
                {
                    _id: false,
                    terms: { type: String, required: true },
                }
            ], default: [],
        },
        restaurant: {
            type: [
                { 
                    _id: false,
                    restaurantId: {
                        type: mongoose.Schema.Types.ObjectId, 
                        ref: 'Restaurant'
                    }
                },
            ], default: [],
        }
    }
);

const Deals = mongoose.model('Deals', dealsSchema);
module.exports = Deals;