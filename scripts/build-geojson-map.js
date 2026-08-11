import { readFileSync, writeFileSync } from 'fs';

const fileContent = readFileSync(
  'C:\\Users\\Arya Gupta\\.gemini\\antigravity-ide\\brain\\792e2dcc-08c6-4a88-baf4-f98f9ee73003\\.system_generated\\steps\\287\\content.md',
  'utf8'
);

const match = fileContent.match(/const map = ({[\s\S]*?});\s*return map;/);
if (!match) {
  console.error('Could not find map object in file');
  process.exit(1);
}

const geoJson = JSON.parse(match[1]);

// SVG viewBox dimensions
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 500;

function coordToSvg(lng, lat) {
  const x = Math.round((((lng + 180) / 360) * SVG_WIDTH) * 10) / 10;
  const y = Math.round((((90 - lat) / 180) * SVG_HEIGHT) * 10) / 10;
  return `${x},${y}`;
}

function polygonToPath(coordinates) {
  return coordinates
    .map(ring => {
      const points = ring.map(([lng, lat]) => coordToSvg(lng, lat));
      return `M${points.join('L')}Z`;
    })
    .join(' ');
}

function multiPolygonToPath(coordinates) {
  return coordinates
    .map(polygon => polygonToPath(polygon))
    .join(' ');
}

const mapPaths = {};

for (const feature of geoJson.features) {
  const id = feature.id || feature.properties?.id;
  if (!id) continue;

  const code = id.toUpperCase();
  const geom = feature.geometry;

  let pathD = '';
  if (geom.type === 'Polygon') {
    pathD = polygonToPath(geom.coordinates);
  } else if (geom.type === 'MultiPolygon') {
    pathD = multiPolygonToPath(geom.coordinates);
  }

  if (pathD) {
    if (mapPaths[code]) {
      mapPaths[code] += ' ' + pathD;
    } else {
      mapPaths[code] = pathD;
    }
  }
}

console.log(`Successfully generated SVG map paths for ${Object.keys(mapPaths).length} countries!`);
console.log('Includes IN:', !!mapPaths['IN'], 'US:', !!mapPaths['US'], 'CN:', !!mapPaths['CN'], 'RU:', !!mapPaths['RU'], 'BR:', !!mapPaths['BR']);

const jsContent = `/**
 * Complete, accurate SVG World Map paths for all ~200 countries.
 * Generated from amCharts GeoJSON (Equirectangular Projection).
 * ViewBox: 0 0 1000 500
 */
const WORLD_MAP_PATHS = ${JSON.stringify(mapPaths, null, 2)};

export default WORLD_MAP_PATHS;
`;

writeFileSync('c:\\Akshit\\ip-map-counter\\src\\world-map.js', jsContent, 'utf8');
console.log('Saved src/world-map.js!');
