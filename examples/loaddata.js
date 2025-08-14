import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import { toPoint } from 'mgrs';

// Promise to turn the JSON object 'data'
// into a lookup table 'lut' indexed by 'key'
export const LoadPictures = (data, key, lut) => {
  return new Promise((resolve,reject) => {
    resolve(data.forEach((row) => {
      //console.log(key, row)
      lut[row[key]] = row;
    }));
  })
}

function togjson(data, vectorSource) {
  console.log('togson', vectorSource)
  let features = [];
  data.forEach(row => {
    const mgrsPoint = row['mgrs'];
    let coordinate = [0,0]; // Null Island! Dangerous place!
    try {
      coordinate = toPoint(mgrsPoint);
    } catch(err) {
      console.log('Ignoring invalid MGRS', mgrsPoint)
    }
    const feat = new Feature({
      geometry: new Point(coordinate),
      ...row
    });
    //console.log('feat', feat)
    vectorSource.addFeature(feat)
  });
  //onsole.log(vectorSource)
  return data;
}

// Promise to add 'data' into a VectorSource.
// The 'mgrs' property needs to be turned into Lat,Lon.
export const LoadCrashData = (data, vectorSource) => {
  return new Promise((resolve,reject) => {
    resolve(togjson(data, vectorSource));
  })
}

