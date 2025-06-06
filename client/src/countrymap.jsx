import React, { useEffect, useState } from 'react';
import VectorSource from 'ol/source/Vector.js';
import { fromLonLat, get } from "ol/proj";
import { Style, Icon } from "ol/style";
import Feature from "ol/Feature";
import {fromExtent} from 'ol/geom/Polygon.js';
import Point from "ol/geom/Point";
import GeoJSON from "ol/format/GeoJSON";
import { Fill, Icon, Stroke, Style, Text } from 'ol/style.js';
//import { createMapboxStreetsV6Style } from "./mapbox-streets-v6-style";

import { Map, OSMSource, MapboxSource, GeoapifySource } from './map';
import { VectorSource as mapVectorSource, XYZSource } from './map';
import { Layers, VectorTileLayer, VectorLayer } from "./map";
import { DATASERVER } from '../settings';

const URL_PROVINCES = DATASERVER + 'geojson/provinces_count.geojson';

const countryStyle = (Style, Fill, Stroke, Icon, Text) => {
    const fill = new Fill({color: ''});
    const stroke = new Stroke({color: '', width: 1});
    const polygon = new Style({fill: fill});
    const strokedPolygon = new Style({fill: fill, stroke: stroke});
    const line = new Style({stroke: stroke});
    const text = new Style({text: new Text({
        text: '', fill: fill, stroke: stroke
    })});
    const styles = [
        strokedPolygon
    ];
    return (feature, resolution) => {
        const countryCode = feature.get('na2')
        if (countryCode == 'VM') { // Viet Nam
            fill.setColor('#95F5E080');
        } else if (countryCode == 'CB') { // Cambodia
            fill.setColor('#D8B36580');
        } else if (countryCode == 'LA') { // Laos
            fill.setColor('#5AB4AC80');  
        }
        return styles;
    }
}

const redBoxStyle = (Style, Fill, Stroke, Icon, Text) => {
    const fill = new Fill({color: '#FF000080'});
    const stroke = new Stroke({color: '#FFFFFFFF', width: 1});
    const polygon = new Style({fill: fill});
    const line = new Style({stroke: stroke});
    const styles = [
        polygon
    ];
    return styles;
}

const mapboxStyle = (Style, Fill, Stroke, Icon, Text) => {
    const styles = [];
    const fill = new Fill({color: ''});
    const stroke = new Stroke({color: '#00FF00', width: 1});
    const polygon = new Style({fill: fill});
    const strokedPolygon = new Style({fill: fill, stroke: stroke});
    const line = new Style({stroke: stroke});
    const text = new Style({text: new Text({
        text: '', fill: fill, stroke: stroke
    })});
    let length = 0;
    return (feature, resolution) => {
        const layer = feature.get('layer');
        const adminLevel = feature.get('admin_level');
        const maritime = feature.get('maritime');

        if (layer == 'water') {
            fill.setColor('#a0c8f0');
            styles[length++] = polygon;
        } else if (layer == 'admin' && adminLevel >= 3 && maritime === 0) {
            stroke.setColor('#9e9cab');
            stroke.setWidth(1);
            styles[length++] = line;
        } else if (layer == 'admin' && adminLevel == 2 && maritime === 0) {
            stroke.setColor('#9e9cab');
            stroke.setWidth(1);
            styles[length++] = line;
        } else if (layer == 'admin' && adminLevel >= 3 && maritime === 1) {
            stroke.setColor('#a0c8f0');
            stroke.setWidth(1);
            styles[length++] = line;
        } else if (layer == 'admin' && adminLevel == 2 && maritime === 1) {
            stroke.setColor('#a0c8f0');
            stroke.setWidth(1);
            styles[length++] = line;
        } else if (layer == 'country_label') {
            //fill.setColor('#d8e8c8');
        } else if (layer == 'marine_label') {
            //fill.setColor('#d8e8c8');
        } else if (layer == 'state_label') {
            //fill.setColor('#d8e8c8');
        } else if (layer == 'place_label') {
            //fill.setColor('#d8e8c8');
        } else {
            fill.setColor('#FFF0F0');
            styles[length++] = polygon;
        }
        styles.length = length;
        return styles;
    }
}

export const CountryMap = () => {
    const [center, setCenter] = useState([104.5, 16.40]); // Indochina map center
    const [zoom, setZoom] = useState(5);
    const ds_provinces = mapVectorSource(URL_PROVINCES);

    const boxStyle = redBoxStyle(Style, Fill, Stroke, Icon, Text);
    const mbStyle = mapboxStyle(Style, Fill, Stroke, Icon, Text);
    const myStyle = countryStyle(Style, Fill, Stroke, Icon, Text);

    const ds_rectangle = new VectorSource();
    ds_rectangle.addFeature(            
        new Feature(
        // Here a `Geometry` is expected, e.g. a `Polygon`, which has a handy function to create a rectangle from bbox coordinates
            [104.4,14.35, 105,15.4], // minX, minY, maxX, maxY
        )
    );

    return (
        <>
        <Map id='country' center={fromLonLat(center)} zoom={zoom}>
            <Layers>
                <VectorTileLayer source={MapboxSource()} style={mbStyle} zIndex={0} />
                <VectorLayer source={ds_provinces} style={myStyle} zIndex={1} />
                {/*<VectorLayer source={ds_rectangle} style={boxStyle} zIndex={2} />*/}
            </Layers>
        </Map>
        </>
    );
}

