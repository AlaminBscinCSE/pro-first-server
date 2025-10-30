import { Response } from "express";

interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

export const successResponse = <T>(
    res: Response,
    message = "Success",
    data?: T,
    statusCode = 200,

): Response<ApiResponse<T>> => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};



export const errorResponse = (
    res: Response,
    message = "Something went wrong",
    statusCode = 500
): Response<ApiResponse> => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};
