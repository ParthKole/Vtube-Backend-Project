import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

 
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  
  const comments = await Comment.find({ video: videoId })
    .sort({ createdAt: -1 }) // newest first
    .skip(skip)
    .limit(limitNumber)
    .populate("owner", "username avatar");

  res.status(200).json(
    new ApiResponse(200, comments, "Comments fetched successfully")
  );
});


const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

 
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

 
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content cannot be empty");
  }

  
  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: userId
  });

  res.status(201).json(
    new ApiResponse(201, comment, "Comment added successfully")
  );
});


const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { updatedContent } = req.body;
    const userId = req.user._id;

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment id");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found");
    }
    if(comment.owner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not authorized to update this comment");
    }


    if (!updatedContent || updatedContent.trim() === "") {
        throw new ApiError(400, "Comment  cannot be empty");
    }

    comment.content=updatedContent.trim();
    await comment.save({validateBeforeSave:false});

    res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    const userId = req.user._id;
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment id");
    }

    const comment=await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found");
    }

    if(comment.owner.toString()!==userId.toString()){
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);
    res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }