const JWT = require('jsonwebtoken');
const jwt = require('../../utils/jwt/jwt-creation');
const roles = require('../../utils/enums/roles');
const bcrypt = require('bcryptjs');
const User = require('../../models/userModel');
const Vendor = require('../../models/restaurantModel');
const Restaurant = require('../../models/restaurantModel');
const Category = require('../../models/categoryModel');
const Deals = require('../../models/dealsModel');


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
    
        const token = jwt.generateToken(user._id, roles.USER);
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
        if (existingUser || existingUser != null) return res.status(400).json({ message: 'User with this email already exists.' });

        const existingUserWithPhone = await User.findOne({ phoneNumber: data.phoneNumber });
        if (existingUserWithPhone || existingUserWithPhone != null) return res.status(400).json({ message: 'User with this phone number already exists.' });
    
        const newUser = new User();
        newUser.email = data.email;
        newUser.name = data.name;
        newUser.phoneNumber = data.phoneNumber;
        newUser.address = { details: data.address };
        await newUser.save();

        const token = jwt.generateToken(newUser._id, roles.USER);

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
    
        const token = jwt.generateToken(vendor._id, roles.VENDOR);
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

        const cuisine = await Category.find();
        if(!cuisine) return res.status(400).json({ message: 'Cuisines not found, Please try again' });       

        const categoryData = cuisine.filter(category => data.cuisineType.includes(category.categoryName));
        
        data.cuisineType = categoryData.map(category => ({
                categoryId: category._id,
                categoryName: category.categoryName
            })
        );

        const newVendor = new Vendor(data);
        await newVendor.save();

        const token = jwt.generateToken(newVendor._id, roles.VENDOR);

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
                favorites: user.favorites,
                cards: user.cards
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

const getAllRestaurantDetails = async(req, res) => {
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

        const restaurantsData = await Restaurant.find();
        if(!restaurantsData || restaurantsData.length == 0){
            return res.status(404).json({ message: 'Restaurants not found' });
        }

        let restaurantsDetails = [];
        restaurantsData.forEach(restaurant => {
            if(restaurant.menu.length > 0) {
                restaurantsDetails.push({
                    name: restaurant.name,
                    description: restaurant?.description,
                    address: restaurant.address,
                    email: restaurant.email,
                    cuisineType: restaurant.cuisineType,
                    website: restaurant.website,
                    menu: restaurant.menu,
                    id: restaurant._id,
                    ratings: restaurant.restaurantRatings,
                    priceForTwo: restaurant.priceForTwo,
                    profileImage: restaurant.profileImage,
                    restaurantCharges: restaurant.restaurantCharges,
                    deliveryFeeApplicable: restaurantsData.deliveryFeeApplicable,
                    gstApplicable: restaurantsData.gstApplicable
                });
            }
        });

        return res.status(200).json({
            message: 'Restaurants details fetched successfully',
            payload: restaurantsDetails
        });


    } catch(error){
        console.error('Error fetching restaurant details:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const getRestaurantDetails = async(req, res) => {
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
        
        const id = req.params.id;
        if(!id){
            return res.status(404).json({ message: 'Restaurants id not found' });
        }

        const restaurantsData = await Restaurant.findOne({
            _id: id
        });
        if(!restaurantsData || restaurantsData.length == 0){
            return res.status(404).json({ message: 'Restaurants not found' });
        }

        let restaurantsDetails = {
            name: restaurantsData.name,
            description: restaurantsData?.description,
            address: restaurantsData.address,
            email: restaurantsData.email,
            cuisineType: restaurantsData.cuisineType,
            website: restaurantsData.website,
            menu: restaurantsData.menu,
            id: restaurantsData._id,
            restaurantCharges: restaurantsData.restaurantCharges,
            restaurantRatings: restaurantsData.restaurantRatings,
            restaurantRatingsCount: restaurantsData.restaurantRatingsCount,
            priceForTwo: restaurantsData.priceForTwo,
            profileImage: restaurantsData.profileImage,
            deliveryFeeApplicable: restaurantsData.deliveryFeeApplicable,
            gstApplicable: restaurantsData.gstApplicable
        };

        return res.status(200).json({
            message: 'Restaurant details fetched successfully',
            payload: restaurantsDetails
        });

    } catch(error) {
        console.error('Error fetching restaurant details:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const getRestaurantData = async(req, res) => {
    try {
        
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }
        
        const JWT_SECRET = 'FoodDeliveryApp';
        const decoded = JWT.verify(token, JWT_SECRET);
        
        const id = decoded.id;
        if(!id){
            return res.status(404).json({ message: 'Restaurants id not found' });
        }

        const restaurantsData = await Restaurant.findOne({
            _id: id
        });
        if(!restaurantsData){
            return res.status(404).json({ message: 'Restaurants not found' });
        }

        const updatedMenu = await Promise.all(
            restaurantsData.menu.map(async (menu) => {
              if (menu.categoryId) {
                const categoryData = await Category.findOne({ _id: menu.categoryId });
                if (categoryData) {
                  return { 
                    _id: menu._id,
                    items: menu.items,
                    subCategoryName: menu.subCategoryName,
                    categoryId: menu.categoryId,
                    categoryName: categoryData.categoryName };
                }
              }
              return menu;
            })
          );
        
        const restaurantsDetails = {
            name: restaurantsData.name,
            ownerDetail: restaurantsData.owner,
            description: restaurantsData?.description,
            address: restaurantsData.address,
            email: restaurantsData.email,
            cuisineType: restaurantsData.cuisineType,
            website: restaurantsData.website,
            menu: updatedMenu,
            _id: restaurantsData._id,
            restaurantCharges: restaurantsData.restaurantCharges,
            restaurantRatings: restaurantsData.restaurantRatings,
            restaurantRatingsCount: restaurantsData.restaurantRatingsCount,
            priceForTwo: restaurantsData.priceForTwo,
            profileImage: restaurantsData.profileImage,
            deliveryFeeApplicable: restaurantsData.deliveryFeeApplicable,
            gstApplicable: restaurantsData.gstApplicable,
            fssaiLicense: restaurantsData.fssaiLicense,
            tradeLicense: restaurantsData.tradeLicense,
            restaurantLicense: restaurantsData.restaurantLicense,
            gstNo: restaurantsData.gstNo,
            priceForTwo: restaurantsData.priceForTwo,
        };

        return res.status(200).json({
            message: 'Restaurant details fetched successfully',
            payload: restaurantsDetails
        });

    } catch(error) {
        console.error('Error fetching restaurant details:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const updateUserProfile = async(data, res) => {
    if(!data) {
        return res.status(400).json({ message: 'User data is required' });
    }

    try {
        const user = await User.findOne({ _id: data.userId });
        if (!user) throw new Error('User not found');

        const emailAlreadyExisted = await User.findOne({ email: data.email, _id: { $ne: data.userId } });
        if (emailAlreadyExisted) return res.status(400).json({ message: 'Email already exists, please use a different email.' });

        const phoneNumberAlreadyExisted = await User.findOne({ phoneNumber: data.phoneNumber, _id: { $ne: data.userId } });
        if (phoneNumberAlreadyExisted) return res.status(400).json({ message: 'Phone number already exists, please use a different number.' });

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

const getCuisineNameById = async(req, res) => {
    try {
        const id = req.params.id;
        if(!id){
            return res.status(404).json({ message: 'Restaurants id not found' });
        }

        const category = await Category.find({ _id: id });
        if(!category) return res.status(404).json({ message: 'Cuisine category not found' });

        const response = {
            message: 'Cuisine category details fetched successfully',
            payload: category.categoryName
        }

        return res.status(200).json(response);

    } catch(err){
        res.status(400).json({ message: err.message });
    }
}

const getCuisineCategory = async(req, res) => {

    try {
        const categoryLists = await Category.find();
        if(!categoryLists) return res.status(404).json({ message: 'Cuisine category not found' });

        const restaurantsData = [];
        // categoryLists.restaurantId.forEach(element => {
        //     restaurantsData.push(element);
        // });

        const response = {
            message: 'Cuisine category details fetched successfully',
            payload: categoryLists
        }

        return res.status(200).json(response);

    } catch(err){
        res.status(400).json({ message: err.message });
    }

}

const getCuisineCategoryName = async(req, res) => {
    try {
        const categoryLists = await Category.find();
        if(!categoryLists) return res.status(404).json({ message: 'Cuisine category not found' });

        const categoryNameData = [];
        categoryLists.forEach(element => {
            categoryNameData.push(element.categoryName);
        });

        const response = {
            message: 'Cuisine category name fetched successfully',
            payload: categoryNameData
        }

        return res.status(200).json(response);

    } catch(err){
        res.status(400).json({ message: err.message });
    }
}

const getAllCuisineCategoryDetails = async(req, res) => {
    try {
        const categoryLists = await Category.find();
        if(!categoryLists) return res.status(404).json({ message: 'Cuisine category not found' });

        const categoryData = [];
        categoryLists.forEach(element => {
            categoryData.push(
                {
                    categoryName: element.categoryName,
                    categoryImage: element.categoryImage
                }
            );
        });

        const response = {
            message: 'Cuisine category data fetched successfully',
            payload: categoryData
        }

        return res.status(200).json(response);

    } catch(err){
        res.status(400).json({ message: err.message });
    }
}

const getCuisineCategoryRestaurantDetails = async(body, res) => {
    if(!body){
        return res.status(400).json({ message: 'Cuisine category name is required' });
    }

    try {
        const categoryLists = await Category.find({ categoryName: body.categoryName });
        if(!categoryLists) return res.status(404).json({ message: 'Cuisine category not found' });

        const restaurantsData = [];
        categoryLists.forEach(category => {
            if(category.restaurant !== null){
                category.restaurant.forEach(element => {
                    restaurantsData.push(element.restaurantId);
                });
            }
        });

        const response = {
            message: 'Cuisine category details for restaurant fetched successfully',
            payload: restaurantsData
        }

        return res.status(200).json(response);

    } catch(err){
        res.status(400).json({ message: err.message });
    }
}

const addCuisineCategory = async(data, res) => {
    if(!data) {
        return res.status(400).json({ message: 'Cuisine data is required' });
    }

    try {
        const categoryExists = await Category.findOne({ categoryName: data.categoryName });
        if(categoryExists) return res.status(400).json({ message: 'Cuisine category already exists' });

        const newCategory = new Category();
        newCategory.categoryName = data.categoryName;

        const updatedCuisineCategory = await newCategory.save();
        res.status(201).json({ message: 'New cuisine category added successfully', payload: updatedCuisineCategory });

    } catch(error) {
        res.status(400).json({ message: err.message });
    }
}

const addNewDeal = async(data, res) => {
    if(!data) {
        return res.status(400).json({ message: 'Cuisine data is required' });
    }

    try {
        const dealExists = await Deals.findOne({ code: data.code });
        if(dealExists) return res.status(400).json({ message: 'Deal already exists, Please add new one.' });

        const newDeal = new Deals();
        newDeal.code = data.code;
        newDeal.title = data.title;
        newDeal.description = data.description;
        newDeal.maxDiscount = data.maxDiscount;
        newDeal.minOrderValue = data.minOrderValue;
        newDeal.discountPercent = data.discountPercent;
        newDeal.discountType = data.discountType;

        if(data.termsAndCondition && data.termsAndCondition.length > 0) {
            let termsAndConditionList = [];
            data.termsAndCondition.forEach(term => {
                termsAndConditionList.push({ terms: term.terms });
            })
            newDeal.termsAndCondition = termsAndConditionList;
        }

        const updatedDealsData = await newDeal.save();
        res.status(201).json({ message: 'New deal added successfully', payload: updatedDealsData });

    } catch(error) {
        res.status(400).json({ message: err.message });
    }
}

const getRestaurantDeal = async(req, res) => {
    const id = req.params.id;
    if(!id){
        return res.status(404).json({ message: 'Restaurants id not found' });
    }

    try {
        const dealsData = await Deals.find();
        if(!dealsData || dealsData.length == 0){
            return res.status(404).json({ message: 'Deals not found' });
        }
    
        const restaurantDeals = dealsData.filter((deal) => deal.restaurant.some(restaurant => restaurant.restaurantId.toString() === id));
    
        res.status(200).json({ message: 'Deal data fetched successfully', payload: restaurantDeals });
    } catch(err){
        res.status(400).json({ message: err.message });
    }
}

const getDealInfo = async(req, res) => {
    const id = req.params.id;
    if(!id){
        return res.status(404).json({ message: 'Deal id not found' });
    }

    try {
        const dealsData = await Deals.findOne({ _id: id });
        if(!dealsData){
            return res.status(404).json({ message: 'Deals not found' });
        }
    
        const dealData = {
            discountPercent: dealsData.discountPercent,
            code: dealsData.code,
            title: dealsData.title,
            maxDiscount: dealsData.maxDiscount,
            description: dealsData.description,
            minOrderValue: dealsData.minOrderValue,
            discountType: dealsData.discountType,
        }

        res.status(200).json({ message: 'Deal data fetched successfully', payload: dealData });
    } catch(err){
        res.status(400).json({ message: err.message });
    }
}

const addToFavorite = async(body, res) => {
    if(!body) {
        return res.status(400).json({ message: 'Favorite processing data is required' });
    }

    try {
        const { userId, restaurantId } = body;

        const existingUser = await User.findOne({ _id: userId });
        if (!existingUser) return res.status(400).json({ message: 'User not found, Please try again.' });

        const restaurantsData = await Restaurant.findOne({ _id: restaurantId });
        if(!restaurantsData) return res.status(400).json({ message: 'Restaurants not found, Please try again.' });

        const alreadyAddedToFavorite = existingUser.favorites.find(fav => fav.restaurantId.toString() === restaurantId.toString());
        if(alreadyAddedToFavorite){
            existingUser.favorites = existingUser.favorites.filter(fav => fav.restaurantId.toString() !== restaurantId.toString());
            await existingUser.save();
            return res.status(200).json({ message: "Removed from favorite", payload: { isSaved: false }});
        } else {
            existingUser.favorites.push({
                restaurantId: restaurantId
            });
            await existingUser.save();
            return res.status(200).json({ message: "Added to favorite", payload: { isSaved: true}});
        }

    } catch(error) {
        return res.status(400).json({ message: error.message });
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
    getAllRestaurantDetails,
    getRestaurantDetails,
    updateUserProfile,
    addNewUserAddress,
    deleteUserAddress,
    updateUserAddress,
    getCuisineNameById,
    getCuisineCategory,
    getCuisineCategoryName,
    getAllCuisineCategoryDetails,
    getCuisineCategoryRestaurantDetails,
    addCuisineCategory,
    addNewDeal,
    getRestaurantDeal,
    getDealInfo,
    addToFavorite,
    getRestaurantData,
}