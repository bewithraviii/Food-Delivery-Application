const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendMail = async(email, subject, content) => {

    const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_ID || 'tatvapca159@gmail.com',
            pass: process.env.MAIL_CRED || '',
        },
        tls: {
            ciphers: 'SSLv3', // Explicitly specify TLS configuration
        },
        logger: true,  // Enable logs for debugging
        debug: true,   // Show connection debug info
    });

    const mailOptions = {
        from: 'tatvapca159@gmail.com',
        to: email,
        subject: subject,
        text: content,
    };
      
    try{
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending mail:', error);
        throw new Error('Email sending failed');
    }
}

module.exports = sendMail;