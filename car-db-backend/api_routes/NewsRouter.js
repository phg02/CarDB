import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  createNews,
  getAllNewsForUsers,
  getAllNewsForAdmin,
  getNewsById,
  updateNews,
  deleteNews,
  restoreNews,
} from "../controller/NewsController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads/news");
// Ensure uploads/news directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  },
});

// ==================== CREATE NEWS (ADMIN ONLY) ====================
/**
 * Create a new news post
 * POST /api/news/create
 * Requires: Admin authentication
 * Multipart form data with optional thumbnail file
 * Body: { title, content, images[]? }
 */
router.post(
  "/create",
  verifyToken,
  isAdmin,
  upload.array("images", 10),
  createNews
);

// ==================== READ NEWS ====================
/**
 * Get all news posts (for users - published only)
 * GET /api/news?page=1&limit=10&search=keyword
 * Public endpoint - no authentication required
 * This must come BEFORE /:id route
 */
router.get("/", getAllNewsForUsers);

/**
 * Get all news posts (for admin - including deleted)
 * GET /api/news/admin/all?page=1&limit=10&isDeleted=false&search=keyword
 * Requires: Admin authentication
 * This must come BEFORE /:id route
 */
router.get("/admin/all", verifyToken, isAdmin, getAllNewsForAdmin);

/**
 * Get a single news post by ID
 * GET /api/news/:id
 * Public endpoint - no authentication required
 */
router.get("/:id", getNewsById);

// ==================== UPDATE NEWS (ADMIN ONLY) ====================
/**
 * Update news post
 * PATCH /api/news/:id
 * Requires: Admin authentication
 * Multipart form data with optional thumbnail file
 * Body: { title?, content?, images[]? }
 */
router.patch(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("thumbnail"),
  updateNews
);

// ==================== DELETE NEWS (ADMIN ONLY) ====================
/**
 * Delete news post (soft delete)
 * DELETE /api/news/:id
 * Requires: Admin authentication
 */
router.delete("/:id", verifyToken, isAdmin, deleteNews);

/**
 * Restore deleted news post
 * PATCH /api/news/:id/restore
 * Requires: Admin authentication
 */
router.patch("/:id/restore", verifyToken, isAdmin, restoreNews);

export default router;
