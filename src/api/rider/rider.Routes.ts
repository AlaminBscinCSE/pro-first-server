import { Router } from "express";
import { riderController } from "./rider.Controller";
import { verifyFirebaseToken } from "../../middlewares/verifyFirebaseToken";
import { verifyAdmin } from "../../middlewares/verifyAdmin";
import { verifyRider } from "../../middlewares/verifyRider";



const riderRouter = Router()

riderRouter.post("/", verifyFirebaseToken, riderController.createRider)
riderRouter.get("/pending", verifyFirebaseToken, verifyAdmin, riderController.getPendingRiders)
riderRouter.patch("/status/:id", riderController.updateRiderStatus);
riderRouter.get("/approved", verifyFirebaseToken, verifyAdmin, riderController.getApprovedRiders);
riderRouter.patch("/activeOrDeactivate/:id", verifyFirebaseToken, riderController.updateRiderActiveStatus);
riderRouter.get("/available", verifyFirebaseToken, riderController.getAvailableRiders);
riderRouter.get("/approved/:email", verifyFirebaseToken, verifyRider, riderController.getApproveRiderByEmail);
riderRouter.patch("/update-work-status/:email", verifyFirebaseToken, verifyRider, riderController.updateWorkStatus);


export default riderRouter


