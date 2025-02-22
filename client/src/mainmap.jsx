import React, { useEffect, useState } from 'react';
import { ImageTileLayer, ImageTileSource, Map, OSMSource, XYZSource } from './map';
import { VectorSource } from './map';
import { Layers, TileLayer, VectorLayer } from "./map";
import { fromLonLat, get } from "ol/proj";
import { Style, Icon } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import GeoJSON from "ol/format/GeoJSON";
import { DATASERVER } from '../settings';

/* 
const defaultStyleMap = new OpenLayers.StyleMap({
	fillColor: "#FFFFFF",
        fillOpacity: 0,
	strokeColor: "#000000",
	strokeOpacity: 1
});
*/

// these numbers come from tilemapresource.xml
//const mapBounds = new OpenLayers.Bounds(104.247254165, 7.99778115733,  109.549632715, 17.0568691898);
const mapMinZoom = 8;
const mapMaxZoom = 16;

// Defense Mapping Agency topo map
function tileUrlFunction(bounds) {

    const res = this.map.getResolution();
    const x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
    const y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
    const zoomlevel = this.map.getZoom();
    let url;
    
/*    // Apparently Virtual Earth zoom level is different than everyone else's.
    if (this.map.baseLayer.name == 'Virtual Earth Roads'
	|| this.map.baseLayer.name == 'Virtual Earth Aerial'
	|| this.map.baseLayer.name == 'Virtual Earth Hybrid')
    {
	zoomlevel += 1;
    }
  */  
    console.log(zoomlevel);
    if (mapBounds.intersectsBounds( bounds ) && zoomlevel >= mapMinZoom && zoomlevel <= mapMaxZoom ) {
        url = this.url + "250k/" + zoomlevel + "/" + x + "/" + y + "." + this.type;
            // list only the files I can't find
        console.log("dma url = ", url);       
    } else {
        // I think I should provide my own pink tile! Sheesh
        url = "http://www.maptiler.org/img/none.png"; // pink tiles! oh no!
    }
    
    return url;
}

/*
        var crashContext = {	
	getSize: zoomSize,
        getOpacity: layerOpacity,
	getColor: "#FFFF00" // default color, we'll change it later
    };	
    var crashPointStyle = new OpenLayers.Style({	
            pointRadius: "${getSize}",
            strokeColor: "#FFFFFF",	
            strokeWidth: 2,
            fillOpacity: "${getOpacity}",
            strokeOpacity: "${getOpacity}"
        },
        { context: crashContext }
    );	  
    var crashStyleMap = new OpenLayers.StyleMap({	
        "default": crashPointStyle,
	//"temporary" : selectStyle,
	"select" : selectStyle
    });
    // Set the color of each point by looking up the value of the Service attribute
    crashStyleMap.addUniqueValueRules("default", "service", service_lut);
    crashStyleMap.addUniqueValueRules("select", "service", service_lut);
    crashLayer = new OpenLayers.Layer.Vector("Crash Sites", {
        styleMap  : crashStyleMap,
        projection: wgsProj,                source
                defaultStyleMap />;

        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol  : ds_crash_sites
    });
    crashLayer.events.register('loadend', this, handle_crashes_loaded);
                source
                defaultStyleMap />;

    detailmap.addLayers([
	baselayer1,
	baselayer2,
	dmaLayer,
	provincesLayer,
	crashLayer,
	//pplVmLayer,
	//pplCbLayer,
	//pplLaLayer,
    ]);
*/
          
const URL_PROVINCES = DATASERVER + "geojson/provinces_count.geojson";

export const MainMap = () => {
    const [center, setCenter] = useState([104.5, 16.40]); // Indochina map center
    const [zoom, setZoom] = useState(5);
    const ds_provinces = VectorSource(URL_PROVINCES);
    /*const ds_dma = XYZSource({
        url: tileUrlFunction,
        //attributions:,
        //maxZoom: 
    });*/
    const ds_arcgis = ImageTileSource();
    return (
        <>
        <Map center={fromLonLat(center)} zoom={zoom}>
            <Layers>
            <VectorLayer source={ds_provinces} zIndex={2} />
            {/*
            <TileLayer source={ds_dma} zIndex={1} />
            <TileLayer source={OSMSource()} zIndex={0} />
             */}
            <ImageTileLayer source={ds_arcgis} />
            </Layers>
        </Map>
        </>
    );
}
