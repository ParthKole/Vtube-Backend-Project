import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

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
      
      const user=await User.findOne({
        $or:[username,email]
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
            $set:{
                refreshToken:undefined
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

    return 
    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logout Successfull !"))
})

export {userRegister,userLogin,userLogout} ;