import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { User } from "./user.model";

/**
 * @desc    Create a new user or update last login if already exists
 * @route   POST /api/user
 * @access  Public
 */
const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, role } = req.body;

        // ❌ Validate email
        if (!email) {
            errorResponse(res, "Email is required", 400);
            return;
        }

        // ✅ Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // 🔄 Update last login timestamp
            existingUser.lastLogin = new Date();
            await existingUser.save();

            successResponse(
                res,
                "User already exists — last login updated",
                existingUser,
                200
            );
            return;
        }

        // ✅ Create a new user
        const newUser = await User.create({
            name,
            email,
            role: role || "user",
            createdAt: new Date(),
            lastLogin: new Date(),
        });

        successResponse(res, "New user created successfully", newUser, 201);
    } catch (error: unknown) {
        // ❌ Error handling
        if (error instanceof Error) {
            errorResponse(res, error.message, 500);
            return;
        }
        errorResponse(res, "Unexpected server error", 500);
    }
};

/**
 * @desc    Search users by name or email (max 10 results)
 * @route   GET /api/user/search?search=<query>
 * @access  Private (admin/staff)
 */
const searchUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const search = (req.query.search as string)?.trim();

        if (!search) {
            errorResponse(res, "Search query is required", 400);
            return;
        }

        // 🔍 Find users matching name or email (case-insensitive)
        const users = await User.find({
            $or: [
                { email: { $regex: search, $options: "i" } }, // regex match on email
                { name: { $regex: search, $options: "i" } },  // regex match on name
            ],
        })
            .limit(10) // ❌ Limit results to 10
            .sort({ createdAt: -1 }); // 🔄 Newest users first

        successResponse(res, "Users fetched successfully", users);
    } catch (error: any) {
        errorResponse(res, `Failed to search users ${error?.message}`, 500);
    }
};

/**
 * @desc    Promote a user to admin
 * @route   PATCH /api/user/make-admin/:id
 * @access  Private (admin)
 */
const makeAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role: "admin" },
            { new: true } // 🔄 Return updated document
        );

        if (!updatedUser) {
            errorResponse(res, "User not found", 404);
            return;
        }

        successResponse(res, "User promoted to admin successfully ✅", updatedUser);
    } catch {
        errorResponse(res, "Failed to update user role", 500);
    }
};

/**
 * @desc    Remove admin role from a user
 * @route   PATCH /api/user/remove-admin/:id
 * @access  Private (admin)
 */
const removeAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role: "user" },
            { new: true }
        );

        if (!updatedUser) {
            errorResponse(res, "User not found", 404);
            return;
        }

        successResponse(res, "Admin role removed successfully ✅", updatedUser);
    } catch {
        errorResponse(res, "Failed to update user role", 500);
    }
};

// ✅ Get user role by email
const getUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.query.email as string;

        if (!email) {
            errorResponse(res, "Email is required", 400);
            return
        }

        const user = await User.findOne({ email });

        if (!user) {
            errorResponse(res, "User not found", 404);
            return
        }

        successResponse(res, "User role fetched successfully", {
            role: user.role,
        });
    } catch (error:any) {
        errorResponse(res, `Server Error"${error?.message}`, 500);
    }
};


// ✅ Export all user-related controllers
export const userController = {
    createUser,
    searchUser,
    makeAdmin,
    removeAdmin,
    getUserRole,
};
