import jwt from "jsonwebtoken";
import { APiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import User from "../models/User.model.js";
export const verifyJwt = asynchandler(async (req, res, next) => {
  try {
    console.log(req.cookies);
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new APiError(401, "unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      " -password -refreshtoken"
    );
    if (!user) {
      throw new APiError(401, "invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new APiError(401, error?.message || "invalid acess token");
  }
});
