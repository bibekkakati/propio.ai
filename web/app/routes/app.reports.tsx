import AmountLabel from "@/components/amountlabel";
import ProgressRow from "@/components/progressrow";
import PropertySelector from "@/components/propertyselector";
import ReportSectionCard from "@/components/reportsectioncard";
import ScreenLoader from "@/components/screenloader";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import useMetaTags from "@/lib/meta";
import { cn, generateAndDownloadExcel } from "@/lib/utils";
import { fadeRow } from "@/motionstyles";
import { PROPERTIES_KEY, PROPERTIES_REPORTS } from "@/querykeys";
import PropertyService from "@/services/property.service";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
    ArrowDownToLine,
    ArrowRight,
    DollarSign,
    Receipt,
    Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, type MetaArgs, type MetaFunction } from "react-router";
import { toast } from "sonner";

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({ title: "Reports" });
};

export default function Reports() {
    const location = useLocation();

    const [selectedProperty, setSelectedProperty] = useState(() => {
        return location.state?.propertyId || "ALL";
    });
    const [selectedMonth, setSelectedMonth] = useState(
        dayjs().format("YYYY-MM"),
    );

    const { data: properties = [], isLoading: propertiesLoading } = useQuery({
        queryKey: [PROPERTIES_KEY],
        queryFn: PropertyService.getProperties,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const propertyIds: string[] = useMemo(() => {
        if (selectedProperty === "ALL") {
            return properties.map((p) => p._id);
        }

        return [selectedProperty];
    }, [selectedProperty, properties]);

    const { currentYear, currentMonth } = useMemo(() => {
        const d = dayjs(selectedMonth);

        return { currentYear: d.get("year"), currentMonth: d.get("month") + 1 };
    }, [selectedMonth]);

    const { data: monthlyReport, isLoading: reportsLoading } = useQuery({
        queryKey: [
            PROPERTIES_REPORTS,
            currentYear,
            currentMonth,
            propertyIds,
            "full",
        ],
        queryFn: () =>
            PropertyService.getMonthlyReport(
                propertyIds,
                currentMonth,
                currentYear,
                true,
            ),
        enabled: !!selectedProperty && !propertiesLoading,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    const { reports, propertySummaries } = useMemo(
        () => monthlyReport || {},
        [monthlyReport],
    );

    const downloadExcel = (p) => {
        // ---------- Property Summary ----------
        const summarySheetData = [
            {
                Property: p.property_name,
                Period: selectedMonth,
                "Number of bookings": p.totalBookingsCount,
                "Bookings value": p.totalBookingsValue,
                "Total expenses": p.totalExpenses,
                "Total earnings": p.totalEarnings,
                "Net earnings (After taxes)": p.netEarnings,
                "Net profit": p.netProfit,
            },
        ];

        // ---------- Bookings By Source ----------
        const bookingsRows = Object.entries(p.bookingsCountBySource).map(
            ([source, count]) => ({
                Source: source,
                "Number of bookings": count,
                "Bookings value": p.bookingsValueBySource[source] || 0,
            }),
        );

        // ---------- Earnings By Source ----------
        const earningsRows = Object.entries(p.earningsBySource).map(
            ([source, amount]) => ({
                Source: source,
                "Total earnings": amount,
            }),
        );

        // ---------- Expenses By Category ----------
        const expenseRows = Object.entries(p.expensesByCategory || {}).map(
            ([category, amount]) => ({
                Category: category,
                "Total expenses": amount,
            }),
        );

        // ---------- Download ----------
        const fileName = `Report/${p.property_name}/${selectedMonth}.xlsx`;

        // GENERATE EXCEL
        generateAndDownloadExcel(
            [
                { name: "Summary", rows: summarySheetData },
                { name: "Booking Sources", rows: bookingsRows },
                { name: "Expense Category", rows: expenseRows },
                { name: "Earning Source", rows: earningsRows },
            ],
            fileName,
        );
    };

    const downloadReports = (propertyId) => {
        const summary = propertySummaries.find(
            (s) => s.propertyId === propertyId,
        );
        if (!summary) {
            toast.error("Report summary not found!");
            return;
        }

        downloadExcel(summary);
    };

    const months = [];
    for (let i = 0; i < 12; i++) {
        months.push(dayjs().subtract(i, "month").format("YYYY-MM"));
    }

    const loading = propertiesLoading || reportsLoading;

    return (
        <div
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
            data-testid="reports-page"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">Reports</h1>
                </div>
                <div className="max-sm:w-full flex flex-row items-center gap-3">
                    <PropertySelector
                        properties={[
                            { _id: "ALL", name: "All Properties" },
                            ...properties,
                        ]}
                        value={selectedProperty}
                        onSelect={setSelectedProperty}
                    />

                    <div className="w-full sm:w-56">
                        <Select
                            value={selectedMonth}
                            onValueChange={setSelectedMonth}
                        >
                            <SelectTrigger
                                data-testid="report-month-select"
                                className="bg-white"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem key={month} value={month}>
                                        {dayjs(month).format("MMMM YYYY")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {loading ? (
                <ScreenLoader />
            ) : reports ? (
                <div className="space-y-6">
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b text-gray-600">
                                    <th className="px-5 py-4 text-left font-semibold">
                                        Property
                                    </th>
                                    <th className="px-5 py-4 text-left font-semibold">
                                        Bookings
                                    </th>
                                    <th className="px-5 py-4 text-left font-semibold">
                                        Expenses
                                    </th>
                                    <th className="px-5 py-4 text-left font-semibold">
                                        Earnings
                                    </th>
                                    <th className="px-5 py-4 text-left font-semibold">
                                        Tax Retained
                                    </th>
                                    <th className="px-5 py-4 text-left font-semibold">
                                        Net Profit
                                    </th>
                                    <th className="px-5 py-4 text-left font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {propertySummaries?.map((s, index) => (
                                    <motion.tr
                                        key={s._id}
                                        {...fadeRow(index)}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800">
                                            {s.property_name}
                                        </td>
                                        <td className="px-5 py-4 text-gray-700">
                                            <AmountLabel
                                                value={s.totalBookingsValue}
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-gray-700">
                                            <AmountLabel
                                                value={s.totalExpenses}
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-gray-700">
                                            <AmountLabel
                                                value={s.totalEarnings}
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-gray-700">
                                            <AmountLabel
                                                value={s.withHoldingTax}
                                            />
                                        </td>
                                        <td
                                            className={cn(
                                                "px-5 py-4 font-medium",
                                                s.netProfit >= 0
                                                    ? "text-green-600"
                                                    : "text-red-600",
                                            )}
                                        >
                                            <AmountLabel value={s.netProfit} />
                                        </td>
                                        <td className="px-5 py-4 text-gray-700">
                                            {s.propertyId ===
                                            selectedProperty ? (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="items-center text-brand p-0"
                                                    onClick={() =>
                                                        downloadReports(
                                                            s.propertyId,
                                                        )
                                                    }
                                                >
                                                    Export
                                                    <ArrowDownToLine className="w-2 h-2 text-brand" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="items-center text-brand p-0"
                                                    onClick={() =>
                                                        setSelectedProperty(
                                                            s.propertyId,
                                                        )
                                                    }
                                                >
                                                    Report
                                                    <ArrowRight className="w-2 h-2 text-brand" />
                                                </Button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden space-y-4">
                        {propertySummaries?.map((s, index) => (
                            <motion.div
                                key={s._id}
                                {...fadeRow(index)}
                                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm active:shadow-md transition-shadow"
                            >
                                {/* Accent Strip */}
                                <div className="absolute left-0 top-0 h-full w-1 bg-gray-900/80" />

                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold text-gray-800 text-sm">
                                            {s.property_name}
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p
                                                className={cn(
                                                    "text-sm font-semibold",
                                                    s.netProfit >= 0
                                                        ? "text-green-600"
                                                        : "text-red-600",
                                                )}
                                            >
                                                <AmountLabel
                                                    value={s.netProfit}
                                                />
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                Net Profit
                                            </p>
                                        </div>
                                    </div>

                                    {/* Breakdown Grid */}
                                    <div className="mt-4 grid grid-cols-12 gap-2 text-xs">
                                        <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                            <p className="text-[11px] text-gray-400">
                                                Bookings
                                            </p>
                                            <p className=" text-gray-900 mt-1">
                                                <AmountLabel
                                                    value={s.totalBookingsValue}
                                                />
                                            </p>
                                        </div>
                                        <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                            <p className="text-[11px] text-gray-400">
                                                Expenses
                                            </p>
                                            <p className=" text-gray-900 mt-1">
                                                <AmountLabel
                                                    value={s.totalExpenses}
                                                />
                                            </p>
                                        </div>
                                        <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                            <p className="text-[11px] text-gray-400">
                                                Earnings
                                            </p>
                                            <p className="text-gray-900 mt-1">
                                                <AmountLabel
                                                    value={s.totalEarnings}
                                                />
                                            </p>
                                        </div>
                                        <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                            <p className="text-[11px] text-gray-400">
                                                Report
                                            </p>
                                            {s.propertyId ===
                                            selectedProperty ? (
                                                <p
                                                    className="text-brand font-medium mt-1"
                                                    onClick={() =>
                                                        downloadReports(
                                                            s.propertyId,
                                                        )
                                                    }
                                                >
                                                    Export
                                                </p>
                                            ) : (
                                                <p
                                                    className="text-brand font-medium mt-1"
                                                    onClick={() =>
                                                        setSelectedProperty(
                                                            s.propertyId,
                                                        )
                                                    }
                                                >
                                                    View
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Detail Sections */}
                    {selectedProperty && selectedProperty !== "ALL" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Booking Sources */}
                            <ReportSectionCard
                                title="Booking Sources"
                                icon={Receipt}
                                right={
                                    <div className="text-xs text-gray-500">
                                        Total:{" "}
                                        {reports?.totalBookingsCount || 0}
                                    </div>
                                }
                            >
                                {!reports?.bookingsBySource?.length ? (
                                    <div className="text-center text-gray-500 py-10 text-sm">
                                        No bookings for selected month
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reports.bookingsBySource.map(
                                            (item, index) => (
                                                <motion.div
                                                    key={item.source}
                                                    {...fadeRow(index)}
                                                >
                                                    <ProgressRow
                                                        label={item.source}
                                                        badgeVariant={
                                                            item.source
                                                        }
                                                        percentage={
                                                            item.percentage
                                                        }
                                                        amount={item.amount}
                                                    />
                                                </motion.div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </ReportSectionCard>

                            {/* Expenses */}
                            <ReportSectionCard
                                title="Expense Category"
                                icon={DollarSign}
                            >
                                {!reports?.expensesByCategory?.length ? (
                                    <div className="text-center text-gray-500 py-10 text-sm">
                                        No expenses for selected month
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reports.expensesByCategory.map(
                                            (item, index) => (
                                                <motion.div
                                                    key={item.category}
                                                    {...fadeRow(index)}
                                                >
                                                    <ProgressRow
                                                        label={item.category}
                                                        badgeVariant={
                                                            item.category
                                                        }
                                                        percentage={
                                                            item.percentage
                                                        }
                                                        amount={item.amount}
                                                    />
                                                </motion.div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </ReportSectionCard>

                            {/* Earnings */}
                            <ReportSectionCard
                                title="Earning Sources"
                                icon={Wallet}
                            >
                                {!reports?.earningsBySource?.length ? (
                                    <div className="text-center text-gray-500 py-10 text-sm">
                                        No earnings for selected month
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reports.earningsBySource.map(
                                            (item, index) => (
                                                <motion.div
                                                    key={item.source}
                                                    {...fadeRow(index)}
                                                >
                                                    <ProgressRow
                                                        label={item.source}
                                                        badgeVariant={
                                                            item.source
                                                        }
                                                        percentage={
                                                            item.percentage
                                                        }
                                                        amount={item.amount}
                                                    />
                                                </motion.div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </ReportSectionCard>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
