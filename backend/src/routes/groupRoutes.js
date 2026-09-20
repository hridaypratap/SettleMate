const express = require("express");
const authMiddleware = require("../middleware/authMiddleware")
const groupController = require("../controllers/groupController")
const router = express.Router();
router.post("/" , authMiddleware , groupController.createGroupController)
router.get("/" , authMiddleware , groupController.getUserGroupsController)
router.get("/:groupId" , authMiddleware , groupController.getGroupByIdController)
router.post("/:groupId/members" , authMiddleware , groupController.addMemberController)
router.delete(
    "/:groupId/members/:memberId",
    authMiddleware,
    groupController.removeMemberController
)
router.delete(
    "/:groupId",
    authMiddleware,
    groupController.deleteGroupController
)

module.exports = router;