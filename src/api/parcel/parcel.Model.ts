import mongoose, { Schema, Types } from "mongoose";
import { IParcel, ITrackingHistory } from "./parcel.Interface";

const TrackingHistorySchema = new Schema<ITrackingHistory>(
    {
        status: {
            type: String,
            enum: [
                "parcel_created",
                "payment_completed",
                "rider_assigned",
                "in_transit",
                "delivered"
            ],
            required: true
        },
        message: {
            type: String,
            required: [true, "Tracking message is required"],
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false ,versionKey:false,timestamps:false} // Do not create extra _id for each tracking entry
);

const ParcelSchema: Schema = new Schema<IParcel>(
    {
        type: {
            type: String,
            enum: ["document", "non-document"]
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true
        },
        weight: {
            type: Number,
            min: [0, "Weight cannot be negative"],
            max: [1000, "Weight seems too high"]
        },

        senderName: { type: String, required: true, trim: true },
        senderContact: {
            type: String,
            required: true,
            trim: true,
            match: [/^(?:\+8801|01)[3-9]\d{8}$/, "Invalid Bangladeshi phone number"]
        },
        senderRegion: { type: String, required: true, trim: true },
        senderCenter: { type: String, required: true, trim: true },
        senderArea: { type: String, required: true, trim: true },
        pickupInstruction: { type: String, required: true, trim: true },

        receiverName: { type: String, required: true, trim: true },
        receiverContact: {
            type: String,
            required: true,
            trim: true,
            match: [/^(?:\+8801|01)[3-9]\d{8}$/, "Invalid Bangladeshi phone number"]
        },
        receiverRegion: { type: String, required: true, trim: true },
        receiverCenter: { type: String, required: true, trim: true },
        receiverArea: { type: String, required: true, trim: true },
        deliveryInstruction: { type: String, required: true, trim: true },

        create_By: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"]
        },

        payment_Status: {
            type: String,
            enum: ["unpaid", "paid"],
            default: "unpaid"
        },
        delivery_Status: {
            type: String,
            enum: ["not_collected", "rider_assigned", "in_transit", "delivered"],
            default: "not_collected"
        },

        tracking_Id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        total_Cost: {
            type: Number,
            required: true,
            min: [0, "Total cost cannot be negative"]
        },

        creation_date: { type: String, required: true, trim: true },

        assignedRider: {
            type: Types.ObjectId,
            ref: "Rider",
            default: null
        },

        cashOut_status: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending"
        },
        cashOut_at: { type: Date, default: null },
        picked_at: { type: Date, default: null },
        delivered_at: { type: Date, default: null },

        // ✅ New Tracking History
        trackingHistory: {
            type: [TrackingHistorySchema],
            default: []
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Parcel = mongoose.model<IParcel>("Parcel", ParcelSchema);
export default Parcel;
