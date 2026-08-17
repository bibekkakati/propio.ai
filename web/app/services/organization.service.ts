import API from "@/lib/api";

const OrganizationService = {
    getOrganizations: async () => {
        return await API.get(`/api/v1/organization/all`);
    },
    getOrganization: async (organizationId: string) => {
        return await API.get(`/api/v1/organization?oid=${organizationId}`);
    },
    addOrganization: async (
        name: string,
        street: string,
        city: string,
        state: string,
        country: string,
    ) => {
        return await API.post(`/api/v1/organization`, {
            name,
            street,
            city,
            state,
            country,
        });
    },
    updateOrganization: async (
        organizationId: string,
        name: string,
        street: string,
        city: string,
        state: string,
        country: string,
        registrationNumber: string,
        taxConfig: object,
    ) => {
        return await API.put(`/api/v1/organization`, {
            organizationId,
            name,
            street,
            city,
            state,
            country,
            registrationNumber,
            taxConfig,
        });
    },
};

export default OrganizationService;
