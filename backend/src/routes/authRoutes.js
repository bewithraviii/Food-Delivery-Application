const express = require('express');
const authController = require('../controllers/auth');
const cartController = require('../controllers/cart');
const searchController = require('../controllers/search');
const vendorController = require('../controllers/vendor');
const orderController = require('../controllers/order');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');
const Roles = require('../utils/enums/roles');


// GET

// User-Profile
router.get('/fetchUserDetails', authorizeRoles(Roles.USER), authController.fetchUser);
// Restaurant
router.get('/fetchRestaurantDetails', authorizeRoles(Roles.USER, Roles.VENDOR), authController.fetchAllRestaurant);
router.get('/fetchRestaurantData', authorizeRoles(Roles.VENDOR), authController.fetchRestaurantData);
router.get('/getRestaurantDetails/:id', authorizeRoles(Roles.USER, Roles.VENDOR), authController.fetchRestaurant);
// Cuisine
router.get('/getAllCuisineCategory', authController.getCuisineCategory);
router.get('/getAllCuisineCategoryName', authController.getCuisineCategoryName);
router.get('/getAllCuisineCategoryDetails', authController.getAllCuisineCategoryDetails);
router.get('/getCuisineCategoryRestaurantDetails', authController.getCuisineCategoryRestaurantDetails);
router.get('/getCuisineNameById/:id', authController.getCuisineNameById);
// Cart
router.get('/getCartByUserId/:id', authorizeRoles(Roles.USER), cartController.getUserCart);
router.get('/getUserCartDataForCheck/:id', authorizeRoles(Roles.USER), cartController.getUserCartDataForCheck);
// Deals
router.get('/getDealsForRestaurant/:id', authController.getRestaurantDeal);
router.get('/getDealInfo/:id', authController.getDealInfo);
// Search
router.get('/searchRestaurant', authorizeRoles(Roles.USER), searchController.searchRestaurant);
// Order
router.get('/getOrderDetails/:id', authorizeRoles(Roles.USER, Roles.VENDOR), orderController.getOrderDetailsById);
router.get('/fetchOrderDetails', authorizeRoles(Roles.USER), orderController.fetchOrderDetails);


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
// Restaurant
router.post('/addToFavorite', authorizeRoles(Roles.USER), authController.addToFavorite);
// Cart
router.post('/addToCart', authorizeRoles(Roles.USER), cartController.addToCart);
router.post('/removeFromCart', authorizeRoles(Roles.USER), cartController.removeFromCart);
router.post('/applyDealsToCart', authorizeRoles(Roles.USER), cartController.applyDealsToCart);
router.post('/removeDealsFromCart', authorizeRoles(Roles.USER), cartController.removeDealsFromCart);
// Order
router.post('/addNewOrder', authorizeRoles(Roles.USER), orderController.addNewOrder);
router.post('/updateOrderStatus', authorizeRoles(Roles.USER, Roles.VENDOR, Roles.DELIVERY_AGENT), orderController.updateOrderStatus)


// ADMIN
router.post('/addCategory', authController.addCuisineCategory);
router.post('/addDeal', authController.addNewDeal);




// Vendor API's

// GET
router.get('/getMenuItemDetails', authorizeRoles(Roles.VENDOR), vendorController.getMenuItemDetails);
router.get('/getOrderRequest', authorizeRoles(Roles.VENDOR), vendorController.getOrderRequest);
router.get('/getActiveOrders', authorizeRoles(Roles.VENDOR), vendorController.getActiveOrders);

// POST
router.post('/addRestaurantMenu', authorizeRoles(Roles.VENDOR), vendorController.addRestaurantMenu);
router.post('/editRestaurantMenu', authorizeRoles(Roles.VENDOR), vendorController.editRestaurantMenu);
router.post('/removeItemFromRestaurantMenu', authorizeRoles(Roles.VENDOR), vendorController.removeItemFromRestaurantMenu);
router.post('/updateRestaurantData', authorizeRoles(Roles.VENDOR), vendorController.updateRestaurantData);

//PATCH
router.patch('/updateOrderRequest', authorizeRoles(Roles.VENDOR), vendorController.updateOrderRequest);

module.exports = router;