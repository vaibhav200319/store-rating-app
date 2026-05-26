import prisma from "../utils/prisma.js";

/**
 * Validate rating is an integer between 1 and 5
 */
const validateRating = (rating) => {
  const value = parseInt(rating, 10);
  if (isNaN(value) || value < 1 || value > 5) return null;
  return value;
};

const storeSummarySelect = {
  id: true,
  name: true,
  email: true,
  address: true,
};

/**
 * POST /api/ratings
 * Submit rating — creates new or updates if user already rated this store
 */
export const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    if (storeId === undefined || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "storeId and rating are required",
      });
    }

    const parsedStoreId = parseInt(storeId, 10);
    const validRating = validateRating(rating);

    if (isNaN(parsedStoreId)) {
      return res.status(400).json({
        success: false,
        message: "storeId must be a valid number",
      });
    }

    if (validRating === null) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const store = await prisma.store.findUnique({
      where: { id: parsedStoreId },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const existing = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId: parsedStoreId,
        },
      },
    });

    // Upsert: @@unique([userId, storeId]) prevents duplicate rows
    const result = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId: parsedStoreId,
        },
      },
      update: { rating: validRating },
      create: {
        userId: req.user.id,
        storeId: parsedStoreId,
        rating: validRating,
      },
      include: {
        store: { select: storeSummarySelect },
      },
    });

    const isUpdate = Boolean(existing);

    return res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate
        ? "Rating updated successfully"
        : "Rating submitted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Submit rating error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * PUT /api/ratings/:storeId
 * Update only the logged-in user's rating for a store
 */
export const updateRating = async (req, res) => {
  try {
    const parsedStoreId = parseInt(req.params.storeId, 10);
    const { rating } = req.body;

    if (isNaN(parsedStoreId)) {
      return res.status(400).json({
        success: false,
        message: "storeId must be a valid number",
      });
    }

    const validRating = validateRating(rating);

    if (validRating === null) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const existing = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId: parsedStoreId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "You have not rated this store yet",
      });
    }

    const updated = await prisma.rating.update({
      where: { id: existing.id },
      data: { rating: validRating },
      include: {
        store: { select: storeSummarySelect },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Rating updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update rating error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/ratings/my-ratings
 */
export const getMyRatings = async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: { userId: req.user.id },
      include: {
        store: { select: storeSummarySelect },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Your ratings fetched successfully",
      data: { ratings, count: ratings.length },
    });
  } catch (error) {
    console.error("Get my ratings error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/ratings/owner/dashboard
 * All stores owned by logged-in OWNER with rating stats and raters
 */
export const getOwnerDashboard = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      where: { ownerId: req.user.id },
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const storeIds = stores.map((s) => s.id);

    // Batch aggregate for average ratings (efficient for many stores)
    const aggregates =
      storeIds.length > 0
        ? await prisma.rating.groupBy({
            by: ["storeId"],
            where: { storeId: { in: storeIds } },
            _avg: { rating: true },
            _count: true,
          })
        : [];

    const statsMap = Object.fromEntries(
      aggregates.map((row) => [
        row.storeId,
        {
          averageRating:
            row._count > 0 ? Number(row._avg.rating.toFixed(2)) : null,
          totalRatings: row._count,
        },
      ])
    );

    const dashboard = stores.map((store) => {
      const { id, name, email, address, ratings } = store;

      return {
        store: { id, name, email, address },
        averageRating: statsMap[id]?.averageRating ?? null,
        totalRatings: statsMap[id]?.totalRatings ?? 0,
        ratedBy: ratings.map((r) => ({
          userId: r.user.id,
          name: r.user.name,
          email: r.user.email,
          rating: r.rating,
          ratedAt: r.id,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      message: "Owner dashboard fetched successfully",
      data: {
        stores: dashboard,
        storeCount: dashboard.length,
      },
    });
  } catch (error) {
    console.error("Owner dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
