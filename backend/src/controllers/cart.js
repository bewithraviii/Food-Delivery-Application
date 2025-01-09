const cartService = require('../services/cart/cart');

exports.geUserCart = async(req, res) => {
    return await cartService.getCartData(req, res);
}

exports.addToCart = async(req, res) => {
    return await cartService.addToCart(req, res);
}