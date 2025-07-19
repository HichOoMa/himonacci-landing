import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import User, { IUser } from "@/models/User";

interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

const Authenticate = async (req: AuthenticatedRequest, res: NextApiResponse) => {
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

export default Authenticate;
export type { AuthenticatedRequest };

