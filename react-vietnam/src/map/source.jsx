import * as olSource from 'ol/source';
import { Vector as VectorSource } from 'ol/source';

export const OSMSource = () => {
	return new olSource.OSM();
}

export const VectorSource = ({ features }) => {
	return new VectorSource({
		features
	});
}

export const XYZSource = ({ url, attributions, maxZoom }) => {
	return new olSource.XYZ({ url, attributions, maxZoom });
}

export const BingSource = () => {
	return new olSource.BingMaps();
}