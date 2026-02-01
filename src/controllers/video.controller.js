import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    //Pagination : 
    const pageNumber=parseInt(page);
    const limitNumber=parseInt(limit);
    const skip=(pageNumber-1)*limitNumber;

    //filter 
    const filter={
        isPublished:true
    }

    if(query){
        filter.$or=[
            {title:{$regex:query,$options:"i"}},
            {description:{$regex:query,$options:"i"}}
        ]
    }

    if(userId){
        filter.owner=userId;
    }
    const sortOptions = {}
    if (sortBy) {
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1
    }
    else {
      sortOptions.createdAt = -1
    }

    //db query based on the filters added in the object
    const videos = await Video.find(filter)
    .populate("owner", "username avatar fullName")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNumber)

    if(!videos){
        throw new ApiError(404,"Videos not found");
    }

    const totalVideos=await Video.countDocuments(filter);

    res.status(200)
    .json(new ApiResponse(200,videos,"Videos fetched successfully",))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title||!description){
        throw new ApiError(404,"Title and Description is Required !");
    }
    //file validations : 
    //get localpath where the video is saved
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    //upload on cloudinary 
    const videoUpload= await uploadOnCloudinary(videoLocalPath);
    const thumbnailUpload=await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoUpload||!thumbnailUpload){
        throw new ApiError(500,"Video Upload on Cloudinary Failed !")
    }

    const video=await Video.create({
        title,
        description,
        videoFile:videoUpload.secure_url,
        thumbnail:thumbnailUpload.secure_url,
        duration:videoUpload.duration||0,
        owner:req.user._id,
        isPublished:true
    })

    res.status(201).
    json(new ApiResponse(201, video, "Video published successfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}