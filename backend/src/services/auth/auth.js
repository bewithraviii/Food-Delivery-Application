const JWT = require('jsonwebtoken');
const jwt = require('../../utils/jwt/jwt-creation');
const bcrypt = require('bcryptjs');
const User = require('../../models/userModel');
const Vendor = require('../../models/restaurantModel');

const userLogin = async (data, res) => {
    if(!data) {
        return res.status(400).json({ message: 'User credentials is required' });
    }

    try{
        const response = { token: '' };
        const user = await User.findOne({ email : data.email, phoneNumber: data.phoneNumber });
        if (!user) throw new Error('Invalid username or phone-number');
      
        // const isMatch = await comparePassword(data.password, user.password);
        // if (!isMatch) throw new Error('Invalid username or password');
    
        const token = jwt.generateToken(user._id);
        if(!token) throw new Error('Something went wrong while creating token');
    
        response.token = token;
    
        res.status(200).json(response);
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}

const userSignUp = async(data, res) => {
    if(!data){
        return res.status(400).json({ message: 'User data is required' });
    }
    try{
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser || existingUser != null) return res.status(400).json({ message: 'User already exists' });
    
        const newUser = new User();
        newUser.email = data.email;
        newUser.name = data.name;
        newUser.phoneNumber = data.phoneNumber;
        newUser.address = { details: data.address };
        await newUser.save();

        const token = jwt.generateToken(newUser._id);

        res.status(201).json({ message: 'User registered', token });
    } catch(err){
        console.log("User sign-up failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const vendorLogin = async(data, res) => {
    if(!data) {
        return res.status(400).json({ message: 'Vendor credentials is required' });
    }

    try{
        const response = { token: '' };
        const vendor = await Vendor.findOne({ email: data.email, "owner.phoneNo": data.phoneNumber });
        if (!vendor) throw new Error('Invalid email or phone-number');
    
        const token = jwt.generateToken(vendor._id);
        if(!token) throw new Error('Something went wrong while creating token');
    
        response.token = token;
    
        res.status(200).json(response);
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}

const vendorSignUp = async(data, res) => {
    if(!data) {
        return res.status(400).json({ message: 'Vendor detail is required' });
    }
    try{
        const existingVendor = await Vendor.findOne({ email: data.email });
        if (existingVendor || existingVendor  != null) return res.status(400).json({ message: 'Vendor already exists' });

        const newVendor = new Vendor(data);
        await newVendor.save();

        const token = jwt.generateToken(newVendor._id);

        res.status(201).json({ message: 'Vendor registered', token });
    } catch(err){
        console.log("vendor sign-up failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const getUserDetails = async(req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        const JWT_SECRET = 'FoodDeliveryApp';
        const decoded = JWT.verify(token, JWT_SECRET);
        
        const userId = decoded.id;
        if (!userId) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'User details fetched successfully',
            payload: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                address: user.address,
            },
        });
    } catch (err) {
        console.error('Error fetching user details:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateUserProfile = async(data, res) => {
    if(!data) {
        return res.status(400).json({ message: 'User data is required' });
    }

    try {
        const user = await User.findOne({ _id: data.userId });
        if (!user) throw new Error('User not found');

        user.name = data.name;
        user.email = data.email;
        user.phoneNumber = data.phoneNumber;
        const updatedUser = await user.save();

        const response = {
            message: "User data updated successfully",
            payload: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address,
            },
        }

        res.status(200).json(response);

    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}

const addNewUserAddress = async(data, res) => {
    if(!data) {
        return res.status(400).json({ message: 'User address is required' });
    }

    try {
        const user = await User.findOne({ _id: data.userId });
        if (!user) throw new Error('User not found');

        const newAddress = {
            title: data.title,
            details: data.detail,
        };
        
        user.address.push(newAddress);
        const updatedUser = await user.save();

        const response = {
            message: "New address created successfully",
            payload: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address,
            },
        }

        res.status(200).json(response);

    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}

const updateUserAddress = async(data, res) => {
    if(!data) {
        return res.status(400).json({ message: 'User address is required' });
    }

    try {
        const user = await User.findOne({ _id: data.userId });
        if (!user) throw new Error('User not found');

        const address = user.address.find(addr => addr._id == data.addressId);
        if (!address) throw new Error('Address not found for this user');

        address.title = data.title;
        address.details = data.detail;

        const updatedUser = await user.save();

        const response = {
            message: "Address updated successfully",
            payload: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address,
            },
        }

        res.status(200).json(response);

    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}

const deleteUserAddress = async(data, res) => {
    if(!data) {
        return res.status(400).json({ message: 'User details is required' });
    }

    try {
        const user = await User.findOne({ _id: data.userId });
        if (!user) throw new Error('User not found');

        user.address = user.address.filter(address => address._id.toString() !== data.addressId);
        const updatedUser = await user.save();

        const response = {
            message: "Address deleted successfully",
            payload: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address,
            },
        }

        res.status(200).json(response);
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}


// const hashPassword = async (password) => {
//     const salt = await bcrypt.genSalt(10);
//     return await bcrypt.hash(password, salt);
// };
  
// const comparePassword = async (enteredPassword, storedPassword) => {
//     return await bcrypt.compare(enteredPassword, storedPassword);
// };

module.exports = { 
    userLogin, 
    userSignUp, 
    vendorLogin, 
    vendorSignUp, 
    getUserDetails,
    updateUserProfile,
    addNewUserAddress,
    deleteUserAddress,
    updateUserAddress
}