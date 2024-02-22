const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide name"],
        trim: true,
        minLength: 3,
        maxLength: 50,
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
        ],
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
    },
});

UserSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); // 'this' refer to the current object (document)
});

UserSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, userName: this.name },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isPasswordCorrect = await bcrypt.compare(
        candidatePassword,
        this.password
    );
    return isPasswordCorrect;
};

module.exports = mongoose.model("User", UserSchema);
