const authService = require('../services/auth/auth');
const otpService = require('../services/mail/mail');

exports.login = async(req, res) => {
    return await authService.userLogin(req.body, res);
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