require("dotenv").config();
const ExpenseService = require("../services/expense.service");
const mongoconnect = require("../utils/mongoconnect");

// Importing it for emitter activation
require("../services/summary.service");

const expenses = [];
const propertyId_1 = "697bb97e087aba0e18518b60";
const propertyId_2 = "6987482267562a54ae6c2751";
const userId = "697b6743f2ad1986c6f2eac0";

const run = async () => {
    mongoconnect();

    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];

        console.log("Expense #", i + 1);

        await ExpenseService.upsertExpense(
            {
                property_id: propertyId_2,
                ...expense,
            },
            userId,
        );
    }
};

run();
