const { default: mongoose } = require("mongoose");
const Property = require("../models/Property");
const PropertyAccess = require("../models/PropertyAccess");
const {
    isUserRoleValid,
    isPropertyTypeValid,
    isUnitTypeValid,
} = require("../utils/common.util");
const { ValidationError } = require("../utils/error.util");
const { capitalizeWord } = require("../utils/string.util");
const ConstantsService = require("./constants.service");
const PropertyUnit = require("../models/PropertyUnit");
const { UnitTypes } = require("../constants/enum");

const PROPERTY_NAME_LENGTH = 60; // 60 characters
const UNIT_NAME_LENGTH = 40; // 40 characters

const hasPropertyAccess = async (propertyId, userId) => {
    if (!propertyId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    const exists = await PropertyAccess.exists({
        userId: userId,
        propertyId: propertyId,
    }).lean();

    if (!exists) {
        throw new ValidationError("Property access denied!");
    }
};

const checkPropertyNameAvailability = async (name, userId) => {
    // Fetch all properties of the user
    const properties = await getPropertiesByUser(userId);

    // Check if name is duplicate
    const isNameDuplicate = properties.find(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
    if (isNameDuplicate) {
        throw new ValidationError(
            "Property name already used for one of your listings.",
        );
    }
};

const checkUnitNameAvailability = async (name, propertyId, userId) => {
    // Fetch all units of the property
    const units = await getUnitsByProperty(propertyId, userId);

    // Check if name is duplicate
    const isNameDuplicate = units.find(
        (u) => u.name.toLowerCase() === name.toLowerCase(),
    );
    if (isNameDuplicate) {
        throw new ValidationError("Unit name cannot be duplicate.");
    }
};

const upsertProperty = async (
    { organizationId, propertyId, name, city, state, country, role, type },
    userId,
) => {
    if (!userId) {
        throw new ValidationError("User not provided!");
    }

    if (!organizationId) {
        throw new ValidationError("Organization not provided!");
    }

    if (!name) {
        throw new ValidationError("Provide a property name.");
    }

    if (name.length > PROPERTY_NAME_LENGTH) {
        throw new ValidationError(
            `Max ${PROPERTY_NAME_LENGTH} characters allowed for the property name.`,
        );
    }

    if (!city || !state || !country) {
        throw new ValidationError("Provide a valid city, state and country.");
    }

    if (!ConstantsService.doesCountryExist(country)) {
        throw new ValidationError(
            "Onboarding is currently disabled for selected country.",
        );
    }

    if (!isPropertyTypeValid(type)) {
        throw new ValidationError("Property type is not valid.");
    }

    if (!isUserRoleValid(role)) {
        throw new ValidationError("User role is not valid.");
    }

    // Update validations
    if (propertyId) {
        await hasPropertyAccess(propertyId, userId);

        // Check if name is getting updated
        // If getting updated, check for availability
        const property = await Property.findById(propertyId, {
            name: 1,
        }).lean();
        if (property.name.toLowerCase() !== name.toLowerCase()) {
            await checkPropertyNameAvailability(name, userId);
        }
    }

    name = capitalizeWord(name);

    const property = await Property.findOneAndUpdate(
        { _id: propertyId || new mongoose.Types.ObjectId() },
        {
            $set: {
                organizationId,
                name,
                city,
                state,
                country,
                role,
                type,
            },
        },
        {
            upsert: true,
            returnDocument: true,
            setDefaultsOnInsert: true,
            projection: "_id",
            runValidators: true,
        },
    ).lean();

    // Steps after new property creation
    if (!propertyId) {
        // Add property access
        await new PropertyAccess({
            userId,
            propertyId: property._id,
            role,
        }).save();

        // Add a default unit
        await upsertPropertyUnit({
            propertyId: property._id,
            unitId: null,
            name: "Full Unit",
            type: UnitTypes[UnitTypes.length - 1],
        });
    }

    return property;
};

const getPropertyDetails = async (propertyId, userId) => {
    if (!propertyId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    await hasPropertyAccess(propertyId, userId);

    const property = await Property.findById(propertyId, {
        name: 1,
        city: 1,
        state: 1,
        country: 1,
        type: 1,
        isActive: 1,
    }).lean();

    return property;
};

const getPropertiesByUser = async (userId) => {
    if (!userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    const userProperties = await PropertyAccess.find(
        { userId: userId },
        { propertyId: 1, role: 1 },
    ).lean();

    if (!userProperties.length) {
        return [];
    }

    const propertyUserRoleMap = {};
    const propertyIds = [];

    userProperties.forEach((up) => {
        propertyIds.push(up.propertyId);
        propertyUserRoleMap[up.propertyId] = up.role;
    });

    const properties = await Property.find(
        {
            _id: { $in: propertyIds },
        },
        {
            name: 1,
            city: 1,
            state: 1,
            country: 1,
            type: 1,
            isActive: 1,
        },
    ).lean();

    properties.forEach((p) => {
        p.role = propertyUserRoleMap[p._id];
    });

    return properties;
};

const getPropertyCount = async (userId) => {
    if (!userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    const count = await PropertyAccess.countDocuments({
        userId: userId,
    }).lean();

    return count;
};

const togglePropertyStatus = async (propertyId, flag, userId) => {
    if (!propertyId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    await hasPropertyAccess(propertyId, userId);

    await Property.updateOne(
        { _id: propertyId },
        { $set: { isActive: Boolean(flag) } },
        { runValidators: true },
    ).lean();
};

const getUnitsByProperty = async (propertyId, userId) => {
    if (!userId || !propertyId) {
        throw new ValidationError("Required arguments are missing!");
    }

    await hasPropertyAccess(propertyId, userId);

    const units = await PropertyUnit.find(
        {
            propertyId,
        },
        {
            name: 1,
            type: 1,
            maxOccupancy: 1,
            ratePerNight: 1,
            isActive: 1,
        },
    ).lean();

    return units;
};

const getPropertyUnit = async (propertyId, unitId, userId) => {
    if (!userId || !unitId || !propertyId) {
        throw new ValidationError("Required arguments are missing!");
    }

    await hasPropertyAccess(propertyId, userId);

    const unit = await PropertyUnit.findOne({
        _id: unitId,
        propertyId,
    }).lean();

    return unit;
};

const upsertPropertyUnit = async (
    { propertyId, unitId, name, type, maxOccupancy, ratePerNight, note },
    userId,
) => {
    if (!userId) {
        throw new ValidationError("User not provided!");
    }

    if (!propertyId) {
        throw new ValidationError("Property not provided!");
    }

    if (!name) {
        throw new ValidationError("Provide a unit name.");
    }

    if (!isUnitTypeValid(type)) {
        throw new ValidationError("Select a valid unit type.");
    }

    if (name.length > UNIT_NAME_LENGTH) {
        throw new ValidationError(
            `Max ${UNIT_NAME_LENGTH} characters allowed for the unit name.`,
        );
    }

    maxOccupancy = Number(maxOccupancy || 0);
    ratePerNight = Number(ratePerNight || 0);

    await hasPropertyAccess(propertyId, userId);

    // Update validations
    if (unitId) {
        // Check if name is getting updated
        // If getting updated, check for availability
        const unit = await PropertyUnit.findOne(
            { _id: unitId, propertyId },
            {
                name: 1,
            },
        ).lean();

        if (!unit) {
            throw new ValidationError("Unit not found!");
        }

        if (unit.name.toLowerCase() !== name.toLowerCase()) {
            await checkUnitNameAvailability(name, propertyId, userId);
        }
    }

    name = capitalizeWord(name);

    const unit = await PropertyUnit.findOneAndUpdate(
        { _id: unitId || new mongoose.Types.ObjectId() },
        {
            $set: {
                propertyId,
                name,
                type,
                maxOccupancy: maxOccupancy || null,
                ratePerNight: ratePerNight || null,
                note,
            },
        },
        {
            upsert: true,
            returnDocument: true,
            setDefaultsOnInsert: true,
            projection: "_id",
            runValidators: true,
        },
    ).lean();

    return unit;
};

const togglePropertyUnitStatus = async (unitId, propertyId, flag, userId) => {
    if (!unitId || !propertyId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    await hasPropertyAccess(propertyId, userId);

    await PropertyUnit.updateOne(
        { _id: unitId, propertyId },
        { $set: { isActive: Boolean(flag) } },
        { runValidators: true },
    ).lean();
};

const PropertyService = {
    hasPropertyAccess,
    upsertProperty,
    getPropertyDetails,
    getPropertiesByUser,
    getPropertyCount,
    togglePropertyStatus,
    getUnitsByProperty,
    getPropertyUnit,
    upsertPropertyUnit,
    togglePropertyUnitStatus,
};

module.exports = PropertyService;
