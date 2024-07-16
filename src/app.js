import express from "express";
import cors from "cors"; //cors for prevent from cors error of browserr
import cookieParser from "cookie-parser"; //its a middlewire that use to xtracts the cookies from the request headers
const app = express();
//middlewire for cors use to set the origin for browser and true credential so browser allow server to read cookies
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
//middler wire for set the limit of data pass by express
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routess for routing discribtion
import userrouter from "./routes/User.route.js";

//routes declaration of user comman
app.use("/api/v1/users", userrouter);

export { app };
