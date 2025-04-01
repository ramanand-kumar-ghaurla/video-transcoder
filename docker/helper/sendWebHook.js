import axios from "axios"
import { configDotenv } from "dotenv"

configDotenv()

const mainApplicationURL = process.env.MAIN_APPLICATION_URL
const sendWebhookRequestToMainApp = async(  key, statusCode)=>{
try {

    // add signature for more security in future

    if(!statusCode || !key ){
        throw new Error(" all fields are required to send webhook req");
        
    }
    
        const response = await axios.post(`${mainApplicationURL}/lecture/verify-transcoding-resonse`,{
            key:key,
            statusCode,
           
        },
    {
        headers:{
            "Content-Type":"application/json",
            
        }
    })

    console.log('response of webhook of verifying transcoding ',response.status)
  return   response
} catch (error) {
    
    console.log('error in sending webhook req to main application',error)
    throw new Error("error in sending webhook req to main application");
    
}

}

export { sendWebhookRequestToMainApp}
