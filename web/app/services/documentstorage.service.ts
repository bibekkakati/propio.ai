import API from "@/lib/api";
import { DocumentType } from "@/types";

const DocumentStorageService = {
    getDocumentDetails: async (documentId: string) => {
        return await API.get(`/api/v1/document?did=${documentId}`);
    },
    getDocuments: async (propertyId: string) => {
        const params = new URLSearchParams();
        params.append("pid", propertyId);

        const queryStr = params.toString();

        return await API.get(`/api/v1/document/all?${queryStr}`);
    },
    addDocument: async (
        propertyId: string,
        attachmentId: string,
        title: string,
        type: DocumentType,
        effectiveDate: Date,
        expiryDate: Date,
    ) => {
        return await API.post("/api/v1/document", {
            propertyId,
            attachmentId,
            title,
            type,
            effectiveDate,
            expiryDate,
        });
    },
    updateDocument: async (
        documentId: string,
        propertyId: string,
        title: string,
        type: DocumentType,
        effectiveDate: Date,
        expiryDate: Date,
    ) => {
        return await API.put("/api/v1/document", {
            documentId,
            propertyId,
            title,
            type,
            effectiveDate,
            expiryDate,
        });
    },
    deleteDocument: async (documentId: string) => {
        return await API.delete(`/api/v1/document?did=${documentId}`);
    },
};

export default DocumentStorageService;
