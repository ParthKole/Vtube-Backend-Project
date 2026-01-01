import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
const app=express();
const PORT=process.env.PORT||5000;

dotenv.config(
    {
    path :'./env'
    }
)


connectDB()
.then(()=>{
    app.listen(PORT, ()=>{
        console.log(`server is listening on PORT : ${PORT}`)
    }) 
    
    app.on("error",(error)=>{
        console.log("ERR : ",error);
        throw error;
    })
})
.catch((err)=>{
    console.log("mongoDB connction error!!!",err)
})