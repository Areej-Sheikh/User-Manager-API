const User = require("../models/User");
const { sendEmail } = require("../utils/email");

async function createUser(req, res, next) {
  try {
    console.log("createUser body:", req.body);
    const user = await User.create(req.body);
    res.status(201).json(user);
    console.log("action createUser body:", req.body);
  } catch (err) {
    console.error("createUser error:", err);
    next(err);
  }
}


async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ];
    }
    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    res.json({ data: users, total });
  } catch (err) {
    console.error("getUsers error:", err);
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getUser error:", err);
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    console.log("updateUser id:", req.params.id, "body:", req.body);
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("updateUser error:", err);
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    next(err);
  }
}

async function notifyUsers(req, res, next) {
  try {
    const { emails = [], subject, message } = req.body;

    if (!emails.length) {
      return res.status(400).json({ message: "No recipient emails provided" });
    }

    const results = [];

    for (const email of emails) {
      try {
        console.log(`Sending email to: ${email}`);
        await sendEmail({
          to: email,
          subject,
          text: message,
          html: `<p>${message}</p>`,
        });
        results.push({ email, status: "sent" });
      } catch (err) {
        console.error(`Failed to send email to ${email}:`, err.message);
        results.push({ email, status: "failed", error: err.message });
      }
    }

    const sentCount = results.filter((r) => r.status === "sent").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    res.json({
      message: `Notifications sent. Success: ${sentCount}, Failed: ${failedCount}`,
      details: results,
    });
  } catch (err) {
    console.error("notifyUsers endpoint error:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}


async function usersByLocation(req, res, next) {
  try {
    const agg = await User.aggregate([
      {
        $group: {
          _id: {
            country: "$location.country",
            state: "$location.state",
            city: "$location.city"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          country: "$_id.country",
          state: "$_id.state",
          city: "$_id.city",
          count: 1
        }
      }
    ]);
    res.json(agg);
  } catch (err) {
    console.error("usersByLocation error:", err);
    next(err);
  }
}
async function analyticsDashboard(req, res, next) {
  try {
    console.log("Analytics endpoint hit");

    const totalUsers = await User.countDocuments();

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

    const usersByGender = await User.aggregate([
      {
        $group: {
          _id: "$gender",
          total: { $sum: 1 },
        },
      },
    ]).then((data) =>
      data.map((item) => ({
        gender: item._id || "Unknown",
        total: item.total,
      }))
    );

    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).then((data) =>
      data.map((item) => ({
        month: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ][item._id - 1],
        total: item.total,
      }))
    );

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
    console.error("analyticsDashboard error:", err);
    next(err);
  }
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
