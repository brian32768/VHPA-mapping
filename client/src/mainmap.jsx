import React, { useContext } from 'react';
import { Map, OSMSource } from './map';
import { Layers, TileLayer, VectorLayer } from "./map";
import { fromLonLat, get } from "ol/proj";

// Okay, the data I have right now is in 1:250k and 1:50k.
// starting with the 250K data, 
// it's currently organized under 
// DMA_data/250k/{zoom}/{x}/{y}.png
// where zoom is {5..12}
//       x is {25..3294} 
//       y is {16..2145}
// or maybe I have x and y reversed?
function dmaTileURL(bounds) {
    const res = this.map.getResolution();
    const x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
    const y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
    const zoomlevel = this.map.getZoom();
    let url;

    console.log("zoomlevel = " + zoomlevel);
    if (mapBounds.intersectsBounds(bounds) && zoomlevel >= mapMinZoom && zoomlevel <= mapMaxZoom) {
        url = SERVER + "/250k/" + zoomlevel + "/" + x + "/" + y + "." + this.type;
        // list only the files I can't find
        console.log("url = ", url);
    } else {
        // This URL is dead now. I need a pink tile of my very own.
        url = "http://www.maptiler.org/img/none.png"; // pink tiles! oh no!
    }
    return '';
}

export const MainMap = ({center, zoom}) => {
    return (
        <>
            <div id="mainmap">
            <Map center={center} zoom={zoom}>
                <Layers>
                    <TileLayer source={OSMSource()} zIndex={0} />
                </Layers>
            </Map>
            </div>
        </>
    );
}
