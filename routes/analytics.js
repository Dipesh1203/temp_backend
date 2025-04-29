import express from "express";
import JournalEntry from "../models/JournalEntry.js";
import auth from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/emotions", auth, async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const emotionCounts = await JournalEntry.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: "$detectedEmotion",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format results
    const formattedCounts = {};
    emotionCounts.forEach((item) => {
      formattedCounts[item._id] = item.count;
    });
    console.log("emotion ", formattedCounts);
    res.json(formattedCounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/weekly", auth, async (req, res) => {
  try {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get entries from the past 7 days
    const entries = await JournalEntry.find({
      userId: new mongoose.Types.ObjectId(req.user.id),
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });

    // Group entries by day and emotion
    const dailyEmotions = {};

    entries.forEach((entry) => {
      const dateStr = entry.date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!dailyEmotions[dateStr]) {
        dailyEmotions[dateStr] = {
          happy: 0,
          sad: 0,
          angry: 0,
          neutral: 0,
          fear: 0,
          surprise: 0,
        };
      }

      dailyEmotions[dateStr][entry.detectedEmotion]++;
    });

    console.log("weekly hit", dailyEmotions);
    res.json(dailyEmotions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/monthly", auth, async (req, res) => {
  try {
    console.log("monthly hit");
    const monthlyEmotions = await JournalEntry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            emotion: "$detectedEmotion",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    console.log("monthly hit", monthlyEmotions);
    // Format results
    const formattedMonthly = {};

    monthlyEmotions.forEach((item) => {
      const yearMonth = `${item._id.year}-${item._id.month
        .toString()
        .padStart(2, "0")}`;

      if (!formattedMonthly[yearMonth]) {
        formattedMonthly[yearMonth] = {
          happy: 0,
          sad: 0,
          angry: 0,
          neutral: 0,
          fear: 0,
          surprise: 0,
        };
      }

      formattedMonthly[yearMonth][item._id.emotion] = item.count;
    });

    console.log("monthly hit", formattedMonthly);
    res.json(formattedMonthly);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;
