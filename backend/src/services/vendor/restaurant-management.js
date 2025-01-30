const Category = require("../../models/categoryModel");
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

            const categoryData = await Category.findOne({ _id: data.categoryId });
            if(!categoryData) return res.status(404).json({ message: 'Cuisine category not found' });

            const checkRestaurantInCategory = categoryData.restaurant.find(restaurant => restaurant.restaurantId == data.restaurantId);
            if(!checkRestaurantInCategory) {
                categoryData.restaurant.push({ restaurantId: data.restaurantId });
                await categoryData.save();
            }

            const menuCategoryDetails = {
                categoryId: data.categoryId,
                subCategoryName: data.subCategoryName,
                items: []
            }
            
            data.items.forEach(item => {
                menuCategoryDetails.items.push(item);
            });


            
            existingRestaurant.menu.push(menuCategoryDetails);
            
            if (!existingRestaurant.cuisineType.some(cuisineType => cuisineType.categoryId == data.categoryId)) {
                existingRestaurant.cuisineType.push({
                    categoryId: data.categoryId,
                    categoryName: data.categoryName,
                });
            }
            
            await existingRestaurant.save();
            return res.status(200).json({ message: 'Restaurant menu added successfully!' });    
        }

    } catch(err) {
        console.log("Failed to add restaurant menu due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const editRestaurantMenu = async (data, res) => {
    if(!data || !data.restaurantId) {
        return res.status(400).json({ message: 'Restaurant data is required' });
    }

    try {
        const existingRestaurant = await Restaurant.findOne({ _id: data.restaurantId });
        if(!existingRestaurant) return res.status(400).json({ message: 'Restaurant not found please try again.' });

        const selectedMenu = existingRestaurant.menu.find(menu => menu.subCategoryName === data.subCategoryName);
        if(!selectedMenu) return res.status(400).json({ message: 'Restaurant menu with this Sub Category not found.' });

        data.items.forEach(dataItem => {
            const selectedMenuItem = selectedMenu.items.find(item => item.itemId == dataItem.itemId);
            if(!selectedMenuItem) return res.status(400).json({ message: 'No Item found with this ItemId.' });

            selectedMenuItem.name = dataItem.name;
            selectedMenuItem.price = dataItem.price;
            selectedMenuItem.description = dataItem.description;
        })

        const updatedRestaurantData = await existingRestaurant.save();
        return res.status(200).json({ message: 'Restaurant menu updated successfully!', payload: updatedRestaurantData }); 

    } catch(err) {
        console.log("Failed to update restaurant menu due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const removeItemFromRestaurantMenu = async (data, res) => {
    if(!data || !data.restaurantId) {
        return res.status(400).json({ message: 'Restaurant data is required' });
    }

    try {
        const existingRestaurant = await Restaurant.findOne({ _id: data.restaurantId });
        if(!existingRestaurant) return res.status(400).json({ message: 'Restaurant not found please try again.' });

        const selectedMenu = existingRestaurant.menu.find(menu => menu.subCategoryName.toLowerCase() === data.subCategoryName.toLowerCase());
        if(!selectedMenu) return res.status(400).json({ message: 'Restaurant menu with this Sub Category not found.' });

        selectedMenu.items = selectedMenu.items.filter(item => item.itemId !== data.itemId);

        if(selectedMenu.items.length == 0){
            console.log(existingRestaurant.cuisineType, selectedMenu.categoryId);
            existingRestaurant.cuisineType = existingRestaurant.cuisineType.filter(cuisine => !cuisine.categoryId.equals(selectedMenu.categoryId));
            existingRestaurant.menu = existingRestaurant.menu.filter(menu => menu.subCategoryName.toLowerCase() !== data.subCategoryName.toLowerCase());
        }

        const updatedRestaurantData = await existingRestaurant.save();
        return res.status(200).json({ message: 'Restaurant menu item deleted successfully', payload: updatedRestaurantData }); 

    } catch(err) {
        console.log("Failed to update restaurant menu due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports = { addRestaurantMenu, editRestaurantMenu, removeItemFromRestaurantMenu }