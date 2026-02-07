import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/Cloudinary.js"


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
        videoFile:{
            url:videoUpload.secure_url,
            public_id:videoUpload.public_id
        },
        thumbnail:{
            url:thumbnailUpload.secure_url,
            public_id:thumbnailUpload.public_id
        },
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
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
     throw new ApiError(400, "Invalid video id");
    }

  // Increment views + fetch updated video
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("owner", "username avatar fullName");

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (!video.isPublished) {
      throw new ApiError(403, "Video is not published yet");
    }

    // Update watch history (non-blocking)
     if (req.user?._id) {
      User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { watchHistory: videoId } }
      ).catch(() => {});
    }

    res
      .status(200)
      .json(new ApiResponse(200, video, "Video fetched successfully"));
})



const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const userId = req.user._id;

  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  if (!title && !description && !thumbnailLocalPath) {
    throw new ApiError(400, "Nothing to update");
  }

  if (title) video.title = title;
  if (description) video.description = description;

  if (thumbnailLocalPath) {
    //  Upload new thumbnail
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnailUpload) {
      throw new ApiError(500, "Thumbnail upload failed");
    }

    //  Delete old thumbnail (safe)
    deleteFromCloudinary(video.thumbnail?.public_id);

    
    video.thumbnail = {
      url: thumbnailUpload.secure_url,
      public_id: thumbnailUpload.public_id
    };
  }

  const updatedVideo = await video.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, updatedVideo, "Video updated successfully")
  );
});



const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // Delete assets from Cloudinary 
  deleteFromCloudinary(video.videoFile?.public_id);
  deleteFromCloudinary(video.thumbnail?.public_id);

  // Delete video document
  await Video.findByIdAndDelete(videoId);

  res.status(200).json(
    new ApiResponse(200, { deleted: true }, "Video deleted successfully")
  );
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId=req.user._id;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id");
    }

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    if(video.owner.toString()!==userId.toString()){
        throw new ApiError(403,"You are not authorized to update this video");
    }

    video.isPublished=!video.isPublished;
    await video.save({validateBeforeSave:false});

    res.status(200).json(new ApiResponse(200,video,"video publish status updated successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}