const restaurantManagementService = require('../services/vendor/restaurant-management');



exports.addRestaurantMenu = async(req, res) => { 
    return await restaurantManagementService.addRestaurantMenu(req, res);
}

exports.editRestaurantMenu = async(req, res) => {
    return await restaurantManagementService.editRestaurantMenu(req.body, res);
}

exports.removeItemFromRestaurantMenu = async (req, res) => {
    return await restaurantManagementService.removeItemFromRestaurantMenu(req, res);
}

exports.updateRestaurantData = async(req, res) => {
    return await restaurantManagementService.updateRestaurantData(req.body, res);
}

exports.getMenuItemDetails = async(req, res) => {
    return await restaurantManagementService.getMenuItemDetails(req, res);
}

exports.getOrderRequest = async(req, res) => {
    return await restaurantManagementService.getOrderRequest(req, res);
}

exports.updateOrderRequest = async(req, res) => {
    return await restaurantManagementService.updateOrderRequest(req, res);
}

exports.getActiveOrders = async(req, res) => {
    return await restaurantManagementService.getActiveOrders(req, res);
}