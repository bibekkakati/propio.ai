const mongoose = require("mongoose");

const agentLogSchema = new mongoose.Schema(
    {
        agentTaskId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "AgentTask",
            index: true,
        },
        message: {
            type: String,
            required: true,
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("AgentLog", agentLogSchema);
