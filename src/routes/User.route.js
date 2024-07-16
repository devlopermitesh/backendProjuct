import { Router } from "express";
import { upload } from "../middlewares/multer.middlewire.js";
import {
  changeUserPassword,
  getCurrentUser,
  GetUserChannelProfile,
  getwatchHistory,
  login,
  logoutUser,
  refreshAcessToken,
  registerUser,
  updateAvatar,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/Authlogin.middlewire.js";
//Router is just like app but its provide more flexibility
const router = Router();
router.route("/register").post(
  //caling a fields method in upload
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(login);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshAcessToken);
router.route("/changepassword").post(verifyJwt, changeUserPassword);
router.route("/get-currentuser").get(verifyJwt, getCurrentUser);
router.route("/update-avatar").post(updateAvatar);
router.route("/channel/:username").get(verifyJwt, GetUserChannelProfile);
router.route("/watchHistory").get(verifyJwt, getwatchHistory);
export default router;
