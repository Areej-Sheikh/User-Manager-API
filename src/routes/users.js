const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/userController");

router.post("/", ctrl.createUser);
router.get("/", ctrl.getUsers);
router.get("/analytics/location", ctrl.usersByLocation);
router.get("/analytics/dashboard", ctrl.analyticsDashboard);
router.post("/notify", ctrl.notifyUsers); 
router.get("/:id", ctrl.getUser);
router.put("/:id", ctrl.updateUser);
router.delete("/:id", ctrl.deleteUser);

module.exports = router;
