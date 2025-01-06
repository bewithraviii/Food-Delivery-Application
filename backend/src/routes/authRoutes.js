const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');
const Roles = require('../utils/enums/roles');


// GET
router.get('/fetchUserDetails', authorizeRoles(Roles.USER), authController.fetchUser);
router.get('/fetchRestaurantDetails', authorizeRoles(Roles.USER, Roles.VENDOR), authController.fetchAllRestaurant);
router.get('/getRestaurantDetails/:id', authorizeRoles(Roles.USER, Roles.VENDOR), authController.fetchRestaurant);

// POST
router.post('/login', authController.login);
router.post('/vendorLogin', authController.vendorLogin);
router.post('/registerUser', authController.signUpUser);
router.post('/registerVendor', authController.signUpVendor);
router.post('/sendOtp', authController.sendOTP);
router.post('/verifyOtp', authController.verifyOTP);
router.post('/generateQrCode', authController.generateQR);
router.post('/verifyQrCodeOtp', authController.verifyQrOTP);
router.post('/updateUserProfileData', authorizeRoles(Roles.USER, Roles.VENDOR), authController.updateUserProfileData);
router.post('/addNewUserAddress', authorizeRoles(Roles.USER, Roles.VENDOR), authController.addNewUserAddress);
router.post('/deleteUserAddress', authorizeRoles(Roles.USER, Roles.VENDOR), authController.deleteUserAddress);
router.post('/updateUserAddress', authorizeRoles(Roles.USER, Roles.VENDOR), authController.updateUserAddress);





module.exports = router;