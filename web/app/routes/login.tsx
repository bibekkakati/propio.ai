import ScreenLoader from "@/components/screenloader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth.context";
import useMetaTags from "@/lib/meta";
import { isValidEmail } from "@/lib/utils";
import AuthService from "@/services/auth.service";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
    type MetaArgs,
    type MetaFunction,
} from "react-router";
import { toast } from "sonner";

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({ title: "Authentication" });
};

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();

    const { login, status } = useAuth();

    const [isLogin, setIsLogin] = useState(
        location.pathname.includes("signin"),
    );
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        otp: "",
        authId: "",
    });

    const responseHandler = async (
        response: Record<string, any>,
        message: string,
    ) => {
        const { token, authId } = response;

        if (authId) {
            setFormData({
                ...formData,
                authId: authId,
            });

            toast.success(message);
            setLoading(false);
            return;
        }

        // Login with auth context
        login(token);

        if (isLogin) {
            toast.success("Welcome back!");
        } else {
            toast.success("Account created!");
        }

        setLoading(false);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const { name, email, otp, authId } = formData;
        if (!email) {
            return toast.error("Please enter your email");
        }
        if (authId && !otp) {
            return toast.error("Please enter the OTP");
        }
        if (!isLogin && !name) {
            return toast.error("Please enter your name");
        }
        if (!isValidEmail(email)) {
            return toast.error("Please enter a valid email");
        }

        setLoading(true);

        try {
            let response = null;

            if (isLogin) {
                response = await AuthService.loginWithEmail(email, authId, otp);
            } else {
                response = await AuthService.signupWithEmail(
                    name,
                    email,
                    authId,
                    otp,
                );
            }

            // Common response handler
            responseHandler(response, "OTP sent to email.");
        } catch (error: any) {
            toast.error(error.message || "Authentication failed");
            setLoading(false);
        }
    };

    const getSubmitButtonLabel = (loading: boolean) => {
        if (loading) {
            const loader = <LoaderCircle className="animate-spin" />;
            const label = isLogin ? "Signing in" : "Creating account";
            return (
                <>
                    {label} {loader}
                </>
            );
        }

        if (formData.authId) {
            return "Validate OTP";
        }

        return "Request OTP";
    };

    // Redirect if already authenticated
    useEffect(() => {
        if (status === "authenticated") {
            navigate(isLogin ? "/app/dashboard" : "/app/onboarding", {
                replace: true,
            });
        }
    }, [status, navigate]);

    if (status === "loading" || status === "authenticated") {
        return <ScreenLoader />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 p-8 rounded-xl shadow-md border border-gray-200">
                <div className="text-center">
                    <Link to="/">
                        <img
                            src="/assets/logo-light.png"
                            className="h-10 w-auto mx-auto"
                        />
                    </Link>
                    <p className="mt-4 text-base text-gray-600">
                        Track your property finances with AI insights
                    </p>
                </div>

                <div className="bg-white">
                    <h2
                        className="text-2xl font-semibold mb-6"
                        data-testid="auth-title"
                    >
                        {isLogin ? "Sign In" : "Create Account"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    data-testid="name-input"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="mt-1"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                data-testid="email-input"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                className="mt-1"
                                disabled={Boolean(loading || formData.authId)}
                            />
                        </div>

                        {formData.authId ? (
                            <div>
                                <Label htmlFor="password">
                                    One-time password
                                </Label>
                                <Input
                                    id="password"
                                    data-testid="password-input"
                                    type="text"
                                    required
                                    value={formData.otp}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            otp: e.target.value,
                                        })
                                    }
                                    className="mt-1"
                                    disabled={loading}
                                />
                            </div>
                        ) : null}

                        <Button
                            type="submit"
                            data-testid="submit-button"
                            className="mt-4 w-full bg-gray-900 hover:bg-gray-800"
                            disabled={loading}
                        >
                            {getSubmitButtonLabel(loading)}
                        </Button>
                    </form>

                    {/* <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            data-testid="google-login-button"
                            onClick={handleGoogleLogin}
                            variant="outline"
                            className="w-full mt-4"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign in with Google
                        </Button>
                    </div> */}

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            data-testid="toggle-auth-mode"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-gray-600 hover:text-gray-900"
                            disabled={loading}
                        >
                            {isLogin
                                ? "Don't have an account? Sign up"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
