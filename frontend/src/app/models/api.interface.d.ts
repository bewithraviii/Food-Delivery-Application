


export interface loginRequest {
    email: string;
    password: string;
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