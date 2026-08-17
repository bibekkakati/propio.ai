import API from "@/lib/api";
import { BookingSource } from "@/types";

const EarningService = {
    getEarning: async (earningId: string, propertyId: string) => {
        return await API.get(
            `/api/v1/earning?eid=${earningId}&pid=${propertyId}`,
        );
    },
    getEarnings: async (propertyId: string, month: number, year: number) => {
        const params = new URLSearchParams();

        params.append("m", month.toString());
        params.append("y", year.toString());
        params.append("pid", propertyId);

        const queryStr = params.toString();

        return await API.get(`/api/v1/earning/all?${queryStr}`);
    },
    addEarning: async (
        propertyId: string,
        recordDate: Date,
        earningSource: BookingSource,
        tdsValue: number,
        tcsValue: number,
        grossAmount: number,
        transactionRef: string,
        note: string,
        attachmentIds: string[],
    ) => {
        return await API.post("/api/v1/earning", {
            propertyId,
            recordDate,
            earningSource,
            tdsValue,
            tcsValue,
            grossAmount,
            transactionRef,
            note,
            attachmentIds,
        });
    },
    updateEarning: async (
        earningId: string,
        propertyId: string,
        recordDate: Date,
        earningSource: BookingSource,
        tdsValue: number,
        tcsValue: number,
        grossAmount: number,
        transactionRef: string,
        note: string,
        attachmentIds: string[],
    ) => {
        return await API.put("/api/v1/earning", {
            earningId,
            propertyId,
            recordDate,
            earningSource,
            tdsValue,
            tcsValue,
            grossAmount,
            transactionRef,
            note,
            attachmentIds,
        });
    },
    deleteEarning: async (earningId: string, propertyId: string) => {
        return await API.delete(
            `/api/v1/earning?eid=${earningId}&pid=${propertyId}`,
        );
    },
};

export default EarningService;
