import AmountLabel from "@/components/amountlabel";
import ProgressRow from "@/components/progressrow";
import PropertySelector from "@/components/propertyselector";
import ReportSectionCard from "@/components/reportsectioncard";
import ScreenLoader from "@/components/screenloader";
import { Button } from "@/components/ui/button";
import useMetaTags from "@/lib/meta";
import { cn } from "@/lib/utils";
import { fadeRow } from "@/motionstyles";
import { PROPERTIES_KEY, PROPERTIES_REPORTS } from "@/querykeys";
import PropertyService from "@/services/property.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
    BarChart3,
    DollarSign,
    Receipt,
    RotateCw,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { MetaArgs, MetaFunction } from "react-router";

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({ title: "Dashboard" });
};

const SummaryCard = ({
    icon: Icon,
    iconBg,
    iconColor,
    title,
    value,
    sub = "",
    valueClass = "",
}) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 transition-colors shadow-2xs hover:border-gray-300"
    >
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        iconBg,
                    )}
                >
                    <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>
        </div>

        <p className={cn("text-2xl font-bold text-gray-900", valueClass)}>
            {value}
        </p>

        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </motion.div>
);

export default function Dashboard() {
    const queryClient = useQueryClient();

    const [selectedProperty, setSelectedProperty] = useState<"ALL" | string>(
        "ALL",
    );

    const { data: properties = [], isLoading: propertiesLoading } = useQuery({
        queryKey: [PROPERTIES_KEY],
        queryFn: PropertyService.getProperties,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const currentYear: number = useMemo(() => dayjs().get("year"), []);
    const currentMonth: number = useMemo(() => dayjs().get("month") + 1, []);

    const propertyIds: string[] = useMemo(() => {
        if (selectedProperty === "ALL") {
            return properties.map((p) => p._id);
        }

        return [selectedProperty];
    }, [selectedProperty, properties]);

    const { data: monthlyReport, isLoading: reportsLoading } = useQuery({
        queryKey: [PROPERTIES_REPORTS, currentYear, currentMonth, propertyIds],
        queryFn: () =>
            PropertyService.getMonthlyReport(
                propertyIds,
                currentMonth,
                currentYear,
            ),
        enabled: !!selectedProperty && !propertiesLoading,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const reports = useMemo(
        () => monthlyReport?.reports || {},
        [monthlyReport],
    );

    const handleRefresh = async () => {
        queryClient.invalidateQueries({
            queryKey: [
                PROPERTIES_REPORTS,
                currentYear,
                currentMonth,
                propertyIds,
            ],
        });
    };

    if (propertiesLoading || reportsLoading) {
        return <ScreenLoader />;
    }

    return (
        <div
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
            data-testid="dashboard-page"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {dayjs()
                            .set("month", currentMonth - 1)
                            .set("year", currentYear)
                            .format("MMMM YYYY")}{" "}
                        Overview
                    </p>
                </div>

                <div className="max-sm:w-full flex flex-row gap-4">
                    <PropertySelector
                        properties={[
                            { _id: "ALL", name: "All Properties" },
                            ...properties,
                        ]}
                        value={selectedProperty}
                        onSelect={setSelectedProperty}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        className="hidden md:flex"
                    >
                        <RotateCw className="w-4 h-4 text-gray-700" />
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-6">
                <SummaryCard
                    icon={TrendingUp}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    title="Total Bookings"
                    value={<AmountLabel value={reports?.totalBookingsValue} />}
                    sub={`${reports?.totalBookingsCount || 0} booking(s) this month`}
                />

                <SummaryCard
                    icon={TrendingDown}
                    iconBg="bg-red-100"
                    iconColor="text-red-600"
                    title="Total Expenses"
                    value={<AmountLabel value={reports?.totalExpenses} />}
                />

                <SummaryCard
                    icon={BarChart3}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                    title="Total Earnings"
                    value={<AmountLabel value={reports?.totalEarnings} />}
                    valueClass={
                        reports?.totalEarnings >= 0
                            ? "text-green-600"
                            : "text-red-600"
                    }
                    sub={`₹${(reports?.netProfit || 0).toLocaleString()} net profit this month`}
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Booking Sources */}
                <ReportSectionCard
                    title="Booking Sources"
                    icon={Receipt}
                    right={
                        <div className="text-xs text-gray-500">
                            Total: {reports?.totalBookingsCount || 0}
                        </div>
                    }
                >
                    {!reports?.bookingsBySource?.length ? (
                        <div className="text-center text-gray-500 py-10 text-sm">
                            No bookings for selected month
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.bookingsBySource.map((item, index) => (
                                <motion.div
                                    key={item.source}
                                    {...fadeRow(index)}
                                >
                                    <ProgressRow
                                        label={item.source}
                                        badgeVariant={item.source}
                                        percentage={item.percentage}
                                        amount={item.amount}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </ReportSectionCard>

                {/* Expenses */}
                <ReportSectionCard title="Expense Category" icon={DollarSign}>
                    {!reports?.expensesByCategory?.length ? (
                        <div className="text-center text-gray-500 py-10 text-sm">
                            No expenses for selected month
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.expensesByCategory.map((item, index) => (
                                <motion.div
                                    key={item.category}
                                    {...fadeRow(index)}
                                >
                                    <ProgressRow
                                        label={item.category}
                                        badgeVariant={item.category}
                                        percentage={item.percentage}
                                        amount={item.amount}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </ReportSectionCard>

                {/* Earnings */}
                <ReportSectionCard title="Earning Sources" icon={Wallet}>
                    {!reports?.earningsBySource?.length ? (
                        <div className="text-center text-gray-500 py-10 text-sm">
                            No earnings for selected month
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.earningsBySource.map((item, index) => (
                                <motion.div
                                    key={item.source}
                                    {...fadeRow(index)}
                                >
                                    <ProgressRow
                                        label={item.source}
                                        badgeVariant={item.source}
                                        percentage={item.percentage}
                                        amount={item.amount}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </ReportSectionCard>
            </div>
        </div>
    );
}
