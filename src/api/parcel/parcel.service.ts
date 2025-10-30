import Parcel from "./parcel.Model";

export const updateParcelStatusService = async (id: string, status: string) => {
    return await Parcel.findByIdAndUpdate(
        id,
        { delivery_Status: status },
        { new: true }
    );
};


export const updateParcelCashOutService = async (parcelId: string) => {
    return await Parcel.findByIdAndUpdate(
        parcelId,
        {
            cashOut_status: "paid",
            cashOut_at: new Date(),
        },
        { new: true }
    );
};




