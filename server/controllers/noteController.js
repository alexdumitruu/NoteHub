const Note = require("../models/Note");
const Course = require("../models/Course");
const Attachment = require("../models/Attachment");
const { Op } = require("sequelize");

// Get all notes for the authenticated user
exports.getUserNotes = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notes = await Note.findAll({
            where: { user_id: userId },
            include: [
                { model: Course, attributes: ['name'] },
                { model: Attachment, as: 'Attachments' }
            ],
            order: [['created_at', 'DESC']] // Assuming created_at exists (default timestamps)
        });
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Create a new note
exports.createNote = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, content, course_id, tags, is_public } = req.body;

        const newNote = await Note.create({
            title,
            content,
            user_id: userId,
            course_id,
            tags,
            is_public
        });

        res.status(201).json(newNote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update a note
exports.updateNote = async (req, res) => {
    try {
        const userId = req.user.userId;
        const noteId = req.params.id;
        const { title, content, tags, is_public } = req.body;

        const note = await Note.findOne({ where: { id: noteId, user_id: userId } });
        if (!note) {
            return res.status(404).json({ error: "Note not found" });
        }

        await note.update({ title, content, tags, is_public });
        res.json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete a note
exports.deleteNote = async (req, res) => {
    try {
        const userId = req.user.userId;
        const noteId = req.params.id;

        const deleted = await Note.destroy({ where: { id: noteId, user_id: userId } });
        if (!deleted) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
