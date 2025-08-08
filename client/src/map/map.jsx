import React, { useRef, useState, useEffect } from 'react';
import * as ol from 'ol';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

export const MapContext = React.createContext();

export const Map = ({children, id, center, zoom}) => {
    const mapRef = useRef();
    const [map, setMap] = useState(null);
    let selected_province_name = '';
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
            console.log('singleclick ' + coordinate);
        });

        let currentFeature;
        const displayFeatureInfo = (pixel, target) => {
            const province_data = document.getElementById('province_data');
            const feature = target.closest('.ol-control')
            ? undefined
            : mapObject.forEachFeatureAtPixel(pixel, function (feature) {
                return feature;
              });
          if (feature) {
            if (feature !== currentFeature) {
              province_data.style.visibility = 'visible';
              if (feature.get('nam')) {
                  const province_text = document.getElementById('province_text');
                  const country_text = document.getElementById('country_text');
                  const crash_text = document.getElementById('crash_text');
                  province_text.innerText = feature.get('nam');
                  country_text.innerText = feature.get('na2');
                  const count = feature.get('PNTCNT');
                  if (count > 0) {
                    crash_text.innerText = 'crash sites: ' + count;
                  } else {
                    crash_text.innerText = '';
                  }
              }
            }
          } else {
            province_data.style.visibility = 'hidden';
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

