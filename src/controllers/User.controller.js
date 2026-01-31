import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import  mongoose  from "mongoose";
import jwt from "jsonwebtoken"

const userRegister= asyncHandler(async(req,res)=>{
    
    /*steps to register user :
      1.get user details from frontend
      2.validate the details -empty
      3.check if same username or mail exist in DB
      4.check for images and avatar 
      5.create user object - create entry in DB
      6.remove password and refresh token from the responce 
      7.check for user creation 
      8.return the responce
    */

      
   //step 1 :
    const {fullName,email,username,password}=req.body;
      
    //step 2 :
    if(
        [fullName,email,username,password].some((field)=>
            field?.trim()===""
        )
    ) {
        throw new ApiError(400,"All Fields are Required !")
    }


    //step 3 :
        const existedUser=await User.findOne(
            {
                $or:[{username},{email}]
            }
        )

        if(existedUser){
            throw new ApiError(409,"User Already Exists !")
        }

    //step 4:check for images and avatar
        const avatarLocalPath= req.files?.avatar[0]?.path;
        // const coverImageLocalPath= req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath=req.files.coverImage[0].path
        }

        if(!avatarLocalPath){
            throw new ApiError(401,"Avatar Required !")
        }

       

        const avatar= await uploadOnCloudinary(avatarLocalPath)
        const coverImage=await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400,"Avatar Required !")
        }
    //step 5:create a user object 
        const user=await User.create({
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url||"",
            email,
            password,
            username:username.toLowerCase()
        })
        
    //step 6: remove password and refresh token from the responce 
        const createdUser=await User.findById(user._id).select(
            "-password -refreshToken"
        )

    //step 7:check for user creation
        if(!createdUser){
            throw new ApiError(500,"Something Wrong while registering the User ! ")
        }
    //step 8:return the responce
        return res.status(201).json(
            new ApiResponse(200,createdUser,"User Registered Successfully")
        )
})

const generateAccessAndRefreshTokens=async (userId)=>{
    try {
     
        const user=await User.findById(userId);
        const accessToken=await user.generateAccessToken();        
        const refreshToken=await user.generateRefreshToken();

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something Went Wrong while generating token!",error)
    }
}

const userLogin =asyncHandler(async(req,res)=>{
    /*
      1.get first user details from the body
      2.validate the user details and password
      3.3.generate the tokens and cookies
    */

      const {username,email,password}=req.body;
      if(!username&&!email){
        throw new ApiError(400,"username or email is required !")
      }
      const user=await User.findOne({
        $or:[{ username }, { email }]
      })
      if(!user){
        throw new ApiError(404,"User/Email Not Found !")
      }

      const isPassValid=await user.isPasswordCorrect(password)
      if(!isPassValid){
        throw new ApiError(401,"Wrong Password !")
      }

      const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

       const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken"
       )

       const options ={
        httpOnly:true,
        secure:true
       }

       return res.status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",refreshToken,options)
       .json(
            new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"user logged in successfully!")
       )
})

const userLogout=asyncHandler(async(req,res)=>{
    await User.findOneAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    const options ={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logout Successfull !"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    try {
        const incomingRefreshToken=req.cookie.refreshToken ||req.body.refreshToken;
        if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorized Request !");
        }
    
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const User=await User.findById(decodedToken?._id);
        if(!User){
            throw new ApiError(401,"Invalid Refresh Token !");
        }
        if(incomingRefreshToken!==User?.refreshToken){
            throw new ApiError(401,"Refresh Token is Expired or Used !");
        }
    
        const options ={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken}= await generateAccessAndRefreshTokens(User._id);
    
        
       return res.status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",newRefreshToken,options)
       .json(
         new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"access Token Refreshed Successfully !")
       )
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid Refresh Token");
    }

    
})

const changeCurrentPassword =asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;

    
    const user=await user.findById(req.user?._id);
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid Password !")
    }

    user.password=password;
    user.save({validateBeforeSave:false});
    return res;
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body;

    if(!fullName||!email){
        throw new ApiError(400,"Fullname or email is invalid!")
    }

    const user =await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,
                email:email
            }
        }
        ,{new:true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"Account Details updated Successfully !"))

})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is Missing !")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
         throw new ApiError(500,"File Upload Failed !")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
        $set:{
            avatar:avatar.url
        }}
    ,{new:true}).select("-password")

    res.status(200)
    .json(new ApiResponse(200,user,"coverImage Updated Successfully !"))

})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage File is Missing !")
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
         throw new ApiError(500,"coverImage File Upload Failed !")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
        $set:{
            coverImage:coverImage.url
        }}
    ,{new:true}).select("-password")
    
    res.status(200)
    .json(new ApiResponse(200,user,"coverImage Updated Successfully !"))
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;
    if(!username){
        throw new ApiError(400,"Username missing !");
    }
    const channel=await User.aggregate([
        {
            $match:{
                username:username.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in : [new mongoose.Types.ObjectId(req.user._id),
                                "$subscribers.subscriber"]},
                        then:true,
                        else:false

                    }

                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                coverImage:1,
                avatar:1,
                isSubscribed:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(400,"channel does not exists");
    }

    res.status(200)
    .json(new ApiResponse(200,channel[0],"User Channel Fetched successfully !"))
});

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }

                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                    
                ]
            }
        },
        
    ])
    res.status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"Watch History fetched successfully !"))
})



export {
    userRegister,
    userLogin,
    userLogout,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} ;