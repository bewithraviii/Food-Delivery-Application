const sendMailService = require('../../utils/mail/mail-notification');
const OTP = require('../../models/otpModel');


const sendOtpMail = async(data, res) => {
    if(!data){
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        let OTP = generateOTP();   
        const email = data.email;
        const subject = 'Your OTP Code';
        const content = `Your OTP is  ${OTP}  . It will expire in 30 seconds.`;
        const otpExists = await findOTPWithMail(email);
        console.log(otpExists);
        if(otpExists){
            otpExists.otp = OTP;
            await otpExists.save();
        }
        else {
            const isSave = await saveOTP(email, OTP);
            if(!isSave){
                res.status(500).json({ message: 'Something went wrong while saving OTP', error: err.message });
            }
        }
    
        // Send Mail Logic
        await sendMailService(email, subject, content);
        res.status(201).json({ message: 'OTP sent to user email', otp: true });
    } catch(err){
        console.log("Something went wrong during OTP generation, Please try again.", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const verifyOtpMail = async(data, res) => {
    if(!data){
        return res.status(400).json({ message: 'OTP is required' });
    }

    try {
        const email = data.email;
        const otp = data.otp;
    
        const record = await findOTP(email, otp);
         if (!record || record == null) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    
        await OTP.deleteOne({ _id: record._id });
        res.status(200).json({ message: 'OTP verified successfully', verified: true });
    
    } catch(err){
        console.log("Something went wrong during OTP verification, Please try again.", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function saveOTP(email, otp) {
    try {
        const newOTP = new OTP({ email, otp });
        await newOTP.save();
        return true;
    } catch(error){
        console.log(error.message);
        return false;
    }
}

async function findOTP(email, otp){
    let response = null;
    try{
        const otpData = await OTP.findOne({ email, otp });
        if(!otpData){
            response = null;
            return response;
        }
        response = otpData;
        return response;
    } catch(error) {
        console.log(error);
        response = null
        return response;
    }
}

async function findOTPWithMail(email){
    let response = null;
    try{
        const otpData = await OTP.findOne({ email });
        if(!otpData){
            response = null;
            return response;
        }
        response = otpData;
        return response;
    } catch(error) {
        console.log(error);
        response = null;
        return response;
    }
}

const generateOTP = (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
}


module.exports = { sendOtpMail, verifyOtpMail }