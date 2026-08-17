/**
 * @param {string} word - Capitalizes the first letter of each word in a string.
 */
module.exports.capitalizeWord = (word) =>
    word?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
