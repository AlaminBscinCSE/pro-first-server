import { Request, Response } from "express";
import Stripe from "stripe";
import config from "../../config";
import Parcel from "../parcel/parcel.Model";
import PaymentHistory from "./payment.Model";
import { errorResponse, successResponse } from "../../utils/apiResponse";

const stripe = new Stripe(config.stripe_secret_key);

// ✅ Step 1: Create Payment Intent
const checkout = async (req: Request, res: Response) => {
    try {
        const { amount, parcelId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid payment amount" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount, // amount in smallest currency unit
            currency: "usd", // or "bdt" if your Stripe account supports it
            description: `Parcel Payment for ${parcelId}`,
            automatic_payment_methods: { enabled: true },
        });

        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return res.status(500).json({ message: "Failed to create payment intent" });
    }
};

// ✅ Step 2: Confirm payment and save history
const createHistory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { parcelId, email, amount, paymentMethod, transactionId } = req.body;

        if (!parcelId || !email || !amount || !transactionId) {
            return errorResponse(res, "Missing required fields", 400);
        }

        // Update parcel payment status
        const parcel = await Parcel.findByIdAndUpdate(
            parcelId,
            { payment_Status: "paid" },
            { new: true }
        );

        if (!parcel) return errorResponse(res, "Parcel not found", 404);

        // Save payment history
        const history = await PaymentHistory.create({
            parcelId,
            email,
            amount,
            paymentMethod,
            transactionId,
            paid_at: new Date(),
        });

        return successResponse(res, "Payment confirmed and history recorded successfully", history, 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to confirm payment";
        return errorResponse(res, message, 500);
    }
};

const getPaymentHistoryByEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.query as { email?: string };

      

        // Case-insensitive search
        const histories = await PaymentHistory.find({
            email: { $regex: new RegExp(`^${email}$`, "i") }
        }).sort({ paid_at: -1 });

        if (histories.length === 0) {
            return successResponse(res, "No payment history found", [], 200);
        }

        return successResponse(res, "Payment history fetched successfully", histories, 200);
    } catch (error: any) {
        return errorResponse(res, `Failed to fetch payment history ${error?.message}`, 500);
    }
};




export const paymentController = {
    checkout,
    createHistory,
    getPaymentHistoryByEmail,
};
