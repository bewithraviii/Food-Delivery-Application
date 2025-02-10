const mongoose = require("mongoose");


const restaurantSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      description: { type: String, default: null },
      address: { type: String, required: true },
      profileImage: {type: String, default: null},
      contactNumber: { type: String, default: null },
      email: { type: String, required: true },
      priceForTwo: { type: Number, default: 400 },
      cuisineType: {
        type: [
          {
            _id: false,
            categoryId: { 
              type: mongoose.Schema.Types.ObjectId, 
              ref: 'Category',
            },
            categoryName: { type: String }
          }
        ], default: null
      },
      website: { type: String, required: true },
      restaurantRatings: { type: Number, default: 0 },
      restaurantRatingsCount: { type: Number, default: 0 },
      menu: {
        type: [
          {
            categoryId: { 
              type: mongoose.Schema.Types.ObjectId, 
              ref: 'Category', 
              required: true 
            },
            subCategoryName: { type: String, required: true },
            items: [
              {
                itemImage: { type: String, default: null},
                itemId: { type: Number, required: true },
                name: { type: String, required: true },
                price: { type: String, required: true },
                description: { type: String, required: true },
                ratings: { type: Number, required: true },
                ratingsCount: { type: Number, required: true },
                available: { type: Boolean, default: true },
              },
            ],
          },
        ], default: [],
      },
      offers: {
        type: [
          {
            dealId: { type: String, required: true }
          }
        ], default: [],
      },
      FSSAILicense: { type: String, default: null },
      tradeLicense: { type: String, default: null },
      restaurantLicense: { type: String, default: null },
      gstNo: { type: String, default: null },
      restaurantCharges: { type: Number, default: 0},
      owner: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phoneNo: { type: String, required: true },
        address: { type: String, required: true },
        bankDetails: { type: String, required: true },
        panCardNo: { type: String, required: true },
        aadharCardNo: { type: String, required: true },
      },
      acceptTermsAndRegulations: { type: Boolean, required: true }
    }, 
    { timestamps: true }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;