const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const settlementController = require("../controllers/settlementController");

router.get(
    "/group/:groupId/settlement",
    authMiddleware,
    settlementController.getGroupSettlement
);

module.exports = router;