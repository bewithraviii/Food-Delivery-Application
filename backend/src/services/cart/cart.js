const Cart = require('../../models/cartModel');
const Deals = require('../../models/dealsModel');
const Restaurant = require('../../models/restaurantModel');
const User = require('../../models/userModel');
const cartStatus = require('../../utils/enums/cartStatus');
const BillCalculation = require('../../utils/cart/bill-calculation');

const getUserCartDataForCheck = async (req, res) => {
    try{
        const userId = req.params.id;
        if(!userId){
            return res.status(400).json({ message: 'User id not found' });
        }

        const existingCart = await Cart.findOne({ userId: userId, status: cartStatus.CartStatus.PENDING });
        if(!existingCart){
            return res.status(200).json({ message: 'Cart not found' });
        }
        
        let responsePayload = {
            message: 'Cart fetched successfully',
            payload: true
        }
        return res.status(200).json(responsePayload);

    } catch(err) {
        console.log("Fetch cart failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const getCartData = async (req, res) => {
    try{
        const userId = req.params.id;
        if(!userId){
            return res.status(400).json({ message: 'User id not found' });
        }

        const existingCart = await Cart.findOne({ userId: userId, status: cartStatus.CartStatus.PENDING });
        if(!existingCart){
            return res.status(400).json({ message: 'Cart not found' });
        }

        let deal;
        let billData;
        if(existingCart.couponApplied){
            deal = await Deals.findOne({ _id: existingCart.couponApplied });
            if(!deal) return res.status(400).json({ message: 'Deal not found' });
        }

        await updateRestaurantDataForCartItems(existingCart.cartItems);

        if(deal){
            billData = await BillCalculation(existingCart.cartItems, deal);
        } else {
            billData = await BillCalculation(existingCart.cartItems, null);
        }

        if(!billData) {
            res.status(500).json({ message: 'Server error', error: "Something went wrong while processing bill calculation." });
        }

        let responsePayload;
        if(billData.discountedPrice)
        {
            responsePayload = {
                message: 'Cart fetched successfully',
                dealApplied: true,
                payload: {...existingCart._doc, ...billData}
            }
        } else {
            responsePayload = {
                message: 'Cart fetched successfully',
                payload: {...existingCart._doc, ...billData}
            }
        }
        
        return res.status(200).json(responsePayload);

    } catch(err) {
        console.log("Fetch cart failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }

}

const addToCart = async (req, res) => {
    const data = req.body;
    if(!data || !data.userId) {
        return res.status(400).json({ message: 'Cart data is required' });
    }
    try{   
        const userId = data.userId;
        const existingCart = await Cart.findOne({ userId: userId, status: cartStatus.CartStatus.PENDING });
        if(!existingCart){
            const newCart = new Cart();
            newCart.userId = userId;
            newCart.cartItems = data.cartItems;
            await newCart.save();
            return res.status(201).json({ message: 'Cart created successfully', payload: newCart });
        }

        if(existingCart.cartItems.length > 0 && Array.isArray(data.cartItems)){ 
            data.cartItems.forEach(cartItem => {
                const existingCartItem = existingCart.cartItems.find(item => item.restaurant.restaurantId.toString() === cartItem.restaurant.restaurantId.toString());
                if(existingCartItem) {
                    cartItem.restaurant.orderItem.forEach(newOrderItem => {
                        const existingOrderItem = existingCartItem.restaurant.orderItem.find(item => item.itemId === newOrderItem.itemId);
                        if(existingOrderItem) {
                            existingOrderItem.quantity += newOrderItem.quantity;
                        } else {
                            existingCartItem.restaurant.orderItem.push(newOrderItem);
                        }
                    });
                } else {
                    // Commented - One Cart = OrderItems from only one Restaurant
                    // existingCart.cartItems.push(cartItem);
                    return res.status(400).json({ message: 'Your cart already contains other restaurant order, Please continue or empty cart.' });
                }
            });  
        }

        await updateRestaurantDataForCartItems(existingCart.cartItems);

        const billData = await BillCalculation(existingCart.cartItems, null);
        if(!billData) {
            res.status(500).json({ message: 'Server error', error: "Something went wrong while processing bill calculation." });
        }

        if(existingCart.couponApplied){
            existingCart.couponApplied = null;
        }
        await existingCart.save();
        return res.status(200).json({ 
            message: 'Cart updated successfully',
            payload: {...existingCart._doc, ...billData} 
        });

    } catch(err) {
        console.log("Add to cart failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const removeFromCart = async(req, res) => {
    const data = req.body;
    if (!data || !data.userId) {
        return res.status(400).json({ message: 'User id and cart data are required' });
    }

    try {
        const userId = data.userId;
        const existingCart = await Cart.findOne({ userId: userId, status: cartStatus.CartStatus.PENDING });
        if(!existingCart){
            return res.status(404).json({ message: 'Cart not found' });
        }

        if(existingCart.cartItems.length > 0 && Array.isArray(data.cartItems)){
            data.cartItems.forEach(cartItem => { 
                const existingCartItem = existingCart.cartItems.find(item => item.restaurant.restaurantId.toString() === cartItem.restaurant.restaurantId.toString());
                if(existingCartItem) {
                    cartItem.restaurant.orderItem.forEach(newOrderItem => {
                        const existingOrderItem = existingCartItem.restaurant.orderItem.find(item => item.itemId === newOrderItem.itemId);
                        if(existingOrderItem && existingOrderItem.quantity > 1) {
                            existingOrderItem.quantity -= newOrderItem.quantity;
                        } else if(existingOrderItem && existingOrderItem.quantity == 1){
                            existingCartItem.restaurant.orderItem = existingCartItem.restaurant.orderItem.filter(item => item.itemId !== newOrderItem.itemId);
                        }
                    });
                    if (existingCartItem.restaurant.orderItem.length === 0) {
                        existingCart.cartItems = existingCart.cartItems.filter(item => item.restaurant.restaurantId.toString() !== cartItem.restaurant.restaurantId.toString());
                    }
                }
            });
        }
        
        if(existingCart.cartItems.length == 0) {
            await existingCart.deleteOne({ userId: userId});
            return res.status(200).json({ message: 'Cart successfully cleared', payload: null });
        } else {

            await updateRestaurantDataForCartItems(existingCart.cartItems);

            const billData = await BillCalculation(existingCart.cartItems, null);
            if(!billData) {
                res.status(500).json({ message: 'Server error', error: "Something went wrong while processing bill calculation." });
            }

            if(existingCart.couponApplied){
                existingCart.couponApplied = null;
            }
            await existingCart.save();
            return res.status(200).json({ 
                message: 'Cart updated successfully', 
                payload: {...existingCart._doc, ...billData}
            });
        }
    } catch(err) {
        console.log("Add to cart failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const applyDealsToCart = async(body, res) => {
    if (!body) {
        return res.status(400).json({ message: 'Deal related data is required' });
    }

    try {
        let restaurantDataPresent = false;
        
        const { dealId, cartId, restaurantId } = body;
        
        const deal = await Deals.findOne({ _id: dealId });
        if(!deal) return res.status(400).json({ message: 'Deal not found' });

        const existingCart = await Cart.findOne({ _id: cartId, status: cartStatus.CartStatus.PENDING });
        if(!existingCart) return res.status(400).json({ message: 'Cart not found' });

        if(existingCart.cartItems.length > 0){
            restaurantDataPresent = existingCart.cartItems.some(cartItem => {
                return cartItem.restaurant.restaurantId.toString() === restaurantId.toString()
            });
        }

        if(!restaurantDataPresent) {
            return res.status(400).json({ message: 'Restaurant data not found in cart' });
        }

        await updateRestaurantDataForCartItems(existingCart.cartItems);

        const billData = await BillCalculation(existingCart.cartItems, deal);
        if(!billData) {
            res.status(500).json({ message: 'Server error', error: "Something went wrong while processing bill calculation." });
        }

        if (billData && billData.minimumOrderNotMet) {
            return res.status(200).json({ message: billData.message, dealApplied: false });
        }

        const { billDetails, totalAmount, discountedPrice } = billData;

        existingCart.couponApplied = deal._id;
        await existingCart.save();

        return res.status(200).json({ 
            message: 'Cart updated successfully', 
            dealApplied: true,
            discountedPrice: discountedPrice,
            payload: {...existingCart._doc, billDetails, totalAmount}
        });

    } catch(err) {
        console.log("Coupon application failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const removeDealsFromCart = async(body, res) => { 
    if (!body) {
        return res.status(400).json({ message: 'Deal related data is required' });
    }

    try {
        const { userId } = body;

        const existingCart = await Cart.findOne({ userId: userId, status: cartStatus.CartStatus.PENDING });
        if(!existingCart){
            return res.status(400).json({ message: 'Cart not found' });
        }

        await updateRestaurantDataForCartItems(existingCart.cartItems);

        const billData = await BillCalculation(existingCart.cartItems, null);
        if(!billData) {
            res.status(500).json({ message: 'Server error', error: "Something went wrong while processing bill calculation." });
        }
            
        if(existingCart.couponApplied){
            existingCart.couponApplied = null;
        }
        await existingCart.save();
    
        return res.status(200).json({
            message: 'Coupon successfully removed',
            payload: {...existingCart._doc, ...billData}
        });

    } catch(err) {
        console.log("Fetch cart failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const updateRestaurantDataForCartItems = async(cartItems) => {
    if (!cartItems || !Array.isArray(cartItems)) {
        throw new Error('Invalid cart items provided');
    }

    await Promise.all(
        cartItems.map(async (cartDetail) => {
            const restaurantsData = await Restaurant.findOne({ _id: cartDetail.restaurant.restaurantId });
            if(!restaurantsData){
                return res.status(404).json({ message: 'Restaurants not found' });
            }
            cartDetail.restaurant.gstApplicable = restaurantsData.gstApplicable;
            cartDetail.restaurant.deliveryFeeApplicable = restaurantsData.deliveryFeeApplicable;
            cartDetail.restaurant.restaurantCharges = restaurantsData.restaurantCharges;
        })
    );
}

module.exports = { getCartData, addToCart, removeFromCart, applyDealsToCart, removeDealsFromCart, 
    getUserCartDataForCheck 
}