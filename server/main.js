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

app.use(cors());
app.use(express.static(static_content))
app.use('/DMA_data', serveIndex('static_content/DMA_data'));
app.use('/geojson', serveIndex('static_content/geojson'));

app.listen({ port:PORT }, ()=>{
    console.log(`Running at ${BASE_URL}`);
});
