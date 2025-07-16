import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

const authenticate = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    return null;
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await dbConnect();

  const authError = await authenticate(req, res);
  if (authError) return;

  // Check if user has active subscription
  if (req.user.subscriptionStatus !== "active") {
    return res.status(403).json({ message: "Active subscription required" });
  }

  try {
    switch (req.method) {
      case "GET":
        // Get user's favorites
        const favorites = req.user.tradingFavorites || [];
        res.status(200).json({ favorites });
        break;

      case "POST":
        // Add to favorites
        const { signalId, type } = req.body;
        
        if (!signalId || !type) {
          return res.status(400).json({ message: "signalId and type are required" });
        }

        const favoriteItem = { signalId, type, addedAt: new Date() };
        
        // Check if already exists
        const existingFavorites = req.user.tradingFavorites || [];
        const alreadyExists = existingFavorites.some(
          (fav: any) => fav.signalId === signalId && fav.type === type
        );

        if (alreadyExists) {
          return res.status(400).json({ message: "Already in favorites" });
        }

        await User.findByIdAndUpdate(req.user._id, {
          $push: { tradingFavorites: favoriteItem }
        });

        res.status(200).json({ message: "Added to favorites" });
        break;

      case "DELETE":
        // Remove from favorites
        const { signalId: removeId, type: removeType } = req.body;
        
        if (!removeId || !removeType) {
          return res.status(400).json({ message: "signalId and type are required" });
        }

        await User.findByIdAndUpdate(req.user._id, {
          $pull: { 
            tradingFavorites: { 
              signalId: removeId, 
              type: removeType 
            } 
          }
        });

        res.status(200).json({ message: "Removed from favorites" });
        break;

      default:
        res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error managing favorites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
