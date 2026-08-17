const PropertyService = require("../services/property.service");
const SummaryService = require("../services/summary.service");
const { NotFoundError } = require("../utils/error.util");
const { SuccessResponse } = require("../utils/response.util");

module.exports = {
    getPropertyCount: async (req, res) => {
        const { userId } = req.user;

        const count = await PropertyService.getPropertyCount(userId);

        return SuccessResponse(res, {
            data: count,
        });
    },
    getProperties: async (req, res) => {
        const { userId } = req.user;

        const properties = await PropertyService.getPropertiesByUser(userId);

        return SuccessResponse(res, {
            data: properties,
        });
    },
    getProperty: async (req, res) => {
        const { userId } = req.user;
        const { pid: propertyId } = req.query;

        const property = await PropertyService.getPropertyDetails(
            propertyId,
            userId,
        );

        if (!property) {
            throw new NotFoundError("Property not found!");
        }

        return SuccessResponse(res, {
            data: property,
        });
    },
    getPropertyUnits: async (req, res) => {
        const { userId } = req.user;
        const { pid: propertyId } = req.query;

        const units = await PropertyService.getUnitsByProperty(
            propertyId,
            userId,
        );

        return SuccessResponse(res, {
            data: units,
        });
    },
    getPropertyUnit: async (req, res) => {
        const { userId } = req.user;
        const { pid: propertyId, uid: unitId } = req.query;

        const unit = await PropertyService.getPropertyUnit(
            propertyId,
            unitId,
            userId,
        );

        if (!unit) {
            throw new NotFoundError("Property unit not found!");
        }

        return SuccessResponse(res, {
            data: unit,
        });
    },
    addProperty: async (req, res) => {
        const { userId, organizationId } = req.user;
        const { name, city, state, country, role, type } = req.body;

        const property = await PropertyService.upsertProperty(
            {
                organizationId,
                propertyId: null,
                name,
                city,
                state,
                country,
                role,
                type,
            },
            userId,
        );

        return SuccessResponse(res, {
            data: property,
            message: "Property added",
        });
    },
    updateProperty: async (req, res) => {
        const { userId, organizationId } = req.user;
        const { propertyId, name, city, state, country, role, type } = req.body;

        const property = await PropertyService.upsertProperty(
            {
                organizationId,
                propertyId,
                name,
                city,
                state,
                country,
                role,
                type,
            },
            userId,
        );

        return SuccessResponse(res, {
            data: property,
            message: "Property details updated",
        });
    },
    addPropertyUnit: async (req, res) => {
        const { userId } = req.user;
        const { propertyId, name, type, maxOccupancy, ratePerNight, note } =
            req.body;

        const unit = await PropertyService.upsertPropertyUnit(
            {
                propertyId,
                unitId: null,
                name,
                type,
                maxOccupancy,
                ratePerNight,
                note,
            },
            userId,
        );

        return SuccessResponse(res, {
            data: unit,
            message: "Property unit added",
        });
    },
    updatePropertyUnit: async (req, res) => {
        const { userId } = req.user;
        const {
            unitId,
            propertyId,
            name,
            type,
            maxOccupancy,
            ratePerNight,
            note,
        } = req.body;

        const unit = await PropertyService.upsertPropertyUnit(
            {
                propertyId,
                unitId,
                name,
                type,
                maxOccupancy,
                ratePerNight,
                note,
            },
            userId,
        );

        return SuccessResponse(res, {
            data: unit,
            message: "Property unit details updated",
        });
    },
    updatePropertyUnitStatus: async (req, res) => {
        const { userId } = req.user;
        const { unitId, propertyId, flag } = req.body;

        await PropertyService.togglePropertyUnitStatus(
            unitId,
            propertyId,
            flag,
            userId,
        );

        return SuccessResponse(res, {
            message: "Property unit status updated",
        });
    },
    getMonthlyReport: async (req, res) => {
        const { userId } = req.user;
        let { pids, m, y, fullreport } = req.query;

        pids = pids.split(",");

        fullreport = Boolean(fullreport);

        if (!pids?.length) {
            throw new ValidationError("Select a property to fetch stats.");
        }

        const month = parseInt(m);
        if (isNaN(month) || month < 1 || month > 12) {
            throw new ValidationError("Select a valid month");
        }

        const year = parseInt(y);
        if (isNaN(year)) {
            throw new ValidationError("Select a valid year");
        }

        const propertySummaries = await Promise.all(
            pids.map((pid) =>
                SummaryService.getMonthlySummary(pid, year, month, userId),
            ),
        );

        const reports = propertySummaries.reduce(
            (acc, curr) => {
                // primitive totals
                acc.totalBookingsCount += curr.totalBookingsCount || 0;
                acc.totalBookingsValue += curr.totalBookingsValue || 0;
                acc.totalEarnings += curr.totalEarnings || 0;
                acc.netEarnings += curr.netEarnings || 0;
                acc.totalExpenses += curr.totalExpenses || 0;

                // helper to merge nested objects
                const mergeMap = (target, source) => {
                    for (const key in source) {
                        target[key] = (target[key] || 0) + source[key];
                    }
                };

                mergeMap(
                    acc.bookingsCountBySource,
                    curr.bookingsCountBySource || {},
                );
                mergeMap(
                    acc.bookingsValueBySource,
                    curr.bookingsValueBySource || {},
                );
                mergeMap(acc.earningsBySource, curr.earningsBySource || {});
                mergeMap(acc.expensesByCategory, curr.expensesByCategory || {});

                return acc;
            },
            {
                bookingsCountBySource: {},
                bookingsValueBySource: {},
                earningsBySource: {},
                expensesByCategory: {},

                totalBookingsCount: 0,
                totalBookingsValue: 0,
                totalEarnings: 0,
                netEarnings: 0,
                totalExpenses: 0,
            },
        );

        reports.netProfit = reports.totalEarnings - reports.totalExpenses;

        reports.earningsBySource = Object.entries(reports.earningsBySource).map(
            ([source, amount]) => {
                const percentage = (amount / reports.totalEarnings) * 100;
                return { source, amount, percentage: Math.round(percentage) };
            },
        );

        reports.expensesByCategory = Object.entries(
            reports.expensesByCategory,
        ).map(([category, amount]) => {
            const percentage = (amount / reports.totalExpenses) * 100;
            return { category, amount, percentage: Math.round(percentage) };
        });

        reports.bookingsBySource = Object.entries(
            reports.bookingsValueBySource,
        ).map(([source, amount]) => {
            const percentage = (amount / reports.totalBookingsValue) * 100;
            const count = reports.bookingsCountBySource[source];
            return {
                source,
                amount,
                percentage: Math.round(percentage),
                count,
            };
        });

        const data = { reports };

        if (fullreport) {
            // fetch property details
            const properties =
                await PropertyService.getPropertiesByUser(userId);

            // map id to name for easier extraction
            const propertyNameMap = {};
            properties.forEach((p) => {
                propertyNameMap[p._id] = p.name;
            });

            // process propertySummaries
            propertySummaries.forEach((s) => {
                const pname = propertyNameMap[s.propertyId];
                s.property_name = pname;

                s.netProfit = s.totalEarnings - s.totalExpenses;
                // Includes taxes deducted/collected for earnings/payouts
                s.withHoldingTax = s.totalEarnings - s.netEarnings;
            });

            data.propertySummaries = propertySummaries;
        }

        return SuccessResponse(res, {
            data,
        });
    },
};
