import React, { useRef, useState, useEffect } from 'react';
import * as ol from 'ol';

export const MapContext = React.createContext();

export const Map = ({children, center, zoom}) => {
    const mapRef = useRef();
    const [map, setMap] = useState(null);
    useEffect(() => {
        let options = {
            view: new ol.View({zoom, center}),
            layers: [],
            controls: [],
            overlays: [],
        };
        let mapObject = new ol.Map(options);
        mapObject.setTarget(mapRef.current);
        setMap(mapObject);
        return () => mapObject.setTarget(undefined);
    }, []);
    
    return (
        <MapContext.Provider value={{map}}>
            <div ref={mapRef} className="ol-map">
                {children}
            </div>
        </MapContext.Provider>
    );
}

