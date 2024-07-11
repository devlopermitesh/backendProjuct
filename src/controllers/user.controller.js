import User from "../models/User.model.js";
import user from "../models/User.model.js";
import { APiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { Apiresonse } from "../utils/APiresonse.js";
const registerUser = asynchandler(async (req, res) => {
  //authenticvation check with username,email
  //check for image,check for4 avatar
  //upload them to cloudinary
  //get url from cloudinary
  //create user object -entry in mongoose
  // remove password and refresh token feild from response
  //check for user creation
  //return res
  //get userdata from frontend
  const { username, email, password, fullname } = req.body;
  // validation
  if (
    [username, email, password, fullname].some((value) => value?.trim() === "")
  ) {
    throw new APiError(400, "ALL field must required");
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new APiError(400, "user is already exist");
  }
  const avatarlocalpath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarlocalpath) {
    throw new APiError(409, "avatar file is must include");
  }
  const avatar = await uploadOnCloudinary(avatarlocalpath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new APiError(409, "avatar file is must include");
  } else {
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });
    const isusercreate = await User.findById(user._id).select(
      "-password -refreshtoken"
    );
    if (!isusercreate) {
      throw new APiError(500, "something went on server");
    }
    return res
      .status(200)
      .json(
        new Apiresonse(200, isusercreate, "User is register successfully ")
      );
  }
});

export { registerUser };
