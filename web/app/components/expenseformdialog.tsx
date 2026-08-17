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
import { cn, handleNumberInput } from "@/lib/utils";
import { EXPENSE_KEY } from "@/querykeys";
import AttachmentService from "@/services/attachment.service";
import ExpenseService from "@/services/expense.service";
import { ExpenseCategory, ExpensePaymentMode } from "@/types";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Download, FileText, LoaderCircle, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const FILE_SIZE_MB = 5;

export default function ExpenseFormDialog({
    open,
    onOpenChange,
    expenseId,
    propertyId,
    prefill,
    onSuccess,
}) {
    const [submitting, setSubmitting] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [attachments, setAttachments] = useState<
        { _id: string; label: string; saved: boolean }[]
    >([]);

    const [formData, setFormData] = useState({
        recordDate: new Date(),
        category: "" as ExpenseCategory,
        amount: "",
        paymentMode: ExpensePaymentMode.UPI,
        vendorName: "",
        note: "",
    });

    const expenseQueryKey = [EXPENSE_KEY, expenseId, propertyId];

    const { data: expense, isLoading: expenseLoading } = useQuery({
        queryKey: expenseQueryKey,
        queryFn: () => ExpenseService.getExpense(expenseId, propertyId),
        enabled: Boolean(expenseId && propertyId),
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
            setAttachments([
                ...attachments,
                {
                    _id,
                    label,
                    saved: false,
                },
            ]);
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
            "application/vnd.ms-excel": [".xls"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
            "text/csv": [".csv"],
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

        let {
            recordDate,
            category,
            amount,
            paymentMode,
            vendorName,
            note,
        }: {
            recordDate: Date;
            category: ExpenseCategory;
            amount: number | string;
            paymentMode: ExpensePaymentMode;
            vendorName: string;
            note: string;
        } = formData;

        const required = [recordDate, category, amount, paymentMode];

        if (required.some((v) => !v)) {
            toast.error("Please fill all required fields");
            return;
        }

        amount = Number(amount);

        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        const attachmentIds = attachments.map((a) => a._id);

        setSubmitting(true);
        try {
            if (expenseId) {
                await ExpenseService.updateExpense(
                    expenseId,
                    propertyId,
                    recordDate,
                    category,
                    amount,
                    paymentMode,
                    vendorName,
                    note,
                    attachmentIds,
                );
                toast.success("Record updated successfully!");
            } else {
                await ExpenseService.addExpense(
                    propertyId,
                    recordDate,
                    category,
                    amount,
                    paymentMode,
                    vendorName,
                    note,
                    attachmentIds,
                );
                toast.success("Record added successfully!");
            }

            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.message || "Failed to save record");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (
            !expenseId ||
            !window.confirm(
                "Are you sure you want to delete this record? This action cannot be undone.",
            )
        ) {
            return;
        }

        setSubmitting(true);
        try {
            await ExpenseService.deleteExpense(expenseId, propertyId);
            toast.success("Record deleted successfully!");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error("Failed to delete record");
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

    const handleFileDelete = async (fileId) => {
        if (
            !fileId ||
            !window.confirm(
                "Are you sure you want to delete this file? This action cannot be undone.",
            )
        ) {
            return;
        }

        // Remove the attachment object from state
        // Files will be deleted by server upon saving
        setAttachments([...attachments.filter((a) => a._id !== fileId)]);
        toast.info("File will be deleted upon saving.");
    };

    const isRecordDateYearOld = useMemo(() => {
        if (!formData.recordDate) return false;

        return dayjs(formData.recordDate).isBefore(new Date(), "year");
    }, [formData.recordDate]);

    useEffect(() => {
        const data = expense || prefill;
        if (data) {
            setFormData({
                recordDate: new Date(data.recordDate),
                category: data.category,
                amount: data.amount,
                paymentMode: data.paymentMode,
                vendorName: data.vendorName,
                note: data.note || "",
            });

            if (data.attachments?.length) {
                setAttachments(
                    data.attachments.map((a) => ({
                        _id: a._id,
                        label: a.label,
                        saved: true,
                    })),
                );
            }
        }
    }, [expense, prefill]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-lg max-h-[90vh] overflow-y-auto"
                aria-describedby="Expense Form"
            >
                <DialogHeader>
                    <DialogTitle>
                        {expenseId ? "Edit Expense" : "Add New Expense"}
                    </DialogTitle>
                </DialogHeader>

                {expenseLoading ? (
                    <div className="mx-auto py-[30vh]">
                        <LoaderCircle className="animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4 items-baseline">
                            <div className="flex flex-col">
                                <Label>Record date *</Label>
                                <Popover modal>
                                    <PopoverTrigger className="mt-2" asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            id="date-picker-simple"
                                            className="justify-start font-normal hover:bg-background"
                                        >
                                            {formData.recordDate ? (
                                                dayjs(
                                                    formData.recordDate,
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
                                            selected={formData.recordDate}
                                            onSelect={(d) =>
                                                setFormData({
                                                    ...formData,
                                                    recordDate: d,
                                                })
                                            }
                                            defaultMonth={
                                                formData.recordDate ||
                                                new Date()
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                                {isRecordDateYearOld ? (
                                    <p className="bg-yellow-50 text-yellow-900 mt-2 p-1 rounded-sm text-xs w-fit">
                                        Record date is older than current year
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <Label>Category *</Label>
                                <Select
                                    key={formData.category}
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            category: value as ExpenseCategory,
                                        })
                                    }
                                    required
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(ExpenseCategory).map(
                                            (c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Amount *</Label>
                                <Input
                                    type="text"
                                    required
                                    min={0}
                                    value={formData.amount}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            amount: handleNumberInput(e),
                                        });
                                    }}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Payment mode *</Label>
                                <Select
                                    key={formData.paymentMode}
                                    value={formData.paymentMode}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            paymentMode:
                                                value as ExpensePaymentMode,
                                        })
                                    }
                                    required
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(ExpensePaymentMode).map(
                                            (mode) => (
                                                <SelectItem
                                                    key={mode}
                                                    value={mode}
                                                >
                                                    {mode}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Vendor name</Label>
                            <Input
                                type="text"
                                value={formData.vendorName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        vendorName: e.target.value,
                                    })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Input
                                type="text"
                                value={formData.note}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        note: e.target.value,
                                    })
                                }
                                className="mt-1"
                            />
                        </div>

                        {/* Attachments Section */}
                        <div>
                            <Label>Attachments (Max {FILE_SIZE_MB}MB)</Label>
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
                                            PDF, PNG, JPG
                                        </p>
                                    </>
                                )}
                            </div>

                            {attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {attachments.map((file) => (
                                        <div
                                            key={file._id}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                        >
                                            <div className="flex-auto flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm truncate max-w-56">
                                                    {file.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-row w-fit">
                                                {file.saved ? (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="link"
                                                        className="hover:scale-110 opacity-80 hover:opacity-100"
                                                        onClick={() =>
                                                            handleFileDownload(
                                                                file._id,
                                                            )
                                                        }
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                ) : null}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="link"
                                                    className="hover:scale-110 opacity-80 hover:opacity-100"
                                                    onClick={() =>
                                                        handleFileDelete(
                                                            file._id,
                                                        )
                                                    }
                                                >
                                                    <X className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            {expenseId ? (
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
                                    : expenseId
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
