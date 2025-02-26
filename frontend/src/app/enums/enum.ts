export enum PAYMENT_METHODS {
    GOOGLE_PAY = "GOOGLE_PAY",
    STRIPE = "STRIPE",
    POD = "POD",
    COD = "COD",
}


export enum ORDER_STATUS {
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    LIVE = 'LIVE',
};



export enum CANCEL_DATA {
    CANCEL_DATA_HEADING = "Your order has been cancelled.",
    CANCEL_DATA_CONTENT = "A refund will be initiated basis our cancellation policy, for further queries reach us out at Help & Support section."
}