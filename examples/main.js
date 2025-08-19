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
import {useGeographic} from 'ol/proj';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { applyStyle } from 'ol-mapbox-style';
import LayerSwitcher from './layerswitcher';

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

const featureCollection = new Collection();
featureCollection.extend(new GeoJSON().readFeatures(geojsonObject));

const vectorSource = new VectorSource({
  features: featureCollection,
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

const arcgisWorldImageryLayer = 
    new ImageLayer({
        title: 'Esri World Imagery',
        type: 'base',
        source: new ImageArcGISRest({
            ratio: 1,
            params: {},
            url: arcgis_server + 'World_Imagery/MapServer',
        }),
});

const refVectorUrl = arcgis_tile_server + 'tile/{z}/{y}/{x}.pbf';
const refStyleUrl = arcgis_tile_server + 'resources/styles/';
console.log(refStyleUrl);
const arcgisWorldImageryReferenceLayer = new VectorTileLayer({
    title: 'Esri World Imagery Labels',
    source: new VectorTileSource({
        format: new MVT(),
        url: refVectorUrl,
        maxZoom: 20, 
    }),
    //style:
    //opacity: 0.7,
});
applyStyle(arcgisWorldImageryReferenceLayer, refStyleUrl);

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
  console.log('createHtmlTable', data)
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

console.log('fc', vectorSource)
loadcsv('http://localhost:8080/CSV/roushx.csv')
  .then(data => LoadCrashData(data, vectorSource))


const map = new Map({
  layers: [
    new TileLayer({
      title: 'OpenStreetMap',
      type: 'base',
      source: new OSM(),
    }),
    arcgisWorldImageryLayer,
    //arcgisWorldImageryHybridLayer,
    arcgisWorldImageryReferenceLayer,
    vectorLayer,
  ],
  target: 'map',
  view: new View({
    center: INDOCHINA_CENTER,
    zoom: 5,
  }),
});

const layerSwitcher = new LayerSwitcher();
map.addControl(layerSwitcher);

// popup
const info = document.getElementById('info');

let currentFeature;
const displayFeatureInfo = function (pixel, target) {
  const feature = target.closest('.ol-control')
    ? undefined
    : map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
  if (feature) {
    info.style.left = pixel[0] + 'px';
    info.style.top = (pixel[1] - 30) + 'px';
    if (feature !== currentFeature) {
      info.style.visibility = 'visible';
      const p = feature.get('mgrs')
      info.innerText = p;
      console.log(feature.get('url'));
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

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

map.getTargetElement().addEventListener('pointerleave', function () {
  currentFeature = undefined;
  info.style.visibility = 'hidden';
});