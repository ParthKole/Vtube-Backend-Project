import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Video } from '../models/video.model.js';
import { Like } from '../models/like.model.js';
import {Subscription} from "../models/subscription.model.js";


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId=req.user._id; //which is also a user 
    const channel=await User.findById(channelId);
    if(!channel){
        throw new ApiError(404,"Channel not found");
    }


     const allVideos=await Video.find({owner:channelId});
     const totalVideos=allVideos.length;
     let totalViews = 0;
     const videoIds = [];

    for (let video of allVideos) {
        totalViews += video.views;
        videoIds.push(video._id);
    }

    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    });

    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    });
  
    const stats = {
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers
    };
    res.status(200).json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

 
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  
  const videos = await Video.find({
    owner: channelId,
    isPublished: true
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .populate("owner", "username avatar");

  res.status(200).json(
    new ApiResponse(200, videos, "Channel videos fetched successfully")
  );
});


export {
    getChannelStats, 
    getChannelVideos
}