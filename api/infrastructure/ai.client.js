const { GoogleGenAI, ApiError } = require("@google/genai");
const { sleep } = require("../utils/common.util");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const generateContent = async (models, config, contents) => {
    const delayMs = 1000 * 2;
    const maxRetryPerModel = 2;

    if (!models || models.length === 0) throw new Error("Model not found");

    for (const model of models) {
        for (let attempt = 1; attempt <= maxRetryPerModel; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    config,
                    contents,
                });

                if (response.text) return response;
            } catch (error) {
                console.error(`[${model}] Attempt ${attempt} failed:`, error.message);
                // Rate limit error
                if (error instanceof ApiError && error.code === 429) {
                    // break the current loop
                    // try next model
                    break;
                }

                if (attempt <= maxRetryPerModel) {
                    const waitTime = delayMs * Math.pow(2, attempt - 1);
                    console.log(`Retrying in ${waitTime}ms...`);
                    await sleep(waitTime);
                }
            }
        }
    }

    throw new Error(
        `Model API call error. Failed after ${maxRetryPerModel} attempts for provided models.`,
    );
};

const AI = {
    generateContent,
};

module.exports = AI;
