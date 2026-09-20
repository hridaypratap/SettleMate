const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const expenseController = require("../controllers/expenseController");

const router = express.Router();

router.post("/" , authMiddleware , expenseController.createExpenseController);
router.get("/group/:groupId" , authMiddleware , expenseController.getGroupExpensesController);
router.get("/group/:groupId/balances",authMiddleware,expenseController.getGroupBalancesController);

module.exports = router;