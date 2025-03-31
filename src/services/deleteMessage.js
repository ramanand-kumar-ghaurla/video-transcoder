import { DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { configDotenv } from "dotenv";

configDotenv()

const deleteMessageFromQueue = async(recieptHandler)=>{

  try {
      if(!queueURL || !recieptHandler){
          throw new Error("queue url and reciept handler is required to delete message");
          
      }
  
      const sqsClient = new SQSClient({
          credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY,
              secretAccessKey: process.env.AWS_SECRET_KEY,
          },
          region: process.env.AWS_REGION,
      })
  
      const deleteCommand = new DeleteMessageCommand({
          QueueUrl:process.env.UPLOAD_QUEUE_URL ,
          ReceiptHandle: recieptHandler,
      });
      await sqsClient.send(deleteCommand);
      console.log(`Deleted message with ID: ${MessageId}`);

      
  } catch (error) {
    
    throw new Error("error in deleting message from queue");
    
  }
}

export {deleteMessageFromQueue}