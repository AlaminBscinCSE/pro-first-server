
import { Request, Response, NextFunction } from "express";
import { User } from "../api/user/user.model";


export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const firebaseUser = (req as any).user;
        if (!firebaseUser?.email) {
            return res.status(401).json({ message: "Unauthorized: No user email found" });
        }

        // ✅ Find user in MongoDB
        const user = await User.findOne({ email: firebaseUser.email }).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Admin only" });
        }

        next();
    } catch {
        return res.status(500).json({ message: "Something went wrong with role verification" });
    }
};
