const {
    uploadFile,
    deleteFile,
    downloadFile,
} = require("../controllers/attachment.controller");

const router = require("express").Router();

router.get("/download", downloadFile);
router.post("/upload", uploadFile);
router.delete("/delete", deleteFile);

module.exports = router;
