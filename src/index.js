// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import dbconnect from "./db/index.js";

dotenv.config();
dbconnect();

// // another way to connect with database
// import express from "express";
// import mongoose from "mongoose";
// import { Db_name } from "./constant.js";
// const app = express();
// console.log(process.env);
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGO_URL}/${Db_name}`);
//     app.on("error", (error) => {
//       console.log("Error", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log("app is listing on port", process.env.PORT);
//     });
//   } catch (error) {
//     console.log("error" + error);
//     throw error;
//   }
// })();
