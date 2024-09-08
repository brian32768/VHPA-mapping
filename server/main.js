import express from 'express'
import http from 'http'
import cors from 'cors'
//import bodyParser from 'body-parser'

const PORT = 8080;
const static_content = "static_content";
const BASE_URL = process.env.NODE_ENV === 'production'
    ? "https://wildsong.biz/vhpa"
    : `http://localhost:${PORT}`;

const app = express();
const httpServer = http.createServer(app);

app.use(
    cors(), // allow everything for now
//  cors({
//        origin: [
//        List the clients allowed to talk to us
//            BASE_URL
//        ],
//    }),
//    bodyParser.json(),
    express.static(static_content),
)

app.listen({ port:PORT }, ()=>{
    console.log(`Server running at ${BASE_URL}`);
});
