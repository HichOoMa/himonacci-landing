import { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Simple security check - this endpoint should only be used in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: "Not available in production" });
  }

  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin user already exists" });
    }

    // Create admin user
    const adminUser = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@hammem.com",
      password: "admin123456", // This will be hashed by the pre-save middleware
      isVerified: true,
      role: "admin",
      subscriptionStatus: "active",
      isAutoTradingEnabled: false,
      isAutoTradingAllowed: true,
    });

    await adminUser.save();

    res.status(201).json({
      message: "Admin user created successfully",
      admin: {
        email: adminUser.email,
        role: adminUser.role,
        id: adminUser._id
      }
    });

  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
