const { default: mongoose } = require("mongoose");
const Organization = require("../models/Organization");
const OrganizationAccess = require("../models/OrganizationAccess");
const { ValidationError, AppError } = require("../utils/error.util");
const { capitalizeWord } = require("../utils/string.util");
const ConstantsService = require("./constants.service");
const { isTaxSystemValid } = require("../utils/common.util");

const ORGANIZATION_NAME_LENGTH = 60; // 60 characters

const hasOrganizationAccess = async (organizationId, userId) => {
    if (!organizationId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    const exists = await OrganizationAccess.exists({
        userId,
        organizationId,
    }).lean();

    if (!exists) {
        throw new ValidationError("Organization access denied!");
    }
};

const upsertOrganization = async (
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
) => {
    if (!userId) {
        throw new AppError("User not provided");
    }

    if (!name) {
        throw new ValidationError("Provide a organization name.");
    }

    if (name.length > ORGANIZATION_NAME_LENGTH) {
        throw new ValidationError(
            `Max ${ORGANIZATION_NAME_LENGTH} characters allowed for the organization name.`,
        );
    }

    if (!street || !city || !state || !country) {
        throw new ValidationError(
            "Provide a valid street, city, state and country.",
        );
    }

    if (!ConstantsService.doesCountryExist(country)) {
        throw new ValidationError(
            "Onboarding is currently disabled for selected country.",
        );
    }

    // Tax config validations
    if (taxConfig && taxConfig.enabled) {
        const { system, identification } = taxConfig;

        if (!isTaxSystemValid(system)) {
            throw new ValidationError("Please select a supported tax system");
        }

        if (!identification) {
            throw new ValidationError("Tax Identification Number is required");
        }
    }

    name = capitalizeWord(name);
    street = (street || "").trim();
    street = capitalizeWord(street);

    if (organizationId) {
        await hasOrganizationAccess(organizationId, userId);
    }

    const org = await Organization.findOneAndUpdate(
        { _id: organizationId || new mongoose.Types.ObjectId() },
        {
            name,
            street,
            city,
            state,
            country,
            registrationNumber,
            taxConfig,
        },
        {
            upsert: true,
            returnDocument: true,
            setDefaultsOnInsert: true,
            projection: "_id",
            runValidators: true,
        },
    ).lean();

    // Insert the access for new creation
    if (!organizationId) {
        await new OrganizationAccess({
            userId,
            organizationId: org._id,
        }).save();
    }

    return org;
};

const getOrganization = async (organizationId, userId) => {
    if (!organizationId || !userId) {
        throw new ValidationError("Required arguments are missing");
    }

    await hasOrganizationAccess(organizationId, userId);

    return await Organization.findById(organizationId).lean();
};

const getOrganizationByUser = async (userId) => {
    if (!userId) {
        throw new ValidationError("User not provided!");
    }

    const accessList = await OrganizationAccess.find(
        { userId },
        {
            organizationId: 1,
        },
    ).lean();

    const organizations = await Organization.find(
        {
            _id: { $in: accessList.map((al) => al.organizationId) },
        },
        {
            _id: 1,
            name: 1,
        },
    ).lean();

    return organizations;
};

const OrganizationService = Object.freeze({
    upsertOrganization,
    getOrganization,
    getOrganizationByUser,
});

module.exports = OrganizationService;
