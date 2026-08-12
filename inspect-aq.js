import WORLD_MAP_PATHS from './src/world-map.js';

const aq = WORLD_MAP_PATHS["AQ"];
const subpaths = aq.split(/(?=[M])/g);

console.log(`Antarctica (AQ) has ${subpaths.length} subpaths.`);

subpaths.forEach((sp, i) => {
  const nums = sp.match(/[\d.]+/g) || [];
  let minX = 999, maxX = 0, minY = 999, maxY = 0;
  for (let j = 0; j < nums.length; j += 2) {
    const x = parseFloat(nums[j]);
    const y = parseFloat(nums[j+1]);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  console.log(`Subpath ${i}: points=${nums.length/2}, X=[${minX.toFixed(1)}, ${maxX.toFixed(1)}], Y=[${minY.toFixed(1)}, ${maxY.toFixed(1)}], len=${sp.length}`);
});
