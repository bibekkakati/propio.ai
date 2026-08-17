const {
    getEarningDetails,
    getEarningsByProperty,
    addEarning,
    updateEarning,
    deleteEarning,
} = require("../controllers/earning.controller");

const router = require("express").Router();

router.get("/", getEarningDetails);
router.get("/all", getEarningsByProperty);
router.post("/", addEarning);
router.put("/", updateEarning);
router.delete("/", deleteEarning);

module.exports = router;
