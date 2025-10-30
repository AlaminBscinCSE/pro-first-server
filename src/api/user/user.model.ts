
import { Schema, model } from "mongoose";
import { IUser } from "./user.interface";


const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { type: String, default: "user" },
        createdAt: { type: Date, default: Date.now },
        lastLogin: { type: Date, default: Date.now },
    },
    {
        versionKey: false,
        timestamps: false
    }
);

export const User = model<IUser>("User", userSchema);
