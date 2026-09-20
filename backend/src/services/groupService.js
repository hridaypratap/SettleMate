const Group = require("../models/Group")
const User = require("../models/User")
const Expense = require("../models/Expense")

const createGroup = async (name, userId) =>{
    
    const group = await Group.create({
        name,
        createdBy: userId,
        members:[userId]
    })

    return group;

};

const getUserGroups = async (userId) =>{
    const groups = await Group.find({
        members: userId
    })

    return groups;

};

const getGroupById = async (groupId, userId) => {
    const group = await Group.findOne({
        _id: groupId,
        members: userId
    }).populate("members", "name email")

    return group;
};

const addMember = async (groupId, email, requestingUserId) => {
    // Finding Group
    const group = await Group.findOne({
        _id: groupId,
        members: requestingUserId
    });

    if (!group) {
        return { error: "GROUP_NOT_FOUND_OR_NOT_MEMBER" };
    }

    // Finding User by email
    const user = await User.findOne({
        email: email.toLowerCase().trim()
    });

    if (!user) {
        return { error: "USER_NOT_FOUND" };
    }

    // Check if already a member
    if (
        group.members.some(
            memberId => memberId.toString() === user._id.toString()
        )
    ) {
        return { error: "USER_ALREADY_MEMBER" };
    }

    // Add user
    group.members.push(user._id);

    await group.save();

    await group.populate("members", "name email")

    return { group };
};

const removeMember = async (groupId, memberId, requestingUserId) => {
    const group = await Group.findOne({
        _id: groupId,
        createdBy: requestingUserId
    })

    if (!group) {
        return { error: "GROUP_NOT_FOUND_OR_NOT_OWNER" }
    }

    if (group.createdBy.toString() === memberId) {
        return { error: "CANNOT_REMOVE_OWNER" }
    }

    const isMember = group.members.some(
        id => id.toString() === memberId
    )

    if (!isMember) {
        return { error: "USER_NOT_MEMBER" }
    }

    const hasExpenses = await Expense.findOne({
        group: groupId,
        $or: [
            { paidBy: memberId },
            { "splitAmong.user": memberId }
        ]
    })

    if (hasExpenses) {
        return { error: "USER_HAS_EXPENSES" }
    }

    group.members = group.members.filter(
        id => id.toString() !== memberId
    )

    await group.save()
    await group.populate("members", "name email")

    return { group }
}

const deleteGroup = async (groupId, requestingUserId) => {
    const group = await Group.findOne({
        _id: groupId,
        createdBy: requestingUserId
    })

    if (!group) {
        return { error: "GROUP_NOT_FOUND_OR_NOT_OWNER" }
    }

    await Expense.deleteMany({
        group: groupId
    })

    await Group.deleteOne({
        _id: groupId
    })

    return { success: true }
}

module.exports = { createGroup , getUserGroups, getGroupById , addMember , removeMember , deleteGroup}