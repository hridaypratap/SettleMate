const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getDashboardController
} = require("../controllers/dashboardController");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getDashboardController
);

module.exports = router;