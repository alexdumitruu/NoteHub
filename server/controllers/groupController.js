const StudyGroup = require("../models/StudyGroup");
const GroupMember = require("../models/GroupMember");
const User = require("../models/User");

// Get groups for the user
exports.getUserGroups = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findByPk(userId, {
            include: [{
                model: StudyGroup,
                as: 'Groups',
                through: { attributes: [] }
            }]
        });

        // Also get groups where user is admin
        const adminGroups = await StudyGroup.findAll({ where: { admin_user_id: userId } });

        // Combine (simplified for now, might duplicate if admin is also member)
        res.json({ memberOf: user.Groups, adminOf: adminGroups });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Create a group
exports.createGroup = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, description } = req.body;

        const group = await StudyGroup.create({
            name,
            description,
            admin_user_id: userId
        });

        // Add creator as member automatically
        await group.addMember(userId);

        res.status(201).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
