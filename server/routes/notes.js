const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const noteController = require("../controllers/noteController");
const auth = require("../middleware/auth");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

/**
 * File filter for allowed types (images and PDFs)
 * @param {Object} req - Express request
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDFs are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Routes - IMPORTANT: Put specific routes before parameterized routes
router.get("/public", noteController.getPublicNotes); // Public notes (no auth required)
router.get("/", auth, noteController.getUserNotes);
router.post("/", auth, upload.single("attachment"), noteController.createNote);
router.put(
  "/:id",
  auth,
  upload.single("attachment"),
  noteController.updateNote
);
router.delete("/:id", auth, noteController.deleteNote);
router.delete(
  "/:noteId/attachments/:attachmentId",
  auth,
  noteController.deleteAttachment
);

module.exports = router;
