import { model, Schema } from "mongoose";
import { IPaymentHistory } from "./payment.Interface";

const PaymentHistorySchema = new Schema<IPaymentHistory>(
    {
        parcelId: { type: String, required: true },
        email: { type: String, required: true },
        amount: { type: Number, required: true },
        paymentMethod: { type: [String], required: true },
        transactionId: { type: String, required: true },
        paid_at: { type: Date, required: true, default: Date.now },
    },
    {
        versionKey: false
    }
);


const PaymentHistory = model<IPaymentHistory>("PaymentHistory", PaymentHistorySchema);

export default PaymentHistory