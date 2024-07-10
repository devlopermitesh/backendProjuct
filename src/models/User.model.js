import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const UserSchema = mongoose.Schema(
  {
    // id: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   lowercase: true,
    // },
    watchHistory: [
      {
        type: {
          VideoId: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
      },
    ],
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trime: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    FulLname: {
      type: String,
      trim: true,
      index: true,
      required: true,
    },
    avatar_url: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,

      required: true,
    },
    refreshtoken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  //to stop again again creating of password on every action use if
  if (this.isModifield("password")) {
    this.password = bcrypt.hash(this.password, 10);
    next();
  }
});
UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
UserSchema.methods.generateAc = async function () {
  return jwt.sign(
    {
      _id: this.id,
      username: this.username,
      email: this.email,
      fullname: this.FulLname,
    },
    process.env.ACCESS_TOKER_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKER_EXPIRY,
    }
  );
};
UserSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKE_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKE_EXPIRY,
    }
  );
};
export const UserModel = mongoose.model("User", UserSchema);
