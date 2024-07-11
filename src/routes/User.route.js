import { Router } from "express";
import { upload } from "../middlewares/multer.middlewire.js";
import {
  login,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/Authlogin.middlewire.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(login);
router.route("/logout").post(verifyJwt, logoutUser);
export default router;
