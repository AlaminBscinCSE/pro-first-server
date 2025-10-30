export interface IRider {
    name: string;
    age: string;
    email: string;
    uid: string;
    nid: string;
    contact: string;
    bikeModel: string;
    region: string;
    warehouse: string;
    application_at: Date;
    application_status: "pending" | "approved" | "rejected";
    work_status: string,
    approveDate?: Date | null;
    rejectDate?: Date | null;
    isActive: boolean;
}
