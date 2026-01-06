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

export default userRegister;