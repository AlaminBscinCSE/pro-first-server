import express, { Request, Response } from 'express';
import cors from "cors"
//import mainRoutes from './routes/mainRoutes';
import { errorHandler } from './middlewares/errorMiddleware';
import { notFound } from './middlewares/notFoundMiddleware';
import { errorResponse, successResponse } from './utils/apiResponse';
import mainRoutes from './routes/mainRoutes';

const app = express();

// Body parser
app.use(express.json());
// CORS configuration
app.use(cors({
    origin: ['https://pro-first-client.vercel.app', 'http://localhost:5173'],
    //methods: ['GET', 'POST', 'PUT', 'DELETE'],

}));



//Root point
app.get('/', (req: Request, res: Response) => {
    try {
        return successResponse<object>(res, "Go Ahead ,ProFirst", { dev: "Arif" }, 200,)
    } catch (error: any) {
        return errorResponse(res, `Something went wrong at server ${error?.message}`, 500)
    }
})

// Main Routes
app.use('/api', mainRoutes);

// 404 handler
app.use(notFound);
// Global error handler
app.use(errorHandler);

export default app;