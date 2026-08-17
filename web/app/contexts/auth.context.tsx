import { setLogoutHandler } from "@/lib/api";
import { getAuthToken, removeAuthToken, setAuthToken } from "@/lib/utils";
import { USER_PROFILE_KEY } from "@/querykeys";
import { useQueryClient } from "@tanstack/react-query";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useNavigate } from "react-router";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextType = {
    status: AuthStatus;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [status, setStatus] = useState<AuthStatus>("loading");

    const syncAuthState = useCallback(() => {
        const token = getAuthToken();

        if (!token) {
            queryClient.removeQueries({ queryKey: [USER_PROFILE_KEY] });
            setStatus("unauthenticated");
        } else {
            setStatus("authenticated");
            queryClient.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
        }
    }, [queryClient]);

    const login = useCallback(
        (token: string) => {
            setAuthToken(token);
            setStatus("loading");
            syncAuthState();
        },
        [syncAuthState],
    );

    const logout = useCallback(() => {
        removeAuthToken();
        queryClient.removeQueries({ queryKey: [USER_PROFILE_KEY] });
        setStatus("unauthenticated");
        navigate("/signin");
    }, [navigate, queryClient]);

    useEffect(() => {
        setLogoutHandler(logout);
    }, [logout]);

    useEffect(() => {
        syncAuthState();
    }, [syncAuthState]);

    return (
        <AuthContext.Provider value={{ status, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
