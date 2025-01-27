import React, { useRef, useState, useEffect } from 'react';
import * as ol from 'ol';

export const MapContext = React.createContext();


export const Map = ({children, center, zoom}) => {
    const mapRef = useRef();
    const [map, setMap] = useState(null);
    useEffect(() => {
        const popupOverlay = new ol.Overlay({
            element: document.getElementById('popup'),
            autoPan: {
              animation: {
                duration: 250,
              },
            },
        });
        let options = {
            view: new ol.View({zoom, center}),
            layers: [],
            controls: [],
            overlays: [popupOverlay],
        };
        let mapObject = new ol.Map(options);
        mapObject.setTarget(mapRef.current);
        mapObject.on('singleclick', (e) => {
            const coordinate = e.coordinate;
            console.log(coordinate);
        });

        let currentFeature;
        const displayFeatureInfo = (pixel, target) => {
            const info = document.getElementById('province_data');
            const feature = target.closest('.ol-control')
            ? undefined
            : mapObject.forEachFeatureAtPixel(pixel, function (feature) {
                return feature;
              });
          if (feature) {
            info.style.left = pixel[0] + 'px';
            info.style.top = pixel[1] + 'px';
            if (feature !== currentFeature) {
              info.style.visibility = 'visible';
              if (feature.get('nam')) {
                info.innerText = feature.get('nam') 
                + " " + feature.get('na2')
                + " " + feature.get('PNTCNT');
              }
            }
          } else {
            info.style.visibility = 'hidden';
          }
          currentFeature = feature;
        };
        mapObject.on('pointermove', (e) => {
            const pixel = mapObject.getEventPixel(e.originalEvent);
            //console.log(pixel);
            displayFeatureInfo(pixel, e.originalEvent.target);
        });
        setMap(mapObject);
        return () => mapObject.setTarget(undefined);
    }, []);
    
    return (
        <MapContext.Provider value={{map}}>
            <div ref={mapRef} className="ol-map">
                {children}
            </div>
            <div id="popup" className="ol-popup">
                <div id="popup-content"></div>
            </div>
        </MapContext.Provider>
    );
}

