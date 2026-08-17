const UserService = require("../services/user.service");
const { SuccessResponse } = require("../utils/response.util");

module.exports = {
    getUserProfile: async (req, res) => {
        const { userId } = req.user;

        const user = await UserService.fetchCustomerByID(userId);

        return SuccessResponse(res, {
            data: user,
        });
    },
};
