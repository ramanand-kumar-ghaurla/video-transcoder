import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { configDotenv } from 'dotenv';
import { deleteMessageFromQueue } from './deleteMessage.js';
import { deleteOriginalFileFromS3 } from './deleteOriginalFile.js';
import {verifyContainerRes} from '../webhook/containerRes.js'


configDotenv();

const verifyMessage = async () => {
    try {
        const sqsClient = new SQSClient({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
            },
            region: process.env.AWS_REGION,
        });

        const messageCommand = new ReceiveMessageCommand({
            QueueUrl: process.env.UPLOAD_QUEUE_URL,
            MaxNumberOfMessages: 1,
            VisibilityTimeout: 20,
        });

        while (true) {
            const { Messages } = await sqsClient.send(messageCommand);

            if (!Messages) {
                console.log('No message in queue');
                continue;
            }

            for (const message of Messages) {
                try {
                    console.log('Message in queue:', message);
                    const { Body, MessageId, ReceiptHandle } = message;
                    console.log('Body of message:', Body);

                    if(!Body || !ReceiptHandle){
                        console.log('no body and reciept handler available')
                        continue
                    }
                    // Validate event and parse it
                    const parsedBody = JSON.parse(Body);
                    console.log('Parsed body of message:', parsedBody);

                    const records = parsedBody.Records

                    console.log('records',records)

                    for (const record of records) {
                        
                        const {s3} = record
                        const {bucket,object} = s3
                        const {key } = object

                        console.log({bucket,object,key})
                    
                        // spin the container

                        
                    }

                    // Process the message (e.g., spin a container or take appropriate action)

                    // Delete the message after successful processing
                  
                } catch (error) {
                    console.error('Error processing message:', error);
                   await deleteMessageFromQueue(ReceiptHandle)
                }
            }
        }
    } catch (error) {
        console.error('Error in verifyMessage:', error);
    }
};

export { verifyMessage };
