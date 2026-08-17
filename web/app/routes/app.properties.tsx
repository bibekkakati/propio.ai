import PropertyForm from "@/components/propertyform";
import ScreenLoader from "@/components/screenloader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import useMetaTags from "@/lib/meta";
import { PROPERTIES_KEY } from "@/querykeys";
import PropertyService from "@/services/property.service";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Ellipsis,
    EllipsisVertical,
    MapPin,
    Plus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, type MetaArgs, type MetaFunction } from "react-router";

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({ title: "Properties" });
};

export default function Properties() {
    const navigate = useNavigate();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    const { data: properties = [], isLoading: propertiesLoading } = useQuery({
        queryKey: [PROPERTIES_KEY],
        queryFn: PropertyService.getProperties,
    });

    const onSuccess = async () => {
        setIsDialogOpen(false);
    };

    if (propertiesLoading) {
        return <ScreenLoader />;
    }

    return (
        <div
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
            data-testid="properties-page"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        Properties
                    </h1>
                </div>
                <Button
                    data-testid="add-property-button"
                    onClick={() => {
                        if (properties.length) {
                            // Prefill last property details
                            // For ease of entering data
                            const lastprop = {
                                ...properties[properties.length - 1],
                            };

                            // Important:
                            // Remove "_id" & "name" to avoid triggering update
                            lastprop._id = null;
                            lastprop.name = "";

                            setSelectedProperty(lastprop);
                        }
                        setIsDialogOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Property
                </Button>
            </div>

            {/* Desktop/Tablet Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Property
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Type
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Location
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Report
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {properties.map((property, index) => (
                            <motion.tr
                                key={property._id}
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
                                    {property.name}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                    {property.type}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700 flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                                    <span>
                                        {property.city}, {property.state}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center text-gray-700">
                                    {property.isActive ? (
                                        <Badge variant="success">
                                            • Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive">
                                            Inactive
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="items-center text-brand p-0"
                                        onClick={() =>
                                            navigate("/app/reports", {
                                                state: {
                                                    propertyId: property._id,
                                                },
                                            })
                                        }
                                    >
                                        View
                                        <ArrowRight className="w-2 h-2 text-brand" />
                                    </Button>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="items-center p-0"
                                        onClick={() => {
                                            setSelectedProperty(property);
                                            setIsDialogOpen(true);
                                        }}
                                    >
                                        <Ellipsis className="w-2 h-2" />
                                    </Button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {properties.map((property, index) => (
                    <motion.div
                        key={property._id}
                        initial={{ opacity: 0, y: 8 }}
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
                                    {property.name}
                                </h3>

                                <div className="text-right">
                                    {property.isActive ? (
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

                            {/* Breakdown Grid */}
                            <div className="mt-4 grid grid-cols-10 gap-2 text-xs">
                                <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                    <p className="text-[11px] text-gray-400">
                                        Type
                                    </p>
                                    <p className="text-gray-900 line-clamp-2 mt-1">
                                        {property.type}
                                    </p>
                                </div>
                                <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                    <p className="text-[11px] text-gray-400">
                                        City
                                    </p>
                                    <p className=" text-gray-900 line-clamp-2 mt-1">
                                        {property.city}
                                    </p>
                                </div>
                                <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                    <p className="text-[11px] text-gray-400">
                                        Report
                                    </p>
                                    <p
                                        className="text-brand font-medium mt-1"
                                        onClick={() =>
                                            navigate("/app/reports", {
                                                state: {
                                                    propertyId: property._id,
                                                },
                                            })
                                        }
                                    >
                                        View
                                    </p>
                                </div>
                                <Button
                                    onClick={() => {
                                        setSelectedProperty(property);
                                        setIsDialogOpen(true);
                                    }}
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Edit property"
                                >
                                    <EllipsisVertical className="h-4 w-4 text-gray-700" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {isDialogOpen ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent aria-describedby="Property Form">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedProperty?._id
                                    ? "Update Property"
                                    : "Add Property"}
                            </DialogTitle>
                        </DialogHeader>

                        <PropertyForm
                            onSuccess={onSuccess}
                            onBack={() => setIsDialogOpen(false)}
                            propertyId={selectedProperty?._id}
                            prefill={selectedProperty}
                        />
                    </DialogContent>
                </Dialog>
            ) : null}
        </div>
    );
}
