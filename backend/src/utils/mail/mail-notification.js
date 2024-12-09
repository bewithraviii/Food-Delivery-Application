const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendMail = async(email, subject, content) => {

    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_ID || 'tatvapca159@gmail.com',
            pass: process.env.MAIL_CRED || '',
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    const mailOptions = {
        from: 'FoodDeliveryApplication.com',
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