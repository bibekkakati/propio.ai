const AttachmentService = require("../services/attachment.service");
const ExpenseService = require("../services/expense.service");
const { SuccessResponse } = require("../utils/response.util");

module.exports = {
    addExpense: async (req, res) => {
        const { userId } = req.user;
        const {
            propertyId,
            recordDate,
            category,
            amount,
            paymentMode,
            vendorName,
            note,
            attachmentIds,
        } = req.body;

        const id = await ExpenseService.upsertExpense(
            {
                propertyId,
                recordDate: new Date(recordDate).getTime(),
                category,
                amount,
                paymentMode,
                vendorName,
                note,
                attachmentIds,
            },
            userId,
        );

        return SuccessResponse(res, {
            data: id,
        });
    },
    updateExpense: async (req, res) => {
        const { userId } = req.user;
        const {
            expenseId,
            propertyId,
            recordDate,
            category,
            amount,
            paymentMode,
            vendorName,
            note,
            attachmentIds,
        } = req.body;

        const id = await ExpenseService.upsertExpense(
            {
                expenseId,
                propertyId,
                recordDate: new Date(recordDate).getTime(),
                category,
                amount,
                paymentMode,
                vendorName,
                note,
                attachmentIds,
            },
            userId,
        );

        return SuccessResponse(res, {
            data: id,
        });
    },
    deleteExpense: async (req, res) => {
        const { userId } = req.user;
        const { eid: expenseId, pid: propertyId } = req.query;

        await ExpenseService.deleteExpense(expenseId, propertyId, userId);

        return SuccessResponse(res, {
            data: expenseId,
        });
    },
    getExpenseDetails: async (req, res) => {
        const { userId } = req.user;
        const { eid: expenseId, pid: propertyId } = req.query;

        const expense = await ExpenseService.getExpenseDetails(
            expenseId,
            propertyId,
            userId,
        );

        if (!expense) {
            throw new NotFoundError("Expense not found!");
        }

        if (expense.attachments?.length) {
            const attachments =
                await AttachmentService.fetchMultipleAttachments(
                    expense.attachments,
                );
            expense.attachments = attachments;
        }

        return SuccessResponse(res, {
            data: expense,
        });
    },
    getExpensesByProperty: async (req, res) => {
        const { userId } = req.user;
        const { pid: propertyId, m, y } = req.query;

        const month = parseInt(m);
        if (isNaN(month) || month < 1 || month > 12) {
            throw new ValidationError("Select a valid month");
        }

        const year = parseInt(y);
        if (isNaN(year)) {
            throw new ValidationError("Select a valid year");
        }

        const from = new Date(year, month - 1, 1).getTime();
        const to = new Date(year, month, 1).getTime() - 1;

        const expenses = await ExpenseService.getExpensesByProperty(
            propertyId,
            userId,
            {
                recordDateFrom: from,
                recordDateTo: to,
            },
        );

        return SuccessResponse(res, {
            data: expenses,
        });
    },
};
