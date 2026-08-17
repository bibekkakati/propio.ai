import AmountLabel from "@/components/amountlabel";
import EarningFormDialog from "@/components/earningformdialog";
import MonthYearPopover from "@/components/monthyearpopover";
import PropertySelector from "@/components/propertyselector";
import ScreenLoader from "@/components/screenloader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useMetaTags from "@/lib/meta";
import { cn } from "@/lib/utils";
import { EARNINGS_KEY, PROPERTIES_KEY } from "@/querykeys";
import EarningService from "@/services/earning.service";
import PropertyService from "@/services/property.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Calendar, Ellipsis, EllipsisVertical, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { MetaArgs, MetaFunction } from "react-router";

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({ title: "Earnings" });
};

export default function Earnings() {
    const queryClient = useQueryClient();

    const [selectedProperty, setSelectedProperty] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [selectedEarning, setSelectedEarning] = useState("");

    const [selectedDate, setSelectedDate] = useState({
        month: dayjs().get("month") + 1,
        year: dayjs().get("year"),
    });

    const { data: properties = [], isLoading: propertiesLoading } = useQuery({
        queryKey: [PROPERTIES_KEY],
        queryFn: PropertyService.getProperties,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const { data: earnings = [], isLoading: earningsLoading } = useQuery({
        queryKey: [
            EARNINGS_KEY,
            selectedDate.month,
            selectedDate.year,
            selectedProperty,
        ],
        queryFn: () =>
            EarningService.getEarnings(
                selectedProperty,
                selectedDate.month,
                selectedDate.year,
            ),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!selectedProperty && !propertiesLoading,
    });

    const refreshEarnings = () => {
        queryClient.invalidateQueries({
            queryKey: [
                EARNINGS_KEY,
                selectedDate.month,
                selectedDate.year,
                selectedProperty,
            ],
        });
    };

    const handleEarningClick = (earningId: string) => {
        setSelectedEarning(earningId);
        setShowDialog(true);
    };

    const handleAddNew = () => {
        setSelectedEarning("");
        setShowDialog(true);
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
            data-testid="earnings-page"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">Earnings</h1>
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
                        data-testid="add-earning-dashboard-btn"
                        onClick={handleAddNew}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="ml-2">Add</span>
                    </Button>
                    <PropertySelector
                        properties={properties}
                        value={selectedProperty}
                        onSelect={setSelectedProperty}
                    />
                </div>
            </div>

            <div className="bg-white" data-testid="earnings-list">
                {propertiesLoading || earningsLoading ? (
                    <ScreenLoader />
                ) : earnings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 rounded-lg border border-gray-200">
                        No earnings recorded yet.
                    </div>
                ) : (
                    <div>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Record Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Source
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Gross Amount
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            TDS Amount
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            TCS Value
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Net Amount
                                        </th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {earnings.map((earning, index) => (
                                        <motion.tr
                                            key={earning._id}
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
                                                {dayjs(
                                                    earning.recordDate,
                                                ).format("Do MMM")}
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <Badge
                                                    variant={
                                                        earning.earningSource
                                                    }
                                                >
                                                    {earning.earningSource}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                <AmountLabel
                                                    value={earning.grossAmount}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                <AmountLabel
                                                    value={earning.tdsValue}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                <AmountLabel
                                                    value={earning.tcsValue}
                                                />
                                            </td>
                                            <td
                                                className={cn(
                                                    "px-4 py-4 text-sm font-medium",
                                                    earning.netAmount >= 0
                                                        ? "text-green-600"
                                                        : "text-red-600",
                                                )}
                                            >
                                                {earning.netAmount >= 0
                                                    ? "+"
                                                    : ""}
                                                <AmountLabel
                                                    value={earning.netAmount}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="items-center p-0"
                                                    onClick={() =>
                                                        handleEarningClick(
                                                            earning._id,
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
                            {earnings.map((earning, index) => (
                                <motion.div
                                    key={earning._id}
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
                                                        earning.earningSource
                                                    }
                                                >
                                                    {earning.earningSource}
                                                </Badge>

                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {dayjs(
                                                        earning.recordDate,
                                                    ).format("Do MMM")}
                                                </div>
                                            </div>

                                            <div className="text-right space-y-1">
                                                <p className="text-base font-semibold tracking-tight">
                                                    <AmountLabel
                                                        value={
                                                            earning.grossAmount
                                                        }
                                                    />
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    Earned
                                                </p>
                                            </div>
                                        </div>

                                        {/* Breakdown Grid */}
                                        <div className="mt-4 grid grid-cols-10 gap-2 text-xs">
                                            <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    Net
                                                </p>
                                                <p className=" text-gray-900 mt-1">
                                                    <AmountLabel
                                                        value={
                                                            earning.netAmount
                                                        }
                                                    />
                                                </p>
                                            </div>

                                            <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    TDS
                                                </p>
                                                <p className=" text-gray-900 mt-1">
                                                    <AmountLabel
                                                        value={earning.tdsValue}
                                                    />
                                                </p>
                                            </div>

                                            <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    TCS
                                                </p>
                                                <p className=" text-gray-900 mt-1">
                                                    <AmountLabel
                                                        value={earning.tcsValue}
                                                    />
                                                </p>
                                            </div>

                                            <Button
                                                onClick={() =>
                                                    handleEarningClick(
                                                        earning._id,
                                                    )
                                                }
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Edit earning"
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

            {showDialog ? (
                <EarningFormDialog
                    open={showDialog}
                    onOpenChange={setShowDialog}
                    earningId={selectedEarning}
                    propertyId={selectedProperty}
                    onSuccess={() => {
                        refreshEarnings();
                        setSelectedEarning(null);
                    }}
                />
            ) : null}
        </div>
    );
}
