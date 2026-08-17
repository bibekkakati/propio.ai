const {
    getOrganization,
    getOrganizations,
    addOrganization,
    updateOrganization,
} = require("../controllers/organization.controller");

const router = require("express").Router();

router.get("/", getOrganization);
router.get("/all", getOrganizations);
router.post("/", addOrganization);
router.put("/", updateOrganization);

module.exports = router;
