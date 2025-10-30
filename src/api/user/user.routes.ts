
import express from "express";
import { userController } from "./user.controller";
import { verifyFirebaseToken } from "../../middlewares/verifyFirebaseToken";
import { verifyAdmin } from "../../middlewares/verifyAdmin";

const userRouter = express.Router();

userRouter.post("/", userController.createUser);
userRouter.get("/search", verifyFirebaseToken, verifyAdmin, userController.searchUser);
userRouter.patch("/make-admin/:id", verifyFirebaseToken, verifyAdmin, userController.makeAdmin);
userRouter.patch("/remove-admin/:id", verifyFirebaseToken, verifyAdmin, userController.removeAdmin);
userRouter.get("/role", verifyFirebaseToken, userController.getUserRole);

export default userRouter;
