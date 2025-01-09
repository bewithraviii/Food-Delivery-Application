const Cart = require('../../models/cartModel');
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
        return res.status(200).json({
            message: 'Cart fetched successfully',
            payload: existingCart
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
        const userId = data.userId;
        const existingCart = await Cart.findOne({ userId: userId});
        if(!existingCart || existingCart == null){
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
                    console.log("existingCartItem", existingCartItem.restaurant.orderItem);
                    cartItem.restaurant.orderItem.forEach(newOrderItem => {
                        console.log("newOrderItem", newOrderItem);
                        const existingOrderItem = existingCartItem.restaurant.orderItem.find(item => item.itemId === newOrderItem.itemId);
                        if(existingOrderItem) {
                            existingOrderItem.quantity += newOrderItem.quantity;
                        } else {
                            existingCartItem.restaurant.orderItem.push(newOrderItem);
                        }
                    });
                } else {
                    existingCart.cartItems.push(cartItem);
                }
            });  
        }
        await existingCart.save();
        return res.status(200).json({ message: 'Cart updated successfully', payload: existingCart });

    } catch(err) {
        console.log("Add to cart failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const updateCart = async (data, res) => {
    if (!data || !data.userId) {
        return res.status(400).json({ message: 'User id and cart data are required' });
    }

    try {
        // Fetch the existing cart for the user
        const existingCart = await Cart.findOne({ userId: data.userId });

        if (!existingCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Handle case 1: Update quantity of an existing orderItem
        if (data.cartItems) {
            data.cartItems.forEach(cartItem => {
                // Check if this cartItem exists in the existing cart
                const existingCartItem = existingCart.cartItems.find(item => item.restaurant.restaurantId.toString() === cartItem.restaurant.restaurantId.toString());

                if (existingCartItem) {
                    cartItem.orderItem.forEach(newOrderItem => {
                        const existingOrderItem = existingCartItem.orderItem.find(item => item.itemId === newOrderItem.itemId);

                        if (existingOrderItem) {
                            // If the orderItem already exists, increment the quantity
                            existingOrderItem.quantity += newOrderItem.quantity;
                        } else {
                            // If the orderItem does not exist, add it
                            existingCartItem.orderItem.push(newOrderItem);
                        }
                    });

                    // Remove orderItems that are no longer in the new data (cleanup)
                    existingCartItem.orderItem = existingCartItem.orderItem.filter(orderItem => 
                        cartItem.orderItem.some(newItem => newItem.itemId === orderItem.itemId)
                    );
                } else {
                    // If no matching cartItem found, add the new cartItem with the new orderItems
                    existingCart.cartItems.push(cartItem);
                }
            });
        }

        // Handle case 2: Add or remove entire cartItems (restaurant level)
        if (data.addCartItems) {
            data.addCartItems.forEach(newCartItem => {
                const existingCartItem = existingCart.cartItems.find(item => item.restaurant.restaurantId.toString() === newCartItem.restaurant.restaurantId.toString());
                
                if (!existingCartItem) {
                    // Add new cartItem if it doesn't exist
                    existingCart.cartItems.push(newCartItem);
                }
            });
        }

        if (data.removeCartItems) {
            existingCart.cartItems = existingCart.cartItems.filter(item => 
                !data.removeCartItems.includes(item.restaurant.restaurantId.toString())
            );
        }

        // Save the updated cart
        await existingCart.save();

        return res.status(200).json({
            message: 'Cart updated successfully',
            payload: existingCart
        });
        
    } catch (err) {
        console.log("Cart update failed due to: ", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
// {
//     "userId": "USER_ID",
//     "cartItems": [
//       {
//         "restaurant": {
//           "restaurantId": "RESTAURANT_ID",
//           "name": "Restaurant Name",
//           "address": "Restaurant Address",
//           "restaurantCharges": 50
//         },
//         "orderItem": [
//           {
//             "itemId": "ITEM_ID_1",
//             "name": "Item 1",
//             "price": 10,
//             "quantity": 2
//           }
//         ]
//       }
//     ],
//     "addCartItems": [
//       {
//         "restaurant": {
//           "restaurantId": "NEW_RESTAURANT_ID",
//           "name": "New Restaurant",
//           "address": "New Address",
//           "restaurantCharges": 100
//         },
//         "orderItem": [
//           {
//             "itemId": "NEW_ITEM_ID",
//             "name": "New Item",
//             "price": 20,
//             "quantity": 1
//           }
//         ]
//       }
//     ],
//     "removeCartItems": ["RESTAURANT_ID_TO_REMOVE"]
// }
  
  


module.exports = { getCartData, addToCart, updateCart }