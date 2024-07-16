import User from "../models/User.model.js";
import user from "../models/User.model.js";
import { APiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { Apiresonse } from "../utils/APiresonse.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import mongoose, { set } from "mongoose";
import { verifyJwt } from "../middlewares/Authlogin.middlewire.js";
const generateAccessAndRefereshToken = async (userID) => {
  // console.log("this is your secret key" + );
  try {
    const user = await User.findById(userID);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshtoken = refreshToken;
    console.log("this is user and going to be save");
    console.log(user);
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
      "-password -refreshtoken"
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accesstoken", accessToken, options)
      .cookie("refreshtoken", refreshToken, options)
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
    { $unset: { refreshToken:1 } },
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

const refreshAcessToken = asynchandler(async (req, res) => {
  //access refreshaccestoken?...cookies
  const incomingRefreshToken =
    req.cookies?.refreshtoken || req.body.refreshtoken;
  if (!incomingRefreshToken) {
    throw new APiError(401, "unauthorised requist");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id).select("-password ");

    if (!user) {
      throw new APiError(401, "invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshtoken) {
      throw new APiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accesstoken, newrefreshToken } =
      await generateAccessAndRefereshToken(user._id);
    return res
      .status(200)
      .cookie("accesstoken", accesstoken, options)
      .cookie("refreshtoken", newrefreshToken, options)
      .json(
        new Apiresonse(
          200,
          { accesstoken, refreshToken: newrefreshToken },
          "access token is refreshed"
        )
      );
  } catch (error) {
    throw new APiError(
      401,
      `something is went wrong ${error?.message || "::check!!"}`
    );
  }
});

const changeUserPassword = asynchandler(async (req, res) => {
  //oldpassword,newpassword

  const { oldpassword, newpassword } = req.body;
  console.log(req.r);
  //user is already login and thats because he/she can change to feature of changeuserpassword means we have req.user (ref: verifyJwt)
  const user = await User.findById(req.user?._id);
  //isPasswordcorrect() take para as oldpassword and bcrypt and compare that with olduserpassword (ref:User.module)
  const ispasswordcorrect = user.isPasswordCorrect(oldpassword);
  if (!ispasswordcorrect) {
    throw new APiError(400, "invalid old password");
  }
  //if oldpassword is correct then save new password ref(User.module)
  user.password = newpassword;
  await user
    .save({ validateBeforeSave: false })
    .then(() => {
      return res
        .status(200)
        .json(new Apiresonse(200, "password is successfull changed!!"));
    })
    .catch((error) => {
      throw new APiError(
        500,
        `something went wrong ${error?.message || "your password cant be change"}`
      );
    });
});

const getCurrentUser = asynchandler(async (req, res) => {
  console.log(req.user);
  return res
    .status(200)
    .json(new Apiresonse(200, req.user, "get current user successfully"));
});

const updateUserDetail = asynchandler(async (req, res) => {
  const { fullname } = req.body;
  if (!fullname) {
    throw new APiError(400, "full name is required");
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
      },
    },
    { new: true }
  ).select("-password");
  return await res
    .status(200)
    .json(new Apiresonse(200, user, "fullname is updated"));
});
const updateAvatar = asynchandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new APiError(400, "avatar file is missing");
  }
  //for delete image from cloudinary
  const foruser = User.findById(req.user?._id).select(
    "-password -refreshtoken"
  );

  if (!foruser) {
    throw new APiError(500, "User is not found ,something is went wrong");
  }
  if (foruser.avatar) {
    const oldAvatarPublicId = foruser.avatar.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(
      oldAvatarPublicId,
      function (error, result) {
        if (error) {
          console.error("Error deleting old cover image:", error);
        } else {
          console.log("Old cover image deleted successfully:", result);
        }
      }
    );
  }

  const avatarupdateclodinary = await uploadOnCloudinary(avatarLocalPath);

  if (!avatarupdateclodinary.url) {
    throw new APiError(400, "Error while uploding Image in avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatarupdateclodinary.url,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(new Apiresonse(200, user, "avatar is updated"));
});
const updatecoverImage = asynchandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new APiError(400, "coverImage file is missing");
  }
  const foruser = User.findById(req.user._id);

  const oldCoverPublicId = foruser?.coverImage?.split("/").pop().split(".")[0];
  await cloudinary.uploader.destroy(oldCoverPublicId, function (error, result) {
    if (error) {
      console.error("Error deleting old cover image:", error);
    } else {
      console.log("Old cover image deleted successfully:", result);
    }
  });
  const coverImageupdateclodinary =
    await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImageupdateclodinary.url) {
    throw new APiError(400, "Error while uploding Image in coverImage");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImageupdateclodinary.url,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new Apiresonse(200, user, "coverImage is updated"));
});

const GetUserChannelProfile = asynchandler(async (req, res) => {
  const { username } = req.params;
  if (username?.trim() == "") {
    throw new APiError(401, "user name is not defined");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subsribeTo",
      },
    },
    {
      $addFields: {
        subcriberCount: {
          $size: { $ifNull: ["$subscribers", []] },
        },
        channelsSubsribedTOcount: {
          $size: { $ifNull: ["$subscribeTo", []] },
        },
        issubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, { $ifNull: ["$subscriber.subcriber", []] }],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subcriberCount: 1,
        channelsSubsribedTOcount: 1,
        issubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  console.log(channel);
  if (!channel?.length) {
    throw new APiError(404, "channel does not exist");
  }
  return res
    .status(200)
    .json(new Apiresonse(200, channel, "user channel is found successfully"));
});

const getwatchHistory = asynchandler(async (req, res) => {
  let history = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user.id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              watchHistory: 1,
            },
          },
        ],
      },
    },
  ]);
  console.log("history is");
  console.log(history);
  if (!history) {
    throw new APiError(404, "watch history not found");
  }

  res
    .status(200)
    .json(new Apiresonse(200, history, "watch history get found successfully"));
});

export {
  registerUser,
  login,
  logoutUser,
  refreshAcessToken,
  changeUserPassword,
  getCurrentUser,
  updateAvatar,
  updateUserDetail,
  updatecoverImage,
  GetUserChannelProfile,
  getwatchHistory,
};
