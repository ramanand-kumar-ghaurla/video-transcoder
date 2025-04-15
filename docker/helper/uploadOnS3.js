import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createReadStream, statSync, readdirSync, unlinkSync, rmSync } from "fs";
import pLimit from "p-limit";
import { configDotenv } from "dotenv";
import path from "path";
import axios from "axios";
import { deleteOriginalFileFromS3 } from "./deleteOriginalFile.js";
import { sendWebhookRequestToMainApp} from './sendWebHook.js'

configDotenv();

const originalFileKey = process.env.KEY

// Determine content type
export const getContentType = (filePath) => {
    if (filePath.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
    if (filePath.endsWith(".ts")) return "video/MP2T";
    return "application/octet-stream";
};

const s3client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId:process.env.AWS_ACCESS_KEY ,
        secretAccessKey: process.env.AWS_SECRET_KEY}
});

// Generate pre-signed URL
export const getPreSignedUrl = async (key, contentType) => {
    try {
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.TRANSCODED_BUCKET_NAME,
            Key: key,
            ContentType: contentType
        });

        const signedUrl = await getSignedUrl(s3client, putObjectCommand, {
            expiresIn: 3600
        });

        return signedUrl;
    } catch (error) {
        console.error("Error in getting signed URL:", error);
        return null;
    }
};

// Upload single file
export const uploadFileOnS3 = async (filePath, signedUrl) => {
    try {
        const fileStream = createReadStream(filePath);
        const { size } = statSync(filePath); // ✅ FIXED: Use correct file size

        const response = await axios.put(signedUrl, fileStream, {
            headers: {
                "Content-Length": size, // ✅ FIXED: Use size, not blksize
                "Content-Type": getContentType(filePath),
            },
            timeout: 300000,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        console.log("Upload successful:", response.status);

        if(response.status ===200){
            unlinkSync(filePath)
        }

        return response
    } catch (error) {
        console.error(`Error uploading file ${filePath}:`, error);
    }
};

// Upload all files in parallel
export const uploadAllHLSFilesParallel = async (outputFolder, s3Folder) => {
    try {
        const files = readdirSync(outputFolder, { withFileTypes: true });

        

        const limit = pLimit(5); // ✅ FIXED: Correctly apply concurrency limit

        const uploadPromises = files.map((file) => limit(async () => {
            const localFilePath = path.join(outputFolder, file.name);
            const contentType = getContentType(file.name);
            const key = `${s3Folder}/${file.name}`;

            const signedUrl = await getPreSignedUrl(key, contentType);
            if (!signedUrl) {
                console.error("Skipping file due to signed URL failure:", file.name);
                return;
            }

           const response =  await uploadFileOnS3(localFilePath, signedUrl);

           return response

        }));

       const solvedPromises =  await Promise.all(uploadPromises);

       // if all status code 200 send seccess webhook req to main application

      if(solvedPromises.length >0){
       const allSuccessfulResult = solvedPromises.every((promise)=> promise.status === 200)

       if(allSuccessfulResult === true){

      // send webhook req to main application for transcoding update

      const response = await sendWebhookRequestToMainApp(`${s3Folder}/playlist.m3u8`,200)
      await deleteOriginalFileFromS3(originalFileKey)
      
       } else{

       const response = await sendWebhookRequestToMainApp(`${s3Folder}/playlist.m3u8`,403)
       await deleteOriginalFileFromS3(originalFileKey)
    }

      }
     
        rmSync(outputFolder,{
            recursive:true,
            force:true,

        })
    } catch (error) {
        if(outputFolder){
            rmSync(outputFolder,{
                recursive:true,
                force:true,
    
            })
        }
        console.error("Error in uploading all files:", error);
    }
};



