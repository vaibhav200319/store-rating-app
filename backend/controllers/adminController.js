import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";

const VALID_ROLES = ["ADMIN", "USER", "OWNER"];

const userSelect = {
  id: true,
  name: true,
  email: true,
  address: true,
  role: true,
};

/**
 * GET /api/admin/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: { totalUsers, totalStores, totalRatings },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/admin/create-user
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, password, address, role",
      });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed: ${VALID_ROLES.join(", ")}`,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        address: address.trim(),
        role,
      },
      select: userSelect,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/admin/users
 * Query: search, role, sort (name|email), order (asc|desc)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, sort = "name", order = "asc" } = req.query;

    const where = {};

    if (role && VALID_ROLES.includes(role)) {
      where.role = role;
    }

    if (search) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
        { address: { contains: term } },
      ];
    }

    const sortField = ["name", "email"].includes(sort) ? sort : "name";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      select: userSelect,
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: { users, count: users.length },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Average rating across all stores owned by a user
 */
const getOwnerAverageStoreRating = async (ownerId) => {
  const stores = await prisma.store.findMany({
    where: { ownerId },
    select: { id: true },
  });

  if (stores.length === 0) {
    return { averageStoreRating: null, storeCount: 0 };
  }

  const storeIds = stores.map((s) => s.id);

  const aggregate = await prisma.rating.aggregate({
    where: { storeId: { in: storeIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    averageStoreRating:
      aggregate._count.rating > 0
        ? Number(aggregate._avg.rating.toFixed(2))
        : null,
    storeCount: stores.length,
  };
};

/**
 * GET /api/admin/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const data = { ...user };

    if (user.role === "OWNER") {
      const ownerStats = await getOwnerAverageStoreRating(user.id);
      data.averageStoreRating = ownerStats.averageStoreRating;
      data.storeCount = ownerStats.storeCount;
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
