import express from 'express'
import http from 'http'
import cors from 'cors'
import serveIndex from 'serve-index';
//import bodyParser from 'body-parser'

const PORT = 8080;
const static_content = "static";
const BASE_URL = process.env.NODE_ENV === 'production'
    ? "https://wildsong.biz/vhpa"
    : `http://localhost:${PORT}`;

const app = express();
const httpServer = http.createServer(app);

app.use(express.static(static_content))
app.use('/DMA_data', serveIndex('static/DMA_data'));
app.use('/geojson', serveIndex('static/geojson'));

app.listen({ port:PORT }, ()=>{
    console.log(`Server running at ${BASE_URL}`);
});
