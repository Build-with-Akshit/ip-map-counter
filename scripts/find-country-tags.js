import { readFileSync } from 'fs';

const txt = readFileSync(
  'C:\\Users\\Arya Gupta\\.gemini\\antigravity-ide\\brain\\792e2dcc-08c6-4a88-baf4-f98f9ee73003\\.system_generated\\steps\\233\\content.md',
  'utf8'
);

const gMatches = txt.match(/<g\s+id="[^"]+"/gi) || [];
console.log('Total <g id="..."> found:', gMatches.length);
console.log('Sample <g id="...">:', gMatches.map(s => s.replace('<g id="', '').replace('"', '')).slice(0, 100).join(', '));
