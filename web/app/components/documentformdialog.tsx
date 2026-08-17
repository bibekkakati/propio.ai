import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DOCUMENT_KEY } from "@/querykeys";
import AttachmentService from "@/services/attachment.service";
import DocumentStorageService from "@/services/documentstorage.service";
import { DocumentType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Download, FileText, LoaderCircle, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const FILE_SIZE_MB = 10;

export default function DocumentFormDialog({
    open,
    onOpenChange,
    documentId,
    propertyId,
    onSuccess,
}) {
    const [submitting, setSubmitting] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [attachment, setAttachment] = useState<{
        _id: string;
        label: string;
        saved: boolean;
    }>(null);

    const [formData, setFormData] = useState({
        effectiveDate: new Date(),
        expiryDate: null,
        documentTitle: "",
        documentType: DocumentType.AGREEMENT,
    });

    const documentQueryKey = [DOCUMENT_KEY, documentId];

    const { data: document, isLoading: documentLoading } = useQuery({
        queryKey: documentQueryKey,
        queryFn: () => DocumentStorageService.getDocumentDetails(documentId),
        enabled: Boolean(documentId),
        staleTime: 0,
    });

    const onDrop = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        if (file.size > FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`File size must be less than ${FILE_SIZE_MB}MB`);
            return;
        }

        setUploadingFile(true);
        try {
            const { _id, label } = await AttachmentService.uploadFile(
                propertyId,
                file,
            );
            setAttachment({
                _id,
                label,
                saved: false,
            });
            toast.success("File uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload file");
        } finally {
            setUploadingFile(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
            "text/plain": [".txt"],
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/heic": [".heic"],
        },
        maxFiles: 1,
        disabled: uploadingFile,
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!propertyId) {
            toast.error("Please select a property");
            return;
        }

        let { effectiveDate, expiryDate, documentTitle, documentType } =
            formData;

        const required = [documentTitle, documentType, effectiveDate];

        if (required.some((v) => !v)) {
            toast.error("Please fill all required fields");
            return;
        }

        if (!documentId && !attachment) {
            toast.error("Please upload a document");
            return;
        }

        setSubmitting(true);
        try {
            if (documentId) {
                await DocumentStorageService.updateDocument(
                    documentId,
                    propertyId,
                    documentTitle,
                    documentType,
                    effectiveDate,
                    expiryDate,
                );
                toast.success("Document updated successfully!");
            } else {
                await DocumentStorageService.addDocument(
                    propertyId,
                    attachment?._id,
                    documentTitle,
                    documentType,
                    effectiveDate,
                    expiryDate,
                );
                toast.success("Document inserted successfully!");
            }

            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.message || "Failed to save document");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (
            !documentId ||
            !window.confirm(
                "Are you sure you want to delete this document? This action cannot be undone.",
            )
        ) {
            return;
        }

        setSubmitting(true);
        try {
            await DocumentStorageService.deleteDocument(documentId);
            toast.success("Document deleted successfully!");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error("Failed to delete document");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileDownload = async (fileId) => {
        toast.info("Downloading file...");
        try {
            const url = await AttachmentService.downloadFile(fileId);

            // open in separate tab
            window.open(url, "_blank");
        } catch (error) {
            toast.error("Failed to download file");
        }
    };

    const isEffectiveDateYearOld = useMemo(() => {
        if (!formData.effectiveDate) return false;

        return dayjs(formData.effectiveDate).isBefore(new Date(), "year");
    }, [formData.effectiveDate]);

    useEffect(() => {
        const data = document;

        if (data) {
            setFormData({
                effectiveDate: new Date(data.effectiveDate),
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                documentTitle: data.documentTitle,
                documentType: data.documentType,
            });

            if (data.attachment) {
                setAttachment({
                    _id: data.attachment._id,
                    label: data.attachment.label,
                    saved: true,
                });
            }
        }
    }, [document]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-lg max-h-[90vh] overflow-y-auto"
                aria-describedby="Document Upload Form"
            >
                <DialogHeader>
                    <DialogTitle>
                        {documentId ? "Edit Document" : "Upload Document"}
                    </DialogTitle>
                </DialogHeader>

                {documentLoading ? (
                    <div className="mx-auto py-[30vh]">
                        <LoaderCircle className="animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                            <Label>Document name *</Label>
                            <Input
                                type="text"
                                required
                                value={formData.documentTitle}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        documentTitle: e.target.value,
                                    })
                                }
                                className="mt-1"
                                maxLength={60}
                            />
                        </div>
                        <div>
                            <Label>Document type *</Label>
                            <Select
                                key={formData.documentType}
                                value={formData.documentType}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        documentType: value as DocumentType,
                                    })
                                }
                                required
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(DocumentType).map(
                                        (source) => (
                                            <SelectItem
                                                key={source}
                                                value={source}
                                            >
                                                {source}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-2">
                            <div className="flex flex-col">
                                <Label>Effective from *</Label>
                                <Popover modal>
                                    <PopoverTrigger className="mt-2" asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            id="date-picker-simple"
                                            className="justify-start font-normal hover:bg-background"
                                        >
                                            {formData.effectiveDate ? (
                                                dayjs(
                                                    formData.effectiveDate,
                                                ).format("MMM D, YYYY")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-52 p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            className="w-full rounded-lg"
                                            selected={formData.effectiveDate}
                                            onSelect={(d) =>
                                                setFormData({
                                                    ...formData,
                                                    effectiveDate: d,
                                                })
                                            }
                                            defaultMonth={
                                                formData.effectiveDate ||
                                                new Date()
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                                {isEffectiveDateYearOld ? (
                                    <p className="bg-yellow-50 text-yellow-900 mt-2 p-1 font-medium rounded-sm text-xs w-fit">
                                        Note: Effective date is older than
                                        current year
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex flex-col">
                                <Label>Expiry date</Label>
                                <Popover modal>
                                    <PopoverTrigger className="mt-2" asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            id="date-picker-simple"
                                            className="justify-start font-normal hover:bg-background"
                                        >
                                            {formData.expiryDate ? (
                                                dayjs(
                                                    formData.expiryDate,
                                                ).format("MMM D, YYYY")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-52 p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            className="w-full rounded-lg"
                                            mode="single"
                                            selected={formData.expiryDate}
                                            onSelect={(d) =>
                                                setFormData({
                                                    ...formData,
                                                    expiryDate: d,
                                                })
                                            }
                                            defaultMonth={
                                                formData.expiryDate ||
                                                new Date()
                                            }
                                            disabled={(date) =>
                                                formData.effectiveDate
                                                    ? dayjs(date).isBefore(
                                                          formData.effectiveDate,
                                                          "day",
                                                      )
                                                    : false
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {attachment?._id ? (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        <span className="max-w-[85%] text-xs overflow-hidden text-nowrap text-ellipsis font-medium">
                                            {attachment.label}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="link"
                                        onClick={() =>
                                            handleFileDownload(attachment._id)
                                        }
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Label>
                                    Attachments (Max {FILE_SIZE_MB}MB)
                                </Label>
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer",
                                        isDragActive
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300",
                                        uploadingFile
                                            ? "opacity-50 cursor-not-allowed"
                                            : "",
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    <Upload
                                        className={cn(
                                            "w-6 h-6 mx-auto mb-2",
                                            uploadingFile
                                                ? "animate-bounce text-gray-600"
                                                : "text-gray-400",
                                        )}
                                    />
                                    {uploadingFile ? (
                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                            Uploading...
                                        </p>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                Drop your document here
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                or click to browse
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                PDF, DOC, TXT, PNG, JPG
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            {documentId ? (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={submitting || uploadingFile}
                                    className="flex-1"
                                >
                                    Delete
                                </Button>
                            ) : null}
                            <Button
                                type="submit"
                                className="flex-1 bg-gray-900 hover:bg-gray-800"
                                disabled={submitting || uploadingFile}
                            >
                                {submitting
                                    ? "Saving..."
                                    : documentId
                                      ? "Update"
                                      : "Save"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
