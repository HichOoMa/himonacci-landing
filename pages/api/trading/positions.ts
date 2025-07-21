import { NextApiRequest, NextApiResponse } from "next";
import Position from "@/models/position";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import Authenticate, { AuthenticatedRequest } from "@/utils/Authentificate";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const authError = await Authenticate(req, res);
    if (authError) return;

    await connectDB();

    const { page = 1, limit = 20, status } = req.query;

    const filter: any = { userId: req.user?._id };
    if (status) {
      filter.status = status;
    }

    const positions = await Position.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const totalCount = await Position.countDocuments(filter);

    res.status(200).json({
      positions: positions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get positions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
