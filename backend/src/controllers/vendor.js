const restaurantManagementService = require('../services/vendor/restaurant-management');



exports.addRestaurantMenu = async(req, res) => { 
    return await restaurantManagementService.addRestaurantMenu(req.body, res);
}

exports.editRestaurantMenu = async(req, res) => {
    return await restaurantManagementService.editRestaurantMenu(req.body, res);
}

exports.removeItemFromRestaurantMenu = async (req, res) => {
    return await restaurantManagementService.removeItemFromRestaurantMenu(req.body, res);
}