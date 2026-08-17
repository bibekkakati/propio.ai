const { getUserProfile } = require("../controllers/user.controller");

const router = require("express").Router();

router.get("/", getUserProfile);

module.exports = router;
