import { Router } from "express";
import parcelRoutes from "../api/parcel/parcel.Routes";
import paymentRouter from "../api/payment/payment.Routes";
import userRouter from "../api/user/user.routes";
import riderRouter from "../api/rider/rider.Routes";

const mainRoutes = Router()

mainRoutes.use("/parcels", parcelRoutes)
mainRoutes.use("/payment", paymentRouter)
mainRoutes.use("/user", userRouter)
mainRoutes.use("/rider", riderRouter)

export default mainRoutes