import { Types } from "mongoose";

export interface ITrackingHistory {
    status: "parcel_created" | "payment_completed" | "rider_assigned" | "in_transit" | "delivered";
    message: string;
    date: Date;
}

export interface IParcel {
    type: "document" | "non-document";
    title: string;
    weight?: number;

    senderName: string;
    senderContact: string;
    senderRegion: string;
    senderCenter: string;
    senderArea: string;
    pickupInstruction: string;

    receiverName: string;
    receiverContact: string;
    receiverRegion: string;
    receiverCenter: string;
    receiverArea: string;
    deliveryInstruction: string;

    create_By: string;
    payment_Status: "unpaid" | "paid";
    delivery_Status: "not_collected" | "rider_assigned" | "in_transit" | "delivered";

    tracking_Id: string;
    total_Cost: number;
    creation_date: string;

    assignedRider?: Types.ObjectId | null;

    cashOut_status: "pending" | "paid";
    cashOut_at: Date | null;

    picked_at: Date | null;
    delivered_at: Date | null;

    trackingHistory?: ITrackingHistory[];
}
