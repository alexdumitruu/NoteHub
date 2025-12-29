const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Note = sequelize.define("Note", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tags: {
        type: DataTypes.STRING, // Storing as comma-separated string or JSON string for simplicity
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('tags');
            return rawValue ? rawValue.split(',') : [];
        },
        set(val) {
            this.setDataValue('tags', Array.isArray(val) ? val.join(',') : val);
        }
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

module.exports = Note;
