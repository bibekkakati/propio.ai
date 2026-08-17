import { getAuthToken, getOrganizationId } from "@/lib/utils";

const baseURL = process.env.VITE_API_BASE_URL;

// Global logout handler that will be set by AuthContext
let globalLogoutHandler: (() => void) | null = null;

export function setLogoutHandler(handler: () => void) {
    globalLogoutHandler = handler;
}

const request = async (
    method: string,
    url: string,
    data: any = null,
    options: any = {},
) => {
    let headers: Record<string, string> = {};

    const token = getAuthToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    headers["x-organization-id"] = getOrganizationId();

    // Set Content-Type based on data
    if (data instanceof FormData) {
        // Do NOT set Content-Type (browser adds boundary)
    } else if (data instanceof Blob) {
        headers["Content-Type"] = data.type || "application/octet-stream";
    } else if (typeof data === "string") {
        headers["Content-Type"] = "text/plain";
    } else if (data !== null && data !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    // Merge custom headers
    if (options?.headers) {
        headers = {
            ...headers,
            ...options.headers,
        };
        delete options.headers;
    }

    let config: any = {
        method,
        credentials: "include",
        headers,
    };

    if (options) {
        config = {
            ...config,
            ...options,
        };
    }

    // Body handling
    if (data !== null && data !== undefined) {
        config.body =
            headers["Content-Type"] === "application/json"
                ? JSON.stringify(data)
                : data;
    }

    const requestUrl = baseURL + url;
    const response = await fetch(requestUrl, config);
    const contentType = response.headers.get("content-type");

    const responseData = await (contentType?.includes("application/json")
        ? response.json()
        : response.text());

    if (response.status === 401) {
        // Call global logout handler
        if (globalLogoutHandler) {
            globalLogoutHandler();
        }

        throw "Unauthorized";
    }

    if (!responseData?.success) {
        throw new Error(
            responseData.error ||
                responseData.message ||
                "Something went wrong!",
        );
    }

    return typeof responseData === "string" ? responseData : responseData.data;
};

// API Wrapper
const API = {
    get: (url: string, options = {}) => request("GET", url, null, options),
    post: (url: string, data?: any, options = {}) =>
        request("POST", url, data, options),
    put: (url: string, data?: any, options = {}) =>
        request("PUT", url, data, options),
    patch: (url: string, data?: any, options = {}) =>
        request("PATCH", url, data, options),
    delete: (url: string, options = {}) =>
        request("DELETE", url, null, options),
};

export default API;
