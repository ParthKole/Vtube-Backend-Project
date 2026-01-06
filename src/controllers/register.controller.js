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
    console.log(req.body);    
    //step 2 :
    if(
        [fullName,email,username,password].some((field)=>
            field?.trim()===""
        )
    ) {
        throw new ApiError(400,"All Fields are Required !")
    }

    //step 3 :
        const existedUser=User.findOne(
            {
                $or:[{username},{email}]
            }
        )

        if(existedUser){
            throw new ApiError(409,"User Already Exists !")
        }

        const avatarLocalPath=req.files?.avatar[0]?.path;
        const coverImageLocalPath=req.files?.coverImage[0]?.path;

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar Required !")
        }

       

        const avatar= await uploadOnCloudinary(avatarLocalPath)
        const coverImage=await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400,"Avatar Required !")
        }

        const user=User.create({
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url||"",
            email,
            password,
            username:username.toLowerCase()
        })
        
        const createdUser=await user.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new ApiError(500,"Something Wrong while registering the User ! ")
        }

        return res.status(201).json(
            new ApiResponse(200,"User Registered Successfully")
        )
})

export default userRegister;