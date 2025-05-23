import express from 'express'
import { verifyMessage } from './src/services/verifyReq.js';
import { verifyContainerRes } from './src/webhook/containerRes.js';

const app = express()



app.use(express.json(
    {limit:"20kb"}
))

verifyMessage()
app.get('/', (req, res) => {
    res.send("Video transcoder service is here");
});

app.post('/verify-container-response',verifyContainerRes)

export {app}