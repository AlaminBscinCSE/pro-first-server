import { Router } from "express";
import { parcelController } from "./parcel.Controller";
import { verifyFirebaseToken } from "../../middlewares/verifyFirebaseToken";
import { verifyAdmin } from "../../middlewares/verifyAdmin";
import { verifyRider } from "../../middlewares/verifyRider";

const parcelRoutes = Router()

parcelRoutes.post("/", verifyFirebaseToken, parcelController.parcelCreate)
parcelRoutes.get("/user/:userEmail", verifyFirebaseToken, parcelController.getMyParcels)
parcelRoutes.delete("/:Id", parcelController.deleteSingleParcel)
parcelRoutes.get("/id/:parcelId", parcelController.getParcelById)
parcelRoutes.get("/assignRider", verifyFirebaseToken, verifyAdmin, parcelController.getAssignRiderParcels);
parcelRoutes.patch("/assign/:parcelId", verifyFirebaseToken, verifyAdmin, parcelController.assignRiderToParcel);
parcelRoutes.get("/pending-deliveries/:email", verifyFirebaseToken, verifyRider, parcelController.getPendingDeliveries);
parcelRoutes.patch("/update-status/:id", verifyFirebaseToken, verifyRider, parcelController.updateParcelStatus);
parcelRoutes.get("/completed-deliveries/:email", verifyFirebaseToken, verifyRider, parcelController.getCompletedDeliveries);
parcelRoutes.patch("/cash-out/:id", verifyFirebaseToken, verifyRider, parcelController.cashOutParcel);
parcelRoutes.patch("/tracking/:parcelId", verifyFirebaseToken, parcelController.addTrackingUpdate);
parcelRoutes.get("/tracking/:trackingId", verifyFirebaseToken, parcelController.getParcelByTrackingId);
parcelRoutes.get("/summary/status", verifyFirebaseToken, verifyAdmin, parcelController.getParcelStatusSummary);



export default parcelRoutes