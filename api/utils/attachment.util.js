const path = require("path");
const fs = require("fs");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
);

const STORAGE_DIR = ".temp";

/**
 * Ensures the upload directory exists by creating it if necessary.
 * Creates parent directories recursively if they don't exist.
 *
 * @async
 * @returns {Promise<string>} The path to the storage directory
 * @throws {Error} If directory creation fails due to permissions or other filesystem errors
 */
const ensureUploadDir = async () => {
    await fs.promises.mkdir(STORAGE_DIR, { recursive: true });
    return STORAGE_DIR;
};

/**
 * Deletes a local file from the filesystem.
 * Silently fails if the file doesn't exist or cannot be deleted.
 *
 * @async
 * @param {string} filePath - The absolute or relative path to the file to delete
 * @returns {Promise<void>}
 */
const deleteLocalFile = async (filePath) => {
    await fs.promises.unlink(filePath).catch(() => { });
};

/**
 * Generates a unique filename with optional prefix and extension.
 *
 * @param {string} extension - File extension (with or without leading dot, e.g., "jpg" or ".jpg")
 * @param {string} [prefix=""] - Optional path prefix (leading slash and dots will be sanitized)
 * @returns {string} Generated filename in format: `prefix/nanoid+timestamp.extension`
 */
const generateFilename = (extension, prefix = "") => {
    const id = nanoid(16) + Date.now();

    prefix = prefix.replace(/^\//, "").replace(/\./g, "_");
    if (prefix && !prefix.endsWith("/")) prefix += "/";

    // Ensure extension starts with a dot
    extension = extension.startsWith(".") ? extension : `.${extension}`;

    return `${prefix}${id}${extension}`;
};

/**
 * Cleans up old files from the temporary storage directory.
 * Deletes files that are older than the specified maximum age based on their last modified time.
 * Runs silently and logs errors without throwing.
 *
 * @async
 * @param {number} [maxAgeHours=1] - Maximum age of files in hours before deletion (default: 1 hour)
 * @returns {Promise<void>}
 */
const cleanupLocalFiles = async (maxAgeHours = 1) => {
    try {
        const tempDir = path.resolve(STORAGE_DIR);
        const files = await fs.promises.readdir(tempDir);
        const now = Date.now();
        const maxAge = maxAgeHours * 60 * 60 * 1000;

        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = await fs.promises.stat(filePath);

            if (now - stats.mtimeMs > maxAge) {
                await deleteLocalFile(filePath);
            }
        }
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Cleanup Error:", error);
        }
    }
};

module.exports = {
    ensureUploadDir,
    deleteLocalFile,
    generateFilename,
    cleanupLocalFiles,
};
