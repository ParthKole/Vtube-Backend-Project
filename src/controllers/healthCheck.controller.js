import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

const healthCheck=asyncHandler(async(req,res)=>{
    res.status(200).json(new ApiResponse(200, {status:"ok"}, "Health check successful"));
})

export {healthCheck};

