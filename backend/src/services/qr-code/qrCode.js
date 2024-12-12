const QRCode = require('qrcode');
const jwt = require('../../utils/jwt/jwt-creation');

const generateQRCode = async (data, res) => {
    try {
        if (!data) {
            return res.status(400).json({ message: 'Data required to generate QR code' });
        }

        // Create a unique payload for the QR code (can be user/vendor-specific)
        const payload = { email: data.email, phoneNo: data.phoneNumber };
        const qrData = jwt.generateToken(payload); // Secure the payload
        // const qrData = JSON.stringify(payload);
        const qrCode = await QRCode.toDataURL(qrData); // Generate a QR code image as Base64

        res.status(200).json({ qrCode, qrData });
    } catch (error) {
        console.error('QR Code generation failed:', error);
        res.status(500).json({ message: 'Failed to generate QR code', error: error.message });
    }
};

module.exports = { generateQRCode }