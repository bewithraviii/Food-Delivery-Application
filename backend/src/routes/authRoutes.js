const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();



// POST
router.post('/login', authController.login);
router.post('/registerUser', authController.signUpUser);
router.post('/registerVendor', authController.signUpVendor);




module.exports = router;