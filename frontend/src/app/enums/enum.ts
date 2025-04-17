export enum PAYMENT_METHODS {
    GOOGLE_PAY = "GOOGLE_PAY",
    STRIPE = "STRIPE",
    POD = "POD",
    COD = "COD",
}

export enum GREETINGS {
    GOOD_MORNING = "Good Morning",
    GOOD_AFTERNOON = "Good Afternoon",
    GOOD_EVENING = "Good Evening",
    WELCOME = "Welcome"
}


export enum ORDER_STATUS {
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    LIVE = 'LIVE',
    REJECTED = 'REJECTED',
};



export enum CANCEL_DATA {
    CANCEL_DATA_HEADING = "Your order has been cancelled.",
    CANCEL_DATA_CONTENT = "A refund will be initiated basis our cancellation policy, for further queries reach us out at Help & Support section.",
}

export enum HELP_SUPPORT {
    HELP_SUPPORT_HEADING = "Need help with your order?",
    HELP_SUPPORT_CONTENT = "Get help & Support",
    HELP_SUPPORT_DESCRIPTION = "We are here to help you. Call us at ",
    HELP_SUPPORT_NUMBER = "07334440007",
}

export enum ARRIVAL_UPDATES {
    ARRIVAL_ON_TIME = "On Time",
    ARRIVAL_DELAYED = "Delayed"
}

export enum ORDER_STEPS {
    ORDER_CONFIRMED = 'CONFIRMED',
    COOKING_IN_PROGRESS = 'COOKING IN PROGRESS',
    OUT_FOR_DELIVERY = 'OUT FOR DELIVERY',
    ORDER_DELIVERED = 'DELIVERED',
    ORDER_PENDING = 'PENDING',
}

export enum CANCEL_REASONS {
    CHANGING_MIND = 'Changing my mind',
    PROMISED_DELIVERY_PRICE_TOO_HIGH = 'Promised delivery price too high',
    FORGOT_TO_APPLY_COUPON = 'Forgot to apply coupon',
    ORDERED_WRONG_ITEMS_MORE_ITEMS = 'Ordered wrong items / more items'
}
