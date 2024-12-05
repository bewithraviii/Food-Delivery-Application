const mongoose = require("mongoose");


const restaurantSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      description: { type: String, default: null },
      address: { type: String, required: true },
      email: { type: String, required: true },
      cuisineType: { type: String, required: true },
      menu:{ 
        type: [
          {
            itemName: { type: String, required: true },
            price: { type: Number, required: true },
            description: { type: String },
          },
        ], 
        default: null
      },
      website: { type: String, default: null },
      FSSAILicense: { type: String, required: true },
      tradeLicense: { type: String, required: true },
      restaurantLicense: { type: String, required: true },
      gstNo: { type: String, required: true },
      owner: {
        fullName: { type: String, required: true },
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