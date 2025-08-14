import {csv, html} from 'd3-fetch';
import { toPoint } from 'mgrs';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {useGeographic} from 'ol/proj';
import Collection from 'ol/Collection';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

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

const vectorSource = new VectorSource({
  features: new GeoJSON().readFeatures(geojsonObject),
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: styleFunction
});

function c(data,id) {
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
    resolve(c(data,id));
  })
}

// Promise to turn the JSON object 'data'
// into a lookup table 'lut' indexed by 'key'
const makeLut = (data, key, lut) => {
  return new Promise((resolve,reject) => {
    resolve(data.forEach((row) => {
      //console.log(key, row)
      lut[row[key]] = row;
    }));
  })
}

// Promise to load a CSV file into memory and return it.
const loadcsv = (url) => {
  return new Promise((resolve, reject) => {
    //console.log('loading from', url);
    resolve(csv(url));
  });
}

function togjson(data) {
  console.log('togson')
  let features = [];
  data.forEach(row => {
    const mgrsPoint = row['mgrs'];
    let coordinate = [0,0]; // Null Island! Dangerous place!
    try {
      coordinate = toPoint(mgrsPoint);
    } catch(err) {
      console.log('Ignoring invalid MGRS', mgrsPoint)
    }
    const feature = {
      type : 'Feature',
      geometry: {
        type: "Point",
        coordinates: coordinate
      },
      properties: row
    }
    features.push(feature)
  });
  let fc = {
    type: "FeatureCollection",
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    },
    features: features
  }
  const featureCollection = new Collection(fc);
  console.log(fc)
  vectorSource.addFeatures(featureCollection);
  return data;
}

// Promise to convert an Object into GeoJSON object.
// The 'mgrs' property needs to be turned into Lat,Lon.
const toGeoJSON = (data, featureCollection) => {
  return new Promise((resolve,reject) => {
    resolve(togjson(data, featureCollection));
  })
}


loadcsv('http://localhost:8080/CSV/HelModels.csv')
  .then(data => createHtmlTable(data, 't1'))
  .then(data => makeLut(data, 'model', pictures))

loadcsv('http://localhost:8080/CSV/roushx.csv')
  //.then(data => createHtmlTable(data,'t2'))
  .then(data => toGeoJSON(data, crash_sites))


const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorLayer,
  ],
  target: 'map',
  view: new View({
    center: INDOCHINA_CENTER,
    zoom: 5,
  }),
});
