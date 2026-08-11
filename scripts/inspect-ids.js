import { readFileSync } from 'fs';

const txt = readFileSync(
  'C:\\Users\\Arya Gupta\\.gemini\\antigravity-ide\\brain\\792e2dcc-08c6-4a88-baf4-f98f9ee73003\\.system_generated\\steps\\233\\content.md',
  'utf8'
);

// Find lines containing <g id="
const gLines = txt.split('\n').filter(line => line.includes('<g id='));
console.log('Total <g id=> lines:', gLines.length);
console.log('First 20 <g id=> lines:\n', gLines.slice(0, 20).join('\n'));
console.log('Last 20 <g id=> lines:\n', gLines.slice(-20).join('\n'));
