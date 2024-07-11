import User from "../models/User.model.js";
import user from "../models/User.model.js";
import { APiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { Apiresonse } from "../utils/APiresonse.js";
import cookieParser from "cookie-parser";

const generateAccessAndRefereshToken = async (userID) => {
  // console.log("this is your secret key" + );
  try {
    const user = await User.findById(userID);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new APiError(
      500,
      `something went wrong while generating toke ${error}`
    );
  }
};
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

const login = asynchandler(async (req, res) => {
  //get username and email
  //check verfication
  //return error if unauthorized ;,give authorized session
  //send session in cookies
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new APiError(400, "username or email is must required");
  }
  const checkuser = await User.findOne({
    $or: [{ email }, { username }],
  }).exec();
  if (checkuser) {
    const ispasswordcorrect = await checkuser.isPasswordCorrect(password);
    if (!ispasswordcorrect) {
      throw new APiError(400, "password is incorrect");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
      checkuser._id
    );
    const LoggedInuser = await User.findById(checkuser._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refereshtoken", refreshToken, options)
      .json(
        new Apiresonse(
          200,
          {
            user: LoggedInuser,
            accessToken,
            refreshToken,
          },
          "User is logged in successfully"
        )
      );
  } else {
    throw new APiError(409, "username ,password is incorrect");
  }
});

const logoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresonse(200, {}, "User is logged out"));
});
export { registerUser, login, logoutUser };
