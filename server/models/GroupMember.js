const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GroupMember = sequelize.define("GroupMember", {
    joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false
});

module.exports = GroupMember;
