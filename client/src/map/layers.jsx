import React from "react";
import { useContext, useEffect } from "react";
import { MapContext } from "./map";
import olVectorLayer from "ol/layer/Vector";
import olTileLayer from "ol/layer/Tile";
import olVectorTileLayer from "ol/layer/VectorTile";
import olWebGLLayer from "ol/layer/WebGLTile";

export const Layers = ({ children }) => {
	return <div>{children}</div>;
};

export const ImageTileLayer = ({source, zIndex=0}) => {
	const { map } = useContext(MapContext);
	useEffect(() => {
		if (!map) return;

		let tileLayer = new olWebGLLayer({
			source,
			zIndex,
		});

		map.addLayer(tileLayer);
		tileLayer.setZIndex(zIndex);

		return () => {
			if (map) {
				map.removeLayer(tileLayer);
			}
		};
	}, [map]);

	return null;
}

export const TileLayer = ({ source, zIndex = 0 }) => {
	const { map } = useContext(MapContext);
	useEffect(() => {
		if (!map) return;

		let tileLayer = new olTileLayer({
			source,
			zIndex,
		});

		map.addLayer(tileLayer);
		tileLayer.setZIndex(zIndex);

		return () => {
			if (map) {
				map.removeLayer(tileLayer);
			}
		};
	}, [map]);

	return null;
};

export const VectorTileLayer = ({ source, style, zIndex = 0 }) => {
	const { map } = useContext(MapContext);
	useEffect(() => {
		if (!map) return;

		let vectorTileLayer = new olVectorTileLayer({
			source,
			zIndex,
			style,
		});

		map.addLayer(vectorTileLayer);
		vectorTileLayer.setZIndex(zIndex);

		return () => {
			if (map) {
				map.removeLayer(vectorTileLayer);
			}
		};
	}, [map]);

	return null;
};

export const VectorLayer = ({ source, style, zIndex = 0 }) => {
	const { map } = useContext(MapContext);
	useEffect(() => {
		if (!map) return;

		let vectorLayer = new olVectorLayer({
			source,
			style
		});

		map.addLayer(vectorLayer);
		vectorLayer.setZIndex(zIndex);

		return () => {
			if (map) {
				map.removeLayer(vectorLayer);
			}
		};
	}, [map]);

	return null;
};
