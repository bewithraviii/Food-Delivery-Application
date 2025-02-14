const CartStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
};

const CartPaymentValues = Object.freeze({
    GST: 5,
    PLATFORM_FEE: 9,
    PLATFORM_FEE_GST: 18,
    DELIVERY_FEE: 30,
    ITEM_TOTAL: 0,
    TOTAL_CART_AMOUNT: 0,
    DISCOUNTED_PRICE_AMOUNT: 0,
    DEFAULT_CHARGES: 0,
    REVISED_GST: 0,
    REVISED_DELIVERY_FEE: 0,
    REVISED_PLATFORM_FEE: 0,
    REVISED_PLATFORM_FEE_GST: 0,
    HUNDRED: 100
});


module.exports = { CartStatus, CartPaymentValues };