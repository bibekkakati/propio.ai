import API from "@/lib/api";

const ConstantsService = {
    getCountryNames: async () => {
        return await API.get("/api/v1/constants/countries");
    },
    getStatesByCountry: async (country: string) => {
        return await API.get("/api/v1/constants/states?country=" + country);
    },
    getPropertyTypes: async () => {
        return await API.get("/api/v1/constants/types/property");
    },
    getUnitTypes: async () => {
        return await API.get("/api/v1/constants/types/unit");
    },
};

export default ConstantsService;
