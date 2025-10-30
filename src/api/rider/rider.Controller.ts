import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import { Rider } from "./rider.Model";
import { User } from "../user/user.model";

/**
 * @desc    Create a new rider application
 * @route   POST /api/rider
 * @access  Private (user must be authenticated)
 */
const createRider = async (req: Request, res: Response) => {
    try {
        const riderData = req.body;
        const uid = (req as any).user.uid; // ✅ Get user UID from JWT
        const jwtEmail = (req as any).user.email; // ✅ Get user Email from JWT

        // Ensure user email matches JWT
        if (jwtEmail !== riderData.email) {
            return errorResponse(
                res,
                "You have to enter your login email!",
                409
            );
        }

        // Check if a rider application already exists for this user
        const existingRider = await Rider.findOne({ uid });
        if (existingRider) {
            return errorResponse(
                res,
                "You already have an active application with this account.",
                409
            );
        }

        // Create new rider application in the database
        const newRider = await Rider.create({
            ...riderData,
            uid,
        });

        // Return success response
        return successResponse(
            res,
            "Rider application submitted successfully!",
            newRider,
            201
        );
    } catch (error) {
        console.error("❌ Error creating rider:", error);
        return errorResponse(res, "Failed to create rider application");
    }
};

/**
 * @desc    Get all pending rider applications
 * @route   GET /api/rider/pending
 * @access  Private (admin or staff)
 */
const getPendingRiders = async (req: Request, res: Response) => {
    try {
        // Fetch all riders with "pending" status, sorted by newest first
        const pendingRiders = await Rider.find({ application_status: "pending" }).sort({
            application_at: -1,
        });

        if (!pendingRiders.length) {
            return errorResponse(res, "No pending rider applications found", 404);
        }

        // Return pending riders
        return successResponse(
            res,
            "Pending rider applications retrieved successfully",
            pendingRiders
        );
    } catch (error) {
        console.error("❌ Error fetching pending riders:", error);
        return errorResponse(res, "Failed to fetch pending rider applications");
    }
};

/**
 * @desc    Update rider application status (approve or reject)
 * @route   PATCH /api/rider/status/:id
 * @access  Private (admin or staff)
 */
const updateRiderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, email } = req.body;

        // Validate status
        if (!["approved", "rejected"].includes(status)) {
            return errorResponse(res, "Invalid status value", 400);
        }

        // Prepare update object
        const updateData: Partial<{ application_status: string; approveDate: Date; rejectDate: Date; isActive: boolean; }> = {
            application_status: status,
        };

        if (status === "approved") {
            // Update user role to rider
            await User.findOneAndUpdate({ email }, { role: "rider" }, { new: true });
            updateData.approveDate = new Date();
            updateData.isActive = true;
        }

        if (status === "rejected") {
            updateData.rejectDate = new Date();
            updateData.isActive = false;
        }

        // Update rider in DB
        const rider = await Rider.findByIdAndUpdate(id, updateData, { new: true });

        if (!rider) {
            return errorResponse(res, "Rider not found", 404);
        }

        // Return updated rider
        return successResponse(res, `Rider ${status} successfully`, rider);
    } catch (error) {
        console.error("❌ Error updating rider status:", error);
        return errorResponse(res, "Failed to update rider status");
    }
};

/**
 * @desc    Get all approved riders
 * @route   GET /api/rider/approved
 * @access  Private (admin/staff)
 */
const getApprovedRiders = async (req: Request, res: Response) => {
    try {
        // Find riders with application_status = "approved"
        const approvedRiders = await Rider.find({ application_status: "approved" })
            .sort({ approveDate: -1 }); // latest approved first

        if (!approvedRiders.length) {
            return errorResponse(res, "No approved riders found", 404);
        }

        // Return success response
        return successResponse(
            res,
            "Approved riders retrieved successfully",
            approvedRiders
        );
    } catch (error) {
        console.error("❌ Error fetching approved riders:", error);
        return errorResponse(res, "Failed to fetch approved riders");
    }
};
/**
 * @desc    Get single approved rider
 * @route   GET /api/rider/approved/email
 */
const getApproveRiderByEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const rider = await Rider.findOne({
            email,
            application_status: "approved"
        });

        if (!rider) {
            return res.status(404).json({
                success: false,
                message: "Rider not found or not approved",
            });
        }

        res.status(200).json({
            success: true,
            data: rider,
        });
    } catch (error) {
        console.error("Error fetching rider:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
/**
 * @desc    Toggle rider active status
 * @route   PATCH /api/rider/active/:id
 * @access  Private (admin/staff)
 */
const updateRiderActiveStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Validate isActive
        if (typeof isActive !== "boolean") {
            return errorResponse(res, "Invalid isActive value", 400);
        }

        // Update rider's active status
        const rider = await Rider.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!rider) {
            return errorResponse(res, "Rider not found", 404);
        }

        const message = isActive
            ? "Rider activated successfully"
            : "Rider deactivated successfully";

        return successResponse(res, message, rider);
    } catch (error) {
        console.error("❌ Error updating rider active status:", error);
        return errorResponse(res, "Failed to update rider active status");
    }
};

/**
 * @desc    Get all available riders in a specific region
 * @route   GET /riders/available?region=RegionName
 * @access  Private (admin/staff)
 */
const getAvailableRiders = async (req: Request, res: Response) => {
    try {
        const region = req.query.region as string;

        // Validate region
        if (!region) {
            return errorResponse(res, "Region query parameter is required", 400);
        }

        // Find riders that are active, idle, and approved
        const riders = await Rider.find({
            region: { $regex: new RegExp(`^${region}$`, "i") }, // case-insensitive exact match
            isActive: true,
            work_status: { $regex: /^idle$/i },
            application_status: { $regex: /^approved$/i },
        });

        // No available riders
        if (riders.length === 0) {
            successResponse(res, "No available riders found", [], 200);
            return;
        }

        // Return available riders
        successResponse(res, "Available riders fetched successfully", riders, 200);
    } catch (error) {
        console.error("Error getting available riders:", error);
        errorResponse(res, "Failed to get available riders", 500);
        return;
    }
};


const updateWorkStatus = async (req: Request, res: Response) => {
    try {
        const { email } = req.params;
        const { work_status } = req.body;

        if (!work_status) {
            return res.status(400).json({ success: false, message: "Work status is required" });
        }

        const allowedStatuses = ["idle", "busy", "on_break"];
        if (!allowedStatuses.includes(work_status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid work status value",
            });
        }

        const updatedRider = await Rider.findOneAndUpdate(
            { email },
            { work_status },
            { new: true }
        );

        if (!updatedRider) {
            return res.status(404).json({ success: false, message: "Rider not found" });
        }

        return res.json({
            success: true,
            message: `Work status updated to "${work_status}"`,
            data: updatedRider,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// Export controller functions
export const riderController = {
    createRider,
    getPendingRiders,
    updateRiderStatus,
    getApprovedRiders,
    updateRiderActiveStatus,
    getAvailableRiders,
    getApproveRiderByEmail,
    updateWorkStatus,
};
