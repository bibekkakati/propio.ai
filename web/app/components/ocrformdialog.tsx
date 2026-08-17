import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import AgentService from "@/services/agent.service";
import AttachmentService from "@/services/attachment.service";
import { AgentTaskStatus } from "@/types";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const FILE_SIZE_MB = 5;

type ProcessStatus = "idle" | "uploading" | "scanning" | "complete" | "error";

interface ProcessStage {
    id: ProcessStatus;
    label: string;
    description: string;
}

const PROCESS_STAGES: ProcessStage[] = [
    {
        id: "uploading",
        label: "Uploading",
        description: "Preparing your document",
    },
    {
        id: "scanning",
        label: "Scanning",
        description: "Analyzing & extracting information",
    },
    { id: "complete", label: "Complete", description: "Ready to review" },
];

export default function OcrFormDialog({
    open,
    onOpenChange,
    propertyId,
    onSuccess,
    module,
}) {
    const [status, setStatus] = useState<ProcessStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const attachmentRef = useRef<{ _id: string; label: string }>(null);
    const outputRef = useRef<any>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const clearPollingInterval = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    const fetchProgress = async (taskId: string) => {
        try {
            const { status, output } =
                await AgentService.getScannedDocument(taskId);

            if (status === AgentTaskStatus.COMPLETED) {
                setStatus("complete");
                clearPollingInterval();

                outputRef.current = output;
            } else if (status === AgentTaskStatus.PROCESSING) {
                setStatus("scanning");
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage(error.message || "Failed to process document");
            clearPollingInterval();
        }
    };

    const processAttachment = async (attachmentId: string) => {
        if (!attachmentId) return;

        setStatus("scanning");
        setErrorMessage(null);

        try {
            const { taskId } = await AgentService.processOcrDocument(
                attachmentId,
                propertyId,
                module,
            );

            // Poll the processing status API every 5 seconds
            const maxAttempts = 30;
            let attempts = 0;

            // Clear any existing interval before starting new one
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }

            pollIntervalRef.current = setInterval(async () => {
                attempts++;

                if (attempts > maxAttempts) {
                    clearPollingInterval();
                    setStatus("error");
                    setErrorMessage("Processing timeout. Please try again.");
                    return;
                }

                await fetchProgress(taskId);
            }, 5000);
        } catch (error) {
            setStatus("error");
            setErrorMessage(error.message || "Failed to process document");
        }
    };

    const onDrop = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        if (file.size > FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`File size must be less than ${FILE_SIZE_MB}MB`);
            return;
        }

        setStatus("uploading");
        setErrorMessage(null);

        try {
            const { _id, label } = await AttachmentService.uploadFile(
                propertyId,
                file,
            );
            attachmentRef.current = { _id, label };

            // Automatically start processing after upload completes
            setTimeout(() => {
                processAttachment(_id);
            }, 800);
        } catch (error) {
            setStatus("error");
            setErrorMessage("Failed to upload file");
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/heic": [".heic"],
        },
        maxFiles: 1,
        disabled: Boolean(status !== "idle" && status !== "error"),
    });

    const isProcessing = ["uploading", "scanning"].includes(status);

    const handleRetry = () => {
        clearPollingInterval();
        setStatus("idle");
        setErrorMessage(null);
        attachmentRef.current = null;
    };

    const handleClose = () => {
        if (!isProcessing) {
            handleRetry();
            onOpenChange(false);
        }
    };

    const handleReview = () => {
        if (onSuccess) {
            onSuccess(outputRef.current, attachmentRef.current);
        }

        handleClose();
    };

    useEffect(() => {
        return () => {
            clearPollingInterval();
        };
    }, []);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-lg max-h-[90vh] overflow-y-auto bg-white"
                aria-describedby="Smart Scan Form"
            >
                <DialogHeader>
                    <DialogTitle>Smart Scan</DialogTitle>
                </DialogHeader>

                {/* File Upload Section */}
                {status === "idle" || status === "error" ? (
                    <>
                        <div className="mt-6">
                            <Label className="text-sm font-medium text-gray-700">
                                Document (Max {FILE_SIZE_MB}MB)
                            </Label>
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "mt-3 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                                    isDragActive
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-300 hover:border-gray-400",
                                    status === "error"
                                        ? "border-red-300 bg-red-50"
                                        : "",
                                )}
                            >
                                <input {...getInputProps()} />
                                <Upload
                                    className={cn(
                                        "w-6 h-6 mx-auto mb-2 transition-colors",
                                        isDragActive
                                            ? "text-blue-500"
                                            : "text-gray-400",
                                        status === "error"
                                            ? "text-red-500"
                                            : "",
                                    )}
                                />
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                    Drop your document here
                                </p>
                                <p className="text-xs text-gray-500">
                                    or click to browse
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    PDF, PNG, JPG
                                </p>
                            </div>
                        </div>

                        {status === "error" && errorMessage && (
                            <div className="mt-4 p-3 bg-destructive/5 border border-destructive rounded-lg flex flex-row items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                                <p className="text-xs text-destructive font-medium">
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                        </div>
                    </>
                ) : (
                    /* Processing Progress Section */
                    <>
                        <div className="mt-6">
                            <div className="space-y-4">
                                {PROCESS_STAGES.map((stage, index) => {
                                    const currentIndex =
                                        PROCESS_STAGES.findIndex(
                                            (s) => s.id === status,
                                        );
                                    const isActive = status === stage.id;
                                    const isCompleted =
                                        index < currentIndex ||
                                        status === "complete";
                                    const isPending = index > currentIndex;

                                    return (
                                        <div key={stage.id}>
                                            <div className="flex items-start gap-4">
                                                {/* Stage Icon */}
                                                <div className="shrink-0 mt-1">
                                                    {isCompleted ? (
                                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                                        </div>
                                                    ) : isActive ? (
                                                        <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
                                                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={cn(
                                                                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                                                                isPending
                                                                    ? "border-gray-300 bg-gray-50"
                                                                    : "border-gray-300 bg-white",
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    "w-2 h-2 rounded-full",
                                                                    isPending
                                                                        ? "bg-gray-300"
                                                                        : "bg-gray-400",
                                                                )}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Stage Content */}
                                                <div className="flex-1 pt-0.5">
                                                    <p
                                                        className={cn(
                                                            "font-medium text-sm transition-colors",
                                                            isCompleted
                                                                ? "text-green-600"
                                                                : isActive
                                                                  ? "text-brand"
                                                                  : "text-gray-600",
                                                        )}
                                                    >
                                                        {stage.label}
                                                    </p>
                                                    <p
                                                        className={cn(
                                                            "text-xs mt-0.5 transition-colors",
                                                            isCompleted
                                                                ? "text-gray-500"
                                                                : isActive
                                                                  ? "text-brand"
                                                                  : "text-gray-400",
                                                        )}
                                                    >
                                                        {stage.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Divider between stages */}
                                            {index <
                                                PROCESS_STAGES.length - 1 && (
                                                <div
                                                    className={cn(
                                                        "ml-4 h-6 border-l-2 transition-colors mt-2",
                                                        isCompleted
                                                            ? "border-green-500"
                                                            : isActive
                                                              ? "border-blue-300"
                                                              : "border-gray-200",
                                                    )}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Status Message */}
                        {status === "complete" && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">
                                        Document processed successfully
                                    </p>
                                    <p className="text-xs text-green-700 mt-1">
                                        Your document is ready for review
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-6">
                            {status === "complete" ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleClose}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        type="button"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        onClick={handleReview}
                                    >
                                        Review
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    disabled
                                    className="flex-1"
                                >
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
