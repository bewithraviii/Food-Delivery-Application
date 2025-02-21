


export interface loginRequest {
    email: string;
    phoneNumber: string;
}

export interface vendorLoginRequest {
    email: string;
    phoneNumber: string;
}

export interface otpSendRequest {
    email: string;
}

export interface otpVerifyRequest {
    email: string;
    otp: string;
}

export interface qrOtpVerifyRequest {
    secret?:string;
    email: string;
    phoneNumber: string;
    otp: string;
}

export interface userSignUpReqForm {
    name: string,
    email:string,
    phoneNumber: string,
    address: string
}

export interface updateUserProfileRequest {
    userId: string,
    name: string,
    email:string,
    phoneNumber: string | number,
}

export interface addNewAddressRequest {
    userId: string,
    title: string,
    detail: string,
}

export interface editAddressRequest {
    userId: string,
    addressId: string,
    title: string,
    detail: string,
}

export interface deleteAddressRequest {
    userId: string,
    addressId: string,
}

export interface vendorSignUpReqForm {
    name: String,
    profileImage: any,
    description?: String,
    address: String,
    email: String,
    cuisineType: [cuisineType],
    menu?: [],
    website: String,
    FSSAILicense?: String,
    tradeLicense?: String,
    restaurantLicense?: String,
    gstNo?: String,
    owner: {
        name: String,
        email: String,
        phoneNo: String,
        address: String,
        bankDetails: String,
        panCardNo: String,
        aadharCardNo: String,
    },
    acceptTermsAndRegulations: Boolean,
}

export interface cuisineType {
    categoryName: string
}

export interface addToCartReqForm {
    userId: string,
    cartItems: [
        {
            restaurant: {
            restaurantId: string | undefined,
            name: string | undefined,
            address: string | undefined,
            restaurantCharges: number | undefined,
            deliveryFeeApplicable: boolean | undefined,
            gstApplicable: boolean | undefined,
            orderItem: [
                {
                    itemId: number,
                    name: string,
                    price: number,
                    quantity: number,
                }
            ]
            },
        }
    ]
}

export interface applyCouponReqForm {
    restaurantId: string | undefined,
    cartId: string,
    dealId: string
}

export interface removeCouponReqForm {
    userId: string
}

export interface addToFavorite {
    restaurantId: string,
    userId: string,
}










export interface cartDataModel {
    restaurant: {
        deliveryFeeApplicable?: boolean;
        gstApplicable?: boolean;
        address: string;
        name?: string;
        restaurantCharges?: number;
        restaurantId?: string;
        restaurantImage?: string;
        orderItem?: OrderItem[];
    },
    _id?: string
}
interface OrderItem {
    itemId?: number;
    name?: string;
    price?: number;
    quantity?: number;
    _id?: string;
    itemImage?: string;
}

interface OrderDataModal {
    userId: string,
    cartData: any,
    totalPrice: number,
    cookingInstructions: string,
    paymentMethod: string,
    paymentId: string
}

interface UpdateOrderModal {
    userId: string,
    orderId: string
}