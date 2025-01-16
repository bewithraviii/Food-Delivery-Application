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