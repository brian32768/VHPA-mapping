// Vietnam project App.jsx
// Brian Wilson <brian@wildsong.biz>
// 03 Nov 2023

import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { MainMap } from './mainmap';
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

const SERVER = 'http://192.168.123.2:8080';

// URLs of data sources, 
const geojson = SERVER + '/geojson/';
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


const App = () => {
    // Parcel will preprocess this image file and bundle only the thumbnail.
    let logoUrl = (new URL('../assets/logo.gif?width=64', import.meta.url)).toString();
    let chart = (new URL('../assets/chart.png', import.meta.url));
    
    const [center, setCenter] = useState([104.5, 16.40]); // Indochina map center

    const [countryzoom, setCountryzoom] = useState(6);
    const [mainzoom, setMainzoom] = useState(5);

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
                        <VectorLayer source={
                                ""
                            }
                        />
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

                <MainMap center={fromLonLat(center)} zoom={mainzoom}/>

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
