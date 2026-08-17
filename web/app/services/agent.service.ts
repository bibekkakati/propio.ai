import API from "@/lib/api";
import type { Modules } from "@/types";

const AgentService = {
    processOcrDocument: async (
        attachmentId: string,
        propertyId: string,
        module: Modules,
    ) => {
        return await API.post(`/api/v1/agent/task/ocr`, {
            attachmentId,
            propertyId,
            module,
        });
    },
    getScannedDocument: async (taskId: string) => {
        return await API.get(`/api/v1/agent/task?tid=${taskId}`);
    },
};

export default AgentService;
