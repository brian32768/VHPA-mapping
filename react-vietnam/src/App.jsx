// Vietnam project App.jsx
// Brian Wilson <brian@wildsong.biz>
// 03 Nov 2023

import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Map, OSMSource } from './map';
import { Layers, TileLayer, VectorLayer } from "./map";
import { Style, Icon } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { XYZSource } from "./map";
import { fromLonLat, get } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

// URLs of data sources, we are all just files here
const geojson = './assets/geojson/';
const provinces = geojson + "provinces_count.geojson";
const countries = geojson + "countries.geojson";
const ppl_vm = geojson + 'vm.geojson'; // Vietnam populated places
const ppl_cb = geojson + 'cb.geojson'; // Cambodia populated places
const ppl_la = geojson + 'la.geojson'; // Laos populated places
const crash_sites = geojson + "crash_data.geojson";
//const maki_icons = "maki-icon-source/renders/";

// Symbolize using color to distinguish countries
const lookup_color = {
    "CB": { fillColor: "#D8B365" }, // Cambodia
    "LA": { fillColor: "#5AB4AC" }, // Laos
    "VM": { fillColor: "#95F5E0" }, // Vietnam
};

function dmaTileURL(bounds) {
/*
    const res = this.map.getResolution();
    const x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
    const y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
    const zoomlevel = this.map.getZoom();
    let url;

    // Apparently Virtual Earth zoom level is different than everyone else's.
    if (this.map.baseLayer.name == 'Virtual Earth Roads'
        || this.map.baseLayer.name == 'Virtual Earth Aerial'
        || this.map.baseLayer.name == 'Virtual Earth Hybrid') {
        zoomlevel += 1;
    }

    //console.log(zoomlevel);
    if (mapBounds.intersectsBounds(bounds) && zoomlevel >= mapMinZoom && zoomlevel <= mapMaxZoom) {
        url = this.url + "250k/" + zoomlevel + "/" + x + "/" + y + "." + this.type;
        // list only the files I can't find
        //console.log("url = ", url);
    } else {
        // I wonder what made me think this was a good idea?
        // This URL is dead now.
        url = "http://www.maptiler.org/img/none.png"; // pink tiles! oh no!
    }
*/
    return '';
}


const App = () => {
    // Parcel will preprocess this image file and bundle only the thumbnail.
    let logoUrl = (new URL('../assets/logo.gif?width=64', import.meta.url)).toString();
    let chart = (new URL('../assets/chart.png', import.meta.url));
    
    const [center, setCenter] = useState([104.5, 16.40]); // Indochina map center

    const [countryzoom, setCountryzoom] = useState(6);
    const [detailzoom, setDetailzoom] = useState(5);

    const baseLayerUrl = "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}";
    const baseAttribution = 'Map tiles by <a href="http://arcgisonline.com">ESRI</a>';

    //overviewmap.setCenter(mapcenter, 5, false, false);
    //bounds = overviewmap.getExtent();
    //overviewmap.restrictedExtent = bounds;    
    
    return (
        <>
            <div id="leftbar">
                <div id="logo">
                    <a href="https://vhpa.org/"><img width="94" height="75" src={logoUrl}/></a>
                </div>
                <div id="countrymap">
                    <Map center={fromLonLat(center)} zoom={countryzoom}>
                        <Layers>
                        <TileLayer source={XYZSource({
                                url: baseLayerUrl,
                                attributions: baseAttribution,
                                maxZoom: 7,
                            })} zIndex={0} />
                            {/* 
                                provincesLayer
                                boxLayer
                            */}
                        </Layers>
                    </Map>
                </div>
                <div id="province_data">
                    <h2>GIA LAI</h2>
                    <h3>Vietnam</h3>
                    crash sites: <b>154</b>
                </div>
            </div>

            <div id="main">
                <div id="titlebar">
                    <h1>Vietnam Helicopter Crash Sites</h1>
                    <div id="coords">position</div>
                    <div id="map_controls">
                        <div className="slider" id="opacity_slider">
                        <span id="min2" class="slider-text"></span>
                        <span id="max2" class="slider-text"></span>
                        </div>
                    </div>
                </div>

                <div id="detailmap">
                    <Map center={fromLonLat(center)} zoom={detailzoom}>
                        <Layers>
                            <TileLayer source={OSMSource()} zIndex={0} />
                        </Layers>
                    </Map>
                </div>

                <div id="crash_data">
                    <div id="crash_text">
                        <h3>Click on a crash site on the map to see information here</h3>
                    </div>

                    <div id="plot-control">
                        <div className="slider" id="date_slider"></div>
                        <div id="plot"><img width="180" height="180" src={chart} /></div>
                    </div>

                    <div id="crash_picture"></div>
                </div>
            </div>
        </>
    )
}
export default App;
