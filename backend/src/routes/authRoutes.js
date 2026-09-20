const express = require('express');
const authMiddleware = require("../middleware/authMiddleware");
const {signup , login , refresh , me} = require("../controllers/authController");
const router = express.Router();
router.post("/signup" , signup);
router.post("/login" , login);
router.post("/refresh" , refresh);
router.get("/me", authMiddleware , me );
module.exports = router;