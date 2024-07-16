//dotev for easy to fetch the varible from .env
import dotenv from "dotenv";
import dbconnect from "./db/index.js";
import { app } from "./app.js";
//providing path for config to dotevn
dotenv.config({ path: "./.env" });
const port = process.env.PORT || 8000;
//calling function for database connection and return promise
dbconnect()
  .then(() => {
    //if promise is succed then listen on port
    app.listen(port, (req, res) => {
      console.log("server is started", port);
    });
  })
  .catch((error) => console.log("mongo db error " + error));
