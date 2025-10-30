import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/apiResponse";
import Parcel from "./parcel.Model";
import { Rider } from "../rider/rider.Model";
import { updateParcelCashOutService, updateParcelStatusService } from "./parcel.service";
import { updateRiderWorkStatusService } from "../rider/rider.service";

/**
 * @desc Create a new parcel order
 * @route POST /api/parcels
 * @access Private
 */
const parcelCreate = async (req: Request, res: Response) => {
    try {
        const newParcel = await Parcel.create(req.body);
        return successResponse(res, "Parcel created successfully", newParcel, 201);
    } catch (error) {
        console.error("Parcel creation error:", error);
        return errorResponse(
            res,
            error instanceof Error ? error.message : "Failed to create parcel",
            500
        );
    }
};

/**
 * @desc Get all parcels created by logged-in user
 * @route GET /api/parcels/my/:userEmail
 * @access Private (Owner only)
 */
const getMyParcels = async (req: Request, res: Response) => {
    try {
        const email = req.params.userEmail;
        const user = (req as any).user; // Firebase authorized user
        const emailFromToken = user.email;

        // ✅ Security check: prevent accessing others' data
        if (email !== emailFromToken) {
            return res.status(403).json({ message: "Access denied" });
        }

        const myParcels = await Parcel.find({ create_By: email }).sort({ createdAt: -1 });

        return successResponse(res, "Your parcels retrieved successfully", myParcels, 200);
    } catch (error) {
        return errorResponse(
            res,
            error instanceof Error ? error.message : "Failed to get your parcels",
            500
        );
    }
};

/**
 * @desc Get single parcel details
 * @route GET /api/parcels/:parcelId
 * @access Private
 */
const getParcelById = async (req: Request, res: Response) => {
    try {
        const Id = req.params.parcelId;
        const parcel = await Parcel.findById(Id);

        if (!parcel) {
            return successResponse(res, "Parcel not found", null, 404);
        }

        return successResponse(res, "Parcel found successfully", parcel, 200);
    } catch (error) {
        return errorResponse(
            res,
            error instanceof Error ? error.message : "Failed to get parcel by ID",
            500
        );
    }
};

/**
 * @desc Admin: Delete parcel request
 * @route DELETE /api/parcels/:Id
 * @access Private (Admin or Parcel owner)
 */
const deleteSingleParcel = async (req: Request, res: Response) => {
    try {
        const id = req.params.Id;
        const deletedParcel = await Parcel.findByIdAndDelete(id);

        if (!deletedParcel) {
            return errorResponse(res, "Parcel not found", 404);
        }

        return successResponse(res, "Parcel deleted successfully", deletedParcel, 200);
    } catch (error) {
        return errorResponse(
            res,
            error instanceof Error ? error.message : "Failed to delete parcel",
            500
        );
    }
};

/**
 * @desc Admin: Get parcels waiting for rider assignment
 * @route GET /api/parcels/assign
 * @access Private Admin Only
 */
const getAssignRiderParcels = async (req: Request, res: Response): Promise<void> => {
    try {
        const parcels = await Parcel.find({
            payment_Status: "paid",
            delivery_Status: "not_collected"
        }).sort({ createdAt: -1 });

        successResponse(res, "Available parcels for rider assignment", parcels);
    } catch (error:any){
        errorResponse(res, `Failed to fetch assignable parcels ${error?.message}`, 500);
    }
};

/**
 * @desc Admin: Assign a rider to parcel
 * ✅ Change parcel status → "rider_assigned"
 * ✅ Change rider work status → "in_delivery"
 * @route PATCH /api/parcels/assign/:parcelId
 */
const assignRiderToParcel = async (req: Request, res: Response) => {
    const { parcelId } = req.params;
    const { riderId } = req.body;

    try {
        const parcel = await Parcel.findById(parcelId);
        if (!parcel) return errorResponse(res, "Parcel not found", 404);

        const rider = await Rider.findById(riderId);
        if (!rider) return errorResponse(res, "Rider not found", 404);

        // ✅ Only idle riders can take new deliveries
        if (rider.work_status !== "idle") {
            return errorResponse(res, "Rider is currently busy", 400);
        }

        // ✅ Update parcel status + assign rider
        parcel.assignedRider = rider._id;
        parcel.delivery_Status = "rider_assigned";
        await parcel.save();

        // ✅ Update rider status to busy
        rider.work_status = "in_delivery";
        await rider.save();

        return successResponse(res, "Rider assigned successfully", { parcel, rider });
    } catch (error:any) {
        return errorResponse(res, `Failed to assign rider ${error?.message}`, 500);
    }
};

/**
 * @desc Rider: Get parcels currently assigned to rider
 * @route GET /api/parcels/pending-deliveries/:email
 */
const getPendingDeliveries = async (req: Request, res: Response) => {
    try {
        const { email } = req.params;

        const rider = await Rider.findOne({ email });
        if (!rider) return errorResponse(res, "Rider not found", 404);

        const pendingParcels = await Parcel.find({
            assignedRider: rider._id,
            delivery_Status: { $in: ["rider_assigned", "in_transit"] }
        }).sort({ createdAt: -1 });

        return successResponse(res, "Pending deliveries fetched successfully", pendingParcels);
    } catch (error: any) {
        return errorResponse(res, error.message);
    }
};

/**
 * @desc Rider: Update parcel delivery status
 * ✅ If status → "delivered"
 * ✅ Rider becomes idle → "idle"
 * @route PATCH /api/parcels/update-status/:id
 */
const updateParcelStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { status } = req.body;

        const updatedParcel = await updateParcelStatusService(id, status);
        if (!updatedParcel) {
            return errorResponse(res, "Parcel not found!", 404);
        }

        let updated = false;

        if (status === "in_transit" && updatedParcel.assignedRider) {
            updatedParcel.picked_at = new Date();
            updated = true;
        }

        if (status === "delivered" && updatedParcel.assignedRider) {
            await updateRiderWorkStatusService(
                updatedParcel.assignedRider.toString(),
                "idle"
            );
            updatedParcel.delivered_at = new Date();
            updated = true;
        }

        // ✅ Save only if new fields updated
        if (updated) {
            await updatedParcel.save();
        }

        return successResponse(res, "Delivery status updated!", updatedParcel);
    } catch (err:any) {
        return errorResponse(res,` Server error! ${err?.message}`, 500);
    }
};


/**
 * @desc Rider: Get parcels completed deliveries 
 * @route GET /api/parcels/completed-deliveries/:email
 */
const getCompletedDeliveries = async (req: Request, res: Response) => {
    try {
        const { email } = req.params;

        const rider = await Rider.findOne({ email });
        if (!rider) return errorResponse(res, "Rider not found", 404);

        const pendingParcels = await Parcel.find({
            assignedRider: rider._id,
            delivery_Status: { $in: ["delivered", "service-center-delivered"] }
        }).sort({ createdAt: -1 });

        return successResponse(res, "Completed deliveries fetched successfully", pendingParcels);
    } catch (error: any) {
        return errorResponse(res, error.message);
    }
};
/**
 * @desc Rider: Cash Out parcel from rider  
 * @route GET /api/parcels/cash-out/:id
 */
const cashOutParcel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const updated = await updateParcelCashOutService(id);

        if (!updated) {
            return res.status(404).json({ message: "Parcel not found!" });
        }

        res.json({
            message: "Cash out successful ✅",
            data: updated,
        });

    } catch (err:any) {
        res.status(500).json({ message: `Server error! ${err?.message}` });
    }
};

//add tracking update ------->
const addTrackingUpdate = async (req: Request, res: Response) => {
    try {
        const { parcelId } = req.params;
        const { status, message } = req.body;

        if (!status || !message) {
            return res.status(400).json({ message: "Status and message are required." });
        }

        // ✅ Update parcel tracking history
        const updatedParcel = await Parcel.findByIdAndUpdate(
            parcelId,
            {
                $push: {
                    trackingHistory: {
                        status,
                        message,
                        date: new Date()
                    }
                },

            },
            { new: true }
        );

        if (!updatedParcel) {
            return res.status(404).json({ message: "Parcel not found." });
        }

        return res.status(200).json({
            message: "Tracking update added successfully.",
            data: updatedParcel
        });

    } catch (error: any) {
        console.error("Add Tracking Update Error:", error);
        return res.status(500).json({ message: error.message || "Server error." });
    }
};
//get  tracking  ------->
const getParcelByTrackingId = async (req: Request, res: Response) => {
    try {
        const { trackingId } = req.params;

        const parcel = await Parcel.findOne({ tracking_Id: trackingId });
        if (!parcel) {
            return res.status(404).json({
                success: false,
                message: "Parcel not found",
            });
        }

        return res.json({
            success: true,
            data: parcel,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};



// ✅ Group parcels by delivery_Status
export const getParcelStatusSummary = async (req: Request, res: Response) => {
    try {
        const summary = await Parcel.aggregate([
            {
                $group: {
                    _id: "$delivery_Status",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1,
                },
            },
        ]);

        res.json({
            success: true,
            data: summary,
        });
    } catch (error) {
        console.error("Error fetching parcel summary:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch parcel summary",
        });
    }
};



export const parcelController = {
    parcelCreate,
    getMyParcels,
    deleteSingleParcel,
    getParcelById,
    getAssignRiderParcels,
    assignRiderToParcel,
    getPendingDeliveries,
    updateParcelStatus,
    getCompletedDeliveries,
    cashOutParcel,
    addTrackingUpdate,
    getParcelByTrackingId,
    getParcelStatusSummary
};
