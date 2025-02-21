const Order = require('../../models/orderModel');
const Cart = require('../../models/cartModel');
const cartStatus = require('../../utils/enums/cartStatus');
const OrderStatus = require('../../utils/enums/status');

const addNewOrder = async(body, res) => {
    if(!body) return res.status(400).json({ message: 'checkout order data is required.' });

    try{   

        const cartData = await Cart.findOne({ _id: body.cartData._id});
        if(!cartData) return res.status(400).json({ message: 'cart not found, Please try again later.' });

        const newOrder = new Order();
        newOrder.userId = body.userId;
        newOrder.cartData = body.cartData;
        newOrder.cookingInstructions = body.cookingInstructions || null;
        newOrder.totalPrice = body.totalPrice;
        newOrder.paymentMethod = body.paymentMethod;
        newOrder.paymentId = body.paymentId;

        const newAddedOrder = await newOrder.save();
        if(newAddedOrder){
            cartData.status = cartStatus.CartStatus.PROCESSED;
            await cartData.save();
        }
        
        return res.status(200).json({ 
            message: 'Order added successfully',
            payload: newAddedOrder 
        });

    } catch(err) {
        console.log("Add new order failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const getOrderDetailsById = async(req, res) => {
    const id = req.params.id;
    if(!id){
        return res.status(404).json({ message: 'Order id not found, Please provide order Id.' });
    }
    
    try {
        const orderData = await Order.findOne({
            _id: id
        });
        if(!orderData){
            return res.status(404).json({ message: 'order not found' });
        }

        return res.status(200).json({
            message: 'Order detail fetched successfully',
            payload: orderData
        });

    } catch(error) {
        console.error('Error fetching order details:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const updateOrderStatus = async(body, res) => {
    if(!body){
        return res.status(404).json({ message: 'Order data not found, Please provide try again.' });
    }

    try {
        const orderData = await Order.findOne({ _id: body.orderId, userId: body.userId });
        if(!orderData){
            return res.status(404).json({ message: 'order not found' });
        }

        orderData.status = OrderStatus.PROCESSING;
        const updatedOrder = await orderData.save();

        return res.status(200).json({
            message: 'Order detail updated successfully',
            payload: updatedOrder
        });

    } catch(error) {
        console.error('Error updating order details:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}


module.exports = { addNewOrder, getOrderDetailsById, updateOrderStatus };