import {csv, html} from 'd3-fetch';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import {ImageArcGISRest, OSM} from 'ol/source';
import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorTileSource from 'ol/source/VectorTile';
import XYZ from 'ol/source/XYZ';
import { useGeographic } from 'ol/proj';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { applyStyle } from 'ol-mapbox-style';


import { transform } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import StadiaMaps from 'ol/source/StadiaMaps';

import LayerSwitcher from 'ol-layerswitcher';

//import LayerSwitcher from './layerswitcher'; // local version


import { LoadCrashData } from '../client/load_data';
import { LoadPictures } from '../client/load_data';
import Collection from 'ol/Collection';

const pictures = new Array(); // Lookup table of helicopter pictures
const crash_sites = new Array();

useGeographic();
const INDOCHINA_CENTER = [104,16]; // Indochina map center

const image = new CircleStyle({
  radius: 5,
  fill: null,
  stroke: new Stroke({color: 'red', width: 10}),
});
const styles = {
  'Point': new Style({
    image: image,
  }),
};
const styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
};

const geojsonObject = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'EPSG:3857',
    },
  },
  'features': [
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': INDOCHINA_CENTER,
      },
    },
  ],
}


const osmLayer = new TileLayer({
    title: 'OpenStreetMap',
    type: 'base',
    source: new OSM(),
})

const featureCollection = new Collection();
featureCollection.extend(new GeoJSON().readFeatures(geojsonObject));

const vectorSource = new VectorSource({
  features: featureCollection,
  attributions:
    '© <a href="https://www.vhpa.org/" target="_blank">VHPA</a>',
});

// DMA topo map overlay layer
const minX = 104, minY = 8
const maxX = 109, maxY = 17

const vectorLayer = new VectorLayer({
  title: 'Crash sites',
  source: vectorSource,
  style: styleFunction,
  extent: [minX, minY, maxX, maxY], // This reduces 404 errors
});

const arcgis_server = 'https://services.arcgisonline.com/ArcGIS/rest/services/';
const arcgis_tile_server = 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/'

const arcgisWorldImageryLayer = new ImageLayer({
  title: 'Esri World Imagery',
  type: 'base',
  visible: false,
  source: new ImageArcGISRest({
      ratio: 1,
      params: {},
      url: arcgis_server + 'World_Imagery/MapServer',
      attributions: '© Esri',
  }),
});

const refVectorUrl = arcgis_tile_server + 'tile/{z}/{y}/{x}.pbf';
// esri styles
const refStyleUrl = arcgis_tile_server + 'resources/styles/';

const mapboxToken = 'pk.eyJ1IjoiZHJ1bml4IiwiYSI6ImNsemhvaHdpajA3Mm0ycHB6bGpweDJsY2sifQ.NHZkHij8-gz_w6nPzW72Bg'
const mapboxStreetsUrl = 'https://api.mapbox.com/v4/' +
    'mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf' + 
    '?access_token=' + mapboxToken;
const mapboxStyle = 'https://api.mapbox.com/styles/v1/mapbox/streets-v11' + 
    '?access_token=' + mapboxToken;
const mapboxStreetsSource = new VectorTileSource({
    url: mapboxStreetsUrl,
    format: new MVT(),
    attributions:
      '© <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a>'
});
const mapboxStreetsLayer = new VectorTileLayer({
  title: 'Mapbox Streets',
  type: 'base',
  visible: false,
  source: mapboxStreetsSource,
})
applyStyle(mapboxStreetsLayer, mapboxStyle)
  .then(() => {
    console.log('streets styled');
  })
  .catch((err) => {
    console.error('Mapbox style loading error:', err);
  });


// Mapbox Satellite raster tiles URL template
const mapboxSatelliteUrl = 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x' +
    `?access_token=${mapboxToken}`;
const mapboxSatelliteLayer = new TileLayer({
  title: 'Mapbox Imagery',
  type: 'base',
  visible: false,
  source: new XYZ({
    url: mapboxSatelliteUrl,
    attributions:
      '© <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
  })
});
// customized local copy of esri styles
//const refStyleUrl = 'http://localhost:8080/esri_mvt_style.json';
console.log(refStyleUrl);
const arcgisWorldImageryReferenceLayer = new VectorTileLayer({
    title: 'Esri Reference',
    type: 'base',
    visible: false,
    source: new VectorTileSource({
        format: new MVT(),
        url: refVectorUrl,
        maxZoom: 20, 
    }),
    //style:
    //opacity: 0.7,
});
applyStyle(arcgisWorldImageryReferenceLayer, refStyleUrl)
  .then(() => {
    // Your map is styled!
  })
  .catch((err) => {
    console.error('ArcGIS style loading error:', err);
  });

  function tableElement(data,id) {
  const table = document.getElementById(id);

  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  Object.keys(data[0]).forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    Object.entries(row).forEach(([key,val]) => {
      
      const td = document.createElement('td');
      if (key == 'url' || key == 'url2' || key == 'picture') {
        const a = document.createElement('a');
        a.href = val;
        a.textContent = val;
        a.target = '_blank';
        td.appendChild(a);
      } else {
        td.textContent = val;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return data;
}

// Promise to turn an Object into an HTML element
// and return the data so it can be used in a chain of promises
const createHtmlTable = (data, id) => {
  //console.log('createHtmlTable', data)
  return new Promise((resolve,reject) => {
    resolve(tableElement(data,id));
  })
}


// Promise to load a CSV file into memory and return it.
const loadcsv = (url) => {
  return new Promise((resolve, reject) => {
    //console.log('loading from', url);
    resolve(csv(url));
  });
}

loadcsv('http://localhost:8080/CSV/HelModels.csv')
  .then(data => createHtmlTable(data, 't1'))
  .then(data => LoadPictures(data, 'model', pictures))

loadcsv('http://localhost:8080/CSV/roushx.csv')
  .then(data => LoadCrashData(data, vectorSource))


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const map = new Map({
  layers: [
    osmLayer,
    new LayerGroup({
      title: 'Water color with labels',
      type: 'base',
      combine: true,
      visible: true,
      layers: [
          new TileLayer({
              source: new StadiaMaps({
                  layer: 'stamen_watercolor',
              }),
          }),
          new TileLayer({
              source: new StadiaMaps({
                  layer: 'stamen_terrain_labels',
              })
          })
      ],
    }),
    mapboxStreetsLayer,
    arcgisWorldImageryLayer,
    mapboxSatelliteLayer,

    new LayerGroup({
      title: 'Overlays',
      layers: [
        vectorLayer,
      ]
    }),
  ],
  target: 'map',
  view: new View({
    center: INDOCHINA_CENTER,
    zoom: 5,
    projection: 'EPSG:3857' // the default
  }),
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const layerSwitcher = new LayerSwitcher();
map.addControl(layerSwitcher);

// popup
const info = document.getElementById('info');

let currentFeature;
const displayFeatureInfo = function (pixel, target) {
  const feature = target.closest('.ol-control')
    ? undefined
    : map.forEachFeatureAtPixel(pixel, function (feature) {
        //console.log('feature:', feature);
        return feature;
      });
  if (feature) {
    info.style.left = pixel[0] + 'px';
    info.style.top = (pixel[1] - 30) + 'px';
    if (feature !== currentFeature) {
      //console.log('new feature')
      info.style.visibility = 'visible';
      const p = feature.get('mgrs')
      if (p) {
        info.innerText = p;
      } else {
        info.style.visibility = 'hidden';
      }
      //console.log(feature.get('url'));
    }
  } else {
    info.style.visibility = 'hidden';
  }
  currentFeature = feature;
};

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    info.style.visibility = 'hidden';
    currentFeature = undefined;
    return;
  }
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

//map.on('click', function (evt) {
//  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
//});

map.getTargetElement().addEventListener('pointerleave', function () {
  currentFeature = undefined;
  info.style.visibility = 'hidden';
});