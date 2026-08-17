const ConstantsService = require("../services/constants.service");
const { SuccessResponse } = require("../utils/response.util");

module.exports = {
    getCountries: async (req, res) => {
        return SuccessResponse(res, {
            data: ConstantsService.getCountryList(),
        });
    },
    getStatesByCountry: async (req, res) => {
        return SuccessResponse(res, {
            data: ConstantsService.getStatesByCountry(req.query.country),
        });
    },
    getPropertyTypes: async (req, res) => {
        return SuccessResponse(res, {
            data: ConstantsService.getPropertyTypes(),
        });
    },
    getUnitTypes: async (req, res) => {
        return SuccessResponse(res, {
            data: ConstantsService.getUnitTypes(),
        });
    },
};
