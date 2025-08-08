import BingMaps from 'ol/source/BingMaps.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import {fromLonLat} from 'ol/proj';

const api_key = ""; // Bing key goes here... I wonder how I manage keys in React? 


const lonlat = [104,17]
const center = fromLonLat(lonlat, "EPSG:3857");

const styles = [
  'RoadOnDemand',
  'Aerial',
  'AerialWithLabelsOnDemand',
  'CanvasDark',
];
const layers = [];
let i, ii;
for (i = 0, ii = styles.length; i < ii; ++i) {
  layers.push(
    new TileLayer({
      visible: false,
      preload: Infinity,
      source: new BingMaps({
        key: api_key,
        imagerySet: styles[i],
        placeholderTiles: false, // Optional. Prevents showing of BingMaps placeholder tiles
      }),
    })
  );
}
const map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
    center: center,
    zoom: 5,
  }),
});

const select = document.getElementById('layer-select');
function onChange() {
  const style = select.value;
  for (let i = 0, ii = layers.length; i < ii; ++i) {
    layers[i].setVisible(styles[i] === style);
  }
}
select.addEventListener('change', onChange);
onChange();
