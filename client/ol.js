window.onload = init;

var map;
var mapBounds = new OpenLayers.Bounds(104.183536551, 7.75399999477, 106.930083996, 10.052160243);
var mapMinZoom = 7;
var mapMaxZoom = 14;

function init() {
	var options = {
		controls: [],
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		units: "m",
		maxResolution: 156543.0339,
		maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34)
	};
	map = new OpenLayers.Map('map', options);

	var gsat = new OpenLayers.Layer.Google("Google Satellite",
		{
			type: google.maps.MapTypeId.SATELLITE,
			sphericalMercator: true, numZoomLevels: 20
		}
	);

	// create TMS Overlay layer
	var dmaLayer = new OpenLayers.Layer.TMS(
		"Defense Mapping Agency",
		"DMA_data/", // URL
		{
			// serviceVersion: '.',
			// layername: '.',
			type: 'png',
			getURL: overlay_getTileURL,
			alpha: true,
			isBaseLayer: false
		}
	);
	if (OpenLayers.Util.alphaHack() == false) { dmaLayer.setOpacity(0.7); }

	map.addLayers([gsat, dmaLayer]);
	map.zoomToExtent(mapBounds.transform(map.displayProjection, map.projection));
}

function overlay_getTileURL(bounds) {
	var res = this.map.getResolution();
	var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
	var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
	var z = this.map.getZoom();
	var url = "https://www.maptiler.org/img/none.png";
	if (mapBounds.intersectsBounds(bounds) && z >= mapMinZoom && z <= mapMaxZoom) {
		url = this.url + "250k/" + z + "/" + x + "/" + y + "." + this.type;
		console.log("topo url = ", url);
	}
	return url;
}		
