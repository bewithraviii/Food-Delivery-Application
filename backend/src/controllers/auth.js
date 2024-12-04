const authService = require('../services/auth/auth');

exports.login = async(req, res) => {
    try {
        const userCredentials = {
            email: req.body.email,
            password: req.body.password
        };
        const result = await authService.userLogin(userCredentials);
        res.status(200).json(result);
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}