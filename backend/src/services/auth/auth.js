const jwt = require('../../utils/jwt/jwt-creation');
const bcrypt = require('bcryptjs');
const User = require('../../models/userModel');

const userLogin = async (data) => {
    if(!data) {
        throw new Error('User credentials is required');
    }
    const response = { token: '' };
    // const user = await User.findOne({ email : data.email });
    // if (!user) throw new Error('Invalid username or password');
  
    // const isMatch = await comparePassword(data.password, user.password);
    // if (!isMatch) throw new Error('Invalid username or password');

    const user = {
        _id: "2135431321"
    }
    const token = jwt.generateToken(user._id);
    if(!token) throw new Error('something went wrong while creating token');

    response.token = token;
    return response;

}


const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};
  
const comparePassword = async (enteredPassword, storedPassword) => {
    return await bcrypt.compare(enteredPassword, storedPassword);
};

module.exports = { userLogin }