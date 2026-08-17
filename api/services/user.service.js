const User = require("../models/User");

const createUser = async (name, email, { emailVerified }) => {
    const user = await new User({
        name,
        email,
        isActive: true,
        emailVerified: Boolean(emailVerified),
    }).save();

    return user;
};

const fetchCustomerByEmail = async (email, projection = {}) => {
    return await User.findOne({ email }, projection).lean();
};

const fetchCustomerByID = async (userId, projection = {}) => {
    return await User.findById(userId, projection).lean();
};

const UserService = {
    createUser,
    fetchCustomerByEmail,
    fetchCustomerByID,
};

module.exports = UserService;
