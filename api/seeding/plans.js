require("dotenv").config();
const PlanService = require("../services/plan.service");
const mongoconnect = require("../utils/mongoconnect");

const adminUserId = "";

const createPlan = async () => {
    return await PlanService.createPlan("Pro", "PROV1", adminUserId);
};

const updatePlan = async (planId) => {
    await PlanService.updatePlan(
        planId,
        {
            pricing: {
                inr: {
                    monthly: 2499,
                    yearly: 23988,
                },
                usd: {
                    monthly: 89,
                    yearly: 828,
                },
            },
            modules: {
                bookings: true,
                earnings: true,
                expenses: true,
                reports: true,
                vault: true,
                staffs: true,
                tasks: true,
                leads: true,
                userAccess: true,
            },
            usageLimits: {
                properties: -1,
                units: 20,
                userSeats: 5,
                smartScansPerMonth: 3000,
                aiCreditsPerMonth: 40000,
            },
            features: {
                bookingPage: true,
                whatsappIntegration: false,
                pmsIntegration: false,
                customBranding: false,
                auditTrails: false,
                notifications: {
                    inapp: true,
                    whatsapp: false,
                    email: true,
                    sms: false,
                    custom: false,
                },
                support: {
                    ticket: true,
                    chat: true,
                    priority: false,
                },
            },
            isActive: true,
        },
        adminUserId,
    );
};

const run = async () => {
    mongoconnect();

    const { _id } = await createPlan();

    await updatePlan(_id);
};

run();
