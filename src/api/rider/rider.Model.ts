import { model, Schema } from "mongoose";
import { IRider } from "./rider.Interface";

const RiderSchema: Schema = new Schema<IRider>({
    name: { type: String, required: true },
    age: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    uid: { type: String, required: true, unique: true },
    nid: { type: String, required: true },
    contact: { type: String, required: true },
    bikeModel: { type: String, required: true },
    region: { type: String, required: true },
    warehouse: { type: String, required: true },
    application_at: { type: Date, default: Date.now },
    application_status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    work_status: { type: String, default: "idle" },
    approveDate: { type: Date, default: null }, // ✅ Track when approved
    rejectDate: { type: Date, default: null },  // ✅ Track when rejected
    isActive: { type: Boolean, default: false },
}, {
    versionKey: false,
    timestamps: false
});

export const Rider = model<IRider>("Rider", RiderSchema);
