const JWT = require('jsonwebtoken');
const socketModule = require('../socket/socket');
const Order = require('../../models/orderModel');
const Status = require('../../utils/enums/status');
const Category = require("../../models/categoryModel");
const Restaurant = require("../../models/restaurantModel");
const RandomGenerator = require("../../utils/random-generator/generate-random");



const addRestaurantMenu = async (req, res) => {
    try{
        
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        const JWT_SECRET = 'FoodDeliveryApp';
        const decoded = JWT.verify(token, JWT_SECRET);
        
        const restaurantId = decoded.id;
        if (!restaurantId) {
            return res.status(400).json({ message: 'Restaurant id is required' });
        }

        const data = req.body;



        const existingRestaurant = await Restaurant.findOne({ _id: restaurantId });
        if(!existingRestaurant) return res.status(400).json({ message: 'Restaurant not found please try again.' });

        let itemNumber = 0; 
        if(existingRestaurant.menu){
            existingRestaurant.menu.forEach((menuItem) => {
                itemNumber = itemNumber + menuItem.items.length;
            });
        }
        
        if(existingRestaurant.menu !== null && existingRestaurant.menu.some(category => category.subCategoryName === data.subCategoryName)){
            const alreadyAddedSubCategory = existingRestaurant.menu.find(category => category.subCategoryName === data.subCategoryName);
            data.items.forEach(async item => {
                itemNumber = await RandomGenerator();
                item.itemId = +itemNumber;
                item.ratings = 0;
                item.ratingsCount = 0;
                alreadyAddedSubCategory.items.push(item);
            });
        } else {
            const categoryData = await Category.findOne({ _id: data.categoryId });
            if(!categoryData) return res.status(404).json({ message: 'Cuisine category not found' });

            const checkRestaurantInCategory = categoryData.restaurant.find(restaurant => restaurant.restaurantId == restaurantId);
            if(!checkRestaurantInCategory) {
                categoryData.restaurant.push({ restaurantId: restaurantId });
                await categoryData.save();
            }

            const menuCategoryDetails = {
                categoryId: data.categoryId,
                subCategoryName: data.subCategoryName,
                items: []
            }
            


            data.items.forEach(async item => {
                itemNumber = await RandomGenerator();
                item.itemId = +itemNumber;
                item.ratings = 0;
                item.ratingsCount = 0;
                menuCategoryDetails.items.push(item);
            });

            existingRestaurant.menu.push(menuCategoryDetails);
            
        }

        if (!existingRestaurant.cuisineType.some(cuisineType => cuisineType.categoryId == data.categoryId)) {
            existingRestaurant.cuisineType.push({
                categoryId: data.categoryId,
                categoryName: data.categoryName,
            });
        }
        
        await existingRestaurant.save();
        return res.status(200).json({ message: 'Restaurant menu added successfully!' });    

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
        
        for (const dataItem of data.items) {
            const selectedMenuItem = selectedMenu.items.find(item => item.itemId == dataItem.itemId);
            if (!selectedMenuItem) {
                return res.status(400).json({ message: 'No Item found with this ItemId.' });
            }

            selectedMenuItem.available = dataItem.available;
            selectedMenuItem.name = dataItem.name;
            selectedMenuItem.price = dataItem.price;
            selectedMenuItem.description = dataItem.description;
            selectedMenuItem.itemImage = dataItem.itemImage;
        }

        const updatedRestaurantData = await existingRestaurant.save();
        return res.status(200).json({ message: 'Restaurant menu updated successfully!', payload: updatedRestaurantData }); 

    } catch(err) {
        console.log("Failed to update restaurant menu due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const updateOrderRequest = async(req, res) => {
    try {
        const data = req.body;
        if(!data || !data.restaurantId) {
            return res.status(400).json({ message: 'Data is required' });
        }

        const orderDetails = await Order.findOne({ _id: data.orderId });
        if(!orderDetails) return res.status(404).json({ message: 'Order not found' });

        orderDetails.status = data.status;
        const updatedOrderDetails = await orderDetails.save();

        const socketPayload = {
            orderId: updatedOrderDetails._id,
            status: updatedOrderDetails.status,
        }

        socketModule.getIO().emit(`orderStatusUpdate_${updatedOrderDetails.userId}`, socketPayload);

        return res.status(200).json({ 
            message: 'Order updated successfully!', 
            payload: { updated: true, userId: updatedOrderDetails.userId } 
        });
        
    } catch(err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const removeItemFromRestaurantMenu = async (req, res) => {
    try {

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        const JWT_SECRET = 'FoodDeliveryApp';
        const decoded = JWT.verify(token, JWT_SECRET);
        
        const restaurantId = decoded.id;
        if (!restaurantId) {
            return res.status(400).json({ message: 'Restaurant id is required' });
        }

        const data = req.body;


        const existingRestaurant = await Restaurant.findOne({ _id: restaurantId });
        if(!existingRestaurant) return res.status(400).json({ message: 'Restaurant not found please try again.' });

        const selectedMenu = existingRestaurant.menu.find(menu => menu.subCategoryName.toLowerCase() === data.subCategoryName.toLowerCase());
        if(!selectedMenu) return res.status(400).json({ message: 'Restaurant menu with this Sub Category not found.' });

        selectedMenu.items = selectedMenu.items.filter(item => item.itemId !== data.itemId);

        if(selectedMenu.items.length == 0){
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

const updateRestaurantData = async(data, res) => {
    if(!data || !data.restaurantId) {
        return res.status(400).json({ message: 'Restaurant data is required' });
    }

    try {
        const existingRestaurant = await Restaurant.findOne({ _id: data.restaurantId });
        if(!existingRestaurant) return res.status(400).json({ message: 'Restaurant not found please try again.' });
  
        if(data.items.hasOwnProperty('gstApplicable')){
            existingRestaurant.gstApplicable = data.items.gstApplicable;
        }

        if(data.items.hasOwnProperty('deliveryFeeApplicable')){
            existingRestaurant.deliveryFeeApplicable = data.items.deliveryFeeApplicable;
        }

        const updatedRestaurantData = await existingRestaurant.save();
        return res.status(200).json({ message: 'Restaurant updated successfully!', payload: updatedRestaurantData }); 

    } catch(err) {
        console.log("Failed to update restaurant due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const getMenuItemDetails = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        const JWT_SECRET = 'FoodDeliveryApp';
        const decoded = JWT.verify(token, JWT_SECRET);
        
        const restaurantId = decoded.id;
        if (!restaurantId) {
            return res.status(400).json({ message: 'Restaurant id is required' });
        }

        const data = req.query;
        
        const existingRestaurant = await Restaurant.findOne({ _id: restaurantId });
        if(!existingRestaurant) return res.status(400).json({ message: 'Restaurant not found please try again.' });

        const category = existingRestaurant.menu && existingRestaurant.menu.find(category => category.subCategoryName === data.subCategoryName);
        if (!category) {
            return res.status(404).json({ message: 'Subcategory not found in restaurant menu' });
        }

        const menuItemDetails = category.items.find(item => item.itemId == data.itemId);
        if (menuItemDetails) {
            const categoryData = await Category.findOne({ _id: category.categoryId });
            if(!categoryData) return res.status(404).json({ message: 'Cuisine category not found' });

            const responsePayload = {
                category: categoryData.categoryName, 
                subCategoryName: category.subCategoryName,
                restaurantId: existingRestaurant._id,
                menuItemDetails
            }

            return res.status(200).json({
                message: 'Restaurant menu item fetched successfully',
                payload: responsePayload
            });
        } else {
            return res.status(404).json({
                message: 'Item not found in restaurant menu',
                payload: null
            });
        }

    } catch(err) {
        console.error('Error fetching restaurant menu item:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const getOrderRequest = async(req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }
        
        const JWT_SECRET = 'FoodDeliveryApp';
        const decoded = JWT.verify(token, JWT_SECRET);
        
        const restaurantId = decoded.id;
        if (!restaurantId) {
            return res.status(400).json({ message: 'Restaurant id is required' });
        }
        
        const orderData = await Order.find({ restaurantId: restaurantId, status: Status.CONFIRMED });
        if(!orderData || orderData.length == 0){
            return res.status(404).json({ message: 'Order not found' })
        }
        
        const orderDetails = await Promise.all(
            orderData.map(async order => await processSocketPayload(order))
        );
        
        return res.status(200).json({ 
            message: 'Order fetched successfully',
            payload: orderDetails 
        });
        
    } catch(err){
        console.error('Error fetching restaurant menu item:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const getActiveOrders = async(req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }
        
        const JWT_SECRET = 'FoodDeliveryApp';
        const decoded = JWT.verify(token, JWT_SECRET);
        
        const restaurantId = decoded.id;
        if (!restaurantId) {
            return res.status(400).json({ message: 'Restaurant id is required' });
        }
        
        const orderData = await Order.find({ restaurantId: restaurantId, status: Status.PROCESSING });
        if(!orderData || orderData.length == 0){
            return res.status(404).json({ message: 'Order not found' })
        }
        
        const orderDetails = await Promise.all(
            orderData.map(async order => await processSocketPayloadForManage(order))
        );
        
        return res.status(200).json({ 
            message: 'Orders fetched successfully',
            payload: orderDetails 
        });
        
    } catch(err){
        console.error('Error fetching restaurant menu item:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const processSocketPayload = async(data) => {
    let socketPayload = {
        date: '',
        item: [],
        orderId: '',
        status: 'Pending',
    };

    data.cartData.cartItems.forEach(cartItem => {
        cartItem.restaurant.orderItem.forEach(item => {
            socketPayload.item.push({ name: item.name, quantity: item.quantity})
        });
    });
    
    const dateObject = new Date(data.createdAt);
    if (isNaN(dateObject.getTime())) console.error("Invalid Date String provided");

    const day = String(dateObject.getDate()).padStart(2, '0');
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const year = dateObject.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;

    socketPayload.orderId = data._id;
    socketPayload.date = formattedDate;

    return socketPayload;

}

const processSocketPayloadForManage = async(data) => {
    let socketPayload = {
        date: '',
        item: [],
        orderId: data._id,
        status: 'Processing',
        note: data.note
    };

    data.cartData.cartItems.forEach(cartItem => {
        cartItem.restaurant.orderItem.forEach(item => {
            socketPayload.item.push({ name: item.name, quantity: item.quantity})
        });
    });
    
    const dateObject = new Date(data.createdAt);
    if (isNaN(dateObject.getTime())) console.error("Invalid Date String provided");

    const day = String(dateObject.getDate()).padStart(2, '0');
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const year = dateObject.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;

    socketPayload.date = formattedDate;

    return socketPayload;
}


module.exports = { 
    addRestaurantMenu, 
    editRestaurantMenu, 
    removeItemFromRestaurantMenu, 
    updateRestaurantData,
    getMenuItemDetails,
    getOrderRequest,
    updateOrderRequest,
    getActiveOrders
}