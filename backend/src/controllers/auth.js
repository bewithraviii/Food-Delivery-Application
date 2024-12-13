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