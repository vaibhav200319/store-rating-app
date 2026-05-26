import { PrismaClient } from "@prisma/client";

// Single Prisma instance for the whole app (avoids too many DB connections)
const prisma = new PrismaClient();

export default prisma;
