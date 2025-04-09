import express from 'express'
import http from 'http'
import cors from 'cors'
import serveIndex from 'serve-index';
//import bodyParser from 'body-parser'

const PORT = 8080;
const static_content = "static_content";
const BASE_URL = process.env.NODE_ENV === 'production'
    ? "https://map.w6gkd.com/"
    : `http://localhost:${PORT}`;

const app = express();
const httpServer = http.createServer(app);

// testing this is fraught, be careful
const cors_options = {
    origin: "http://localhost:8090", // all client requests come from here
}
app.use(cors(cors_options));
app.use(express.static(static_content))
app.use('/DMA_data', serveIndex('static_content/DMA_data'));
app.use('/geojson', serveIndex('static_content/geojson'));

app.listen({ port:PORT }, ()=>{
    console.log(`Running at ${BASE_URL}`);
});

