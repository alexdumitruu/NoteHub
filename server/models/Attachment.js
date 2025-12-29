const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Attachment = sequelize.define("Attachment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file_type: {
        type: DataTypes.STRING, // 'image', 'pdf', etc.
        allowNull: false,
    },
});

module.exports = Attachment;
