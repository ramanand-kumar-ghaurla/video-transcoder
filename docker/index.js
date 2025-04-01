/**steps 
 * get the file from s3
 * download the file local with fs module
 * transecode the file with ffmpeg
 * 
*/

import {S3Client,GetObjectCommand, } from '@aws-sdk/client-s3'
import { uploadAllHLSFilesParallel } from './helper/uploadOnS3.js'
import {unlink,mkdir} from 'node:fs/promises'

import { createWriteStream} from 'node:fs'
import { pipeline } from 'node:stream/promises'
import {configDotenv} from 'dotenv'
import path from 'node:path'
import { exec } from 'node:child_process'
import { exit } from 'node:process'
import { promisify } from 'node:util'

configDotenv()

const s3client = new S3Client({
    requestHandler:{requestTimeout:600000},
   region: process.env.AWS_REGION,
    credentials: {
        accessKeyId:process.env.AWS_ACCESS_KEY ,
        secretAccessKey: process.env.AWS_SECRET_KEY},
    
})

const transcodeVideo = async ()=>{
    try {

         const key = process.env.KEY
         let result
         let originalFilePath

         console.log('key of original file',key)
       try {
         //get the file from s3
         const getcommand = new GetObjectCommand({
             Bucket: process.env.ORIGINAL_BUCKET_NAME,
             Key: key,
              })
 
          result = await s3client.send(getcommand)  
         
       
         //download file locally 
 
          originalFilePath = 'video.mp4';
     const writeStream = createWriteStream(originalFilePath);
     await pipeline(result.Body, writeStream);
 
     
       } catch (error) {
        console.log('error in getting object from s3',error)
       }

    // Prepare output directory
    const outputSuffix = key.split('.')[0];
    const outputPath = path.resolve(outputSuffix);
    await mkdir(outputPath, { recursive: true });

    

    

    // Transcode the video via ffmpeg
   

    const ffmpegCommand = `ffmpeg -hide_banner -y -i "${path.resolve(originalFilePath)}" \
    -map 0:v:0 -map 0:a:0 -vf scale=w=842:h=480:force_original_aspect_ratio=decrease -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -b:v 1400k -maxrate 1498k -bufsize 2100k -c:a aac -ar 48000 -b:a 128k \
    -map 0:v:0 -map 0:a:0 -vf scale=w=1280:h=720:force_original_aspect_ratio=decrease -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -b:v 2800k -maxrate 2996k -bufsize 4200k -c:a aac -ar 48000 -b:a 128k \
    -map 0:v:0 -map 0:a:0 -vf scale=w=1920:h=1080:force_original_aspect_ratio=decrease -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -b:v 5000k -maxrate 5350k -bufsize 7500k -c:a aac -ar 48000 -b:a 192k \
    -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \
    -hls_time 4 -hls_playlist_type vod -master_pl_name playlist.m3u8 \
    -hls_segment_filename "${outputPath}/%v_%03d.ts" -f hls "${outputPath}/%v.m3u8"

  `;
    


 
  


    const promiseExec = promisify(exec)

  try {
    const {stderr,stdout} =await promiseExec(ffmpegCommand)

    if(stdout){
        console.log('output of exec',stdout)
    }
    if(stderr){
        console.log('error in ffmpeg command ',stderr)
       
    }
    
   
   } catch (error) {
    if(originalFilePath){
        await unlink(originalFilePath);
       }
    console.log('error in ffmpeg command',error)
    return
   }

  // Cleanup original video
   if(originalFilePath){
    await unlink(originalFilePath);
   }
    console.log('Temporary files cleaned up.');

     const response = await uploadAllHLSFilesParallel(outputPath,outputSuffix)

     

     process.exit(0)

    } catch (error) {
       
        console.log('error in transcoding video',error)
        
        process.exit(1)
    }
}

transcodeVideo()
