import dotenv from "dotenv";
dotenv.config();
import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret:process.env.CLOUDINARY_CLOUD_SECRET
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null;
        const responce = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        // console.log("File Uploaded on Cloudinary !",responce.url);
         fs.unlinkSync(localFilePath);
        return responce;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        //remove the locally saved file as it saved in temporary file on the server b'cuz upload got failed
        return null;
    }
}

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto"
    });

    return response; 
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
    return null;
  }
};


export {uploadOnCloudinary,deleteFromCloudinary}