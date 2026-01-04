import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express();


//middl-wares 

//1.if cross origin request occurs then allow only these devices (means cors_origin)
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//2.to handle json data 
app.use(express.json({limit:"16kb"}))

//3.to handle different url's data 
app.use(express.urlencoded({extended:true,limit:"16kb"}))

//4.use saved files in public folder(public folder :used to temporarily save the data) 
app.use(express.static("public"))
app.use(cookieParser())

//routes :
import  userRouter  from "./routes/user.route.js";
app.use("/api/v1/user",userRouter);

export default app;
