const Restaurant = require("../../models/restaurantModel");



const addRestaurantMenu = async (data, res) => {
    if(!data || !data.restaurantId) {
        return res.status(400).json({ message: 'Restaurant data is required' });
    }

    try{
        const existingRestaurant = await Restaurant.findOne({ _id: data.restaurantId });
        if(!existingRestaurant) return res.status(400).json({ message: 'Restaurant not found please try again.' });
        
        if(existingRestaurant.menu !== null && existingRestaurant.menu.some(category => category.subCategoryName === data.subCategoryName)){
            return res.status(400).json({ message: 'Menu Sub-Category already exists, Please choose another one.'});
        } else {
            const menuCategoryDetails = {
                categoryId: data.categoryId,
                subCategoryName: data.subCategoryName,
                items: []
            }
            
            data.items.forEach(item => {
                menuCategoryDetails.items.push(item);
            });
            
            existingRestaurant.menu.push(menuCategoryDetails);
            
            await existingRestaurant.save();
            return res.status(200).json({ message: 'Restaurant menu added successfully!' });    
        }

    } catch(err) {
        console.log("Failed to add or update restaurant menu due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports = { addRestaurantMenu }