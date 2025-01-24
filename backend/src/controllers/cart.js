const cartService = require('../services/cart/cart');

exports.getUserCart = async(req, res) => {
    return await cartService.getCartData(req, res);
}

exports.addToCart = async(req, res) => {
    return await cartService.addToCart(req, res);
}

exports.removeFromCart = async(req, res) => {
    return await cartService.removeFromCart(req, res);
}

exports.applyDealsToCart = async(req, res) => {
    return await cartService.applyDealsToCart(req.body, res);
}

exports.removeDealsFromCart = async(req, res) => {
    return await cartService.removeDealsFromCart(req.body, res);
}