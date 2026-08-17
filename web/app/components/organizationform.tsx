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
    ORGANIZATION_KEY,
    ORGANIZATIONS_KEY,
} from "@/querykeys";
import ConstantsService from "@/services/constants.service";
import OrganizationService from "@/services/organization.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const ORGANIZATION_NAME_LENGTH = 60; // 60 characters

export default function OrganizationForm({
    onSuccess,
    organizationId = null,
    prefill = null,
}) {
    const queryClient = useQueryClient();

    const [submitting, setSubmitting] = useState(false);
    const [organizationData, setOrganizationData] = useState({
        name: "",
        street: "",
        city: "",
        state: "",
        country: "",
        registrationNumber: "",
        taxEnabled: false,
        taxSystem: "",
        taxIdentification: "",
    });

    const { data: countries = [] } = useQuery({
        queryKey: [COUNTRIES_KEY],
        queryFn: ConstantsService.getCountryNames,
        staleTime: Infinity,
    });

    const { data: states = [] } = useQuery({
        queryKey: [COUNTRY_STATES_KEY, organizationData.country],
        queryFn: () =>
            ConstantsService.getStatesByCountry(organizationData.country),
        enabled: !!organizationData.country,
        staleTime: Infinity,
    });

    const handleSubmit = async () => {
        let {
            name,
            street,
            city,
            state,
            country,
            registrationNumber,
            taxEnabled,
            taxSystem,
            taxIdentification,
        } = organizationData;
        name = name.trim();
        city = city.trim();

        if (!name || !street || !city || !state || !country) {
            toast.error("All fields are required");
            return;
        }

        if (name.length > ORGANIZATION_NAME_LENGTH) {
            toast.error(
                `Max ${ORGANIZATION_NAME_LENGTH} characters are allowed for organization name`,
            );
            return;
        }

        const taxConfig = {
            enabled: Boolean(taxEnabled),
            system: taxSystem,
            identification: taxIdentification,
        };

        setSubmitting(true);
        try {
            if (organizationId) {
                await OrganizationService.updateOrganization(
                    organizationId,
                    name,
                    street,
                    city,
                    state,
                    country,
                    registrationNumber,
                    taxConfig,
                );
                toast.success("Organization details updated successfully!");
                queryClient.invalidateQueries({
                    queryKey: [ORGANIZATION_KEY, organizationId],
                });
            } else {
                await OrganizationService.addOrganization(
                    name,
                    street,
                    city,
                    state,
                    country,
                );
                toast.success("Organization created successfully!");
            }

            // Refresh organizations entries
            queryClient.invalidateQueries({
                queryKey: [ORGANIZATIONS_KEY],
            });

            onSuccess && onSuccess();
        } catch (error) {
            toast.error(error.message || "Failed to add organization");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (countries && countries.length > 0) {
            setOrganizationData((prev) => {
                if (!prev.country) {
                    return { ...prev, country: countries[0] };
                }
                return prev;
            });
        }
    }, [countries]);

    useEffect(() => {
        if (prefill) {
            setOrganizationData({
                name: prefill.name || "",
                street: prefill.street || "",
                city: prefill.city || "",
                state: prefill.state || "",
                country: prefill.country || "",
                registrationNumber: prefill.registrationNumber || "",
                taxEnabled: prefill.taxConfig?.enabled || false,
                taxSystem: prefill.taxConfig?.system || "",
                taxIdentification: prefill.taxConfig?.identification || "",
            });
        }
    }, [prefill]);

    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="organization-name">Organization name *</Label>
                <Input
                    id="organization-name"
                    data-testid="organization-name-input"
                    type="text"
                    placeholder="e.g., Season Stays PVT LTD"
                    value={organizationData.name}
                    onChange={(e) =>
                        setOrganizationData({
                            ...organizationData,
                            name: e.target.value,
                        })
                    }
                    required
                    className="mt-2 text-base"
                    maxLength={ORGANIZATION_NAME_LENGTH}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select
                        key={organizationData.country}
                        value={organizationData.country}
                        onValueChange={(value) =>
                            setOrganizationData({
                                ...organizationData,
                                country: value,
                                state: "",
                            })
                        }
                        required
                        disabled={Boolean(organizationId)}
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
                        key={organizationData.state}
                        value={organizationData.state}
                        onValueChange={(value) =>
                            setOrganizationData({
                                ...organizationData,
                                state: value,
                            })
                        }
                        disabled={Boolean(
                            !organizationData.country || organizationId,
                        )}
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
                        value={organizationData.city}
                        onChange={(e) =>
                            setOrganizationData({
                                ...organizationData,
                                city: e.target.value,
                            })
                        }
                        required
                        className="mt-2 text-base"
                    />
                </div>
                <div>
                    <Label htmlFor="street">Street *</Label>
                    <Input
                        id="street"
                        data-testid="street-input"
                        type="text"
                        placeholder="e.g., 121F, 13th Block"
                        value={organizationData.street}
                        onChange={(e) =>
                            setOrganizationData({
                                ...organizationData,
                                street: e.target.value,
                            })
                        }
                        required
                        className="mt-2 text-base"
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button
                    data-testid="save-organization-button"
                    onClick={handleSubmit}
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            {"Saving"} <LoaderCircle className="animate-spin" />
                        </>
                    ) : organizationId ? (
                        "Update"
                    ) : (
                        "Submit"
                    )}
                </Button>
            </div>
        </div>
    );
}
