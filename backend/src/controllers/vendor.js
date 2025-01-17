const restaurantManagementService = require('../services/vendor/restaurant-management');



exports.addRestaurantMenu = async(req, res) => { 
    return await restaurantManagementService.addRestaurantMenu(req.body, res);
}