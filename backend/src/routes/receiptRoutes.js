const express = require("express");


const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const receiptController = require("../controllers/receiptController");

const router = express.Router();

router.post(
    "/extract",
    authMiddleware,
    upload.single("receipt"),
    receiptController.extractReceiptController
);
module.exports = router;