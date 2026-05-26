import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  submitRating,
  updateRating,
  getMyRatings,
  getOwnerDashboard,
} from "../controllers/ratingController.js";

const router = Router();

// OWNER routes (define before /:storeId to avoid conflicts)
router.get(
  "/owner/dashboard",
  protect,
  authorizeRoles("OWNER"),
  getOwnerDashboard
);

// USER routes
router.get("/my-ratings", protect, authorizeRoles("USER"), getMyRatings);
router.post("/", protect, authorizeRoles("USER"), submitRating);
router.put("/:storeId", protect, authorizeRoles("USER"), updateRating);

export default router;
