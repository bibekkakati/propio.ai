import API from "@/lib/api";

const UserService = {
    getUser: async () => {
        return await API.get("/api/v1/user");
    },
};

export default UserService;
