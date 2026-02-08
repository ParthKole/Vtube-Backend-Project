import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  
  if (channelId.toString() === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId
  });

  let isSubscribed=false;

  
  if (existingSubscription) {
    await existingSubscription.deleteOne();
    isSubscribed = false;
  } else {
    await Subscription.create({
      channel: channelId,
      subscriber: subscriberId
    });
    isSubscribed = true;
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { isSubscribed },
      "Subscription toggled successfully"
    )
  );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // controller to return subscriber list of a channel
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

  
  const subscriptions = await Subscription.find({ channel: channelId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .populate("subscriber", "username avatar");

  
    const subscribers = subscriptions.map(sub => sub.subscriber);

  res.status(200).json(
    new ApiResponse(
      200,
      subscribers,
      "Channel subscribers fetched successfully"
    )
  );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  // controller to return channel list to which user has subscribed
  const subscriberId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const subscriptions = await Subscription.find({
    subscriber: subscriberId
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .populate("channel", "username avatar");

  
  const channels = subscriptions.map(sub => sub.channel);

  res.status(200).json(
    new ApiResponse(
      200,
      channels,
      "Subscribed channels fetched successfully"
    )
  );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}