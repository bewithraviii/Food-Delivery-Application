const JWT = require('jsonwebtoken');
const Order = require('../../models/orderModel');
const Cart = require('../../models/cartModel');
const cartStatus = require('../../utils/enums/cartStatus');
const OrderStatus = require('../../utils/enums/status');
const socketModule = require('../socket/socket');

const addNewOrder = async(body, res) => {
    if(!body) return res.status(400).json({ message: 'checkout order data is required.' });

    try{   

        const cartData = await Cart.findOne({ _id: body.cartData._id});
        if(!cartData) return res.status(400).json({ message: 'cart not found, Please try again later.' });

        const restaurantId = body.cartData.cartItems[0].restaurant.restaurantId;
        if(!restaurantId) return res.status(400).json({ message: 'restaurant id not found, Please try again later.' });
                 

        const newOrder = new Order();
        newOrder.userId = body.userId;
        newOrder.userAddress = body.userAddress;
        newOrder.cartData = body.cartData;
        newOrder.cookingInstructions = body.cookingInstructions || null;
        newOrder.totalPrice = body.totalPrice;
        newOrder.paymentMethod = body.paymentMethod;
        newOrder.paymentId = body.paymentId;
        newOrder.restaurantId = restaurantId;

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

        switch(body.updateOrderStatusTo) {
            case OrderStatus.PROCESSING:
                orderData.status = OrderStatus.PROCESSING;
              break;
            case OrderStatus.CANCELLED:
                orderData.status = OrderStatus.CANCELLED;
                orderData.cancelReason = body.selectedCancelReason;
              break;
            case OrderStatus.OUT_FOR_DELIVERY:
                orderData.status = OrderStatus.OUT_FOR_DELIVERY;
              break;
            case OrderStatus.COMPLETED:
                orderData.status = OrderStatus.COMPLETED;
              break;
            default:
                orderData.status = OrderStatus.CONFIRMED;
          }

        // if(body.updateOrderStatusTo == OrderStatus.PROCESSING){
        //     orderData.status = OrderStatus.PROCESSING;
        // } else if (body.updateOrderStatusTo == OrderStatus.CANCELLED){
        //     orderData.status = OrderStatus.CANCELLED;
        //     orderData.cancelReason = body.selectedCancelReason;
        // } else if (body.updateOrderStatusTo == OrderStatus.COMPLETED){
        //     orderData.status = OrderStatus.COMPLETED;
        // } else if (body.updateOrderStatusTo == OrderStatus.OUT_FOR_DELIVERY) {
        //     orderData.status = OrderStatus.OUT_FOR_DELIVERY;
        // }

        const updatedOrder = await orderData.save();
        
        if(updatedOrder.status == OrderStatus.CONFIRMED){
            const socketPayload =  await processSocketPayload(updatedOrder);
            socketModule.getIO().emit(`newOrderNotification_${updatedOrder.restaurantId}`, {
                ...socketPayload
            });
        }
        

        return res.status(200).json({
            message: 'Order detail updated successfully',
            payload: { updated: true, userId: updatedOrder.userId, status: updatedOrder.status }
        });

    } catch(error) {
        console.error('Error updating order details:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const fetchOrderDetails = async(req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        const JWT_SECRET = 'FoodDeliveryApp';
        const decoded = JWT.verify(token, JWT_SECRET);
        
        const userId = decoded.id;
        if (!userId) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const orderData = await Order.find({ 
            userId: userId,
        });
        if(!orderData || orderData.length == 0){
            return res.status(404).json({ message: 'Order not found' });
        }
        
        let orderDetails = [];
        orderData.forEach(order => {
            orderDetails.push({
                _id: order._id,
                status: order.status,
                userId: order.userId,
                paymentMethod: order.paymentMethod,
                totalPrice: order.totalPrice,
                createdDate: order.createdAt,
                updatedDate: order.updatedAt,
                cartData: order.cartData.cartItems[0].restaurant,
            });
        });

        return res.status(200).json({
            message: 'Order details fetched successfully',
            payload: orderDetails
        });


    } catch(error){
        console.error('Error fetching order details:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: error.message });
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


module.exports = { addNewOrder, getOrderDetailsById, updateOrderStatus, fetchOrderDetails };