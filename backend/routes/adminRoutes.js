import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  getDashboard,
  createUser,
  getAllUsers,
  getUserById,
} from "../controllers/adminController.js";

const router = Router();

// All routes: authenticated + ADMIN only
router.use(protect, authorizeRoles("ADMIN"));

router.get("/dashboard", getDashboard);
router.post("/create-user", createUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

export default router;
