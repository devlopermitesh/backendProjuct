//need mongoose for database connection and name for databse
import mongoose from "mongoose";
import { Db_name } from "../constant.js";
//function for connect to database and return a promise
const dbconnect = async () => {
  try {
    //mongoose.connect method help to connect mongo db by url of database location
    const dbresponse = await mongoose.connect(
      `${process.env.MONGO_URL}/${Db_name}`
    );
  } catch (error) {
    console.log("error :" + error);
    //process.exit is a method provided by Node.js that exits the current process. and 1 for somekind of failur to prevent continue running
    process.exit(1);
  }
};

export default dbconnect;
