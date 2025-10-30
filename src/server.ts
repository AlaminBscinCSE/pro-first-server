import mongoose from "mongoose";
import config from "./config";
import app from "./app";

const mainServer = async () => {
    try {
        await mongoose.connect(config.database_url as string)
        console.log("database connect successfully")
        app.listen(config.port, () => {
            console.log(`server run on ${config.port}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1); // exit with failure code
    }
}
mainServer()