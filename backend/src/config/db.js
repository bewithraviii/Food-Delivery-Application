const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


const connectDB = async () => {

    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/food_delivery_application';

    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 30000,  // Increased timeout
            socketTimeoutMS: 45000,           // Increased socket timeout
          })
          .then(() => console.log("App connected to backend(MongoDB)"))
          .catch((err) => console.error("Failed to connect to MongoDB", err));
    } catch(err) {
        console.log('Error connecting DB: ', err);
        process.exit(1);
    }
};

module.exports = connectDB;