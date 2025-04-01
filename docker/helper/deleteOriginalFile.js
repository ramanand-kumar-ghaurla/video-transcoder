import { S3Client,DeleteObjectCommand } from "@aws-sdk/client-s3";
import { configDotenv } from "dotenv";

configDotenv()



const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId:process.env.AWS_ACCESS_KEY ,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
})

export const deleteOriginalFileFromS3 = async(key)=>{

    const deleteCommand = new DeleteObjectCommand({
        Key:key,
        Bucket:process.env.ORIGINAL_BUCKET_NAME,
        
    })

const {$metadata,DeleteMarker} = await s3Client.send(deleteCommand)

console.log('response of delete object command',{
    $metadata,DeleteMarker
})

return {
    $metadata
}
}

