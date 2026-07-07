import cron from "node-cron";
import MessageDay from "../models/messageDayModel";
import User from "../models/userModel";
import { generateRecommendedLessonsForDate } from "../services/recommendedLessonService";
import { generateReviewForDate } from "../services/reviewService";
import { getVietnamDateKey } from "../utils/vietnamTime";

export async function runReviewCronJob(dateVN?: string) {
  const targetDateVN = dateVN ?? getVietnamDateKey();
  const users = await User.find({}, { _id: 1 });

  for (const user of users) {
    try {
      const messageDay = await MessageDay.findOne({
        userId: user._id,
        dateVN: targetDateVN,
      });

      if (!messageDay || messageDay.messages.length === 0) {
        continue;
      }

      await generateReviewForDate(user._id.toString(), targetDateVN);
      await generateRecommendedLessonsForDate(
        user._id.toString(),
        targetDateVN,
      );
      console.log(
        `[CRON] Review and recommended lessons generated for user ${user._id} on ${targetDateVN}`,
      );
    } catch (error: any) {
      console.error(
        `[CRON] Failed to generate review for user ${user._id}:`,
        error.message,
      );
    }
  }
}

export const startReviewCron = () => {
  cron.schedule(
    "0 0 23 * * *",
    async () => {
      try {
        await runReviewCronJob();
      } catch (error: any) {
        console.error("[CRON] Review cron job failed:", error.message);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    },
  );

  console.log("[CRON] Review scheduler started (23:00 daily)");
};
