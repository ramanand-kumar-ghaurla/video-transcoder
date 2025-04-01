import { deleteOriginalFileFromS3} from '../../docker/helper/deleteOriginalFile.js'


const verifyContainerRes = async(req , res)=>{

   try {
     const { key , success , status,message} = req.body
 
     if(!key || !success || !status){
         throw new Error(" key and response status is required for verification");
         
     }
 
   if(status === 200 && success === true){

    await deleteOriginalFileFromS3(key)
    
   }
   } catch (error) {
    
    console.log('error in verifying container response',error)
   throw new Error('error in verifying container message')
   }

   
}

export {
    verifyContainerRes
}