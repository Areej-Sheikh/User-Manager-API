const User = require("../models/User");
const { sendEmail } = require("../utils/email");

// Helper for timestamps
const ts = () => new Date().toISOString();

async function createUser(req, res, next) {
  console.log(`\n[${ts()}] --- createUser() START ---`);
  console.log("[createUser] Incoming body:", req.body);

  try {
    console.log("[createUser] Attempting DB write...");
    const user = await User.create(req.body);
    console.log("[createUser] User created:", user);

    res.status(201).json(user);
  } catch (err) {
    console.error("[createUser] ERROR:", err);
    next(err);
  }

  console.log(`[${ts()}] --- createUser() END ---\n`);
}

async function getUsers(req, res, next) {
  console.log(`\n[${ts()}] --- getUsers() START ---`);
  console.log("[getUsers] Query params:", req.query);

  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = {};

    if (q) {
      console.log("[getUsers] Applying search filter for:", q);
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    console.log("[getUsers] Final DB filter:", filter);

    console.log("[getUsers] Executing find()...");
    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    console.log("[getUsers] Users fetched:", users.length);

    const total = await User.countDocuments(filter);
    console.log("[getUsers] Total matching users:", total);

    res.json({ data: users, total });
  } catch (err) {
    console.error("[getUsers] ERROR:", err);
    next(err);
  }

  console.log(`[${ts()}] --- getUsers() END ---\n`);
}

async function getUser(req, res, next) {
  console.log(`\n[${ts()}] --- getUser() START ---`);
  console.log("[getUser] ID param:", req.params.id);

  try {
    console.log("[getUser] Fetching user...");
    const user = await User.findById(req.params.id);

    if (!user) {
      console.warn("[getUser] User NOT FOUND!");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[getUser] User fetched:", user);

    res.json(user);
  } catch (err) {
    console.error("[getUser] ERROR:", err);
    next(err);
  }

  console.log(`[${ts()}] --- getUser() END ---\n`);
}

async function updateUser(req, res, next) {
  console.log(`\n[${ts()}] --- updateUser() START ---`);
  console.log("[updateUser] ID:", req.params.id);
  console.log("[updateUser] Body:", req.body);

  try {
    console.log("[updateUser] Updating user...");
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!user) {
      console.warn("[updateUser] User NOT FOUND");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[updateUser] Updated user:", user);
    res.json(user);
  } catch (err) {
    console.error("[updateUser] ERROR:", err);
    next(err);
  }

  console.log(`[${ts()}] --- updateUser() END ---\n`);
}

async function deleteUser(req, res, next) {
  console.log(`\n[${ts()}] --- deleteUser() START ---`);
  console.log("[deleteUser] ID:", req.params.id);

  try {
    console.log("[deleteUser] Deleting user...");
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      console.warn("[deleteUser] User NOT FOUND!");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[deleteUser] User deleted:", user._id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("[deleteUser] ERROR:", err);
    next(err);
  }

  console.log(`[${ts()}] --- deleteUser() END ---\n`);
}

async function notifyUsers(req, res, next) {
  console.log(`\n[${ts()}] --- notifyUsers() START ---`);
  console.log("[notifyUsers] Request body:", req.body);

  try {
    const { emails = [], subject, message } = req.body;

    if (!emails.length) {
      console.warn("[notifyUsers] No emails provided");
      return res.status(400).json({ message: "No recipient emails provided" });
    }

    const results = [];

    for (const email of emails) {
      console.log(`[notifyUsers] Sending email to ${email}...`);

      try {
        await sendEmail({
          to: email,
          subject,
          text: message,
          html: `<p>${message}</p>`,
        });

        console.log(`[notifyUsers] SUCCESS for ${email}`);
        results.push({ email, status: "sent" });
      } catch (err) {
        console.error(`[notifyUsers] FAILED for ${email}:`, err.message);
        results.push({ email, status: "failed", error: err.message });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;

    console.log("[notifyUsers] Summary:", { sent, failed });

    res.json({
      message: `Notifications sent. Success: ${sent}, Failed: ${failed}`,
      details: results,
    });
  } catch (err) {
    console.error("[notifyUsers] ERROR:", err);
    next(err);
  }

  console.log(`[${ts()}] --- notifyUsers() END ---\n`);
}

async function usersByLocation(req, res, next) {
  console.log(`\n[${ts()}] --- usersByLocation() START ---`);

  try {
    console.log("[usersByLocation] Running location aggregation...");

    const agg = await User.aggregate([
      {
        $group: {
          _id: {
            country: "$location.country",
            state: "$location.state",
            city: "$location.city",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          country: "$_id.country",
          state: "$_id.state",
          city: "$_id.city",
          count: 1,
        },
      },
    ]);

    console.log("[usersByLocation] Aggregation result:", agg);

    res.json(agg);
  } catch (err) {
    console.error("[usersByLocation] ERROR:", err);
    next(err);
  }

  console.log(`[${ts()}] --- usersByLocation() END ---\n`);
}

async function analyticsDashboard(req, res, next) {
  console.log(`\n[${ts()}] --- analyticsDashboard() START ---`);

  try {
    console.log("[analyticsDashboard] Counting users...");
    const totalUsers = await User.countDocuments();

    console.log("[analyticsDashboard] Running location aggregation...");
    const usersByLocation = await User.aggregate([
      {
        $group: {
          _id: {
            city: "$location.city",
            state: "$location.state",
            country: "$location.country",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log("[analyticsDashboard] Location aggregation:", usersByLocation);

    const usersByCity = usersByLocation.map((loc) => ({
      city: loc._id.city,
      count: loc.count,
    }));

    const usersByState = usersByLocation.map((loc) => ({
      state: loc._id.state,
      count: loc.count,
    }));

    const usersByCountry = usersByLocation.map((loc) => ({
      country: loc._id.country,
      count: loc.count,
    }));

    console.log("[analyticsDashboard] Fetching users by gender...");
    const usersByGender = await User.aggregate([
      {
        $group: {
          _id: "$gender",
          total: { $sum: 1 },
        },
      },
    ]);

    console.log("[analyticsDashboard] Gender breakdown:", usersByGender);

    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("[analyticsDashboard] Monthly breakdown:", usersByMonth);

    res.json({
      totalUsers,
      usersByCity,
      usersByState,
      usersByCountry,
      usersByGender,
      usersByMonth,
      notificationsSent: 0,
    });
  } catch (err) {
    console.error("[analyticsDashboard] ERROR:", err);
    next(err);
  }

  console.log(`[${ts()}] --- analyticsDashboard() END ---\n`);
}

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  notifyUsers,
  usersByLocation,
  analyticsDashboard,
};
