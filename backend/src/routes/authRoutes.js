const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();



// GET
router.get('/fetchUserDetails', authController.fetchUser);
router.get('/fetchRestaurantDetails', authController.fetchAllRestaurant);
router.get('/getRestaurantDetails/:id', authController.fetchRestaurant);

// POST
router.post('/login', authController.login);
router.post('/vendorLogin', authController.vendorLogin);
router.post('/registerUser', authController.signUpUser);
router.post('/registerVendor', authController.signUpVendor);
router.post('/sendOtp', authController.sendOTP);
router.post('/verifyOtp', authController.verifyOTP);
router.post('/generateQrCode', authController.generateQR);
router.post('/verifyQrCodeOtp', authController.verifyQrOTP);
router.post('/updateUserProfileData', authController.updateUserProfileData);
router.post('/addNewUserAddress', authController.addNewUserAddress);
router.post('/deleteUserAddress', authController.deleteUserAddress);
router.post('/updateUserAddress', authController.updateUserAddress);





module.exports = router;