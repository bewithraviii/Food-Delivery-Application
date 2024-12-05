const authService = require('../services/auth/auth');

exports.login = async(req, res) => {
    return await authService.userLogin(req.body, res);
}

exports.signUpUser = async(req, res) => {
    return await authService.userSignUp(req.body, res);
}

exports.signUpVendor = async(req, res) => {
    return await authService.vendorSignUp(req.body, res);
}