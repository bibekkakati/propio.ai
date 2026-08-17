import API from "@/lib/api";

const AttachmentService = {
    uploadFile: async (propertyId: string, file: File) => {
        const formdata = new FormData();
        formdata.append("file", file);

        return await API.post(
            `/api/v1/attachment/upload?pid=${propertyId}`,
            formdata,
        );
    },
    deleteFile: async (attachmentId: string) => {
        return await API.delete(
            `/api/v1/attachment/delete?aid=${attachmentId}`,
        );
    },
    downloadFile: async (attachmentId: string) => {
        return await API.get(`/api/v1/attachment/download?aid=${attachmentId}`);
    },
};

export default AttachmentService;
