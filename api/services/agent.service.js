const OcrAgent = require("../agents/ocr.agent");
const { Agents, AgentTaskStatus, DocumentTypes } = require("../constants/enum");
const AgentLog = require("../models/AgentLog");
const AgentTask = require("../models/AgentTask");
const { ValidationError, AppError } = require("../utils/error.util");
const AttachmentService = require("./attachment.service");
const PropertyService = require("./property.service");

// Separate OCR agent function for background processing
const asyncOcrAgentProcess = async ({ taskId, fileurl, mimeType }, fn) => {
    // Update task status to PROCESSING
    const task = await AgentTask.findByIdAndUpdate(
        taskId,
        {
            status: AgentTaskStatus.PROCESSING,
        },
        {
            runValidators: true,
            new: true,
            projection: "_id",
        },
    );

    // Log the start of OCR processing
    await new AgentLog({
        agentTaskId: taskId,
        message: "Started OCR processing",
    }).save();

    // Record the start time to calculate processing duration later
    const startTimeMs = Date.now();
    let tokensConsumed = 0;

    try {
        // Call the provided OCR function (e.g., parseExpenseReceipt or parseBookingReceipt)
        const ocrResult = await fn(fileurl, mimeType);
        tokensConsumed += Number(ocrResult.tokensConsumed);

        const { result, error } = ocrResult;
        if (error) {
            throw new AppError(error);
        }

        // Update the task with the OCR result and mark it as COMPLETED
        await task.updateOne(
            {
                output: result,
                tokensConsumed: tokensConsumed,
                status: AgentTaskStatus.COMPLETED,
                processingTimeMs: Date.now() - startTimeMs,
            },
            { runValidators: true },
        );

        // Log the completion of OCR processing along with tokens consumed and processing time
        await new AgentLog({
            agentTaskId: taskId,
            message: "Completed OCR processing",
            meta: {
                tokensConsumed,
            },
        }).save();
    } catch (error) {
        // Update the task to mark it as FAILED in case of any errors during OCR processing
        await task.updateOne({
            tokensConsumed: tokensConsumed,
            status: AgentTaskStatus.FAILED,
            error: error.message || "Scanning failed with unknown error",
            processingTimeMs: Date.now() - startTimeMs,
        });

        // Log the failure of OCR processing along with error details, tokens consumed, and processing time
        await new AgentLog({
            agentTaskId: taskId,
            message: "OCR processing failed",
            meta: {
                tokensConsumed,
            },
        }).save();

        console.error(error);
    }
};

const getTaskDetails = async (taskId) => {
    const task = await AgentTask.findOne(
        { _id: taskId },
        {
            propertyId: 1,
            output: 1,
            status: 1,
            error: 1,
        },
    ).lean();

    return task;
};

const scanExpenseDocument = async (attachmentId, propertyId, userId) => {
    if (!attachmentId || !userId) {
        throw new ValidationError("Required arguments are missing");
    }

    // Validate property access
    await PropertyService.hasPropertyAccess(propertyId, userId);

    const task = await new AgentTask({
        userId: userId,
        propertyId: propertyId,
        agentName: Agents.EXPENSE_OCRAGENT,
        input: {
            attachmentId,
        },
    }).save();

    const { url, mimetype } = await AttachmentService.getAttachmentURL(
        attachmentId,
        userId,
    );

    // Start the background work
    asyncOcrAgentProcess(
        { taskId: task._id, fileurl: url, mimeType: mimetype },
        OcrAgent.parseExpenseReceipt,
    );

    // Return the task ID immediately
    return task._id;
};

const scanBookingDocument = async (attachmentId, propertyId, userId) => {
    if (!attachmentId || !userId) {
        throw new ValidationError("Required arguments are missing");
    }

    // Validate property access
    await PropertyService.hasPropertyAccess(propertyId, userId);

    const task = await new AgentTask({
        userId: userId,
        propertyId: propertyId,
        agentName: Agents.BOOKING_OCRAGENT,
        input: {
            attachmentId,
        },
    }).save();

    const { url, mimetype } = await AttachmentService.getAttachmentURL(
        attachmentId,
        userId,
    );

    // Start the background work
    asyncOcrAgentProcess(
        { taskId: task._id, fileurl: url, mimeType: mimetype },
        OcrAgent.parseBookingReceipt,
    );

    // Return the task ID immediately
    return task._id;
};

const AgentService = Object.freeze({
    getTaskDetails,
    scanExpenseDocument,
    scanBookingDocument,
});

module.exports = AgentService;
