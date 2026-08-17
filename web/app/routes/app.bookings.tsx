import AmountLabel from "@/components/amountlabel";
import BookingFormDialog from "@/components/bookingformdialog";
import MonthYearPopover from "@/components/monthyearpopover";
import OcrFormDialog from "@/components/ocrformdialog";
import PropertySelector from "@/components/propertyselector";
import ScreenLoader from "@/components/screenloader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useMetaTags from "@/lib/meta";
import { BOOKINGS_KEY, PROPERTIES_KEY } from "@/querykeys";
import BookingService from "@/services/booking.service";
import PropertyService from "@/services/property.service";
import { Modules } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Ellipsis, EllipsisVertical, Plus, Scan } from "lucide-react";
import { useEffect, useState } from "react";
import type { MetaArgs, MetaFunction } from "react-router";

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({ title: "Bookings" });
};

export default function Bookings() {
    const queryClient = useQueryClient();

    const [selectedProperty, setSelectedProperty] = useState("");
    const [addDialog, setAddDialog] = useState(false);
    const [scanDialog, setScanDialog] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState("");
    const [scannedBooking, setScannedBooking] = useState(null);

    const [selectedDate, setSelectedDate] = useState({
        month: dayjs().get("month") + 1,
        year: dayjs().get("year"),
    });

    const { data: properties = [], isLoading: propertiesLoading } = useQuery({
        queryKey: [PROPERTIES_KEY],
        queryFn: PropertyService.getProperties,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
        queryKey: [
            BOOKINGS_KEY,
            selectedDate.month,
            selectedDate.year,
            selectedProperty,
        ],
        queryFn: () =>
            BookingService.getBookings(
                selectedProperty,
                selectedDate.month,
                selectedDate.year,
            ),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!selectedProperty && !propertiesLoading,
    });

    const refreshBookings = () => {
        queryClient.invalidateQueries({
            queryKey: [
                BOOKINGS_KEY,
                selectedDate.month,
                selectedDate.year,
                selectedProperty,
            ],
        });
    };

    const handleBookingClick = (bookingId: string) => {
        setSelectedBooking(bookingId);
        setAddDialog(true);
    };

    const handleAddNew = () => {
        setSelectedBooking("");
        setAddDialog(true);
    };

    const handleScan = () => {
        setSelectedBooking("");
        setScanDialog(true);
    };

    const onScanSuccess = (data, attachment) => {
        data.attachments = [attachment];
        setScannedBooking(data);
        setAddDialog(true);
    };

    useEffect(() => {
        if (!properties.length) {
            setSelectedProperty("");
            return;
        }

        const selectedPropertyExists = properties.some(
            (p) => p._id === selectedProperty,
        );

        // if selected property is not in the list, reset
        if (!selectedPropertyExists) {
            setSelectedProperty(properties[0]._id);
        }
    }, [properties]);

    return (
        <div
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
            data-testid="bookings-page"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">Bookings</h1>
                    <div className="mt-1 flex flex-row gap-1.5 items-center text-gray-600">
                        <MonthYearPopover
                            month={selectedDate.month}
                            year={selectedDate.year}
                            onChange={(m, y) =>
                                setSelectedDate({
                                    month: m,
                                    year: y,
                                })
                            }
                        >
                            <p className="underline decoration-dashed decoration-1 decoration decoration-gray-500 underline-offset-4 cursor-pointer">
                                {dayjs()
                                    .set("month", selectedDate.month - 1)
                                    .set("year", selectedDate.year)
                                    .format("MMMM YYYY")}{" "}
                            </p>
                        </MonthYearPopover>

                        <p>Overview</p>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-3">
                    <Button
                        data-testid="add-booking-dashboard-btn"
                        onClick={handleAddNew}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                    </Button>
                    <Button
                        data-testid="scan-booking-button"
                        onClick={handleScan}
                    >
                        <Scan className="w-4 h-4 mr-2" />
                        Scan
                    </Button>
                    <PropertySelector
                        properties={properties}
                        value={selectedProperty}
                        onSelect={setSelectedProperty}
                    />
                </div>
            </div>

            <div className="bg-white" data-testid="bookings-list">
                {propertiesLoading || bookingsLoading ? (
                    <ScreenLoader />
                ) : bookings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 rounded-lg border border-gray-200">
                        No bookings recorded yet.
                    </div>
                ) : (
                    <div>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Source
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Guest
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Occupancy
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Check-in
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Check-out
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {bookings.map((booking, index) => (
                                        <motion.tr
                                            key={booking._id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.25,
                                                ease: "easeOut",
                                                delay: index * 0.03,
                                            }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {booking.ref}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge
                                                    variant={
                                                        booking.bookingSource
                                                    }
                                                >
                                                    {booking.bookingSource}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {booking.guestName}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {booking.guestCount}{" "}
                                                {booking.guestCount === 1
                                                    ? "guest"
                                                    : "guests"}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {dayjs(booking.checkIn).format(
                                                    "Do MMM",
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {dayjs(booking.checkOut).format(
                                                    "Do MMM",
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm font-medium">
                                                <AmountLabel
                                                    value={booking.amount}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="items-center p-0"
                                                    onClick={() =>
                                                        handleBookingClick(
                                                            booking._id,
                                                        )
                                                    }
                                                >
                                                    <Ellipsis className="w-2 h-2" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Table View */}
                        <div className="md:hidden space-y-3">
                            {bookings.map((booking, index) => (
                                <motion.div
                                    key={booking._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.25,
                                        ease: "easeOut",
                                        delay: index * 0.03,
                                    }}
                                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm active:shadow-md transition-shadow"
                                >
                                    {/* Accent Strip */}
                                    <div className="absolute left-0 top-0 h-full w-1 bg-gray-900/80" />

                                    <div className="p-4">
                                        {/* Header Row */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 space-y-1.5">
                                                <Badge
                                                    variant={
                                                        booking.bookingSource
                                                    }
                                                >
                                                    {booking.bookingSource}
                                                </Badge>

                                                <p className="text-[11px] text-gray-400">
                                                    #{booking.ref}
                                                </p>
                                            </div>

                                            <div className="text-right space-y-1">
                                                <p className="text-base font-semibold tracking-tight">
                                                    <AmountLabel
                                                        value={booking.amount}
                                                    />
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    {booking.guestCount}{" "}
                                                    Guest(s)
                                                </p>
                                            </div>
                                        </div>

                                        {/* Breakdown Grid */}
                                        <div className="mt-4 grid grid-cols-10 gap-2 text-xs">
                                            <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    Guest
                                                </p>
                                                <p className="text-gray-900 truncate mt-1">
                                                    {
                                                        booking.guestName.split(
                                                            " ",
                                                        )[0]
                                                    }
                                                </p>
                                            </div>
                                            <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    Check-in
                                                </p>
                                                <p className=" text-gray-900 mt-1">
                                                    {dayjs(
                                                        booking.checkIn,
                                                    ).format("Do MMM")}
                                                </p>
                                            </div>
                                            <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    Check-out
                                                </p>
                                                <p className=" text-gray-900 mt-1">
                                                    {dayjs(
                                                        booking.checkOut,
                                                    ).format("Do MMM")}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    handleBookingClick(
                                                        booking._id,
                                                    )
                                                }
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Edit booking"
                                            >
                                                <EllipsisVertical className="h-4 w-4 text-gray-700" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {addDialog ? (
                <BookingFormDialog
                    open={addDialog}
                    onOpenChange={setAddDialog}
                    bookingId={selectedBooking}
                    propertyId={selectedProperty}
                    prefill={scannedBooking}
                    onSuccess={() => {
                        refreshBookings();
                        setSelectedBooking(null);
                        setScannedBooking(null);
                    }}
                />
            ) : null}
            {scanDialog ? (
                <OcrFormDialog
                    open={scanDialog}
                    onOpenChange={setScanDialog}
                    propertyId={selectedProperty}
                    onSuccess={onScanSuccess}
                    module={Modules.BOOKING}
                />
            ) : null}
        </div>
    );
}
