const AttachmentService = require("../services/attachment.service");
const EarningService = require("../services/earning.service");
const { SuccessResponse } = require("../utils/response.util");

module.exports = {
    addEarning: async (req, res) => {
        const { userId } = req.user;
        const {
            propertyId,
            recordDate,
            earningSource,
            tdsValue,
            tcsValue,
            grossAmount,
            note,
            attachmentIds,
        } = req.body;

        const id = await EarningService.upsertEarning(
            {
                propertyId,
                recordDate: new Date(recordDate).getTime(),
                earningSource,
                tdsValue,
                tcsValue,
                grossAmount,
                note,
                attachmentIds,
            },
            userId,
        );

        return SuccessResponse(res, {
            data: id,
        });
    },
    updateEarning: async (req, res) => {
        const { userId } = req.user;
        const {
            earningId,
            propertyId,
            recordDate,
            earningSource,
            tdsValue,
            tcsValue,
            grossAmount,
            note,
            attachmentIds,
        } = req.body;

        const id = await EarningService.upsertEarning(
            {
                earningId,
                propertyId,
                recordDate: new Date(recordDate).getTime(),
                earningSource,
                tdsValue,
                tcsValue,
                grossAmount,
                note,
                attachmentIds,
            },
            userId,
        );

        return SuccessResponse(res, {
            data: id,
        });
    },
    deleteEarning: async (req, res) => {
        const { userId } = req.user;
        const { eid: earningId, pid: propertyId } = req.query;

        await EarningService.deleteEarning(earningId, propertyId, userId);

        return SuccessResponse(res, {
            data: earningId,
        });
    },
    getEarningDetails: async (req, res) => {
        const { userId } = req.user;
        const { eid: earningId, pid: propertyId } = req.query;

        const earning = await EarningService.getEarningDetails(
            earningId,
            propertyId,
            userId,
        );

        if (!earning) {
            throw new NotFoundError("Earning not found!");
        }

        if (earning.attachments?.length) {
            const attachments =
                await AttachmentService.fetchMultipleAttachments(
                    earning.attachments,
                );
            earning.attachments = attachments;
        }

        return SuccessResponse(res, {
            data: earning,
        });
    },
    getEarningsByProperty: async (req, res) => {
        const { userId } = req.user;
        const { pid: propertyId, m, y } = req.query;

        const month = parseInt(m);
        if (isNaN(month) || month < 1 || month > 12) {
            throw new ValidationError("Select a valid month");
        }

        const year = parseInt(y);
        if (isNaN(year)) {
            throw new ValidationError("Select a valid year");
        }

        const from = new Date(year, month - 1, 1).getTime();
        const to = new Date(year, month, 1).getTime() - 1;

        const earnings = await EarningService.getEarningsByProperty(
            propertyId,
            userId,
            {
                recordDateFrom: from,
                recordDateTo: to,
            },
        );

        return SuccessResponse(res, {
            data: earnings,
        });
    },
};
