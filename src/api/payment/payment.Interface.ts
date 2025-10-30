


export interface IPaymentHistory {
    parcelId: string;
    email: string;
    amount: number;
    paymentMethod: string[];
    transactionId: string;
    paid_at: Date;
}
