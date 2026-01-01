const Note = require("../models/Note");
const Course = require("../models/Course");
const Attachment = require("../models/Attachment");
const User = require("../models/User");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

/**
 * Get all notes for the authenticated user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getUserNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await Note.findAll({
      where: { user_id: userId },
      include: [
        { model: Course, attributes: ["name"] },
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
 * Get all public notes (accessible without authentication)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getPublicNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { is_public: true },
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
 * Create a new note with optional file attachment
 * @param {Object} req - Express request (may contain req.file from multer)
 * @param {Object} res - Express response
 */
exports.createNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, content, course_id, tags, is_public, group_id } = req.body;

    // Parse tags if it's a string (from FormData)
    let parsedTags = tags;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    const newNote = await Note.create({
      title,
      content,
      user_id: userId,
      course_id: course_id || null,
      tags: parsedTags,
      is_public: is_public === "true" || is_public === true,
      group_id: group_id || null,
    });

    // Handle file attachment if present
    if (req.file) {
      const fileType = req.file.mimetype.startsWith("image/") ? "image" : "pdf";
      await Attachment.create({
        note_id: newNote.id,
        file_url: `/uploads/${req.file.filename}`,
        file_type: fileType,
        original_name: req.file.originalname,
      });
    }

    // Fetch the note with attachments to return
    const noteWithAttachments = await Note.findByPk(newNote.id, {
      include: [
        { model: Course, attributes: ["name"] },
        { model: Attachment, as: "Attachments" },
      ],
    });

    res.status(201).json(noteWithAttachments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a note with optional file attachment
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.updateNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;
    const { title, content, tags, is_public, group_id } = req.body;

    const note = await Note.findOne({ where: { id: noteId, user_id: userId } });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Parse tags if it's a string (from FormData)
    let parsedTags = tags;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    await note.update({
      title,
      content,
      tags: parsedTags,
      is_public: is_public === "true" || is_public === true,
      group_id: group_id || null,
    });

    // Handle new file attachment if present
    if (req.file) {
      const fileType = req.file.mimetype.startsWith("image/") ? "image" : "pdf";
      await Attachment.create({
        note_id: note.id,
        file_url: `/uploads/${req.file.filename}`,
        file_type: fileType,
        original_name: req.file.originalname,
      });
    }

    // Fetch updated note with attachments
    const updatedNote = await Note.findByPk(note.id, {
      include: [
        { model: Course, attributes: ["name"] },
        { model: Attachment, as: "Attachments" },
      ],
    });

    res.json(updatedNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a note and its attachments
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;

    // Find note with attachments
    const note = await Note.findOne({
      where: { id: noteId, user_id: userId },
      include: [{ model: Attachment, as: "Attachments" }],
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Delete attachment files from disk
    if (note.Attachments && note.Attachments.length > 0) {
      for (const attachment of note.Attachments) {
        const filePath = path.join(__dirname, "..", attachment.file_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      // Delete attachment records
      await Attachment.destroy({ where: { note_id: noteId } });
    }

    await note.destroy();
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a specific attachment from a note
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.deleteAttachment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { noteId, attachmentId } = req.params;

    // Verify the note belongs to the user
    const note = await Note.findOne({ where: { id: noteId, user_id: userId } });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Find and delete the attachment
    const attachment = await Attachment.findOne({
      where: { id: attachmentId, note_id: noteId },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, "..", attachment.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await attachment.destroy();
    res.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
