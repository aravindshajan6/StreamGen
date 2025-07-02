import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";


export const protectedRoute = async(req, res, next) => {
    console.log("checking for protected route...........");
    try {
        const token = req.cookies.token;
        console.log("Token inside protected route : ", token);

        if(!token) {
            console.log("no token found while checking for protected route");
            return res.status(401).json({ message: "Unauthorized - no token"});
        }

        //check for user in jwt which we added while creating token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("decoded--------", decoded);
        if(!decoded)
        {
            return res.status(401).json({ message: "Unauthorized - invalid token"});
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user) {
            res.status(401).json({ message: "Unauthorized - invalid token" });
        }
        console.log("User ------------->", user);
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protected route : ", error);
        res.status(500).json({ message: "Internal server error" })
    }
}
    
