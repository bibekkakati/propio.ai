import API from "@/lib/api";
import { ExpenseCategory, ExpensePaymentMode } from "@/types";

const ExpenseService = {
    getExpense: async (expenseId: string, propertyId: string) => {
        return await API.get(
            `/api/v1/expense?eid=${expenseId}&pid=${propertyId}`,
        );
    },
    getExpenses: async (propertyId: string, month: number, year: number) => {
        const params = new URLSearchParams();

        params.append("m", month.toString());
        params.append("y", year.toString());
        params.append("pid", propertyId);

        const queryStr = params.toString();

        return await API.get(`/api/v1/expense/all?${queryStr}`);
    },
    addExpense: async (
        propertyId: string,
        recordDate: Date,
        category: ExpenseCategory,
        amount: number,
        paymentMode: ExpensePaymentMode,
        vendorName: string,
        note: string,
        attachmentIds: string[],
    ) => {
        return await API.post("/api/v1/expense", {
            propertyId,
            recordDate,
            category,
            amount,
            paymentMode,
            vendorName,
            note,
            attachmentIds,
        });
    },
    updateExpense: async (
        expenseId: string,
        propertyId: string,
        recordDate: Date,
        category: ExpenseCategory,
        amount: number,
        paymentMode: ExpensePaymentMode,
        vendorName: string,
        note: string,
        attachmentIds: string[],
    ) => {
        return await API.put("/api/v1/expense", {
            expenseId,
            propertyId,
            recordDate,
            category,
            amount,
            paymentMode,
            vendorName,
            note,
            attachmentIds,
        });
    },
    deleteExpense: async (expenseId: string, propertyId: string) => {
        return await API.delete(
            `/api/v1/expense?eid=${expenseId}&pid=${propertyId}`,
        );
    },
};

export default ExpenseService;
