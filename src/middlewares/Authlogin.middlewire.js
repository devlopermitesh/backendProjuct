import jwt from "jsonwebtoken";
import { APiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import User from "../models/User.model.js";
export const verifyJwt = asynchandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accesstoken ||
      req.header("Authorization")?.replace("Bearer ", ""); //this for app frontend
    console.log("token is +" + token);
    if (!token) {
      throw new APiError(401, "unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded token is ");
    console.log(decodedToken);
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
