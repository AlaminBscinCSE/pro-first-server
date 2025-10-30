import { Request, Response, NextFunction } from "express";
import { User } from "../api/user/user.model";


export const verifyRider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const firebaseUser = (req as any).user;

        if (!firebaseUser?.email) {
            return res.status(401).json({ message: "Unauthorized: No user email found" });
        }

        // ✅ Check user existence in MongoDB
        const user = await User.findOne({ email: firebaseUser.email }).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }

        // ✅ Restrict access to riders only
        if (user.role !== "rider") {
            return res.status(403).json({ message: "Access denied: Rider only" });
        }

        next();
    } catch {
        return res.status(500).json({ message: "Role verification failed" });
    }
};
