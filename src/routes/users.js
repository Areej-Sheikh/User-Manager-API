const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  notifyUsers,
  usersByLocation,
  analyticsDashboard,
} = require("../controllers/userController");

router.get("/", getUsers);
router.post("/", createUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/notify", notifyUsers);
router.get("/analytics/users-by-location", usersByLocation);
router.get("/analytics/dashboard", analyticsDashboard);

module.exports = router;
