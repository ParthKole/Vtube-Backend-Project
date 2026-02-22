import dotenv from"dotenv";
dotenv.config();
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

    
const connectDB = async()=>{
    try{
        const mongo_res=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("DB Connected !!");
        console.log(`\n${mongo_res}`);
    }
    catch(error){
        console.log("MONGODB Error : ",error);
        throw error;
        process.exit(1);
    }
}

export default connectDB
 