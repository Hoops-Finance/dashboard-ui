const fs = require("fs").promises;
const path = require("path");

(async function auditCandleCache() {
  const cacheFile = path.join(process.cwd(), "candlesCache.json");
  let raw;
  try {
    raw = await fs.readFile(cacheFile, "utf8");
  } catch (err) {
    console.error(
      `Error reading candlesCache.json. Make sure the file exists at ${cacheFile}.`,
      err
    );
    process.exit(1);
  }

  let candleCache;
  try {
    candleCache = JSON.parse(raw);
  } catch (err) {
    console.error("Error parsing JSON from candlesCache.json", err);
    process.exit(1);
  }

  let allTestsPassed = true;

  // Iterate over each asset in the cache.
  for (const assetKey in candleCache) {
    const resolutionGroups = candleCache[assetKey];
    console.log(`\nAuditing asset: ${assetKey}`);

    for (const resKey in resolutionGroups) {
      const resolution = parseInt(resKey, 10);
      const candles = resolutionGroups[resKey];

      console.log(`  Resolution: ${resolution} (found ${candles.length} candles)`);

      if (!Array.isArray(candles)) {
        console.error(`    ERROR: Expected an array of candles for resolution ${resolution}`);
        allTestsPassed = false;
        continue;
      }

      if (candles.length === 0) {
        console.warn(`    WARNING: No candles found for resolution ${resolution}`);
        continue;
      }

      // Sort candles by time (if not already sorted)
      candles.sort((a, b) => a.time - b.time);

      // 1. Check for duplicate timestamps.
      const seenTimestamps = new Set();
      candles.forEach((candle) => {
        if (seenTimestamps.has(candle.time)) {
          console.error(`    ERROR: Duplicate candle timestamp found: ${candle.time}`);
          allTestsPassed = false;
        } else {
          seenTimestamps.add(candle.time);
        }
      });

      // 2. Check alignment of candles.
      const expectedMod = candles[0].time % resolution;
      candles.forEach((candle, index) => {
        if (candle.time % resolution !== expectedMod) {
          console.error(
            `    ERROR: Candle at index ${index} has timestamp ${candle.time} (mod ${candle.time %
              resolution}), expected mod ${expectedMod}`
          );
          allTestsPassed = false;
        }

        if (index > 0) {
          const diff = candle.time - candles[index - 1].time;
          if (diff !== resolution) {
            console.error(
              `    ERROR: Time difference between candle at index ${index - 1} and ${index} is ${diff}, expected ${resolution}`
            );
            allTestsPassed = false;
          }
        }
      });
    }
  }

  if (allTestsPassed) {
    console.log("\nAll candle cache tests passed.");
    process.exit(0);
  } else {
    console.error("\nSome tests failed. Please review the errors above.");
    process.exit(1);
  }
})();
