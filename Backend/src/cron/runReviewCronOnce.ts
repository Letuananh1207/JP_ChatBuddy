import dotenv from "dotenv";
dotenv.config();

import connectDB from "../utils/db";
import { runReviewCronJob } from "./reviewCron";

async function main() {
  await connectDB();
  await runReviewCronJob();
  process.exit(0);
}

main().catch((error) => {
  console.error("[TEST] Review cron test failed:", error);
  process.exit(1);
});
