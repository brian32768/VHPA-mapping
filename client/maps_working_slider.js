// Web Mapping - Vietnam project
// Brian Wilson <brian@wildsong.biz>
// 02 JUN 2012 

window.onload = init

// URLs of data sources, we are all just files here
var provinces = "provinces.geojson";
var countries = "countries.geojson";
var ppl_vm = 'vm.geojson'; // Vietnam populated places
var ppl_cb = 'cb.geojson'; // Cambodia populated places
var ppl_la = 'la.geojson'; // Laos populated places
var crash_sites = "Hupy data/all_date.geojson";

var overviewmap, detailmap;
var mapProj, wgsProj;
var dateSlider = "#slider1";
var opacitySlider = "#slider2";
var data_loaded = false;

var provincesLayer; // global so we can get at the feature list

// these numbers come from tilemapresource.xml
var mapBounds = new OpenLayers.Bounds(104.247254165, 7.99778115733,  109.549632715, 17.0568691898);
var mapMinZoom = 8;
var mapMaxZoom = 16;

function init() {
    mapProj = new OpenLayers.Projection("EPSG:900913");
    wgsProj = new OpenLayers.Projection("EPSG:4326");

    // Set data sources
    ds_crash_sites = new OpenLayers.Protocol.HTTP({
	url : crash_sites,
	format : new OpenLayers.Format.GeoJSON()
    });
    ds_provinces = new OpenLayers.Protocol.HTTP({
	url : provinces,
	format : new OpenLayers.Format.GeoJSON()
    });
    ds_countries = new OpenLayers.Protocol.HTTP({
	url : countries,
	format : new OpenLayers.Format.GeoJSON()
    });

    ds_ppl_vm = new OpenLayers.Protocol.HTTP({
	url : ppl_vm,
	format : new OpenLayers.Format.GeoJSON()
    });
    ds_ppl_cb = new OpenLayers.Protocol.HTTP({
	url : ppl_cb,
	format : new OpenLayers.Format.GeoJSON()
    });
    ds_ppl_la = new OpenLayers.Protocol.HTTP({
	url : ppl_la,
	format : new OpenLayers.Format.GeoJSON()
    });
    
    init_overview();
    init_detail();
}

// =============================================================================

function init_overview() {
    var options = {
	projection : mapProj,
	controls: []
    };
    
    overviewmap = new OpenLayers.Map("overviewmap", options);

    var baseLayer = new OpenLayers.Layer.Stamen("toner");
    baseLayer.setOpacity(.70); // allow background color to show through
    // Stamen requests this attribution when using their layers.
    attribution = document.getElementById("attribution")
    attribution.innerHTML = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.'
    + 'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
    
    //console.log("overviewmap:", overviewmap);
    //console.log("overviewmap.projection:", overviewmap.projection);
    
    // For different ESRI basemaps,
    // see http://arcgisonline.com/home/search.html?q=base%20map%20name&t=content
    //arcgisLayer = new OpenLayers.Layer.XYZ( "ESRI",
    //    "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}",
    //    {sphericalMercator: true});
    //overviewmap.addLayer(arcgisLayer);
    //attribution = document.getElementById("attribution");
    //attribution.innerHTML = 'Map tiles by <a href="http://arcgisonline.com">ESRI</a>';

    var overview_context = {	
	getSize: 3,
        getOpacity: 1,
	getColor: "#000000"
    };	
    
    var default_style = new OpenLayers.Style(
        {	
            pointRadius: 2,
	    fillColor: "#F0F0F0",
            strokeColor: "#000",	
            strokeWidth: 1,
            fillOpacity: 0.5,
            strokeOpacity: 1
        } //,{ context: overview_context }
    );	
    
    var tinted_style = new OpenLayers.Style(
        {	
	    fillColor: function(feature) {
		color = "#FF00FF";
		//na2 = feature.attributes["na2"];
		//console.log(na2);
		//color = "#FF0000"; // VM
		//if (na2 == "CB") color = "#FFFF00";
		//else if (na2 == "LA") color = "#0000FF"
		return color;	
	    },
            strokeColor: "#000",	
            strokeWidth: 1,
            fillOpacity: 0.5,
            strokeOpacity: 1
        },
        { context: overview_context }
    );	
    
    var select_style = new OpenLayers.Style(
	{	
//            pointRadius: "${getSize}",	
	    fillColor: "#00FFFF",
	    strokeColor: "#000",	
	    strokeWidth: 3,	
	    fillOpacity: 1,
	    strokeOpacity: 1
	},
        { context: overview_context }
    );

    var countries_style = new OpenLayers.StyleMap({	
        "default": default_style
    });
    var countriesLayer = new OpenLayers.Layer.Vector("COUNTRIES",
        {
            styleMap  : countries_style,
            projection: wgsProj,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol  : ds_countries,
	    baseLayer : true
        }
    );

/* 
  // All these dots make for a busy map
    var crashStyleMap = new OpenLayers.StyleMap({	
        "default": default_style,
//	"temporary" : select_style
    });
    var crashLayer = new OpenLayers.Layer.Vector("CRASH",
        {
            styleMap  : crashStyleMap,
            projection: wgsProj,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol  : ds_crash_sites
        }
    );
    overviewmap.addLayer(crashLayer);
*/
    
    var provinces_style = new OpenLayers.StyleMap({	
        "default": tinted_style,
	"temporary" : select_style
    });
    provincesLayer = new OpenLayers.Layer.Vector("PROVINCES",
        {
            styleMap  : provinces_style,
            projection: wgsProj,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol  : ds_provinces
        }
    );
    provincesLayer.events.register( 'loadend', this, handle_dataloaded );

    // On mouseover, highlight the province on map and show the province data           
    var selectCtrl = new OpenLayers.Control.SelectFeature(provincesLayer,
	{
	    hover: true,
	    highlightOnly: true,
	    renderIntent: "temporary",
	    eventListeners: {
		featurehighlighted: handle_mouseover_overview,
	    }
	}
    );
    overviewmap.addControl(selectCtrl);
    selectCtrl.activate();

    // On click, zoom the detail map
    overviewmap.events.registerPriority("click", overviewmap,
	function(e) {
	    var lonlat = overviewmap.getLonLatFromLayerPx(e.xy);
	    zoom_detail(lonlat);
	}
    );

    overviewmap.addLayers([
	baseLayer,
//			   countriesLayer,
			   provincesLayer,
    ]);
    
    // The GEOGRAPHIC CENTER of the Indochina
    var mapcenter = new OpenLayers.LonLat(104.5, 16.40); // Indochina map center
    mapcenter.transform(wgsProj, mapProj);
    //console.log("Overview mapcenter ", mapcenter)

    overviewmap.setCenter(mapcenter, 5, false, false);
//    bounds = overviewmap.getExtent();
//    overviewmap.restrictedExtent = bounds;
}


// =============================================================================

function init_detail() {
    var mapControls =  [
	new OpenLayers.Control.Navigation(),
	new OpenLayers.Control.PanZoomBar(),
	new OpenLayers.Control.LayerSwitcher()
    ];
    var options = {
	controls : mapControls,
	projection: mapProj,
	displayProjection: wgsProj,
	units: "m",
	maxResolution: 156543.0339,
	maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34) 
    };
    detailmap = new OpenLayers.Map('detailmap', options);

    // Google satellite layer.
    var baselayer = new OpenLayers.Layer.Google("Google Satellite",
	{
	    type: google.maps.MapTypeId.SATELLITE,
	    sphericalMercator: true, numZoomLevels: 20
	}
    );
    
    var detail_context = {	
	getSize: 3,
        getOpacity: 1,
	getColor: "#FFFF00"
    };	
  
    var default_style = new OpenLayers.Style(
        {	
            pointRadius: 3,	
            fillColor: "#FFFFFF",
            strokeColor: "#000",	
            strokeWidth: 2,	
            fillOpacity: 0,
            strokeOpacity: 1
        },
        { context: detail_context }
    );	
  
    var select_style = new OpenLayers.Style(
	{	
            pointRadius: 5,	
	    fillColor: "#00FFFF",
	    strokeColor: "#000",	
	    strokeWidth: 3,	
	    strokeOpacity: 1
	},
        { context: detail_context }
    );

    var provinces_styleMap = new OpenLayers.StyleMap({	
        "default": default_style,
	"temporary" : select_style
    });
    provincesLayer = new OpenLayers.Layer.Vector("Provinces",
        {
            styleMap  : provinces_styleMap,
            projection: wgsProj,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol  : ds_provinces
        }
    );
    
    // make sure fillOpacity is set > 0!!
    var service_lookup_color = {
	"AR": { fillColor : "#FF0000"},
	"MC": { fillColor : "#FFFF00"},
	"VF": { fillColor : "#FF00FF"},
	"AF": { fillColor : "#0000FF"},
    };
    
    // this works
    var service_lookup_size = {
	"AR": { pointRadius : 10},
	"MC": { externalGraphic : "helicopter.png"},
	"VF": { pointRadius : 30},
	"AF": { pointRadius : 40},
    };
    
    var crash_context = {	
	getSize: 5,
        getOpacity: layerOpacity,
	getColor: "#FFFF00"
    };	
    
    var crash_point_style = new OpenLayers.Style(
        {	
            pointRadius: 5,	
            strokeColor: "#FFFFFF",	
            strokeWidth: 2,
	    fillColor: "#FFFFFF",
            fillOpacity: "${getOpacity}",
            strokeOpacity: "${getOpacity}"
        },
        { context: crash_context }
    );	
  
    var crashStyleMap = new OpenLayers.StyleMap({	
        "default": crash_point_style,
	"temporary" : select_style
    });
    
    // Set the color of each point by looking up the value of the Service attribute
    crashStyleMap.addUniqueValueRules("default", "Service",
				      service_lookup_color);
    
    // make this global
    crashLayer = new OpenLayers.Layer.Vector("Crash Sites",
        {
            styleMap  : crashStyleMap,
            projection: wgsProj,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol  : ds_crash_sites
        }
    );
    
    var pplVmLayer = new OpenLayers.Layer.Vector("Pop. places: Vietnam",
        {
            projection: wgsProj,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol  : ds_ppl_vm
        }
    );
    var pplCbLayer = new OpenLayers.Layer.Vector("Pop. places: Cambodia",
        {
            projection: wgsProj,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol  : ds_ppl_cb
        }
    );
    var pplLaLayer = new OpenLayers.Layer.Vector("Pop. places: Laos",
        {
            projection: wgsProj,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol  : ds_ppl_la
        }
    );
    
    // Topo map overlay layer
    var dmaLayer = new OpenLayers.Layer.TMS(
	"Defense Mapping Agency", // title to show in layer switcher
	'DMA_data/', // URL service endpoint
        {
	    //serviceVersion: '.',
	    //layername: '.',
            type: 'png',
	    getURL: overlay_getTileURL,
	    alpha: true,
            isBaseLayer: false
        }
    );
    if (OpenLayers.Util.alphaHack() == false) { dmaLayer.setOpacity(0.7); }
    
    // avoid pink tiles
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
    OpenLayers.Util.onImageLoadErrorColor = "transparent";

    var highlightCtrl = new OpenLayers.Control.SelectFeature(crashLayer,
	{	
    	    hover: true,
	    highlightOnly: true,
	    renderIntent: "temporary",
	    eventListeners: {
		featurehighlighted: handle_mouseover_detail,
	    }
	}
    );
    detailmap.addControl(highlightCtrl);
    highlightCtrl.activate();
    
    /*
    // On click, zoom the detail map
    detailmap.events.registerPriority("click", detailmap,
	function(e) {
	    var lonlat = detailmap.getLonLatFromPixel(e.xy);
	    //console.log("Click on ", e.xy, lonlat);
	    //zoom_detail(lonlat); // just for testing
	}
    );
    */
    
    detailmap.addLayers(
	[
	    baselayer,
	    dmaLayer,
	    provincesLayer,
	    crashLayer,
	    
	    //pplVmLayer,
	    //pplCbLayer,
	    //pplLaLayer
	]
    );
    
    // The GEOGRAPHIC CENTER of the Dong Nai
    var mapcenter = new OpenLayers.LonLat(107.5, 11.0); // Dong Nai map center
    mapcenter.transform(wgsProj, detailmap.projection);
    //console.log("Detail mapcenter ", mapcenter)
    
    detailmap.setCenter(mapcenter, 8, false, false);
    
    // doing this messes up transforms
    // Restrict extent changes
    //bounds = detailmap.getExtent();
    //detailmap.restrictedExtent = bounds;
    
    mapBounds.transform(detailmap.displayProjection, detailmap.projection)
    
    // Zoom to show all available topo tiles, not something we do normally
    //detailmap.zoomToExtent( mapBounds);
    //detailmap.zoomIn();
    //detailmap.zoomIn();
    
    console.log("Zoom is now ", detailmap.getZoom());
}

// =============================================================================

function overlay_getTileURL(bounds) {

    var res = this.map.getResolution();
    var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
    var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
    var zoomlevel = this.map.getZoom();
    var url;
    
    // Apparently Virtual Earth zoom level is different than everyone else's.
    if (this.map.baseLayer.name == 'Virtual Earth Roads'
	|| this.map.baseLayer.name == 'Virtual Earth Aerial'
	|| this.map.baseLayer.name == 'Virtual Earth Hybrid')
    {
	zoomlevel += 1;
    }
    
    //console.log(zoomlevel);
    if (mapBounds.intersectsBounds( bounds ) && zoomlevel >= mapMinZoom && zoomlevel <= mapMaxZoom )
    {
	url = this.url + "250k/" + zoomlevel + "/" + x + "/" + y + "." + this.type;
        // list only the files I can't find
	//console.log("url = ", url);
	
    } else {
        url = "http://www.maptiler.org/img/none.png"; // pink tiles! oh no!
    }
    
    return url;
}

// =============================================================================

// Handle the event when the mouse rolls over a city in our map.
function handle_mouseover_overview(event) {
    var attributes = event.feature.attributes;
    //console.log(attributes);
    
    country = "Vietnam"
    if (attributes.na2 == 'CB') country = "Cambodia"
    else if (attributes.na2 == 'LA') country = "Laos"
    
    show_province_data([attributes.nam, country])
}

// =============================================================================

// Zoom the detail map to the given point
function zoom_detail(mapxy)
{
    //// Center map and restrict extent changes
    //detailmap.setCenter(lonlat, 8, false, false);
    //console.log("zoom to " + mapxy);
    //console.log("projection=", detailmap.projection);
    //mapxy.transform(detailmap.projection, wgsProj);
    //console.log("xform " + mapxy);
    
    //var mapcenter = new OpenLayers.LonLat(lonlat.lon, lonlat.lat)
    //mapcenter.transform(wgsProj, mapProj)
    detailmap.setCenter(mapxy, 8, false, false)
    //bounds = detailmap.getExtent();
    //detailmap.restrictedExtent = bounds;
}

// =============================================================================

// Handle the event when the mouse rolls over a city in our map.
function handle_mouseover_detail(event) {
    var attributes = event.feature.attributes;
    show_crash_data(attributes)
}

// =============================================================================

function show_province_data(a)
{
    //console.log(a)
    var html =
	"<h2>" + a[0] + "</h2>"
	+ "<h3>" + a[1] + "</h3>"
	+ "<br />"
    document.getElementById("province_data").innerHTML = html;
}

// =============================================================================

function show_crash_data(a)
{
    //console.log(a)
    var html = "<h2>" + a["Incident"] + "</h2>"
	+ "Date: " + a["yyyymmdd"] + "<br />"
	+ "Service: " + a["Service"] + "<br />"
	+ "Unit: " + a["unit"] + "<br />"
	+ "Tail number: " + a["tail__"] + "<br />"
	+ "Model: " + a["model"] + "<br />"
    document.getElementById("crash_data").innerHTML = html;
}

//////////////////////////////////////////////////////////

// This handler is called after the province data layer has finished loading.
// Extract the province names to create a pick list.
function handle_dataloaded(layer) {
    features = layer.object.features
    //console.log("handle_dataloaded() # of features ", features.length);  
    provincedata = Array() // all data is a global used elsewhere
    for (var i in features) {
	//console.log("feature attributes = ", i, features[i].attributes)
//	var city = features[i].attributes.name
	var name = features[i].attributes.nam
//	var pop = features[i].attributes.pop_2010
//	var v = features[i].attributes.violentcrime_2010
//	var p = features[i].attributes.propertycrime_2010
       provincedata.push(name)
    }
    provincedata.sort();
    //console.log(provincedata);
    $("input#autocomplete").autocomplete(
	{
	    source: provincedata
	}
    );
    
    data_loaded = true // flag it's safe to use alldata now
    initcontrols();
//    initgraph()    
}

// This handler is called when the controls are moved on the sliders
function handle_slider(){
    console.log("handle_slider"); //console.log(control);
    crashLayer.redraw();	
}
// This handler is called when the controls are moved on the sliders
function handle_opacity_slider(){
    console.log("handle_opacity_slider"); 
    crashLayer.redraw();	
}

// Initialize the controls that are not on the map.
// This is called from the data loaded handler so that we
// can use the actual data to set up the sliders.
function initcontrols()
{
    console.log("initcontrols")

// Find data range limits    
//    var minViolent = Number.MAX_VALUE
//    var maxViolent = 0
//    var minProperty = Number.MAX_VALUE
//    var maxProperty = 0
//    
//    for (i in alldata) {
//	var v = alldata[i][3]
//	var p = alldata[i][4]
//	
//	if (minViolent > v) minViolent = v
//	else if (maxViolent < v) maxViolent = v
//	if (minProperty > p) minProperty = p
//	else if (maxProperty < p) maxProperty = p
//    }
    // Sliders
    
    // date range
    
    document.getElementById("min1").innerHTML = 1961;
    document.getElementById("max1").innerHTML = 1972;

    $(dateSlider).slider({	
	values:[1961,1972], 	
	min: 1961,	
	max: 1972, 	
	step: 1, 	
	range: true, 	
	change: handle_slider	
    });

    // opacity, just a single handle
    
    //document.getElementById("min2").innerHTML = 0;
    //document.getElementById("max2").innerHTML = 100;

    $(opacitySlider).slider({	
	value: 1, 	
	min: 0,	
	max: 1, 	
	step: .1, 	
	//range: true, 	
	change: handle_opacity_slider	
    });
}

// Return an opacity level (0..1) based on slider levels
function layerOpacity(feature) {
//    if (!data_loaded) return 1;
//    var violentBreaks = $(dateSlider).slider( "option", "values" );
//    var propertyBreaks = $(opacitySlider).slider( "option", "values" );
    return $(opacitySlider).slider("option", "value")
}

// That's all!
