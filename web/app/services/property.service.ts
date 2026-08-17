import API from "@/lib/api";

const PropertyService = {
    getProperty: async (propertyId: string) => {
        return await API.get("/api/v1/property?pid=" + propertyId);
    },
    getPropertyCount: async () => {
        return await API.get("/api/v1/property/count");
    },
    getProperties: async () => {
        return await API.get("/api/v1/property/all");
    },
    getPropertyUnit: async (unitId: string, propertyId: string) => {
        const params = new URLSearchParams();

        params.append("uid", unitId);
        params.append("pid", propertyId);

        const queryStr = params.toString();

        return await API.get(`/api/v1/property/unit?${queryStr}`);
    },
    getPropertyUnits: async (propertyId: string) => {
        const params = new URLSearchParams();

        params.append("pid", propertyId);

        const queryStr = params.toString();

        return await API.get(`/api/v1/property/all/unit?${queryStr}`);
    },
    getMonthlyReport: async (
        propertyIds: string[],
        month: number,
        year: number,
        fullreport?: boolean,
    ) => {
        const params = new URLSearchParams();

        params.append("m", month.toString());
        params.append("y", year.toString());
        params.append("pids", propertyIds.join(","));

        if (fullreport) {
            params.append("fullreport", "1");
        }

        const queryStr = params.toString();

        return await API.get(`/api/v1/property/report/monthly?${queryStr}`);
    },
    addProperty: async (
        name: string,
        city: string,
        state: string,
        country: string,
        role: string,
        type: string,
    ) => {
        return await API.post("/api/v1/property", {
            name,
            city,
            state,
            country,
            role,
            type,
        });
    },
    updateProperty: async (
        propertyId: string,
        name: string,
        city: string,
        state: string,
        country: string,
        role: string,
        type: string,
    ) => {
        return await API.put("/api/v1/property", {
            propertyId,
            name,
            city,
            state,
            country,
            role,
            type,
        });
    },
    addPropertyUnit: async (
        propertyId: string,
        name: string,
        type: string,
        maxOccupancy: number,
        ratePerNight: number,
        note: string,
    ) => {
        return await API.post("/api/v1/property/unit", {
            propertyId,
            name,
            type,
            maxOccupancy,
            ratePerNight,
            note,
        });
    },
    updatePropertyUnit: async (
        propertyId: string,
        unitId: string,
        name: string,
        type: string,
        maxOccupancy: number,
        ratePerNight: number,
        note: string,
    ) => {
        return await API.put("/api/v1/property/unit", {
            propertyId,
            unitId,
            name,
            type,
            maxOccupancy,
            ratePerNight,
            note,
        });
    },
    updatePropertyUnitStatus: async (
        propertyId: string,
        unitId: string,
        flag: boolean,
    ) => {
        return await API.put("/api/v1/property/unit/status", {
            unitId,
            propertyId,
            flag,
        });
    },
};

export default PropertyService;
