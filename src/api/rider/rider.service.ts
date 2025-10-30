import { Rider } from "./rider.Model";



export const updateRiderWorkStatusService = async (
    riderId: string,
    status: string
) => {
    return await Rider.findByIdAndUpdate(
        riderId,
        { work_status: status },
        { new: true } // ✅ return updated data
    );
};
