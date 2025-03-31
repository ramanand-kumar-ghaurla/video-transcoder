import { json } from "express";


const verifyContainerRes = async(req , res)=>{

   try {
     const { key , success , status,message} = req.body
 
     if(!key || !success || !status){
         throw new Error(" key and response status is required for verification");
         
     }
 
     if(success === true && status === 200){
         return {
             key , success,message
         }
     }else{
         return {
            status,
            message
         }
     }
   } catch (error) {
    
    console.log('error in verifying container response',error)
   throw new Error('error in verifying container message')
   }

   
}

export {
    verifyContainerRes
}