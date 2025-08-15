// Vietnam project
// Brian Wilson <brian@wildsong.biz>
// 05 JUN 2012 
// 09 AUG 2025

import Map from 'ol/Map';
import View from 'ol/View';
import Style from 'ol/style/Style';
import Projection from 'ol/proj/Projection';
import TileLayer from 'ol/layer/Tile';
import { useGeographic } from 'ol/proj';
import ImageTileSource from 'ol/source/ImageTile';
import VectorSource from 'ol/source/Vector';
import WebGLLayer from 'ol/layer/WebGLTile';
import VectorLayer from 'ol/layer/Vector';
//import XYZ from 'ol/source/XYZ';
import {OSM} from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import {defaults as defaultControls} from 'ol/control/defaults';
import OverviewMap from "ol/control/OverviewMap";
import {defaults as defaultInteractions} from 'ol/interaction/defaults';
import Select from 'ol/interaction/Select';
import {altKeyOnly, click, pointerMove} from 'ol/events/condition';
import Feature from 'ol/Feature';
import { createStyleFunction } from 'ol/Feature';
import MousePosition from 'ol/control/MousePosition';
import {createStringXY} from 'ol/coordinate';

// This was a test that draws a circle on the maps
import Circle from 'ol/geom/Circle';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { createStringXY } from 'ol/coordinate';
import { pointerMove } from 'ol/events/condition';

import {csv, text} from 'd3-fetch';
import Collection from 'ol/Collection';
import { LoadCrashData } from './load_data';
import { LoadPictures } from './load_data';

window.onload = init
useGeographic(); // use 'normal' coordinates in this project

// URLs of data sources
const geojson_server = 'http://localhost:8080/geojson/';
const provinces = geojson_server + "provinces_count.geojson";
const countries = geojson_server + "countries.geojson";
const ppl_vm = geojson_server + 'vm.geojson'; // Vietnam populated places
const ppl_cb = geojson_server + 'cb.geojson'; // Cambodia populated places
const ppl_la = geojson_server + 'la.geojson'; // Laos populated places
//const maki_icons = "maki-icon-source/renders/";

let overviewMapControl, detailmap;
const dateSlider = "#date_slider";
const opacitySlider = "#opacity_slider";
let provinces_loaded = false;

let provincesLayer; // global so we can get at the feature list

// The GEOGRAPHIC CENTER of the Indochina
const INDOCHINA_CENTER = [104,16]; 

const mapMinZoom = 8;
const mapMaxZoom = 16;

let ds_crash_sites;
let ds_provinces;
let ds_countries;
let ds_ppl_vm;
let ds_ppl_cb;
let ds_ppl_la;
const pictures = new Array(); // Lookup table of helicopter pictures

let currentFeature;

// Symbolize using color to distinguish countries
const lookup_color = {
    "CB": "#D8B365",
    "LA": "#5AB4AC",
    "VM": "#95F5E0",
};

const image = new CircleStyle({
  radius: 25,
  fill: null,
  stroke: new Stroke({color: 'red', width: 5}),
});
const styles = {
  'Point': new Style({
    image: image,
  }),
  'LineString': new Style({
    stroke: new Stroke({
      color: 'green',
      width: 1,
    }),
  }),
  'MultiLineString': new Style({
    stroke: new Stroke({
      color: 'green',
      width: 1,
    }),
  }),
  'MultiPoint': new Style({
    image: image,
  }),
  'MultiPolygon': new Style({
    stroke: new Stroke({
      color: 'yellow',
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.1)',
    }),
  }),
  'Polygon': new Style({
    stroke: new Stroke({
      color: 'blue',
      lineDash: [4],
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  }),
  'GeometryCollection': new Style({
    stroke: new Stroke({
      color: 'magenta',
      width: 2,
    }),
    fill: new Fill({
      color: 'magenta',
    }),
    image: new CircleStyle({
      radius: 10,
      fill: null,
      stroke: new Stroke({
        color: 'magenta',
      }),
    }),
  }),
  'Circle': new Style({
    stroke: new Stroke({
      color: 'red',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(179, 42, 42, 0.2)',
    }),
  }),
};

const shapeStyle = function (feature) {
  return styles[feature.getGeometry().getType()];
};

const info = document.getElementById('info');
const crash_text = document.getElementById('crash_text')
const crash_picture = document.getElementById('crash_picture')

const display_crash_site = (pixel, target) => {
    //console.log("crash data", pixel, target);
    const feature = target.closest('.ol-control')
        ? undefined
        : detailmap.forEachFeatureAtPixel(pixel, function (feature) {
            return feature;
        });
    if (feature) {
        console.log('feature ');
        info.style.left = (pixel[0] + 200) + 'px';
        info.style.top = (pixel[1] + 50) + 'px';
        if (feature !== currentFeature) {
            info.style.visibility = 'visible';

            const mgrs = feature.get('mgrs');

            const unit = feature.get('unit') + ' ';
            info.innerHTML = unit? unit : 'no unit'

            const sum = feature.get('short_sum');
            let text = 
                (sum
                    ? ('Summary: <b>' + sum + '</b>') 
                    : ('<b>No summary for ' + mgrs + '</b>')
                );
            text += '<br />'

            // There are not very many pictures associated with
            // crashes so fall back on generic pictures
            let pix = feature.get('picture');
            text += 'Picture:';


            if (pix) {
                text = 'picture: ' + pix + '<br/>' + text;
                crash_text.innerHTML = text;
            } else {
                let model = feature.get('model')
                crash_text.innerHTML = text;

                pix = pictures[model]['url']
                const a = document.createElement('a');
                a.href = pix;
                a.textContent = model;
                a.target = '_blank';
                crash_text.appendChild(a);
            }

            const detailed_url = feature.get('url');
            if (detailed_url) {
                const a = document.createElement('a');
                a.href = detailed_url;
                a.textContent = 'Incident report';
                a.target = '_blank';
                crash_text.appendChild(a);
            }

        }
    } else {
        info.style.visibility = 'hidden';
    }
    currentFeature = feature;
}

// Promise to load a CSV file into memory and return it.
const loadcsv = (url) => {
  return new Promise((resolve, reject) => {
    //console.log('loading from', url);
    resolve(csv(url));
  });
}

function init() {

    // Set data sources

    ds_crash_sites = new VectorSource({
        features: new Collection(),
    });

    ds_provinces = new VectorSource({
        url: provinces,
        format: new GeoJSON(),
    });
    ds_provinces.on('featuresloadend', handle_provinces_loaded);
    ds_provinces.on('featuresloaderror', function(event){
        console.log('load error: provinces', event);
    });
    // Set the color of each province by looking up the country attribute
    const provinceStyle = new Style({
        fill: new Fill({
            color: "#123456",
        }),
        stroke: new Stroke({color: 'black', width: 1}),
    });
    provincesLayer = new VectorLayer({
        source: ds_provinces,
        minZoom: 10,
        maxZoom: 4,
        style: function (feature) {
            const countryCode = feature.get('na2');
            const color = lookup_color[countryCode] || "#FF0000";
            //console.log(color);
            provinceStyle.getFill().setColor(color);
            return provinceStyle;
        },
    });

    ds_countries = new VectorSource({
        url: countries,
        format: new GeoJSON(),
    });
    ds_ppl_vm = new VectorSource({
        url: ppl_vm,
        format: new GeoJSON(),
    });
    ds_ppl_cb = new VectorSource({
        url: ppl_cb,
        format: new GeoJSON(),
    });
    ds_ppl_la = new VectorSource({
        url: ppl_la,
        format: new GeoJSON(),
    });

    // overview map control

    // For different ESRI basemaps,
    // see http://arcgisonline.com/home/search.html?q=base%20map%20name&t=content
    const ds_arcgis = new ImageTileSource({
        attributions:
          'Tiles © <a href="https://services.arcgisonline.com/arcgis/' +
          'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        url:
          'https://server.arcgisonline.com/arcgis/rest/services/' +
          'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    });
    const baseLayer = new WebGLLayer({source:ds_arcgis});
    
    const overview_context = {
        getSize: 3,
        getOpacity: 1,
        getColor: "#000000"
    };

    const tintedStyle = new Style(
        {
            strokeColor: "#000",
            strokeWidth: 1,
            fillOpacity: 0.3,
            strokeOpacity: 0.7
        },
        { context: overview_context }
    );


    const selectStyle = new Style({
        pointRadius: 10,
        fillColor: "#00FFFF",
        strokeColor: "#000",
        strokeWidth: 3,
        fillOpacity: 1,
        strokeOpacity: 1
    });

    const provincesStyle = new Style({
        "default": tintedStyle,
        "temporary": selectStyle
    });

    const selectClick = new Select({
        condition: click,
        style: selectStyle,
        layers: [provincesLayer],
    });

    //boxLayer = new ol.Layer.Boxes("Reference Frame");
    overviewMapControl = new OverviewMap({
        target: 'overviewmap',
        className: 'ol-custom-overviewmap',
        layers: [
            baseLayer,
            //shapeLayer, // show a big red circle behind our other data
            provincesLayer,
        ],
        collapsed: false,
        //interactions: defaultInteractions(),
        //view: new View(),
    });

    /*
    const selectCtrl = new ol.Control.SelectFeature(provincesLayer, {
        hover: true,
        highlightOnly: true,
        renderIntent: "temporary",
        eventListeners: {
            featurehighlighted: handle_hover_province,
        }
    });
    overviewMapControl.addControl(selectCtrl);
    selectCtrl.activate();
*/
/*
    // On click, zoom the detail map
    overviewMapControl.on('click', (e)=>{
        if (currentFeature) {
            const geom = currentFeature.getGeometry();
            const extent = geom.getExtent();
            console.log('clicked!', currentFeature.get('nam'), extent);
            detailmap.getView().fit(extent, {
                //padding: [40,40,40,40],
                duration: 1000,
            });

            // draw a red box on the overview map, too, to show extent.
        }
    });
*/
    //overviewMapControl.addInteraction(selectClick)
  
    //    bounds = overviewMapControl.getExtent();
    //    overviewMapControl.restrictedExtent = bounds;

    //////////////////////////////////////////////////
    //
    // "detail" aka MAIN map, the big one on the right

    const mapControls = [
        //new ol.Control.Navigation(),
        //new ol.Control.PanZoomBar(),
        //new ol.Control.LayerSwitcher()
    ];
    /*
    // Google satellite layer.
    const baseLayer1 = new ol.Layer.Google("Google Satellite", {
        type: google.maps.MapTypeId.SATELLITE,
        sphericalMercator: true, numZoomLevels: 14
    });

    // Google hybrid layer.
    const baseLayer2 = new ol.Layer.Google("Google Hybrid", {
        type: google.maps.MapTypeId.HYBRID,
        sphericalMercator: true, numZoomLevels: 14
    });
*/
    const defaultStyleMap = new Style({
        fillColor: "#FFFFFF",
        fillOpacity: 0,
        strokeColor: "#000000",
        strokeOpacity: 1
    });
    const detail_context = {
        getSize: zoomSize2,
        getOpacity: 1,
        getColor: "#FFFF00"
    };
    /*
    const selectStyle = new Style({
        pointRadius: "${getSize}",
        strokeColor: "#FFFF00",
        strokeWidth: 4,
        fillOpacity: 1,
        strokeOpacity: 1
    }, { context: detail_context });
*/
    const crashContext = {
        getSize: zoomSize,
        getOpacity: layerOpacity,
        getColor: "#FFFF00" // default color, we'll change it later
    };
    let crashStyles = {};
    crashStyles['Point'] = [
      new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({
            color: [255,0,255,255],
          }),
          stroke: new Stroke({
            color: [255,255,0,0],
            width: 1,
          }),
        }),
        zIndex: Infinity,
      }),
    ];
    const crashStyle = (feature) => {
      const t = feature;
      //console.log('f=', t);
      return crashStyles[t.getGeometry().getType()];
    }
    // Set the color of each point by looking up the value of the Service attribute
    //crashStyle.addUniqueValueRules("default", "service", service_lut);
    //crashStyle.addUniqueValueRules("select", "service", service_lut);
    const crashLayer = new VectorLayer({
        source: ds_crash_sites,
        style: crashStyle,
        //strategies: [new ol.Strategy.Fixed()],
    });
    const pplVmLayer = new VectorLayer({
        source: ds_ppl_vm,
        //strategies: [new ol.Strategy.Fixed()],
    });
    pplVmLayer.set('layerName', 'Pop. places: Viet Nam');
    const pplCbLayer = new VectorLayer({
        source: ds_ppl_cb,
        //strategies: [new ol.Strategy.Fixed()],
    });
    pplCbLayer.set('layerName', 'Pop. places: Cambodia');
    const pplLaLayer = new VectorLayer({
        source: ds_ppl_la,
    });
    pplLaLayer.set('layerName', 'Pop. places: Laos');

    // Topo map overlay layer
    /*
    dmaLayer = new TMSLayer(
        "Defense Mapping Agency", // title to show in layer switcher
        'DMA_data/', // URL service endpoint
        {
            type: 'png',
            getURL: overlay_getTileURL,
            alpha: true,
            isBaseLayer: false,
        }
    );
*/

    // avoid pink tiles
    //ol.IMAGE_RELOAD_ATTEMPTS = 3;
    //ol.Util.onImageLoadErrorColor = "transparent";

    /*
    crashLayer.events.on({
        'featureselected': function (event) {
            console.log("feature selected", event.feature)
            show_crash_data(event.feature)
        },
        'featureunselected': function (event) {
            console.log("feature unselected", event.feature)
            //            $('counter').innerHTML = this.selectedFeatures.length;
        },

        'featurehighlighted': function (event) { console.log("featurehighlighted", event) },
        'featureunhighlighted': function (event) { console.log("featureunhighlighted", event) },
        'activate': function (event) { console.log("Activated", event) },
        'deactivate': function (event) { console.log("Deactivated", event) },
    });
*/
    const selectCrash = new Select({
        condition: click,
        style: selectStyle,
        layers: [provincesLayer],
    });


    /*crashControl =
        new ol.Control.SelectFeature(
            crashLayer,
            {
                clickout: false,
                toggle: false,
                hover: false,
                //		multiple: false,
                //		toggleKey: "ctrlKey", // ctrl key removes from selection
                //		multipleKey: "shiftKey", // shift key adds to selection
                //		box: true
            }
        )
            */
    //	
    //    highlightControl = 
    //	new ol.Control.SelectFeature(
    //	    crashLayer,
    //	    {	
    //		hover: true,
    //		//highlightOnly: true,
    //		renderIntent: "temporary",
    //		eventListeners: {
    //		    featurehighlighted: handle_mouseover_detail,
    //		}
    //	    }
    //	)
    //detailmap.addControl(crashControl);
    //crashControl.activate();

    // When user causes map extent to change, 
    // redraw the extent box on the overview map.
    // http://dev.openlayers.org/docs/files/OpenLayers/Map-js.html#OpenLayers.Map.events
   /* detailmap.events.register("moveend", detailmap,
        function (e) {
            const bounds = detailmap.getExtent();
            drawbox(bounds);
        }
    );
*/
    // Put the mouse coords in a div.
    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      target: document.getElementById('coords'),
    })
    
    //detailmap.setCenter(mapcenter, 8, false, false);

    // draw a box to show extent of the overview map on the detail map.
    //const dbounds = detailmap.getExtent();
    //drawbox(dbounds);

    // doing this messes up transforms, need to figure out why!
    // Restrict extent changes
    //detailmap.restrictedExtent = dbounds;

    //mapBounds.transform(detailmap.displayProjection, detailmap.projection)

    // Zoom to show all available topo tiles, not something we do normally
    //detailmap.zoomToExtent( mapBounds);
    //detailmap.zoomIn();
    //detailmap.zoomIn();

    loadcsv('http://localhost:8080/CSV/HelModels.csv')
    .then(data => LoadPictures(data, 'model', pictures))
    .then(console.log("crash sites loaded"))

    loadcsv('http://localhost:8080/CSV/roushx.csv')
    .then(data => LoadCrashData(data, ds_crash_sites))

    detailmap = new Map({
        target: 'detailmap',
        layers: [
            new TileLayer({
                source: new OSM(),
            }),
            //shapeLayer,
          //baseLayer1,
          //baseLayer2,
          //dmaLayer,
          provincesLayer,
          crashLayer,
          //pplVmLayer,
          //pplCbLayer,
          //pplLaLayer,
        ],
        controls: defaultControls().extend([
          mousePositionControl,
          overviewMapControl
        ]),
        view: new View({center:INDOCHINA_CENTER, zoom:5}),
        units: "m",
        maxResolution: 156543.0339,
        //maxExtent: new ol.Bounds(-20037508, -20037508, 20037508, 20037508.34)
    });

    detailmap.on('singleclick', (e)=>{
        if (e.dragging) {
            currentFeature = undefined;
            return;
        }
    // Highlight the province on overviewmap and show the province data           
        display_crash_site(e.pixel, e.originalEvent.target);
    });

    /*
    // The detailmap instantiates the overview map so this has to happen
    // after creating the detailmap.
    const omap = overviewMapControl.getMap()
    console.log('omap is', omap)

    // OverviewmapControl does not support many events directly
    omap.on('pointermove', (e)=>{
        if (e.dragging) {
            currentFeature = undefined;
            return;
        }
    // Highlight the province on overviewmap and show the province data           
        //const pixel = [e.clientX, e.clientY];
        //const mapXY = overviewMapControl.getMap().getCoordinateFromPixel(pixel);
        console.log("pointermove", e);
        show_province_data(e.pixel, e.originalEvent.target);
    });
    */
}

// =============================================================================
function roundNumber(num, dec) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

// =============================================================================
function overlay_getTileURL(bounds) {

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
    if (mapBounds.intersects(bounds) && zoomlevel >= mapMinZoom && zoomlevel <= mapMaxZoom) {
        url = this.url + "250k/" + zoomlevel + "/" + x + "/" + y + "." + this.type;
        // list only the files I can't find
        //console.log("url = ", url);
    } else {
        // I wonder what made me think this was a good idea?
        // This URL is dead now.
        url = "http://www.maptiler.org/img/none.png"; // pink tiles! oh no!
    }

    return url;
}


// =============================================================================

// Zoom the detail map to the given point
function zoom_detail(mapxy) {
    //// Center map and restrict extent changes
    //detailmap.setCenter(lonlat, 8, false, false);
    console.log("zoom to " + mapxy);
    //console.log("projection=", detailmap.projection);
    //mapxy.transform(detailmap.projection, wgsProj);
    //console.log("xform " + mapxy);

    //var mapcenter = new ol.LonLat(lonlat.lon, lonlat.lat)
    //mapcenter.transform(wgsProj, mapProj)
    //detailmap.setCenter(mapxy, 8, false, false)

    //drawbox(detailmap.getExtent());
    //detailmap.restrictedExtent = bounds;
}

// =============================================================================
function drawbox(bounds) {
    var box = new ol.Marker.Box(bounds);
    boxLayer.clearMarkers(); // remove any previous instance
    box.setBorder("#FF0000", 3);
    boxLayer.addMarker(box);
}

// =============================================================================

// Handle the event when the mouse rolls over a crash site on the detail map.
function handle_mouseover_detail(event) {
    show_crash_data(event.feature)
}

// =============================================================================

function show_province_data(pixel, target) {
    //console.log(pixel, target);
    const feature = target.closest('.ol-control')
        ? undefined
        : overviewMapControl.getMap().forEachFeatureAtPixel(pixel, function (feature) {
            //console.log('a feature', feature)
            return feature;
        });
    if (feature) {
        //console.log(feature.getProperties());
        const na2 = feature.get('na2');
        if (na2) {
            let country = "???";
            if (na2 == 'CB') country = "Cambodia"
            else if (na2 == 'LA') country = "Laos"
            else if (na2 == 'VM') country = "Vietnam";
            else country = na2;
            currentFeature = feature;

            const province = feature.get('nam'); // no 'e'!
            const cnt = feature.get('PNTCNT');
            var html =
                "<h2>" + province + "</h2>"
                + "<h3>" + country + "</h3>"
                + "crash sites: <b>" + cnt + "</b>"

            document.getElementById("province_data").innerHTML = html;
        }
    }
}

// =============================================================================
// this table is used to put text in description and to define colors on map
var service_lut = {
    'AR': { "service": "U.S. Army", fillColor: "#006D2C" }, // dark green
    'AF': { "service": "U.S. Air Force", fillColor: "#0E0296" },// light blue
    'MC': { "service": "U.S. Marine Corps", fillColor: "#0E0296" },// dark blue
    'NA': { "service": "U.S. Navy", fillColor: "#246DED" }, // blue
    'CG': { "service": "U.S. Coast Guard", fillColor: "#E87941" }, // orange
    'AN': { "service": "Australian Navy", fillColor: "#F25EA1" }, // reddish
    'AA': { "service": "Air America", fillColor: "#FF0000" }, // red
    'VF': { "service": "Vietnam Air Force", fillColor: "#F2E15E" }, // yellow-orange
    '': { "service": "Undefined", fillColor: "#FFFFFF" }, // white
};

function show_crash_data(f) {
    //    console.log("show_crash_data", f)
    a = f.attributes;
    console.log(a)
    var html;

    // Try to find some good header text
    abbrev = a["service"] // two letter abbreviation
    service = service_lut[abbrev].service;
    model = a['model']
    tail = a['tail_no']
    if (model || tail) {
        html = "<h2>" + model + ' ' + tail + "</h2>";
        html += "Date: <b>" + a["date"] + "</b><br />"
            + "Service: <b>" + service + "</b><br />"
            + "Unit: <b>" + a["unit"] + "</b><br />"
    }
    else {
        html = "<h2>" + 'Incident ' + a['incident'] + "</h2>"

        html += "Date: <b>" + a["date"] + "</b><br />"
            + "Service: <b>" + a["Service"] + "</b><br />"
            + "Unit: <b>" + a["unit"] + "</b><br />"
    }

    current_url = a['url']
    if (current_url) {
        html += '<p><input type="button" onclick="more_info()" value="More info"></p>';
    }

    document.getElementById("crash_text").innerHTML = html;

    // Embed a picture if there is one
    html = '<span style="position:relative;top:50px;right:40px;">(no picture available)</span>';
    if (a['picture']) {
        html += "<i>photo represents type of aircraft</i>";
        html = '<img height=200 src="' + a['picture'] + '"><br />';
    }
    document.getElementById("crash_picture").innerHTML = html;
}

//////////////////////////////////////////////////////////

// Open a new window with the "more info" page for a helicopter crash.
function more_info() {
    window.open(current_url);
    return false;
}

//////////////////////////////////////////////////////////

let province_data = Array();

// Called after the province data layer has finished loading.
// Extract the province names to create a pick list.
function handle_provinces_loaded(event) {
    console.log('loaded ' + event.target.url_);
    console.log("# of features ", event.features.length);  
  
    let features = event.features;
    for (let i in features) {
        const attributes = features[i].getProperties();
        let name = attributes.nam; // name without 'e'!
        //console.log(name);
        province_data.push(name)
    }
    //console.log(province_data);

    // This is an autocomplete list, I am not using it yet.
    // I really need one for all place names, not for provinces.
    // put this in index.html
    // <span id="province"><input id="autocomplete" /></span>
    // province_data.sort();
    //    $("input#autocomplete").autocomplete(
    //	{ source: province_data } );

    provinces_loaded = true // flag it's safe to use data now
}

// This handler is called when the controls are moved on the sliders
function handle_date_slider() {
    var values = $(dateSlider).slider("option", "values")
    console.log("handle_date_slider", values);
    crashLayer.redraw();
}

function initcontrols() {

    // Set up date range slider, 2 handles

    //    document.getElementById("min1").innerHTML = 1962;
    //    document.getElementById("max1").innerHTML = 1975;

    $(dateSlider).slider({
        values: [1962, 1975], 	// positions for controls
        min: 1962,
        max: 1975,
        step: 1,
        range: true,
        change: handle_date_slider,
        orientation: "vertical"
    });

    // Topo layer opacity, just a single handle

    document.getElementById("min2").innerHTML = "Topo layer";
    document.getElementById("max2").innerHTML = "100%";

    $(opacitySlider).slider({
        value: 1,
        min: 0,
        max: 1,
        step: .1,
        //range: true, 	
        change: handle_opacity_slider
    });
}

// This handler is called when the controls are moved on the sliders
function handle_opacity_slider() {
    var value = $(opacitySlider).slider("option", "value")
    console.log("handle_opacity_slider", value);
    dmaLayer.setOpacity(value);
    dmaLayer.redraw();
}

// Return an appropriate crash site size (radius) based on current zoom
function zoomSize() {
    var zoom = detailmap.getZoom();
    if (zoom < 9)
        return 5;
    else if (zoom < 12)
        return 7;
    return 9;
}

function zoomSize2() {
    var zoom = detailmap.getZoom();
    if (zoom < 9)
        return 5 + 3;
    else if (zoom < 12)
        return 7 + 3;
    return 9 + 4;
}

// Use the date range slider, 
// Return an opacity level (0..1) based on slider levels
function layerOpacity(feature) {

    var values = $(dateSlider).slider("option", "values")

    // slider is upside down!

    end = 1975 - values[0] + 1962
    start = 1975 - values[1] + 1962

    // values on slider are upside down relative to chart
    // so I flip them here

    var visible = 0
    if (feature.attributes["year"] >= start &&
        feature.attributes["year"] <= end)
        visible = 1;

    //console.log("opacity", visible);    
    return visible;
}

// That's all!
