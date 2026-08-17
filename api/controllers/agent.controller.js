const { Modules } = require("../constants/enum");
const AgentService = require("../services/agent.service");
const DocumentStorageService = require("../services/documentstorage.service");
const PropertyService = require("../services/property.service");
const { ValidationError, AppError, NotFoundError } = require("../utils/error.util");
const { SuccessResponse } = require("../utils/response.util");

const getTaskDetails = async (req, res) => {
    const { userId } = req.user;
    const { tid: taskId } = req.query;

    if (!taskId) {
        throw new ValidationError("Task ID is required");
    }

    const task = await AgentService.getTaskDetails(taskId);

    if (!task) {
        throw new NotFoundError("No pending task found");
    }

    if (task.error) {
        throw new AppError(task.error, 400);
    }

    // Identity check
    await PropertyService.hasPropertyAccess(task.propertyId, userId);

    const data = {
        status: task.status,
        output: task.output,
    };

    return SuccessResponse(res, {
        data,
    });
};

const processOcrDocument = async (req, res) => {
    const { userId } = req.user;
    const { propertyId, attachmentId, module } = req.body;

    if (!attachmentId) {
        throw new ValidationError("Attachment ID is required");
    }

    let agentfn = null;

    if (module === Modules.EXPENSE) {
        agentfn = AgentService.scanExpenseDocument;
    } else if (module === Modules.BOOKING) {
        agentfn = AgentService.scanBookingDocument;
    }

    if (!agentfn) {
        throw new ValidationError("Module is invalid");
    }

    const taskId = await agentfn(attachmentId, propertyId, userId);

    return SuccessResponse(res, {
        data: { taskId },
    });
};

module.exports = {
    getTaskDetails,
    processOcrDocument,
};
