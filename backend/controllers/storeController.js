import prisma from "../utils/prisma.js";

const storeSelect = {
  id: true,
  name: true,
  email: true,
  address: true,
  ownerId: true,
};

/**
 * Get average rating and count for a single store
 */
const getStoreRatingStats = async (storeId) => {
  const aggregate = await prisma.rating.aggregate({
    where: { storeId },
    _avg: { rating: true },
    _count: true,
  });

  return {
    averageRating:
      aggregate._count > 0
        ? Number(aggregate._avg.rating.toFixed(2))
        : null,
    totalRatings: aggregate._count,
  };
};

/**
 * Batch-fetch rating stats for multiple stores (avoids N+1 queries)
 */
const getRatingStatsForStores = async (storeIds) => {
  if (storeIds.length === 0) return {};

  const grouped = await prisma.rating.groupBy({
    by: ["storeId"],
    where: { storeId: { in: storeIds } },
    _avg: { rating: true },
    _count: true,
  });

  return Object.fromEntries(
    grouped.map((row) => [
      row.storeId,
      {
        averageRating:
          row._count > 0 ? Number(row._avg.rating.toFixed(2)) : null,
        totalRatings: row._count,
      },
    ])
  );
};

const attachRatingStats = (store, statsMap) => ({
  ...store,
  averageRating: statsMap[store.id]?.averageRating ?? null,
  totalRatings: statsMap[store.id]?.totalRatings ?? 0,
});

/**
 * POST /api/stores
 */
export const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || !email || !address || ownerId === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, address, ownerId",
      });
    }

    const parsedOwnerId = parseInt(ownerId, 10);
    if (isNaN(parsedOwnerId)) {
      return res.status(400).json({
        success: false,
        message: "ownerId must be a valid number",
      });
    }

    const owner = await prisma.user.findUnique({
      where: { id: parsedOwnerId },
      select: { id: true, role: true },
    });

    if (!owner || owner.role !== "OWNER") {
      return res.status(400).json({
        success: false,
        message: "ownerId must belong to a user with role OWNER",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingStore = await prisma.store.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: "Store email already exists",
      });
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        address: address.trim(),
        ownerId: parsedOwnerId,
      },
      select: storeSelect,
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: {
        ...store,
        averageRating: null,
        totalRatings: 0,
      },
    });
  } catch (error) {
    console.error("Create store error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Shared store listing logic (search, pagination, sort, average ratings)
 */
const listStores = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const { search, sort = "name", order = "asc" } = req.query;

    const where = {};

    if (search) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { address: { contains: term } },
      ];
    }

    const sortField = ["name", "email", "address"].includes(sort) ? sort : "name";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        select: storeSelect,
      }),
      prisma.store.count({ where }),
    ]);

    const statsMap = await getRatingStatsForStores(stores.map((s) => s.id));
    const storesWithRatings = stores.map((store) =>
      attachRatingStats(store, statsMap)
    );

    return res.status(200).json({
      success: true,
      message: "Stores fetched successfully",
      data: {
        stores: storesWithRatings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("List stores error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/** GET /api/stores — ADMIN only */
export const getAllStores = listStores;

/** GET /api/stores/browse — USER, OWNER, ADMIN */
export const getBrowseStores = listStores;

/**
 * GET /api/stores/:id
 */
export const getStoreById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const store = await prisma.store.findUnique({
      where: { id },
      select: storeSelect,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const ratingStats = await getStoreRatingStats(id);

    return res.status(200).json({
      success: true,
      message: "Store fetched successfully",
      data: {
        ...store,
        ...ratingStats,
      },
    });
  } catch (error) {
    console.error("Get store by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * DELETE /api/stores/:id
 */
export const deleteStore = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const store = await prisma.store.findUnique({ where: { id } });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Delete ratings first (foreign key constraint)
    await prisma.$transaction([
      prisma.rating.deleteMany({ where: { storeId: id } }),
      prisma.store.delete({ where: { id } }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Store deleted successfully",
      data: { id },
    });
  } catch (error) {
    console.error("Delete store error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
