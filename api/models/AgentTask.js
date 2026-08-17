const mongoose = require("mongoose");
const { Agents, AgentTaskStatus } = require("../constants/enum");

const agentTaskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Property",
        },
        agentName: {
            type: String,
            required: true,
            enum: Object.values(Agents),
        },
        input: { type: mongoose.Schema.Types.Mixed },
        output: { type: mongoose.Schema.Types.Mixed },
        tokensConsumed: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: Object.values(AgentTaskStatus),
            default: AgentTaskStatus.PENDING,
        },
        error: {
            type: String,
        },
        processingTimeMs: {
            type: Number,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("AgentTask", agentTaskSchema);
