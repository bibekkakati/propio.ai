const {
    getTaskDetails,
    processOcrDocument,
} = require("../controllers/agent.controller");

const router = require("express").Router();

router.get("/task", getTaskDetails);
router.post("/task/ocr", processOcrDocument);

module.exports = router;
