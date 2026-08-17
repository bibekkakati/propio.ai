import AmountLabel from "@/components/amountlabel";
import PropertySelector from "@/components/propertyselector";
import ScreenLoader from "@/components/screenloader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UnitFormDialog from "@/components/unitformdialog";
import useMetaTags from "@/lib/meta";
import { PROPERTIES_KEY, PROPERTY_UNITS_KEY } from "@/querykeys";
import PropertyService from "@/services/property.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Ellipsis, EllipsisVertical, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { MetaArgs, MetaFunction } from "react-router";

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({ title: "Units" });
};

export default function Units() {
    const queryClient = useQueryClient();

    const [selectedProperty, setSelectedProperty] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState("");

    const { data: properties = [], isLoading: propertiesLoading } = useQuery({
        queryKey: [PROPERTIES_KEY],
        queryFn: PropertyService.getProperties,
    });

    const { data: units = [], isLoading: unitsLoading } = useQuery({
        queryKey: [PROPERTY_UNITS_KEY, selectedProperty],
        queryFn: () => PropertyService.getPropertyUnits(selectedProperty),
        enabled: !!selectedProperty && !propertiesLoading,
    });

    const refreshUnits = () => {
        queryClient.invalidateQueries({
            queryKey: [PROPERTY_UNITS_KEY, selectedProperty],
        });
    };

    const handleUnitClick = (unitId: string) => {
        setSelectedUnit(unitId);
        setShowDialog(true);
    };

    const handleAddNew = () => {
        setSelectedUnit("");
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
            data-testid="units-page"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        Property Units
                    </h1>
                </div>

                <div className="flex flex-row items-center gap-3">
                    <Button
                        data-testid="add-unit-dashboard-btn"
                        onClick={handleAddNew}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="ml-2">Add Unit</span>
                    </Button>
                    <PropertySelector
                        properties={properties}
                        value={selectedProperty}
                        onSelect={setSelectedProperty}
                    />
                </div>
            </div>

            <div className="bg-white" data-testid="earnings-list">
                {propertiesLoading || unitsLoading ? (
                    <ScreenLoader />
                ) : units.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 rounded-lg border border-gray-200">
                        No units added yet.
                    </div>
                ) : (
                    <div>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Unit name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Max Occupancy
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Rate per night
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Status
                                        </th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {units.map((unit, index) => (
                                        <motion.tr
                                            key={unit._id}
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
                                                {unit.name}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {unit.type}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {unit.maxOccupancy || "-"}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                <AmountLabel
                                                    value={unit.ratePerNight}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-left text-gray-700">
                                                {unit.isActive ? (
                                                    <Badge variant="success">
                                                        • Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="items-center p-0"
                                                    onClick={() =>
                                                        handleUnitClick(
                                                            unit._id,
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
                            {units.map((unit, index) => (
                                <motion.div
                                    key={unit._id}
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
                                            <h3 className="font-semibold text-sm text-gray-900 truncate">
                                                {unit.name}
                                            </h3>

                                            <div className="text-right">
                                                {unit.isActive ? (
                                                    <Badge variant="success">
                                                        • Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 font-medium">
                                            {unit.type}
                                        </p>

                                        {/* Breakdown Grid */}
                                        <div className="mt-4 grid grid-cols-12 gap-2 text-xs">
                                            <div className="col-span-5 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    Occupancy
                                                </p>
                                                <p className="text-gray-900 line-clamp-2 mt-1">
                                                    {unit.maxOccupancy || "-"}
                                                </p>
                                            </div>
                                            <div className="col-span-5 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    Nightly rate
                                                </p>
                                                <p className=" text-gray-900 line-clamp-2 mt-1">
                                                    <AmountLabel
                                                        value={
                                                            unit.ratePerNight
                                                        }
                                                    />
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    handleUnitClick(unit._id)
                                                }
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Edit unit"
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
                <UnitFormDialog
                    open={showDialog}
                    onOpenChange={setShowDialog}
                    unitId={selectedUnit}
                    propertyId={selectedProperty}
                    onSuccess={() => {
                        refreshUnits();
                        setSelectedUnit(null);
                    }}
                />
            ) : null}
        </div>
    );
}
