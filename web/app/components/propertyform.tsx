import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    COUNTRIES_KEY,
    COUNTRY_STATES_KEY,
    PROPERTIES_KEY,
    PROPERTY_COUNT_KEY,
    PROPERTY_KEY,
    PROPERTY_TYPES_KEY,
} from "@/querykeys";
import ConstantsService from "@/services/constants.service";
import PropertyService from "@/services/property.service";
import { UserRoles } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const PROPERTY_NAME_LENGTH = 60; // 60 characters

export default function PropertyForm({
    onBack,
    onSuccess,
    propertyId = null,
    prefill = null,
}) {
    const queryClient = useQueryClient();

    const [submitting, setSubmitting] = useState(false);
    const [propertyData, setPropertyData] = useState({
        name: "",
        city: "",
        state: "",
        country: "",
        role: UserRoles.OWNER,
        type: "",
    });

    const { data: countries = [] } = useQuery({
        queryKey: [COUNTRIES_KEY],
        queryFn: ConstantsService.getCountryNames,
        staleTime: Infinity,
    });

    const { data: states = [] } = useQuery({
        queryKey: [COUNTRY_STATES_KEY, propertyData.country],
        queryFn: () =>
            ConstantsService.getStatesByCountry(propertyData.country),
        enabled: !!propertyData.country,
        staleTime: Infinity,
    });

    const { data: propertyTypes = [] } = useQuery({
        queryKey: [PROPERTY_TYPES_KEY],
        queryFn: ConstantsService.getPropertyTypes,
        staleTime: Infinity,
    });

    const handleSubmit = async () => {
        let { name, city, state, country, role, type } = propertyData;
        name = name.trim();
        city = city.trim();

        if (!name || !city || !state || !country || !role || !type) {
            toast.error("All fields are required");
            return;
        }

        if (name.length > PROPERTY_NAME_LENGTH) {
            toast.error(
                `Max ${PROPERTY_NAME_LENGTH} characters are allowed for property name`,
            );
            return;
        }

        setSubmitting(true);
        try {
            if (propertyId) {
                await PropertyService.updateProperty(
                    propertyId,
                    name,
                    city,
                    state,
                    country,
                    role,
                    type,
                );
                toast.success("Property details updated successfully!");
                queryClient.invalidateQueries({
                    queryKey: [PROPERTY_KEY, propertyId],
                });
            } else {
                await PropertyService.addProperty(
                    name,
                    city,
                    state,
                    country,
                    role,
                    type,
                );
                toast.success("Property added successfully!");
            }

            // Refresh property count
            queryClient.invalidateQueries({
                queryKey: [PROPERTY_COUNT_KEY],
            });
            // Refresh property entries
            queryClient.invalidateQueries({
                queryKey: [PROPERTIES_KEY],
            });

            onSuccess && onSuccess();
        } catch (error) {
            toast.error(error.message || "Failed to add property");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (countries && countries.length > 0) {
            setPropertyData((prev) => {
                if (!prev.country) {
                    return { ...prev, country: countries[0] };
                }
                return prev;
            });
        }
    }, [countries]);

    useEffect(() => {
        if (prefill) {
            setPropertyData({
                name: prefill.name || "",
                city: prefill.city || "",
                state: prefill.state || "",
                country: prefill.country || "",
                role: (prefill.role || "") as UserRoles,
                type: prefill.type || "",
            });
        }
    }, [prefill]);

    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="property-name">Property name *</Label>
                <Input
                    id="property-name"
                    data-testid="property-name-input"
                    type="text"
                    placeholder="e.g., Beach Villa, Mountain Cottage"
                    value={propertyData.name}
                    onChange={(e) =>
                        setPropertyData({
                            ...propertyData,
                            name: e.target.value,
                        })
                    }
                    required
                    className="mt-2 text-base"
                    maxLength={PROPERTY_NAME_LENGTH}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select
                        key={propertyData.country}
                        value={propertyData.country}
                        onValueChange={(value) =>
                            setPropertyData({
                                ...propertyData,
                                country: value,
                                state: "",
                            })
                        }
                        required
                    >
                        <SelectTrigger
                            data-testid="country-select"
                            className="mt-2"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                            position="popper"
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            className="max-h-64 overflow-y-auto"
                        >
                            {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                    {country}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                        key={propertyData.state}
                        value={propertyData.state}
                        onValueChange={(value) =>
                            setPropertyData({
                                ...propertyData,
                                state: value,
                            })
                        }
                        disabled={!propertyData.country}
                        required
                    >
                        <SelectTrigger
                            data-testid="state-select"
                            className="mt-2"
                        >
                            <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent
                            position="popper"
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            className="max-h-64 overflow-y-auto"
                        >
                            {states.map((state) => (
                                <SelectItem key={state} value={state}>
                                    {state}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="city">City/Town *</Label>
                    <Input
                        id="city"
                        data-testid="city-input"
                        type="text"
                        placeholder="e.g., Goa, Manali"
                        value={propertyData.city}
                        onChange={(e) =>
                            setPropertyData({
                                ...propertyData,
                                city: e.target.value,
                            })
                        }
                        required
                        className="mt-2 text-base"
                    />
                </div>
                <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select
                        value={propertyData.role}
                        onValueChange={(value) =>
                            setPropertyData({
                                ...propertyData,
                                role: value as UserRoles,
                            })
                        }
                        required
                    >
                        <SelectTrigger
                            data-testid="role-select"
                            className="mt-2"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                            position="popper"
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            className="max-h-64 overflow-y-auto"
                        >
                            {Object.values(UserRoles).map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="type">Property type *</Label>
                <Select
                    key={propertyData.type}
                    value={propertyData.type}
                    onValueChange={(value) =>
                        setPropertyData({
                            ...propertyData,
                            type: value,
                        })
                    }
                    required
                >
                    <SelectTrigger data-testid="type-select" className="mt-2">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent
                        position="popper"
                        side="bottom"
                        align="start"
                        sideOffset={4}
                        className="max-h-64 overflow-y-auto"
                    >
                        {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1"
                    disabled={submitting}
                >
                    Back
                </Button>
                <Button
                    data-testid="save-property-button"
                    onClick={handleSubmit}
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            {"Saving"} <LoaderCircle className="animate-spin" />
                        </>
                    ) : propertyId ? (
                        "Update"
                    ) : (
                        "Submit"
                    )}
                </Button>
            </div>
        </div>
    );
}
