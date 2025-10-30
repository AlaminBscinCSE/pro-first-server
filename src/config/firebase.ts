
import config from "./index";
import admin from "firebase-admin";


const decodedKey = Buffer.from(config.fb_service_key || "", 'base64').toString('utf8');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(
            JSON.parse(decodedKey)
        ),
    });
}

export default admin;