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

        console.log("File Uploaded on Cloudinary !",responce.url);
        return responce;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        //remove the locally saved file as it saved in temporary file on the server b'cuz upload got failed
        return null;
    }
}

export {uploadOnCloudinary}