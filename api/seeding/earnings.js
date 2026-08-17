require("dotenv").config();
const EarningService = require("../services/earning.service");
const mongoconnect = require("../utils/mongoconnect");

// Importing it for emitter activation
require("../services/summary.service");

const earnings = [
    {
        record_date: "2025-11-05",
        earning_source: "Direct",
        gross_amount: 18500,
    },

    {
        record_date: "2025-11-10",
        earning_source: "Airbnb",
        gross_amount: 42000,
        tds_value: 420,
        gst_value: 756,
    },

    {
        record_date: "2025-11-11",
        earning_source: "OTA",
        gross_amount: 13500,
        tds_value: 135,
        gst_value: 243,
    },

    {
        record_date: "2025-11-15",
        earning_source: "Agent",
        gross_amount: 24000,
        tds_value: 240,
        gst_value: 432,
    },

    {
        record_date: "2025-11-15",
        earning_source: "Direct",
        gross_amount: 21000,
    },

    {
        record_date: "2025-11-22",
        earning_source: "Airbnb",
        gross_amount: 48000,
        tds_value: 480,
        gst_value: 864,
    },

    {
        record_date: "2025-11-23",
        earning_source: "OTA",
        gross_amount: 15000,
        tds_value: 150,
        gst_value: 270,
    },

    { record_date: "2025-11-24", earning_source: "Other", gross_amount: 25500 },

    {
        record_date: "2025-11-27",
        earning_source: "Direct",
        gross_amount: 19800,
    },

    {
        record_date: "2025-12-02",
        earning_source: "Agent",
        gross_amount: 36000,
        tds_value: 360,
        gst_value: 648,
    },

    {
        record_date: "2025-12-09",
        earning_source: "Airbnb",
        gross_amount: 26000,
        tds_value: 260,
        gst_value: 468,
    },

    {
        record_date: "2025-12-09",
        earning_source: "Direct",
        gross_amount: 31500,
    },

    {
        record_date: "2025-12-12",
        earning_source: "OTA",
        gross_amount: 12000,
        tds_value: 120,
        gst_value: 216,
    },

    {
        record_date: "2025-12-17",
        earning_source: "Agent",
        gross_amount: 44000,
        tds_value: 440,
        gst_value: 792,
    },

    {
        record_date: "2025-12-21",
        earning_source: "Airbnb",
        gross_amount: 28500,
        tds_value: 285,
        gst_value: 513,
    },

    {
        record_date: "2025-12-26",
        earning_source: "Direct",
        gross_amount: 62000,
    },

    {
        record_date: "2026-01-06",
        earning_source: "OTA",
        gross_amount: 72000,
        tds_value: 720,
        gst_value: 1296,
        note: "Year-end OTA settlement",
    },

    {
        record_date: "2026-01-06",
        earning_source: "Direct",
        gross_amount: 19500,
    },

    {
        record_date: "2026-01-15",
        earning_source: "Airbnb",
        gross_amount: 51000,
        tds_value: 510,
        gst_value: 918,
    },

    {
        record_date: "2026-01-14",
        earning_source: "Agent",
        gross_amount: 22500,
        tds_value: 225,
        gst_value: 405,
    },

    {
        record_date: "2026-01-18",
        earning_source: "OTA",
        gross_amount: 11000,
        tds_value: 110,
        gst_value: 198,
    },

    { record_date: "2026-01-22", earning_source: "Other", gross_amount: 33000 },

    {
        record_date: "2026-01-29",
        earning_source: "Direct",
        gross_amount: 26500,
    },

    {
        record_date: "2026-02-07",
        earning_source: "Airbnb",
        gross_amount: 45000,
        tds_value: 450,
        gst_value: 810,
    },

    {
        record_date: "2026-02-10",
        earning_source: "OTA",
        gross_amount: 21000,
        tds_value: 210,
        gst_value: 378,
    },

    {
        record_date: "2026-02-16",
        earning_source: "Agent",
        gross_amount: 34000,
        tds_value: 340,
        gst_value: 612,
    },

    {
        record_date: "2026-02-17",
        earning_source: "Direct",
        gross_amount: 27500,
    },

    {
        record_date: "2026-02-24",
        earning_source: "Airbnb",
        gross_amount: 52000,
        tds_value: 520,
        gst_value: 936,
    },
];

const propertyId_1 = "697bb97e087aba0e18518b60";
const propertyId_2 = "6987482267562a54ae6c2751";
const userId = "697b6743f2ad1986c6f2eac0";

const run = async () => {
    mongoconnect();

    for (let i = 0; i < earnings.length; i++) {
        const earning = earnings[i];

        console.log("Earning #", i + 1);

        await EarningService.upsertEarning(
            {
                property_id: propertyId_1,
                ...earning,
            },
            userId,
        );
    }
};

run();
