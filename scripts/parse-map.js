import { readFileSync, writeFileSync } from 'fs';

const fileContent = readFileSync(
  'C:\\Users\\Arya Gupta\\.gemini\\antigravity-ide\\brain\\792e2dcc-08c6-4a88-baf4-f98f9ee73003\\.system_generated\\steps\\148\\content.md',
  'utf8'
);

const svgStart = fileContent.indexOf('<svg');
const xml = fileContent.substring(svgStart);

const map = {};

// Match all elements inside <g> tags or top-level paths
// 1. Find all <g id="...">(...)</g>
const gMatches = xml.matchAll(/<g\s+[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/g>/gi);
for (const match of gMatches) {
  const id = match[1].toUpperCase();
  const inner = match[2];
  const dMatches = [...inner.matchAll(/d="([^"]+)"/g)];
  if (dMatches.length > 0) {
    map[id] = dMatches.map(m => m[1].replace(/\s+/g, ' ').trim()).join(' ');
  }
}

// 2. Find all <path ...> elements that have an id attribute
const pathMatches = xml.matchAll(/<path\s+[^>]*>/gi);
for (const match of pathMatches) {
  const tag = match[0];
  const idMatch = tag.match(/id="([^"]+)"/);
  const dMatch = tag.match(/d="([^"]+)"/);
  if (idMatch && dMatch) {
    const id = idMatch[1].toUpperCase();
    if (!map[id]) {
      map[id] = dMatch[1].replace(/\s+/g, ' ').trim();
    }
  }
}

console.log(`Parsed total ${Object.keys(map).length} country codes.`);

const jsContent = `/**
 * Real SVG world map paths from flekschas/simple-world-map.
 * ViewBox: 30.767 241.591 784.077 458.627
 */
const WORLD_MAP_PATHS = ${JSON.stringify(map, null, 2)};

export default WORLD_MAP_PATHS;
`;

writeFileSync('c:\\Akshit\\ip-map-counter\\src\\world-map.js', jsContent, 'utf8');
console.log('Saved src/world-map.js');
