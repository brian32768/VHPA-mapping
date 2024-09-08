import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { MainMap } from './mainmap';
import { CountryMap } from './countrymap';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

//const maki_icons = "maki-icon-source/renders/";


const App = () => {
    // Parcel will preprocess this image file and bundle only the thumbnail.
    let logoUrl = (new URL('../assets/logo.gif?width=64', import.meta.url)).toString();
    let chart = (new URL('../assets/chart.png', import.meta.url));
    
    return (
        <>
            <div id="leftbar">
                <div id="logo">
                    <a href="https://vhpa.org/"><img width="94" height="75" src={logoUrl}/></a>
                </div>
                <div id="countrymap">
                    <CountryMap />
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
                        <span id="min2" className="slider-text"></span>
                        <span id="max2" className="slider-text"></span>
                        </div>
                    </div>
                </div>

                <div id="mainmap">
                    <MainMap />
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
