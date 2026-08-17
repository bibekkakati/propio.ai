const {
    getExpenseDetails,
    getExpensesByProperty,
    addExpense,
    updateExpense,
    deleteExpense,
} = require("../controllers/expense.controller");

const router = require("express").Router();

router.get("/", getExpenseDetails);
router.get("/all", getExpensesByProperty);
router.post("/", addExpense);
router.put("/", updateExpense);
router.delete("/", deleteExpense);

module.exports = router;
