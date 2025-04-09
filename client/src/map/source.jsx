import * as olSource from 'ol/source';
import { GeoJSON } from 'ol/format';
import { MVT } from 'ol/format';
import { TileGrid } from 'ol/tilegrid';
import { get as getProjection } from 'ol/proj';

export const OSMSource = () => {
	return new olSource.OSM();
}

export const VectorSource = (url) => {
	return new olSource.Vector({
		url: url,
		format: new GeoJSON()
	});
}

export const XYZSource = ({ url, attributions, maxZoom }) => {
	// lots of other attributes possible here...
	// refer to https://openlayers.org/en/latest/apidoc/module-ol_source_XYZ-XYZ.html
	return new olSource.XYZ({ url, attributions, maxZoom });
}

export const EsriWorldTopoMapSource = () => {
	return new olSource.ImageTile({
        attributions:
          'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
          'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        url:
          'https://server.arcgisonline.com/ArcGIS/rest/services/' +
          'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
	});
}


export const BingSource = () => {
	return new olSource.BingMaps();
}

// Calculation of resolutions that match zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
const resolutions = [];
for (let i = 0; i <= 8; ++i) {
  resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
}

// Gallery: https://apidocs.geoapify.com/docs/maps/map-tiles/
const geoapifyUrl = () => {
	const key = "d49d4e6bef4c442f97b4a15691507625";
	// positron (grey)
	// https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=YOUR_API_KEY
	return (    
		"https://maps.geoapify.com/v1/tile/positron/" + 
		`{z}/{x}/{y}@2x.png?apiKey=` + key
	  )
		.replace('{z}', String(tileCoord[0] * 2 - 1))
		.replace('{x}', String(tileCoord[1]))
		.replace('{y}', String(tileCoord[2]));
}

const mapboxUrl = (tileCoord) => {
	const key = "pk.eyJ1IjoiZHJ1bml4IiwiYSI6ImNsemhvaHdpajA3Mm0ycHB6bGpweDJsY2sifQ.NHZkHij8-gz_w6nPzW72Bg";
	return (    
		'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
		'{z}/{x}/{y}.vector.pbf?access_token=' +
		key
	  )
		.replace('{z}', String(tileCoord[0] * 2 - 1))
		.replace('{x}', String(tileCoord[1]))
		.replace('{y}', String(tileCoord[2]))
		.replace(
		  '{a-d}',
		  'abcd'.substr(((tileCoord[1] << tileCoord[0]) + tileCoord[2]) % 4, 1),
		);
}


export const MapboxSource = () => {
	return new olSource.VectorTile({
		format: new MVT(),
		tileGrid: new TileGrid({
			extent: getProjection('EPSG:3857').getExtent(),
			resolutions: resolutions,
			tileSize: 512
		}),
		tileUrlFunction: mapboxUrl
	});
}

// Geoapify appears to be a German company
export const GeoapifySource = () => {
	return new olSource.VectorTile({
		format: new MVT(),
		tileGrid: new TileGrid({
			extent: getProjection('EPSG:3857').getExtent(),
			resolutions: resolutions,
			tileSize: 512
		}),
		tileUrlFunction: mapboxUrl
	});
}


