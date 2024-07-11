// require("dotenv").config({ path: "./.env" });
import dotenv from "dotenv";
import dbconnect from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });
const port = process.env.PORT || 8000;
dbconnect()
  .then(() => {
    app.listen(port, (req, res) => {
      console.log("server is started", port);
    });
  })
  .catch((error) => console.log("mongo db error " + error));

// // another way to connect with database
// import express from "express";
// import mongoose from "mongoose";
// import { Db_name } from "./constant.js";
// const app = express();
// console.log(process.env);
// (async () => {
//   try {
//   const databaseResponse=  await mongoose.connect(`${process.env.MONGO_URL}/${Db_name}`);
// databaseResponse
//   .then(() => {
//     app.listen(port, (req, res) => {
//       console.log("server is started", port);
//     });
//   })
//   .catch(() => console.log("mongo db error " + error));
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
