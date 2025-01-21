const express = require('express');
const authController = require('../controllers/auth');
const cartController = require('../controllers/cart');
const vendorController = require('../controllers/vendor');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');
const Roles = require('../utils/enums/roles');


// GET

// User-Profile
router.get('/fetchUserDetails', authorizeRoles(Roles.USER), authController.fetchUser);
// Restaurant
router.get('/fetchRestaurantDetails', authorizeRoles(Roles.USER, Roles.VENDOR), authController.fetchAllRestaurant);
router.get('/getRestaurantDetails/:id', authorizeRoles(Roles.USER, Roles.VENDOR), authController.fetchRestaurant);
// Cuisine
router.get('/getAllCuisineCategory', authController.getCuisineCategory);
router.get('/getAllCuisineCategoryName', authController.getCuisineCategoryName);
router.get('/getCuisineCategoryRestaurantDetails', authController.getCuisineCategoryRestaurantDetails);
// Cart
router.get('/getCartByUserId/:id', authorizeRoles(Roles.USER), cartController.getUserCart);





// POST

// Login-Signup
router.post('/login', authController.login);
router.post('/vendorLogin', authController.vendorLogin);
router.post('/registerUser', authController.signUpUser);
router.post('/registerVendor', authController.signUpVendor);
// Authentication-QR/OTP
router.post('/sendOtp', authController.sendOTP);
router.post('/verifyOtp', authController.verifyOTP);
router.post('/generateQrCode', authController.generateQR);
router.post('/verifyQrCodeOtp', authController.verifyQrOTP);
// User-Profile/Address
router.post('/updateUserProfileData', authorizeRoles(Roles.USER, Roles.VENDOR), authController.updateUserProfileData);
router.post('/addNewUserAddress', authorizeRoles(Roles.USER, Roles.VENDOR), authController.addNewUserAddress);
router.post('/deleteUserAddress', authorizeRoles(Roles.USER, Roles.VENDOR), authController.deleteUserAddress);
router.post('/updateUserAddress', authorizeRoles(Roles.USER, Roles.VENDOR), authController.updateUserAddress);
// Cart
router.post('/addCategory', authController.addCuisineCategory);
router.post('/addToCart', authorizeRoles(Roles.USER), cartController.addToCart);
router.post('/removeFromCart', authorizeRoles(Roles.USER), cartController.removeFromCart);








// Vendor API's
router.post('/addRestaurantMenu', vendorController.addRestaurantMenu);
router.post('/editRestaurantMenu', vendorController.editRestaurantMenu);
router.post('/removeItemFromRestaurantMenu', vendorController.removeItemFromRestaurantMenu);



module.exports = router;