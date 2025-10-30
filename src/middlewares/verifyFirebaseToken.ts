import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided or something went wrong" });
        }

        const token = authHeader.split(" ")[1];

        // 🔥 Verify the token using Firebase Admin
        const decodedUser = await admin.auth().verifyIdToken(token);

        // Attach the decoded user to the request object
        (req as any).user = decodedUser;

        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};
