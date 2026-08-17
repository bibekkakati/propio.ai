const fs = require("fs");
const path = require("path");
const { MailClient } = require("../infrastructure/mail.client");

const TEMPLATE_DIR = path.join(__dirname, "../templates");

// Simple in-memory cache
const templateCache = new Map();

/**
 * Load template by key name
 * @param {string} key - Template file name without extension (.html)
 * @returns {Promise<string>}
 */
const loadTemplate = async (key) => {
    if (!key) {
        throw new Error("Template key is required");
    }

    // Return cached version if available
    if (templateCache.has(key)) {
        return templateCache.get(key);
    }

    const filePath = path.join(TEMPLATE_DIR, `${key}.html`);

    try {
        const template = await fs.promises.readFile(filePath, "utf8");

        // Cache it
        templateCache.set(key, template);

        return template;
    } catch (err) {
        throw new Error(`Email template "${key}" not found`);
    }
};

/**
 * It loads the email template and inject the {{variables}} to prepare email body
 * @param {string} key - Template file name without extension (.html)
 * @param {Object} data
 * @returns {Promise<string>}
 */
const getEmailBody = async (key, data = {}) => {
    const template = await loadTemplate(key);

    return template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
        const value = key.split(".").reduce((acc, part) => acc?.[part], data);

        if (value === undefined || value === null) {
            console.warn(`Missing value for template variable: ${key}`);
            return "";
        }

        return String(value);
    });
};

/**
 * Sends an email.
 * In non-production environments, logs email details to console instead of sending.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The email subject line.
 * @param {string} body - The HTML body content of the email.
 * @returns {Promise<void>} A Promise that resolves when the email is sent or logged.
 */
const sendEmail = async (to, subject, body) => {
    try {
        if (process.env.NODE_ENV !== "production") {
            console.log(`Mail Triggered: ${to} | ${subject}`);
            return;
        }

        const { data, error } = await MailClient.send({
            to, subject, body
        });

        if (error) {
            console.log("Mail error: ", error.message);
            return;
        }
        console.log("Mail sent: ", data);
    } catch (error) {
        console.log("Mail error: ", error.message);
    }
};

module.exports = {
    getEmailBody,
    sendEmail,
};
