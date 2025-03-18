import { configDotenv } from 'dotenv'
import { app } from './app.js'


configDotenv()

app.listen(process.env.PORT || 5000, (error) =>{
    if(!error)
        console.log(`transcoder service is running on ${process.env.PORT}`) 
                   
    else 
        console.log("Error occurred, server can't start", error);
    }
);