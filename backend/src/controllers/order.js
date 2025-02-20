const orderService = require('../services/order/order');

exports.getOrderDetailsById = async(req, res) => {
    return await orderService.getOrderDetailsById(req, res);
}
