const {
    getProperty,
    getProperties,
    addProperty,
    updateProperty,
    getPropertyCount,
    getMonthlyReport,
    addPropertyUnit,
    updatePropertyUnit,
    getPropertyUnit,
    getPropertyUnits,
    updatePropertyUnitStatus,
} = require("../controllers/property.controller");

const router = require("express").Router();

router.get("/", getProperty);
router.get("/unit", getPropertyUnit);
router.get("/count", getPropertyCount);
router.get("/all", getProperties);
router.get("/all/unit", getPropertyUnits);

router.get("/report/monthly", getMonthlyReport);

router.post("/", addProperty);
router.put("/", updateProperty);

router.post("/unit", addPropertyUnit);
router.put("/unit", updatePropertyUnit);
router.put("/unit/status", updatePropertyUnitStatus);

module.exports = router;
