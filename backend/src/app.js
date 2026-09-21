const express = require("express")
// const dotenv = require('dotenv')
require("dotenv").config();
const cookieParser = require("cookie-parser");
const multer = require("multer");
const groupRoutes = require("./routes/groupRoutes")
const expenseRoutes = require("./routes/expenseRoutes");
const settlementRoutes = require("./routes/settlementRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const cors = require("cors");
// dotenv.config()

require("./config/db")

const authRoutes = require("./routes/authRoutes")


const app = express()

app.use(express.json())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser())
app.use("/api/auth" , authRoutes)
app.use("/api/groups" , groupRoutes)
app.use("/api/expenses", expenseRoutes);
app.use("/api/settlements", settlementRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req,res) =>{
    res.send("Express Splitter is hridays app")
})

app.use((err, req, res, next) => {

    if (err instanceof multer.MulterError) {

        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "Receipt image must be smaller than 5MB"
            });
        }

        return res.status(400).json({
            message: err.message
        });
    }

    if (err.message === "Only JPEG, PNG and WebP images are allowed") {
        return res.status(400).json({
            message: err.message
        });
    }

    console.error("Unhandled Error:", err);

    return res.status(500).json({
        message: "Internal server error"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

