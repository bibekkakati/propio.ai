const {
    processSignupWithEmail,
    processLoginWithEmail,
} = require("../controllers/auth.controller");

const router = require("express").Router();

router.post("/signup/email", processSignupWithEmail);
router.post("/login/email", processLoginWithEmail);

module.exports = router;
