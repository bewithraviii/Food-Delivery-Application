const CartEnums = require('../enums/cartStatus');


const billCalculation = async(cartItems) => {
    
    try{

        const defaultPlatformFee = process.env.PLATFORM_FEE_APPLICABLE === 'true';
        const defaultPlatformFeeGST = process.env.PLATFORM_FEE_APPLICABLE_GST === 'true';

        let GST = CartEnums.CartPaymentValues.GST;
        let DELIVERY_FEE = CartEnums.CartPaymentValues.DELIVERY_FEE;
        const ITEM_TOTAL = CartEnums.CartPaymentValues.ITEM_TOTAL;
        const PLATFORM_FEE = defaultPlatformFee ? CartEnums.CartPaymentValues.PLATFORM_FEE : CartEnums.CartPaymentValues.REVISED_PLATFORM_FEE;
        const DEFAULT_CHARGES = CartEnums.CartPaymentValues.DEFAULT_CHARGES;
        const PLATFORM_FEE_GST = defaultPlatformFeeGST ? CartEnums.CartPaymentValues.PLATFORM_FEE_GST : CartEnums.CartPaymentValues.REVISED_PLATFORM_FEE_GST;

        if(cartItems.length > 0){
            const billDetails = [
                { label: 'Item Total', amount: ITEM_TOTAL },
                { label: 'Delivery Fee', amount: DELIVERY_FEE },
                { label: 'Platform Fee', amount: PLATFORM_FEE },
                { label: 'GST and Restaurant Charges', amount: DEFAULT_CHARGES },
            ]
            let totalAmount = CartEnums.CartPaymentValues.TOTAL_CART_AMOUNT;
        
            cartItems.forEach((cartDetail) => {
    
                GST = cartDetail.restaurant.gstApplicable ? GST : CartEnums.CartPaymentValues.REVISED_GST;
                DELIVERY_FEE = cartDetail.restaurant.deliveryFeeApplicable ? DELIVERY_FEE : CartEnums.CartPaymentValues.REVISED_DELIVERY_FEE;

                cartDetail.restaurant.orderItem.forEach((item) => {
                const itemTotal = item.price * item.quantity;
                const gst = itemTotal * GST / 100;
                const restaurantCharge = cartDetail.restaurant.restaurantCharges;
                const gstOnPlatformFee = +(billDetails[2].amount * PLATFORM_FEE_GST / 100).toFixed(2);
                billDetails[0].amount = billDetails[0].amount + itemTotal;
                billDetails[3].amount = billDetails[3].amount + +(gst + restaurantCharge + gstOnPlatformFee).toFixed(2);
                });

            })
            billDetails.forEach(billDetail => {
                totalAmount = +(totalAmount + billDetail.amount).toFixed(2);
            });
        
            return { billDetails, totalAmount };
        } else {
            return null;
        }
    } catch(error){
        console.error("Error calculating bill:", error);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
    
}


module.exports = billCalculation;