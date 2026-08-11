import { readFileSync, writeFileSync } from 'fs';

const fileContent = readFileSync(
  'C:\\Users\\Arya Gupta\\.gemini\\antigravity-ide\\brain\\792e2dcc-08c6-4a88-baf4-f98f9ee73003\\.system_generated\\steps\\233\\content.md',
  'utf8'
);

const svgStart = fileContent.indexOf('<svg');
const xml = fileContent.substring(svgStart);

const countryPaths = {};
let currentCountry = null;

const lines = xml.split('\n');

for (const line of lines) {
  const gMatch = line.match(/<g\s+id="([A-Z]{2})"/i);
  if (gMatch) {
    currentCountry = gMatch[1].toUpperCase();
    if (!countryPaths[currentCountry]) {
      countryPaths[currentCountry] = [];
    }
  }

  const dMatch = line.match(/\bd="([^"]+)"/);
  if (dMatch && currentCountry && currentCountry !== 'OCEAN' && currentCountry !== 'WORLD') {
    countryPaths[currentCountry].push(dMatch[1].replace(/\s+/g, ' ').trim());
  }

  const pathIdMatch = line.match(/<path\s+id="([A-Z]{2})"/i);
  if (pathIdMatch) {
    const id = pathIdMatch[1].toUpperCase();
    if (dMatch && id !== 'OCEAN' && id !== 'WORLD') {
      if (!countryPaths[id]) countryPaths[id] = [];
      countryPaths[id].push(dMatch[1].replace(/\s+/g, ' ').trim());
    }
  }
}

// Combine all paths per country
const resultMap = {};
for (const [code, paths] of Object.entries(countryPaths)) {
  if (paths.length > 0) {
    resultMap[code] = paths.join(' ');
  }
}

console.log(`Parsed ${Object.keys(resultMap).length} countries from world-states.svg.`);
console.log('Country codes count:', Object.keys(resultMap).length);
console.log('Has IN:', !!resultMap['IN'], 'Has US:', !!resultMap['US'], 'Has CN:', !!resultMap['CN'], 'Has RU:', !!resultMap['RU'], 'Has BR:', !!resultMap['BR']);

const jsContent = `/**
 * Complete SVG World Map paths for all ~180+ countries.
 * ViewBox: 0 0 1000 507.209
 */
const WORLD_MAP_PATHS = ${JSON.stringify(resultMap, null, 2)};

export default WORLD_MAP_PATHS;
`;

writeFileSync('c:\\Akshit\\ip-map-counter\\src\\world-map.js', jsContent, 'utf8');
console.log('Saved src/world-map.js!');
