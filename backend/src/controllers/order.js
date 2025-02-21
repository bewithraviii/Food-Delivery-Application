const orderService = require('../services/order/order');

exports.addNewOrder = async(req, res) => {
    return await orderService.addNewOrder(req.body, res);
}

exports.getOrderDetailsById = async(req, res) => {
    return await orderService.getOrderDetailsById(req, res);
}

exports.updateOrderStatus = async(req, res) => {
    return await orderService.updateOrderStatus(req.body, res);
}
