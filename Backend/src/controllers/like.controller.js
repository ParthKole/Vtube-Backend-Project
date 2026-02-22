import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  
  const existingLike = await Like.findOne({
    video: videoId,
    likedby: userId
  });

  let liked;

  
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    liked = false;
  } else {
    await Like.create({
      video: videoId,
      likedby: userId
    });
    liked = true;
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { liked },
      "Video like toggled successfully"
    )
  );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  // Check comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if like already exists
  const existingLike = await Like.findOne({
    comment: commentId,
    likedby: userId
  });

  let liked;

  // Toggle logic
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    liked = false;
  } else {
    await Like.create({
      comment: commentId,
      likedby: userId
    });
    liked = true;
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { liked },
      "comment like toggled successfully"
    )
  );
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId=req.user._id;
    //TODO: toggle like on tweet
    if(!mongoose.Types.ObjectId.isValid(tweetId)){     
        throw new ApiError(400,"Invalid tweet id");
     }

    const tweet=await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }

    const existingLike=await Like.findOne({
        tweet:tweetId,
        likedby:userId
    })

    let liked;

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        liked=false;
    }else{
        await Like.create({
            tweet:tweetId,
            likedby:userId
        })
        liked=true;
    }

    res.status(200).json(new ApiResponse(200,{liked},"Tweet like toggled successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likes = await Like.find({
    likedby: userId,
    video: { $ne: null }
  }).populate("video");

  // keep only published videos
  const likedVideos = likes
    .filter(like => like.video && like.video.isPublished === true)
    .map(like => like.video);

  res.status(200).json(
    new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
  );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}