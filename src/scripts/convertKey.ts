// scripts/convertKey.ts
import { readFileSync } from "fs";

const key = readFileSync("../../firebase-service-account.json", "utf8");
const base64 = Buffer.from(key).toString("base64");
console.log(base64);
// To decode, use: Buffer .from(base64, "base64").toString("utf8");

