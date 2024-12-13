


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



export interface vendorSignUpReqForm {
    name: String,
    description?: String,
    address: String,
    email: String,
    cuisineType: String,
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
    acceptTermsAndRegulations: Boolean
}