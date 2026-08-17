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
import { BOOKING_KEY, PROPERTY_UNITS_KEY } from "@/querykeys";
import AttachmentService from "@/services/attachment.service";
import BookingService from "@/services/booking.service";
import PropertyService from "@/services/property.service";
import { BookingPaymentMode, BookingSource } from "@/types";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Download, FileText, LoaderCircle, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const FILE_SIZE_MB = 5;

export default function BookingFormDialog({
    open,
    onOpenChange,
    bookingId,
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
        checkIn: new Date(),
        checkOut: dayjs().add(1, "day").toDate(),
        ratePerNight: "",
        unitId: "",
        amount: "",
        bookingSource: BookingSource.DIRECT,
        guestName: "",
        guestCount: "",
        paymentMode: BookingPaymentMode.UPI,
        note: "",
        generate_receipt: false,
    });

    const bookingQueryKey = [BOOKING_KEY, bookingId, propertyId];

    const { data: booking, isLoading: bookingLoading } = useQuery({
        queryKey: bookingQueryKey,
        queryFn: () => BookingService.getBooking(bookingId, propertyId),
        enabled: Boolean(bookingId && propertyId),
        staleTime: 0,
    });

    const { data: propertyUnits = [] } = useQuery({
        queryKey: [PROPERTY_UNITS_KEY, propertyId],
        queryFn: () => PropertyService.getPropertyUnits(propertyId),
        enabled: Boolean(propertyId),
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
            checkIn,
            checkOut,
            ratePerNight,
            unitId,
            amount,
            bookingSource,
            guestName,
            guestCount,
            paymentMode,
            note,
        }: {
            checkIn: Date;
            checkOut: Date;
            ratePerNight: string | number;
            unitId: string;
            amount: string | number;
            bookingSource: BookingSource;
            guestName: string;
            guestCount: string | number;
            paymentMode: BookingPaymentMode;
            note?: string;
        } = formData;

        const required = [
            checkIn,
            checkOut,
            ratePerNight,
            unitId,
            amount,
            bookingSource,
            guestName?.trim(),
            guestCount,
            paymentMode,
        ];

        if (required.some((v) => !v)) {
            toast.error("Please fill all required fields");
            return;
        }

        ratePerNight = Number(ratePerNight);
        guestCount = Number(guestCount);

        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);

        if (
            dayjs(checkIn).isAfter(checkOut, "day") ||
            dayjs(checkIn).isSame(checkOut, "day")
        ) {
            toast.error("Check-in date should be before check-out date");
            return;
        }

        if (isNaN(ratePerNight) || ratePerNight < 1) {
            toast.error("Please enter a valid room rate");
            return;
        }

        if (isNaN(guestCount) || guestCount <= 0) {
            toast.error("Please enter a valid guest count");
            return;
        }

        const attachmentIds = attachments.map((a) => a._id);

        setSubmitting(true);
        try {
            if (bookingId) {
                await BookingService.updateBooking(
                    bookingId,
                    propertyId,
                    unitId,
                    guestName,
                    guestCount,
                    checkIn,
                    checkOut,
                    ratePerNight,
                    bookingSource,
                    paymentMode,
                    note,
                    attachmentIds,
                );
                toast.success("Booking updated successfully!");
            } else {
                await BookingService.addBooking(
                    propertyId,
                    unitId,
                    guestName,
                    guestCount,
                    checkIn,
                    checkOut,
                    ratePerNight,
                    bookingSource,
                    paymentMode,
                    note,
                    attachmentIds,
                );
                toast.success("Booking added successfully!");
            }

            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.message || "Failed to save booking");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (
            !bookingId ||
            !window.confirm(
                "Are you sure you want to delete this booking? This action cannot be undone.",
            )
        ) {
            return;
        }

        setSubmitting(true);
        try {
            await BookingService.deleteBooking(bookingId, propertyId);
            toast.success("Booking deleted successfully!");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error("Failed to delete booking");
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

    const bookingNights: number = useMemo(() => {
        const from = formData.checkIn;
        const to = formData.checkOut;

        // Return nights as 1
        // If checkin & checkout date is same or not provided yet
        if (!from || !to || dayjs(from).isSame(to, "day")) return 1;

        // Normalize both to start of day, then calculate nights
        const nights = dayjs(to)
            .startOf("day")
            .diff(dayjs(from).startOf("day"), "day");
        return nights;
    }, [formData.checkIn, formData.checkOut]);

    useEffect(() => {
        const ratePerNight: string = formData.ratePerNight;
        let amount: number | string = Number(ratePerNight || 0) * bookingNights;

        if (amount && !Number.isInteger(amount)) {
            amount = amount.toFixed(2);
        }

        setFormData({
            ...formData,
            amount: amount.toString() || "",
        });
    }, [bookingNights, formData.ratePerNight]);

    useEffect(() => {
        if (
            propertyUnits?.length &&
            formData.unitId &&
            !formData.ratePerNight
        ) {
            const { ratePerNight } = propertyUnits.find(
                (p) => p._id === formData.unitId,
            );
            setFormData({
                ...formData,
                ratePerNight: ratePerNight || "",
            });
        }
    }, [propertyUnits, formData.unitId]);

    useEffect(() => {
        const data = booking || prefill;

        if (data) {
            setFormData({
                checkIn: new Date(data.checkIn),
                checkOut: new Date(data.checkOut),
                ratePerNight: data.ratePerNight,
                unitId: data.unitId,
                amount: data.amount,
                bookingSource: data.bookingSource,
                guestName: data.guestName,
                guestCount: data.guestCount,
                paymentMode: data.paymentMode,
                note: data.note || "",
                generate_receipt: false,
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
    }, [booking, prefill]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-lg max-h-[90vh] overflow-y-auto"
                aria-describedby="Booking Form"
            >
                <DialogHeader>
                    <DialogTitle>
                        {bookingId ? "Edit Booking" : "Add New Booking"}
                    </DialogTitle>
                </DialogHeader>

                {bookingLoading ? (
                    <div className="mx-auto py-[30vh]">
                        <LoaderCircle className="animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <Label>Check-in date *</Label>
                                <Popover modal>
                                    <PopoverTrigger className="mt-2" asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            id="date-picker-simple"
                                            className="justify-start font-normal hover:bg-background"
                                        >
                                            {formData.checkIn ? (
                                                dayjs(formData.checkIn).format(
                                                    "MMM D, YYYY",
                                                )
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
                                            selected={formData.checkIn}
                                            onSelect={(d) => {
                                                const isCheckoutBefore =
                                                    formData.checkOut
                                                        ? dayjs(
                                                              formData.checkOut,
                                                          ).isBefore(d, "day")
                                                        : false;

                                                setFormData({
                                                    ...formData,
                                                    checkIn: d,
                                                    checkOut: isCheckoutBefore
                                                        ? dayjs(d)
                                                              .add(1, "day")
                                                              .toDate()
                                                        : formData.checkOut,
                                                });
                                            }}
                                            defaultMonth={
                                                formData.checkIn || new Date()
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex flex-col">
                                <Label>Check-out date *</Label>
                                <Popover modal>
                                    <PopoverTrigger className="mt-2" asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            id="date-picker-simple"
                                            className="justify-start font-normal hover:bg-background"
                                        >
                                            {formData.checkOut ? (
                                                dayjs(formData.checkOut).format(
                                                    "MMM D, YYYY",
                                                )
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
                                            selected={formData.checkOut}
                                            onSelect={(d) =>
                                                setFormData({
                                                    ...formData,
                                                    checkOut: d,
                                                })
                                            }
                                            defaultMonth={
                                                formData.checkOut || new Date()
                                            }
                                            disabled={(date) =>
                                                formData.checkIn
                                                    ? dayjs(date).isBefore(
                                                          dayjs(
                                                              formData.checkIn,
                                                          ).add(1, "day"),
                                                          "day",
                                                      )
                                                    : false
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Guest name *</Label>
                                <Input
                                    type="text"
                                    required
                                    value={formData.guestName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            guestName: e.target.value,
                                        })
                                    }
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label>Guest count *</Label>
                                <Input
                                    type="text"
                                    required
                                    value={formData.guestCount}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            guestCount: handleNumberInput(
                                                e,
                                                false,
                                            ),
                                        });
                                    }}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Unit *</Label>
                                <Select
                                    key={formData.unitId}
                                    value={formData.unitId}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            unitId: value,
                                        })
                                    }
                                    required
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {propertyUnits?.map(({ _id, name }) => (
                                            <SelectItem key={_id} value={_id}>
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Room rate *</Label>
                                <Input
                                    type="text"
                                    required
                                    min={0}
                                    value={formData.ratePerNight}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            ratePerNight: handleNumberInput(e),
                                        });
                                    }}
                                    className="mt-1"
                                />
                                <span className="text-xs text-gray-400">
                                    Inclusive of taxes
                                </span>
                            </div>
                        </div>

                        <div>
                            <Label>Amount *</Label>
                            <Input
                                type="text"
                                required
                                min={0}
                                value={Number(formData.amount).toLocaleString()}
                                className="mt-1"
                                disabled
                            />
                            <span className="text-xs text-gray-400">
                                Rate per night x {bookingNights} night(s)
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Booking source *</Label>
                                <Select
                                    key={formData.bookingSource}
                                    value={formData.bookingSource}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            bookingSource:
                                                value as BookingSource,
                                        })
                                    }
                                    required
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(BookingSource).map(
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
                            <div>
                                <Label>Payment mode *</Label>
                                <Select
                                    key={formData.paymentMode}
                                    value={formData.paymentMode}
                                    required
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            paymentMode:
                                                value as BookingPaymentMode,
                                        })
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(BookingPaymentMode).map(
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

                        {/* Receipt Section */}
                        {
                            booking?.receipt_id ? (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium">
                                                Booking Receipt
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="link"
                                            onClick={() =>
                                                handleFileDownload(
                                                    booking.receipt_id,
                                                )
                                            }
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            ) : null
                            // TODO: Development pending
                            // <div className="flex items-center justify-between">
                            //     <Label>Generate Receipt</Label>
                            //     <Switch
                            //         checked={formData.generate_receipt}
                            //         onCheckedChange={(checked) =>
                            //             setFormData({
                            //                 ...formData,
                            //                 generate_receipt: checked,
                            //             })
                            //         }
                            //     />
                            // </div>
                        }

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
                            {bookingId ? (
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
                                    : bookingId
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
