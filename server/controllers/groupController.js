const StudyGroup = require("../models/StudyGroup");
const GroupMember = require("../models/GroupMember");
const User = require("../models/User");
const Note = require("../models/Note");
const Course = require("../models/Course");
const Attachment = require("../models/Attachment");

/**
 * Get groups for the authenticated user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      include: [
        {
          model: StudyGroup,
          as: "Groups",
          through: { attributes: [] },
        },
      ],
    });

    // Also get groups where user is admin
    const adminGroups = await StudyGroup.findAll({
      where: { admin_user_id: userId },
    });

    res.json({ memberOf: user.Groups, adminOf: adminGroups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a specific group with members
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getGroupDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.id;

    const group = await StudyGroup.findByPk(groupId, {
      include: [
        {
          model: User,
          as: "Members",
          attributes: ["id", "full_name", "email"],
          through: { attributes: ["joined_at"] },
        },
        {
          model: User,
          as: "Admin",
          attributes: ["id", "full_name", "email"],
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is a member or admin
    const isMember = group.Members.some((m) => m.id === userId);
    const isAdmin = group.admin_user_id === userId;

    if (!isMember && !isAdmin) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    res.json({ ...group.toJSON(), isAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Create a new group
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.createGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description } = req.body;

    const group = await StudyGroup.create({
      name,
      description,
      admin_user_id: userId,
    });

    // Add creator as member automatically
    await group.addMember(userId);

    res.status(201).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Invite a member to a group by email
 * @param {Object} req - Express request with email in body
 * @param {Object} res - Express response
 */
exports.inviteMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find the group
    const group = await StudyGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if requester is admin
    if (group.admin_user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the group admin can invite members" });
    }

    // Find the user by email
    const invitedUser = await User.findOne({ where: { email } });
    if (!invitedUser) {
      return res.status(404).json({ error: "User with this email not found" });
    }

    // Check if already a member
    const existingMembership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: invitedUser.id },
    });

    if (existingMembership) {
      return res
        .status(400)
        .json({ error: "User is already a member of this group" });
    }

    // Add member
    await GroupMember.create({
      group_id: groupId,
      user_id: invitedUser.id,
    });

    res.status(201).json({
      message: "Member invited successfully",
      member: {
        id: invitedUser.id,
        full_name: invitedUser.full_name,
        email: invitedUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get notes shared with a specific group
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getGroupNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.id;

    // Verify user is a member of the group
    const group = await StudyGroup.findByPk(groupId, {
      include: [{ model: User, as: "Members", attributes: ["id"] }],
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.Members.some((m) => m.id === userId);
    const isAdmin = group.admin_user_id === userId;

    if (!isMember && !isAdmin) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    // Get notes for this group
    const notes = await Note.findAll({
      where: { group_id: groupId },
      include: [
        { model: Course, attributes: ["name"] },
        { model: User, attributes: ["id", "full_name"] },
        { model: Attachment, as: "Attachments" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Remove a member from a group (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.removeMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id: groupId, memberId } = req.params;

    const group = await StudyGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if requester is admin
    if (group.admin_user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the group admin can remove members" });
    }

    // Cannot remove admin
    if (parseInt(memberId) === group.admin_user_id) {
      return res.status(400).json({ error: "Cannot remove the group admin" });
    }

    await GroupMember.destroy({
      where: { group_id: groupId, user_id: memberId },
    });

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
