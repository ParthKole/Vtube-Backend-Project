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
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

export default app;
