const OrganizationService = require("../services/organization.service");
const { ValidationError } = require("../utils/error.util");
const { SuccessResponse } = require("../utils/response.util");

module.exports = {
    getOrganizations: async (req, res) => {
        const { userId } = req.user;

        const organizations =
            await OrganizationService.getOrganizationByUser(userId);

        return SuccessResponse(res, {
            data: organizations,
        });
    },
    getOrganization: async (req, res) => {
        const { userId } = req.user;
        let { oid: organizationId } = req.query;

        if (!organizationId) {
            throw new NotFoundError("Organization not found!");
        }

        const organization = await OrganizationService.getOrganization(
            organizationId,
            userId,
        );

        return SuccessResponse(res, {
            data: organization,
        });
    },
    addOrganization: async (req, res) => {
        const { userId } = req.user;
        const { name, street, city, state, country } = req.body;

        const org = await OrganizationService.upsertOrganization(
            {
                organizationId: null,
                name,
                street,
                city,
                state,
                country,
                registrationNumber: null,
                taxConfig: null,
            },
            userId,
        );

        return SuccessResponse(res, {
            data: org,
            message: "Organization created successfully",
        });
    },
    updateOrganization: async (req, res) => {
        const { userId } = req.user;
        const {
            organizationId,
            name,
            street,
            city,
            state,
            country,
            registrationNumber,
            taxConfig,
        } = req.body;

        if (!organizationId) {
            throw new ValidationError("Organization not found!");
        }

        const org = await OrganizationService.upsertOrganization(
            {
                organizationId,
                name,
                street,
                city,
                state,
                country,
                registrationNumber,
                taxConfig,
            },
            userId,
        );

        return SuccessResponse(res, {
            data: org,
            message: "Organization details updated",
        });
    },
};
