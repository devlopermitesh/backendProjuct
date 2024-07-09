import mongoose from "mongoose";
import { Db_name } from "../constant.js";

const dbconnect = async () => {
  try {
    const dbresponse = await mongoose.connect(
      `${process.env.MONGO_URL}/${Db_name}`
    );
    console.log("mongose is responsive on ", dbresponse.connection.host);
  } catch (error) {
    console.log("error :" + error);
    process.exit(1);
  }
};

export default dbconnect;
