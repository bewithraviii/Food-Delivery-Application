const mongoose = require("mongoose");


const restaurantSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      description: { type: String, default: null },
      address: { type: String, required: true },
      contactNumber: { type: String, default: null },
      email: { type: String, required: true },
      cuisineType: { type: String, required: true },
      website: { type: String, required: true },
      restaurantRatings: { type: Number, default: 0 },
      restaurantRatingsCount: { type: Number, default: 0 },
      menu: {
        type: [
          {
            categoryName: { type: String, required: true },
            items: [
              {
                name: { type: String, required: true },
                price: { type: String, required: true },
                description: { type: String, default: true },
                ratings: { type: Number, required: true },
                ratingsCount: { type: Number, required: true },
              },
            ],
          },
        ], default: null,
      },
      offers: {
        type: [
          {
            code: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String, required: true },
            termsAndCondition: [
              {
                terms: { type: String, required: true }
              }
            ]
          }
        ], default: null,
      },
      FSSAILicense: { type: String, default: null },
      tradeLicense: { type: String, default: null },
      restaurantLicense: { type: String, default: null },
      gstNo: { type: String, default: null },
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