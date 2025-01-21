const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        categoryName: { type: String, required: true },
        restaurant: {
            type: [
                { 
                    restaurantId: {
                        type: mongoose.Schema.Types.ObjectId, 
                        ref: 'Restaurant'
                    }
                },
            ], default: [],
        }
    }
);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;