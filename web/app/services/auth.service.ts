import API from "@/lib/api";

const AuthService = {
    loginWithEmail: async (email: string, authId: string, otp: string) => {
        return await API.post("/api/v1/auth/login/email", {
            email,
            authId,
            otp,
        });
    },
    signupWithEmail: async (
        name: string,
        email: string,
        authId: string,
        otp: string,
    ) => {
        return await API.post("/api/v1/auth/signup/email", {
            name,
            email,
            authId,
            otp,
        });
    },
};

export default AuthService;
