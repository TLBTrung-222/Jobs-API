const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { UnauthenticatedError, BadRequestError } = require("../errors");

const register = async (req, res) => {
    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError("Please provide email and password");
    }
    const user = await User.findOne({ email });
    console.log(`User logged in with email and password: \n${user}`);
    // compare password
    const isPasswordCorrect = await user.comparePassword(password);
    if (user && isPasswordCorrect) {
        const token = user.createJWT();
        res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
    } else {
        throw new UnauthenticatedError("Invalid Credentials");
    }
};

module.exports = {
    login,
    register,
};
