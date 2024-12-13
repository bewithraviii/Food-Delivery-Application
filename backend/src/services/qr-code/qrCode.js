const QRCode = require('qrcode');
const jwt = require('../../utils/jwt/jwt-creation');
const QR = require('../../models/qrModel');
const speakeasy = require('speakeasy');

const generateQRCode = async (data, res) => {
    try {
        if (!data) {
            return res.status(400).json({ message: 'Data required to generate QR code' });
        }

        const restaurantsEmail = data.email;
        const ownerPhoneNumber = data.phoneNumber;

        const qrDatabaseData = await QR.findOne({ restaurantsEmail, ownerPhoneNumber });
        if(qrDatabaseData){
            await QR.deleteOne({ _id: qrDatabaseData._id });
        }

        const qrData = speakeasy.generateSecret({
            name: `FOOD: Food Delivery App (${data.email})`,
            issuer: 'FOOD',
        });

        const qrSecret = qrData.base32;
        
        const newQR = new QR({ restaurantsEmail, ownerPhoneNumber, qrSecret });
        await newQR.save();

        const qrCode = await QRCode.toDataURL(qrData.otpauth_url);

        res.status(200).json({ qrCode, secret: qrSecret });
    } catch (error) {
        console.error('QR Code generation failed:', error);
        res.status(500).json({ message: 'Failed to generate QR code', error: error.message });
    }
};

const verifyOTP = async (data, res) => {
    if (!data) {
        return res.status(400).json({ message: 'QR OTP or Secret is required' });
    }
    try {
        const otp = data.otp;
        const restaurantsEmail = data.email;
        const ownerPhoneNumber = data.phoneNumber;
        // const secret = data.secret;

        const qrData = await QR.findOne({ restaurantsEmail: restaurantsEmail, ownerPhoneNumber: ownerPhoneNumber });
        if(!qrData){
            return res.status(400).json({ message: 'QR secret not found' });
        }

        const secret = qrData.qrSecret;
        
        const isVerified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: otp,
            window: 1
        });
        
        if (isVerified) {
            await QR.deleteOne({ _id: qrData._id });
            return res.status(200).json({ message: 'QR OTP Verified Successfully', verified: true });
        } else {
            return res.status(400).json({ message: 'Invalid QR OTP' });
        }
    } catch (error) {
        console.error('OTP verification failed:', error);
        return res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
    }
};

module.exports = { generateQRCode, verifyOTP }