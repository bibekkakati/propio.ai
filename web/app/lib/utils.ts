import type { ClassValue } from "class-variance-authority/types";
import { clsx } from "clsx";
import type { ChangeEvent } from "react";
import { twMerge } from "tailwind-merge";
import XLSX from "xlsx";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function handleNumberInput(
    e: ChangeEvent<HTMLInputElement>,
    allowDecimal = true,
): string {
    let inputValue = e.target.value;

    if (inputValue === "" || inputValue === "-") {
        return "";
    }

    // Strip duplicate trailing decimal point (e.g. "1.5." → "1.5")
    if (
        allowDecimal &&
        inputValue.endsWith(".") &&
        inputValue.indexOf(".") !== inputValue.length - 1
    ) {
        inputValue = inputValue.slice(0, -1);
    }

    // Allow intermediate decimal states like "1." or "1.0"
    const decimalInProgress = allowDecimal && /^\d*\.\d*$/.test(inputValue);

    const v = Number(inputValue);

    if (isNaN(v)) {
        return "";
    }

    const absValue = Math.abs(v);

    if (!allowDecimal) {
        return Math.floor(absValue).toString();
    }

    // Preserve the raw input if it's a valid partial decimal (e.g. "1.", "1.50")
    if (decimalInProgress) {
        return inputValue.startsWith("-") ? inputValue.slice(1) : inputValue;
    }

    return absValue.toString();
}

export function setAuthToken(token: string) {
    window.localStorage.setItem("x-a-token", token);
}

export function getAuthToken(): string {
    return window.localStorage.getItem("x-a-token") || "";
}

export function removeAuthToken() {
    window.localStorage.removeItem("x-a-token");
}

export function setOrganizationId(organizationId: string) {
    window.sessionStorage.setItem("x-organization-id", organizationId);
}

export function getOrganizationId(): string {
    return window.sessionStorage.getItem("x-organization-id") || "";
}

export function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (typeof email !== "string") return false;

    return emailRegex.test(email.trim());
}

export function convertToCSV(rows = []) {
    if (!rows || !rows.length) return "";

    const headers = Object.keys(rows[0]);

    const csv = [
        headers.join(","), // header row
        ...rows.map((row) =>
            headers
                .map((field) => {
                    let val = row[field];

                    if (val === null || val === undefined) return "";

                    // escape quotes
                    if (typeof val === "string") {
                        val = val.replace(/"/g, '""');
                        return `"${val}"`;
                    }

                    return val;
                })
                .join(","),
        ),
    ].join("\n");

    return csv;
}

export function generateAndDownloadExcel(jsonSheets = [], filename) {
    const workbook = XLSX.utils.book_new();

    jsonSheets.forEach((js) => {
        XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.json_to_sheet(js.rows),
            js.name,
        );
    });

    XLSX.writeFile(workbook, filename);
}
