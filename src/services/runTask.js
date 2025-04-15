import {RunTaskCommand, ECSClient} from '@aws-sdk/client-ecs'
import { configDotenv } from 'dotenv'

configDotenv()


export const runTaskForVideoTranscoding = async(key)=>{

   try {
     const escClient = new ECSClient({
         credentials: {
             accessKeyId: process.env.AWS_ACCESS_KEY,
             secretAccessKey: process.env.AWS_SECRET_KEY,
         },
         region: process.env.AWS_REGION,
     })
 
     const taskCommand = new RunTaskCommand({
         taskDefinition:process.env.ECS_TASK_DEFINITION_ARN,
         cluster:process.env.AWS_CLUSTER_ARN,
         launchType:'FARGATE',
         networkConfiguration:{
             awsvpcConfiguration:{
                 subnets:[
                     'subnet-0ac2dff055ec9c306',
                     'subnet-01d30d9dc004250a1',
                     'subnet-0c024f91b0910c3a2'
                 ],
                 securityGroups:['sg-0c4287ab0877ca993'],
                 assignPublicIp:'ENABLED'
             },
             
         },
         overrides:{
             containerOverrides:[
                 { name :process.env.AWS_CONTAINER_NAME,
                   environment:[
                     { name: 'KEY' , value: key,},
                     { name: 'ORIGINAL_BUCKET_NAME' , value: process.env.ORIGINAL_BUCKET_NAME},
                     { name: 'AWS_ACCESS_KEY' , value: process.env.AWS_ACCESS_KEY,},
                     { name: 'AWS_SECRET_KEY' , value:  process.env.AWS_SECRET_KEY},
                     { name: 'AWS_REGION' , value:  process.env.AWS_REGION},
                     { name: 'TRANSCODED_BUCKET_NAME' , value: process.env.TRANSCODED_BUCKET_NAME},
                     { name: 'MAIN_APPLICATION_URL' , value:process.env.MAIN_APPLICATION_URL},
                   ]
                 }
             ]
         }
         
     })
 
     const response = await escClient.send(taskCommand)

     console.log('response of run task ',response)
 
   } catch (error) {
    console.log('error in running task ',error)
   }
}