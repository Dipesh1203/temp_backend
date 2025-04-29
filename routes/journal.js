import express from "express";
import JournalEntry from "../models/JournalEntry.js";
import auth from "../middleware/auth.js";
import { analyzeEmotion } from "../utils/sentimentAnalyzer.js";

const router = express.Router();

router.get("/test", async (req, res) => {
  const { content, date, userEmotion } = req.body;

  try {
    // Analyze text content for emotion

    res.json({ data: "Working ...." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//   POST api/journal
//Description:   Create a journal entry

router.post("/", auth, async (req, res) => {
  const { content, date, userEmotion } = req.body;

  try {
    // Analyze text content for emotion
    const detectedEmotion = analyzeEmotion(content);

    // Create new journal entry
    const newEntry = new JournalEntry({
      userId: req.user.id,
      content,
      detectedEmotion,
      userEmotion,
      date: new Date(date) || new Date(),
    });

    // Save entry to database
    const entry = await newEntry.save();

    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//   GET api/journal
//Description:   Get all journal entries for a user

router.get("/", auth, async (req, res) => {
  try {
    // Find entries for this user, sorted by date (newest first)
    const entries = await JournalEntry.find({ userId: req.user.id }).sort({
      date: -1,
    });

    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//   GET api/journal/:id
//Description:   Get a specific journal entry

router.get("/:id", auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    // Check if entry exists
    if (!entry) {
      return res.status(404).json({ msg: "Entry not found" });
    }

    // Check if user owns the entry
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    res.json(entry);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Entry not found" });
    }
    res.status(500).send("Server error");
  }
});

//   PUT api/journal/:id
//Description:   Update a journal entry

router.put("/:id", auth, async (req, res) => {
  const { content, userEmotion } = req.body;

  try {
    let entry = await JournalEntry.findById(req.params.id);

    // Check if entry exists
    if (!entry) {
      return res.status(404).json({ msg: "Entry not found" });
    }

    // Check if user owns the entry
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // If content changed, re-analyze emotion
    let detectedEmotion = entry.detectedEmotion;
    if (content && content !== entry.content) {
      detectedEmotion = analyzeEmotion(content);
    }

    // Update entry
    entry = await JournalEntry.findByIdAndUpdate(
      req.params.id,
      {
        content: content || entry.content,
        detectedEmotion,
        userEmotion: userEmotion || entry.userEmotion,
      },
      { new: true }
    );

    res.json(entry);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Entry not found" });
    }
    res.status(500).send("Server error");
  }
});

//   DELETE api/journal/:id
//Description:   Delete a journal entry

router.delete("/:id", auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    // Check if entry exists
    if (!entry) {
      return res.status(404).json({ msg: "Entry not found" });
    }

    // Check if user owns the entry
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Delete entry
    await entry.remove();

    res.json({ msg: "Entry removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Entry not found" });
    }
    res.status(500).send("Server error");
  }
});

export default router;
