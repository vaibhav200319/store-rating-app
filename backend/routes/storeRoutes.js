import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  createStore,
  getAllStores,
  getBrowseStores,
  getStoreById,
  deleteStore,
} from "../controllers/storeController.js";

const router = Router();

// IMPORTANT: /browse must be registered BEFORE /:id and BEFORE admin-only middleware.
// Otherwise Express treats "browse" as :id and applies ADMIN-only rules → 403 for USER.

// GET /api/stores/browse — USER, OWNER, ADMIN
router.get(
  "/browse",
  protect,
  authorizeRoles("ADMIN", "USER", "OWNER"),
  (req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[stores] GET /browse role=${req.user?.role}`);
    }
    next();
  },
  getBrowseStores
);

// Admin-only routes below
router.use(protect, authorizeRoles("ADMIN"));

router.post("/", createStore);
router.get("/", getAllStores);
router.get("/:id", getStoreById);
router.delete("/:id", deleteStore);

export default router;
