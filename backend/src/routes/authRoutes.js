const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();



// POST
router.post('/login', authController.login);
router.post('/vendorLogin', authController.vendorLogin);
router.post('/registerUser', authController.signUpUser);
router.post('/registerVendor', authController.signUpVendor);
router.post('/sendOtp', authController.sendOTP);
router.post('/verifyOtp', authController.verifyOTP);
router.post('/generateQrCode', authController.generateQR);




module.exports = router;