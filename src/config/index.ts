import dotenv from "dotenv";
dotenv.config();

export default {
    node_env: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 5000,
    database_url: process.env.DATABASE_URL || "",
    stripe_secret_key: process.env.STRIPE_SECRET_KEY || "",
    client_Domain: process.env.CLIENT_DOMAIN || "http://localhost:5173",
    fb_service_key: process.env.FB_SERVICE_KEY
};
