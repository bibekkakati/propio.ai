import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleNumberInput } from "@/lib/utils";
import { PROPERTY_UNIT_KEY, UNIT_TYPES_KEY } from "@/querykeys";
import ConstantsService from "@/services/constants.service";
import PropertyService from "@/services/property.service";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

interface FormDataSchema {
    name: string;
    type: string;
    maxOccupancy: number | string;
    ratePerNight: number | string;
    note: string;
}

export default function UnitFormDialog({
    open,
    onOpenChange,
    unitId,
    propertyId,
    onSuccess,
}) {
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<FormDataSchema>({
        name: "",
        type: "",
        maxOccupancy: "",
        ratePerNight: "",
        note: "",
    });

    const unitQueryKey = [PROPERTY_UNIT_KEY, unitId, propertyId];

    const { data: unit, isLoading: unitLoading } = useQuery({
        queryKey: unitQueryKey,
        queryFn: () => PropertyService.getPropertyUnit(unitId, propertyId),
        enabled: Boolean(unitId && propertyId),
        staleTime: 0,
    });

    const { data: unitTypes = [] } = useQuery({
        queryKey: [UNIT_TYPES_KEY],
        queryFn: ConstantsService.getUnitTypes,
        staleTime: Infinity,
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!propertyId) {
            toast.error("Please select a property");
            return;
        }

        let { name, type, maxOccupancy, ratePerNight, note }: FormDataSchema =
            formData;

        const required = [name, type];

        if (required.some((v) => !v)) {
            toast.error("Please fill all required fields");
            return;
        }

        maxOccupancy = Number(maxOccupancy);
        ratePerNight = Number(ratePerNight);

        if (isNaN(maxOccupancy)) {
            toast.error("Please enter a valid occupancy");
            return;
        }

        setSubmitting(true);
        try {
            if (unitId) {
                await PropertyService.updatePropertyUnit(
                    propertyId,
                    unitId,
                    name,
                    type,
                    maxOccupancy,
                    ratePerNight,
                    note,
                );
                toast.success("Unit details updated successfully!");
            } else {
                await PropertyService.addPropertyUnit(
                    propertyId,
                    name,
                    type,
                    maxOccupancy,
                    ratePerNight,
                    note,
                );
                toast.success("Unit added successfully!");
            }

            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.message || "Failed to save unit");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (flag: boolean) => {
        if (!unitId) {
            return;
        }

        setSubmitting(true);
        try {
            await PropertyService.updatePropertyUnitStatus(
                propertyId,
                unitId,
                flag,
            );
            toast.success("Unit status modified successfully!");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error("Failed to modify status");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (unit) {
            setFormData({
                name: unit.name || "",
                type: unit.type || "",
                maxOccupancy: (unit.maxOccupancy || "").toString(),
                ratePerNight: (unit.ratePerNight || "").toString(),
                note: unit.note || "",
            });
        }
    }, [unit]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-lg max-h-[90vh] overflow-y-auto"
                aria-describedby="Property Unit Form"
            >
                <DialogHeader>
                    <DialogTitle>
                        {unitId ? "Edit Unit" : "Add New Unit"}
                    </DialogTitle>
                </DialogHeader>

                {unitLoading ? (
                    <div className="mx-auto py-[30vh]">
                        <LoaderCircle className="animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                            <Label>Name *</Label>
                            <Input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    });
                                }}
                                maxLength={40}
                                className="mt-1"
                            />
                            <span className="text-xs text-gray-400">
                                e.g. Room number, Listing name
                            </span>
                        </div>
                        <div>
                            <Label htmlFor="type">Type *</Label>
                            <Select
                                key={formData.type}
                                value={formData.type}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        type: value,
                                    })
                                }
                                required
                            >
                                <SelectTrigger
                                    data-testid="type-select"
                                    className="mt-2"
                                >
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    side="bottom"
                                    align="start"
                                    sideOffset={4}
                                    className="max-h-64 overflow-y-auto"
                                >
                                    {unitTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Max occupancy</Label>
                                <Input
                                    type="text"
                                    min={0}
                                    value={formData.maxOccupancy}
                                    className="mt-1"
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            maxOccupancy: handleNumberInput(
                                                e,
                                                false,
                                            ),
                                        });
                                    }}
                                />
                            </div>
                            <div>
                                <Label>Rate per night</Label>
                                <Input
                                    type="text"
                                    min={0}
                                    value={formData.ratePerNight}
                                    className="mt-1"
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            ratePerNight: handleNumberInput(
                                                e,
                                                true,
                                            ),
                                        });
                                    }}
                                />
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

                        <div className="flex gap-3 pt-4">
                            {unitId ? (
                                <Button
                                    type="button"
                                    variant={
                                        unit.isActive
                                            ? "destructive"
                                            : "outline"
                                    }
                                    onClick={() =>
                                        handleStatusUpdate(!unit.isActive)
                                    }
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    {unit.isActive ? "Disable" : "Enable"}
                                </Button>
                            ) : null}
                            <Button
                                type="submit"
                                className="flex-1 bg-gray-900 hover:bg-gray-800"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Saving..."
                                    : unitId
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
