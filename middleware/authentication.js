const User = require("../models/User");
const { UnauthenticatedError } = require("../errors");
const jwt = require("jsonwebtoken");

const authorizedMiddleware = async (req, res, next) => {
    console.log("Access job route, verifing token...");
    console.log("---------------------------------------------");
    // if user already logged in, verify the token user sent
    const { authorization: authHeader } = req.headers; // "Bearer token"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthenticatedError("Authentication invalid");
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // attach user's infors into req object (so our controller can access it directly
        // without the need of decode the token again)
        req.user = await User.findById(decoded.userId).select("-password"); //we don't want to wrap the password;
        // req.user = { userId: decoded.userId, userName: decoded.userName };
        console.log(
            `Verifing sucess, user's information decoded: ${JSON.stringify(
                decoded,
                null,
                2
            )}`
        );
        console.log(
            "------------------------------------------------------------"
        );
        console.log(
            `User infor we will pass to next middleware (get from db): ${req.user}`
        );
        console.log(
            "------------------------------------------------------------"
        );
        next();
    } catch (error) {
        throw new UnauthenticatedError("Invalid credentials");
    }
};

module.exports = authorizedMiddleware;
