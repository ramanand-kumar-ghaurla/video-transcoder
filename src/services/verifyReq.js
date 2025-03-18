import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient, DeleteMessageCommand, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { configDotenv } from 'dotenv';

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

                    if(!Body){
                        console.log('no body available')
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
                    // const deleteCommand = new DeleteMessageCommand({
                    //     QueueUrl: process.env.UPLOAD_QUEUE_URL,
                    //     ReceiptHandle: ReceiptHandle,
                    // });
                    // await sqsClient.send(deleteCommand);
                    // console.log(`Deleted message with ID: ${MessageId}`);
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error in verifyMessage:', error);
    }
};

export { verifyMessage };
