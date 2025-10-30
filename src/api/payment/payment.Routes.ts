
import express from "express";
import { paymentController } from "./payment.Controller";
import { verifyFirebaseToken } from "../../middlewares/verifyFirebaseToken";


const paymentRouter = express.Router();
paymentRouter.post("/create-checkout-session", paymentController.checkout);
paymentRouter.post("/conformAndSaveHistory", paymentController.createHistory);
paymentRouter.get("/history",verifyFirebaseToken, paymentController.getPaymentHistoryByEmail);


export default paymentRouter;
