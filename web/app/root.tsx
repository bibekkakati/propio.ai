import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    type MetaArgs,
    type MetaFunction,
} from "react-router";
import type { Route } from "./+types/root";
import ScreenLoader from "./components/screenloader";
import { AuthProvider } from "./contexts/auth.context";
import "./index.css";
import useMetaTags from "./lib/meta";
dayjs.extend(advancedFormat);

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000, // 30s
            refetchOnWindowFocus: false,
            retry: 0,
        },
    },
});

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({});
};

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link
                    rel="icon"
                    type="image/png"
                    href="/favicon/favicon-32x32.png"
                    sizes="32x32"
                />
                <link
                    rel="icon"
                    type="image/svg+xml"
                    href="/favicon/favicon.svg"
                />
                <link rel="shortcut icon" href="/favicon/favicon.ico" />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/favicon/apple-touch-icon.png"
                />
                <meta name="apple-mobile-web-app-title" content="Propio" />
                <link rel="manifest" href="/site.webmanifest" />

                <link
                    rel="preload"
                    href="/assets/logo-x.png"
                    as="image"
                    type="image/png"
                />
                <link
                    rel="preload"
                    href="/assets/logo-light.png"
                    as="image"
                    type="image/png"
                />
                <link
                    rel="preload"
                    href="/assets/logo-dark.png"
                    as="image"
                    type="image/png"
                />

                <Meta />
                <Links />
            </head>
            <body className="w-screen">
                {children}
                <Toaster position="top-center" theme="light" />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export function HydrateFallback() {
    return <ScreenLoader />;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
