const authService = require('../services/auth/auth');
const otpService = require('../services/mail/mail');
const qrCodeService = require('../services/qr-code/qrCode')

exports.login = async(req, res) => {
    return await authService.userLogin(req.body, res);
}

exports.vendorLogin = async(req, res) => {
    return await authService.vendorLogin(req.body, res);
}

exports.signUpUser = async(req, res) => {
    return await authService.userSignUp(req.body, res);
}

exports.signUpVendor = async(req, res) => {
    return await authService.vendorSignUp(req.body, res);
}

exports.sendOTP = async(req, res) => {
    return await otpService.sendOtpMail(req.body, res);
}

exports.verifyOTP = async(req, res) => {
    return await otpService.verifyOtpMail(req.body, res);
}

exports.generateQR = async(req, res) => {
    return await qrCodeService.generateQRCode(req.body, res);
}

exports.verifyQrOTP = async (req, res) => {
    return await qrCodeService.verifyOTP(req.body, res);
};

exports.fetchUser = async (req, res) => {
    return await authService.getUserDetails(req, res);
};

exports.fetchAllRestaurant = async (req, res) => {
    return await authService.getAllRestaurantDetails(req, res);
};

exports.fetchRestaurant = async (req, res) => {
    return await authService.getRestaurantDetails(req, res);
}

exports.updateUserProfileData = async (req, res) => {
    return await authService.updateUserProfile(req.body, res);
}

exports.addNewUserAddress = async(req, res) => {
    return await authService.addNewUserAddress(req.body, res);
}

exports.updateUserAddress = async(req, res) => {
    return await authService.updateUserAddress(req.body, res);
}

exports.deleteUserAddress = async(req, res) => {
    return await authService.deleteUserAddress(req.body, res);
}

exports.getCuisineCategory = async(req, res) => {
    return await authService.getCuisineCategory(req, res);
}

exports.getCuisineCategoryName = async(req, res) => {
    return await authService.getCuisineCategoryName(req, res);
}

exports.getAllCuisineCategoryDetails = async(req, res) => {
    return await authService.getAllCuisineCategoryDetails(req, res);
}

exports.getCuisineCategoryRestaurantDetails = async(req, res) => {
    return await authService.getCuisineCategoryRestaurantDetails(req.body, res);
}

exports.addCuisineCategory = async(req, res) => {
    return await authService.addCuisineCategory(req.body, res);
}

exports.addNewDeal = async(req, res) => {
    return await authService.addNewDeal(req.body, res);
}

exports.getRestaurantDeal = async(req, res) => {
    return await authService.getRestaurantDeal(req, res);
}

exports.addToFavorite = async(req, res) => {
    return await authService.addToFavorite(req.body, res);
}