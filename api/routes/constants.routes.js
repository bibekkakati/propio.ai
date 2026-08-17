const {
    getCountries,
    getStatesByCountry,
    getPropertyTypes,
    getUnitTypes,
} = require("../controllers/constants.controller");

const router = require("express").Router();

router.get("/countries", getCountries);
router.get("/states", getStatesByCountry);
router.get("/types/property", getPropertyTypes);
router.get("/types/unit", getUnitTypes);

module.exports = router;
