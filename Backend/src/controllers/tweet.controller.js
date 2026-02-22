import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    const userId=req.user._id;
    
    const newTweet=await Tweet.create({
        content:content.trim(),
        owner:userId
    })

    res.status(201).json(new ApiResponse(201,newTweet,"Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  
  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const tweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  res.status(200).json(
    new ApiResponse(200, tweets, "User tweets retrieved successfully")
  );
});


const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;

    if(!content || content.trim() === ""){
        throw new ApiError(400,"Tweet content is required");
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet ID");
    }

    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweet not found");
    }
    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to update this tweet");
    }

    tweet.content=content.trim();
    await tweet.save({validateBeforeSave:false});

    res.status(200).json(new ApiResponse(200,tweet,"Tweet updated successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    const userId = req.user._id;
    const tweet = await Tweet.findById(tweetId); 
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    await tweet.deleteOne();
    res.status(200).json(
        new ApiResponse(200, null, "Tweet deleted successfully")
    );
});

const getAllTweets = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10 } = req.query;

    // Convert to numbers safely
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, parseInt(limit) || 10);

    const skip = (pageNumber - 1) * limitNumber;

    // Fetch tweets with pagination
    const tweets = await Tweet.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("owner", "fullname username email avatar");

    // Get total tweet count
    const totalTweets = await Tweet.countDocuments();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                totalTweets,
                totalPages: Math.ceil(totalTweets / limitNumber),
                currentPage: pageNumber
            },
            "All tweets retrieved successfully"
        )
    );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
}