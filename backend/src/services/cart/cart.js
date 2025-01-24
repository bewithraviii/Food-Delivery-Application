const Cart = require('../../models/cartModel');
const Deals = require('../../models/dealsModel');
const Restaurant = require('../../models/restaurantModel');
const User = require('../../models/userModel');
const cartStatus = require('../../utils/enums/cartStatus');

const getCartData = async (req, res) => {
    try{
        const userId = req.params.id;
        if(!userId){
            return res.status(400).json({ message: 'User id not found' });
        }

        const existingCart = await Cart.findOne({ userId: userId});
        if(!existingCart){
            return res.status(400).json({ message: 'Cart not found' });
        }
        const billDetails = [
            { label: 'Item Total', amount: 0 },
            { label: 'Delivery Fee', amount: 30 },
            { label: 'Platform Fee', amount: 9 },
            { label: 'GST and Restaurant Charges', amount: 0 },
        ]
        let totalAmount = 0;

        existingCart.cartItems.forEach((cartDetail) => {
            cartDetail.restaurant.orderItem.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            const gst = itemTotal * 5 / 100;
            const restaurantCharge = cartDetail.restaurant.restaurantCharges;
            const gstOnPlatformFee = +(billDetails[2].amount * 18 / 100).toFixed(2);
            billDetails[0].amount = billDetails[0].amount + itemTotal;
            billDetails[3].amount = billDetails[3].amount + +(gst + restaurantCharge + gstOnPlatformFee).toFixed(2);
            });
        })
        billDetails.forEach(billDetail => {
            totalAmount = totalAmount + billDetail.amount;
        });

        return res.status(200).json({
            message: 'Cart fetched successfully',
            payload: {...existingCart._doc, billDetails, totalAmount}
        });

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
        const billDetails = [
            { label: 'Item Total', amount: 0 },
            { label: 'Delivery Fee', amount: 30 },
            { label: 'Platform Fee', amount: 9 },
            { label: 'GST and Restaurant Charges', amount: 0 },
        ]
        let totalAmount = 0;

        const userId = data.userId;
        const existingCart = await Cart.findOne({ userId: userId});
        if(!existingCart){
            const newCart = new Cart();
            newCart.userId = userId;
            newCart.cartItems = data.cartItems;
            newCart.status = cartStatus.PENDING
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

        existingCart.cartItems.forEach((cartDetail) => {
            cartDetail.restaurant.orderItem.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            const gst = itemTotal * 5 / 100;
            const restaurantCharge = cartDetail.restaurant.restaurantCharges;
            const gstOnPlatformFee = +(billDetails[2].amount * 18 / 100).toFixed(2);
            billDetails[0].amount = billDetails[0].amount + itemTotal;
            billDetails[3].amount = billDetails[3].amount + +(gst + restaurantCharge + gstOnPlatformFee).toFixed(2);
            });
        })
        billDetails.forEach(billDetail => {
            totalAmount = totalAmount + billDetail.amount;
        });

        if(existingCart.couponApplied){
            existingCart.couponApplied = null;
        }
        await existingCart.save();
        return res.status(200).json({ 
            message: 'Cart updated successfully',
            payload: {...existingCart._doc, billDetails, totalAmount} 
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
        const billDetails = [
            { label: 'Item Total', amount: 0 },
            { label: 'Delivery Fee', amount: 30 },
            { label: 'Platform Fee', amount: 9 },
            { label: 'GST and Restaurant Charges', amount: 0 },
        ]
        let totalAmount = 0;

        const userId = data.userId;
        const existingCart = await Cart.findOne({ userId: userId});
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
            existingCart.cartItems.forEach((cartDetail) => {
                cartDetail.restaurant.orderItem.forEach((item) => {
                const itemTotal = item.price * item.quantity;
                const gst = itemTotal * 5 / 100;
                const restaurantCharge = cartDetail.restaurant.restaurantCharges;
                const gstOnPlatformFee = parseFloat((billDetails[2].amount * 18 / 100).toFixed(2));
                billDetails[0].amount = billDetails[0].amount + itemTotal;
                billDetails[3].amount = billDetails[3].amount + parseFloat((gst + restaurantCharge + gstOnPlatformFee).toFixed(2));
                });
            })
            billDetails.forEach(billDetail => {
                totalAmount = totalAmount + billDetail.amount;
            });

            if(existingCart.couponApplied){
                existingCart.couponApplied = null;
            }
            await existingCart.save();
            return res.status(200).json({ 
                message: 'Cart updated successfully', 
                payload: {...existingCart._doc, billDetails, totalAmount}
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
        let totalAmount = 0;
        let discountedPrice = 0;
        const billDetails = [
            { label: 'Item Total', amount: 0 },
            { label: 'Delivery Fee', amount: 30 },
            { label: 'Platform Fee', amount: 9 },
            { label: 'GST and Restaurant Charges', amount: 0 },
            { label: 'Item Discount', amount: 0},
        ]
        
        const { dealId, cartId, restaurantId } = body;
        
        const deal = await Deals.findOne({ _id: dealId });
        if(!deal) return res.status(400).json({ message: 'Deal not found' });

        const existingCart = await Cart.findOne({ _id: cartId });
        if(!existingCart) return res.status(400).json({ message: 'Cart not found' });

        if(existingCart.cartItems.length > 0){
            restaurantDataPresent = existingCart.cartItems.some(cartItem => {
                return cartItem.restaurant.restaurantId.toString() === restaurantId.toString()
            });
        }

        if(!restaurantDataPresent) {
            return res.status(400).json({ message: 'Restaurant data not found in cart' });
        }

        existingCart.cartItems.forEach((cartDetail) => {
            cartDetail.restaurant.orderItem.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            const gst = itemTotal * 5 / 100;
            const restaurantCharge = cartDetail.restaurant.restaurantCharges;
            const gstOnPlatformFee = parseFloat((billDetails[2].amount * 18 / 100).toFixed(2));
            billDetails[0].amount = billDetails[0].amount + itemTotal;
            billDetails[3].amount = billDetails[3].amount + parseFloat((gst + restaurantCharge + gstOnPlatformFee).toFixed(2));
            });
        })

        if(billDetails[0].amount > deal.minOrderValue) {
            if(deal.discountType == 'PERCENT'){
                discountedPrice = billDetails[0].amount * deal.discountPercent / 100;
                if(deal.maxDiscount != 0 && discountedPrice >= deal.maxDiscount){
                    discountedPrice = deal.maxDiscount;
                }
                billDetails[4].amount = billDetails[4].amount +  parseFloat((discountedPrice).toFixed(2));
            } else {
                discountedPrice = deal.maxDiscount;
                billDetails[4].amount = billDetails[4].amount + parseFloat((discountedPrice).toFixed(2));
            }
        } else {
            return res.status(200).json({ 
                message: `Please add item value more than Rs.${deal.minOrderValue}`,
                dealApplied: false
            }); 
        }

        billDetails.forEach(billDetail => {
            if(billDetail.label == 'Item Discount'){
                totalAmount = totalAmount - billDetail.amount;
            } else {
                totalAmount = totalAmount + billDetail.amount;
            }
        });

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
        let totalAmount = 0;
        const { userId } = body;
        const billDetails = [
            { label: 'Item Total', amount: 0 },
            { label: 'Delivery Fee', amount: 30 },
            { label: 'Platform Fee', amount: 9 },
            { label: 'GST and Restaurant Charges', amount: 0 },
        ]
    
        const existingCart = await Cart.findOne({ userId: userId});
        if(!existingCart){
            return res.status(400).json({ message: 'Cart not found' });
        }

        existingCart.cartItems.forEach((cartDetail) => {
            cartDetail.restaurant.orderItem.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            const gst = itemTotal * 5 / 100;
            const restaurantCharge = cartDetail.restaurant.restaurantCharges;
            const gstOnPlatformFee = +(billDetails[2].amount * 18 / 100).toFixed(2);
            billDetails[0].amount = billDetails[0].amount + itemTotal;
            billDetails[3].amount = billDetails[3].amount + +(gst + restaurantCharge + gstOnPlatformFee).toFixed(2);
            });
        })
        billDetails.forEach(billDetail => {
            totalAmount = totalAmount + billDetail.amount;
        });

            
        if(existingCart.couponApplied){
            existingCart.couponApplied = null;
        }
        await existingCart.save();
    
        return res.status(200).json({
            message: 'Coupon successfully removed',
            payload: {...existingCart._doc, billDetails, totalAmount}
        });

    } catch(err) {
        console.log("Fetch cart failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}


module.exports = { getCartData, addToCart, removeFromCart, applyDealsToCart, removeDealsFromCart }