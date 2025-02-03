const searchService = require('../services/search/search-management');



exports.searchRestaurant = async(req, res) => {
    return await searchService.searchRestaurant(req, res);
}