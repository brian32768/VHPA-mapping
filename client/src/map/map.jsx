import React, { useRef, useState, useEffect } from 'react';
import * as ol from 'ol';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

export const MapContext = React.createContext();

const selectStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});

export const Map = ({children, id, center, zoom}) => {
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
        const info = document.getElementById('province_data');

        let mapObject = new ol.Map(options);
        mapObject.id = id;
        mapObject.setTarget(mapRef.current);

        let selected = null;
        const displayFeatureInfo = (feature) => {
          if (feature) {
            if (feature !== selected) {
              if (feature.get('nam')) {
                const p = document.getElementById('province');
                const c = document.getElementById('country');
                const cs = document.getElementById('crashsites');
                const countryCode = feature.get('na2')
                let ctxt = '???';
                if (countryCode == 'VM') { // Viet Nam
                    ctxt = 'Viet Nam';
                } else if (countryCode == 'CB') { // Cambodia
                    ctxt = 'Cambodia';
                } else if (countryCode == 'LA') { // Laos
                    ctxt = 'Laos';  
                }
                p.innerText = feature.get('nam');
                c.innerText = ctxt;
                cs.innerText = feature.get('PNTCNT');
                info.style = {visibility:'visible'};
              }
            }
          }
        };

        // These events happen on either the country or main map

        mapObject.on('pointermove', (e) => {
          info.style = {visibility:'hidden'};
          // deselect whatever is currently selected
          if (selected !== null) {
            try {
              selected.setStyle(undefined);
            } catch(err) {
              console.log('rubbish! ' + err.message);
            }
          }
          //  const pixel = mapObject.getEventPixel(e.originalEvent);
          mapObject.forEachFeatureAtPixel(e.pixel, function(f) {
            // BTW the other map is called 'main'
            if (id == 'country') {
              displayFeatureInfo(f);
              selected = f;
              //selectStyle.getFill().setColor(f.get('COLOR') || '#eeeeee');
              try {
                f.setStyle(selectStyle);
              } catch(err) {
                console.log('pity that ' + err.message);
              }
            }
          })
        });

        mapObject.on('singleclick', (e) => {
            const coordinate = e.coordinate;
            const id = e.map.id;
            if (id == 'country') {
              const province_name = selected.get('nam') 
              console.log(province_name)
              // light up the province
              // zoom the mainmap to the extent of this province
            }
            console.log(coordinate);
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

