import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

//   POST api/auth/register
//Description:   Register user
// @access  Public
router.post("/register", async (req, res) => {
  console.log("==========");
  const { name, email, password } = req.body;

  try {
    console.log("==========");
    // Check if user already exists
    let user = await User.findOne({ email });
    console.log("==========");
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }
    console.log("==========");
    // Create new user
    user = new User({
      name,
      email,
      password,
    });
    console.log("==========");

    // Save user to database
    await user.save();
    console.log("==========");
    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };
    console.log("==========");

    // Sign JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "journalsecret",
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//   POST api/auth/login
//Description:   Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "journalsecret",
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//   GET api/auth/user
//Description:   Get user data

router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;
