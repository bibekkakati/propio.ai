const {
    getDocumentDetails,
    getDocumentsByProperty,
    addDocument,
    updateDocument,
    deleteDocument,
} = require("../controllers/documentstorage.controller");

const router = require("express").Router();

router.get("/", getDocumentDetails);
router.get("/all", getDocumentsByProperty);
router.post("/", addDocument);
router.put("/", updateDocument);
router.delete("/", deleteDocument);

module.exports = router;
