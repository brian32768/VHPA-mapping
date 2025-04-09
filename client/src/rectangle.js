import {fromExtent} from 'ol/geom/Polygon.js';

    new VectorLayer({
      source: new VectorSource({
        features: [
          new Feature(
            // Here a `Geometry` is expected, e.g. a `Polygon`, which has a handy function to create a rectangle from bbox coordinates
            fromExtent([-1000000, 5000000, 3000000, 7000000]), // minX, minY, maxX, maxY
          ),
        ],
      }),
    }),
