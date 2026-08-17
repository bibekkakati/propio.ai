const { TaxSystems, PropertyTypes, UnitTypes } = require("../constants/enum");
const { CountryStates, Countries } = require("../constants/locations");

const getStatesByCountry = (country) => {
    return CountryStates[country];
};

const getCountryList = () => {
    return Countries;
};

const doesCountryExist = (country) => {
    return CountryStates.hasOwnProperty(country);
};

const getSupportedTaxSystem = () => {
    return Object.values(TaxSystems);
};

const getPropertyTypes = () => {
    return PropertyTypes;
};

const getUnitTypes = () => {
    return UnitTypes;
};

const ConstantsService = {
    getStatesByCountry,
    getCountryList,
    doesCountryExist,
    getSupportedTaxSystem,
    getPropertyTypes,
    getUnitTypes,
};

module.exports = ConstantsService;
