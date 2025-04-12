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
        const info = document.getElementById('province_data');

        let mapObject = new ol.Map(options);
        mapObject.id = id;
        mapObject.setTarget(mapRef.current);


        const displayFeatureInfo = (feature) => {
          const p = document.getElementById('province');
          const c = document.getElementById('country');
          const cs = document.getElementById('crashsites');
          let countrytxt = '---';
          let ccounttxt = '---';
          info.style = {visibility:'hidden'};
          if (feature && feature.get('nam')) {
            const countryCode = feature.get('na2')
            if (countryCode == 'VM') {
              countrytxt = 'Viet Nam';
            } else if (countryCode == 'CB') {
              countrytxt = 'Cambodia';
            } else if (countryCode == 'LA') {
              countrytxt = 'Laos';
            }
            info.style = {visibility:'visible'};

            selected_province_name = feature.get('nam');
            ccounttxt = feature.get('PNTCNT');
          }
          p.innerText = selected_province_name;
          c.innerText = countrytxt;
          cs.innerText = ccounttxt;
        };

        // These events happen on either the country or main map

        let selected = null;
        mapObject.on('pointermove', (e) => {
          // deselect whatever is currently selected
          if (selected !== null) {
            try {
              selected.setStyle(undefined);
              selected = null;
            } catch(err) {
              console.log('deselect failed' + err);
            }
          }
          //  const pixel = mapObject.getEventPixel(e.originalEvent);
          mapObject.forEachFeatureAtPixel(e.pixel, function(f) {
            // BTW the other map is called 'main'
            if (id == 'country') {
              const countryCode = f.get('na2')
              let fc = '#88888888';
              if (countryCode == 'VM') {
                countrytxt = 'Viet Nam';
                fc = '#95F5E080';
              } else if (countryCode == 'CB') {
                countrytxt = 'Cambodia';
                fc = '#D8B36580';
              } else if (countryCode == 'LA') {
                countrytxt = 'Laos';
                fc = '#5AB4AC80';  
              }
              try {
                const selectStyle = new Style({
                  stroke: new Stroke({
                    color: 'rgba(25, 25, 25, 0.7)',
                    width: 3,
                  }),
                  fill: new Fill({
                    color: fc,
                  }),
                });
                f.setStyle(selectStyle);
                displayFeatureInfo(f);
                selected = f;
              } catch(err) {
                console.log('renderFeature ' + err);
              }
            }
            return true;
          })
        });

        mapObject.on('singleclick', (e) => {
            const coordinate = e.coordinate;
            const id = e.map.id;
            if (id == 'country') {
              console.log(selected_province_name)
              console.log(coordinate);
              // light up the province
              // zoom the mainmap to the extent of this province
            }
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

