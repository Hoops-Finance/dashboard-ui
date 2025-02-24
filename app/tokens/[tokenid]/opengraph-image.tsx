import "source-map-support/register";

import { ImageResponse } from "next/og";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  fetchCoreData,
  fetchPeriodDataFromServer,
  fetchTokenDetailsWithCache,
  getPairsForToken,
} from "@/services/serverData.service";
import type { AssetDetails, Pair } from "@/utils/types";
import { generatePairRoutes } from "@/app/pools/[protocol]/[pair]/page";
import { getCachedRoutes } from "@/lib/routeCache";
import { generateTokenRoutes } from "./page";

export const alt = "Token Stats";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 86400;
export const config = {
  runtime: "experimental-edge",
};

export async function generateStaticParams() {
  const { tokenRoutes } = await getCachedRoutes(generateTokenRoutes, generatePairRoutes);
  return tokenRoutes;
}

export default async function ogImage({ params }: { params: Promise<{ tokenid: string }> }) {
  const { tokenid } = await params;
  // Load the font manually from the public/fonts directory
  const fontPath = path.resolve("public/fonts/noto-sans-v27-latin-regular.ttf");
  const fontData = fs.readFileSync(fontPath);

  // Fetch Data
  const [{ tokens, pairs }, { poolRiskData }] = await Promise.all([
    fetchCoreData(),
    fetchPeriodDataFromServer("14d"),
  ]);

  // Token Details
  let tokenDetails: AssetDetails | null = null;
  try {
    tokenDetails = await fetchTokenDetailsWithCache(tokenid, tokens);
  } catch (err) {
    console.error("[OG Image] Error fetching token details:", err);
  }

  // Basic Stats
  const currentPriceNum = tokenDetails?.price ?? 0;
  const priceString = currentPriceNum
    ? currentPriceNum.toLocaleString(undefined, { minimumFractionDigits: 7 })
    : "N/A";

  const supply = (Number(tokenDetails?.supply) * 1e-7).toLocaleString();
  const volume7d = (Number(tokenDetails?.volume7d) * 1e-7).toLocaleString();
  const trades = tokenDetails?.trades?.toLocaleString() ?? "N/A";
  const homeDomain = tokenDetails?.home_domain ?? tokenDetails?.contract ?? "N/A";

  // Liquidity
  const pairMap = new Map<string, Pair>(pairs.map((p) => [p.id, p]));
  const tvlMap = new Map<string, number>();
  for (const p of pairs) {
    if (!p.tvl) continue;
    tvlMap.set(p.token0, (tvlMap.get(p.token0) ?? 0) + p.tvl);
    tvlMap.set(p.token1, (tvlMap.get(p.token1) ?? 0) + p.tvl);
  }
  const liquidityVal = tvlMap.get(tokenDetails?.contract ? tokenDetails.contract : tokenid);

  // Rating
  const ratingValue = tokenDetails?.rating?.average ?? null;

  // Age (Days)
  let ageDays = "N/A";
  if (tokenDetails?.created) {
    const nowSec = Math.floor(Date.now() / 1000);
    const diffSec = nowSec - tokenDetails.created;
    if (diffSec > 0) {
      ageDays = (diffSec / (60 * 60 * 24)).toFixed(0); // round to nearest day
    }
  }

  // Get Pairs & Distinct Tokens
  let pairsForThisToken: Pair[] = [];
  const distinctOtherTokens = new Set<string>();
  if (tokenDetails) {
    const token = tokens.find((t) => t.id === tokenDetails.contract);
    if (token) {
      pairsForThisToken = getPairsForToken(token, pairs);
    }
    pairsForThisToken.forEach((p) => {
      if (p.token0 !== tokenDetails.asset) distinctOtherTokens.add(p.token0);
      if (p.token1 !== tokenDetails.asset) distinctOtherTokens.add(p.token1);
    });
  }
  const poolsCount = pairsForThisToken.length;
  const tokensCount = distinctOtherTokens.size;

  console.log("Generating Open Graph Image...");

  // MAIN container, contains 1 title row and 2 stat rows
  const element = (
    <div
      style={{
        width: "1200px",
        height: "630px",
        backgroundColor: "#000", // Black background
        display: "flex",
        flexDirection: "column",
        padding: "5px",
        justifyContent: "space-between",
      }}
    >
      {/* Top Section: Logo and Token Info */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "5px",
          width: "1190px",
          height: "183px",
        }}
      >
        {/* Left: Main App Logo */}
        <div
          style={{
            width: "236px",
            height: "100%",
            backgroundColor: "#222",
            borderRadius: "12px",
            padding: "5px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #444",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#333",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="https://app.hoops.finance/images/logo2.svg"
                alt="Logo"
                style={{
                  filter: "invert(1)",
                }}
              />
            }
          </div>
        </div>

        {/* Right: Token Logo & Info */}
        <div
          style={{
            width: "945px",
            height: "100%",
            backgroundColor: "#222",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "5px",
            border: "2px solid #444",
          }}
        >
          {/* Token Logo */}
          <div
            style={{
              width: "20%",
              height: "100%",
              backgroundColor: "#333",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  tokenDetails?.toml_info?.image
                    ? tokenDetails.toml_info.image
                    : tokenDetails?.toml_info?.orgLogo
                }
                alt="Token Logo"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            }
          </div>

          {/* Token Name and Domain/Contract */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "10px",
            }}
          >
            <span
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {tokenDetails?.asset.split("-")[0] ?? "Unknown"}
            </span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {tokenDetails?.asset.split("-")[1] ?? ""}
            </span>
            <span
              style={{
                fontSize: "18px",
                color: "#bbb",
              }}
            >
              {homeDomain}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: 2 Rows, 5 Stats Each */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "5px",
          width: "1190px",
          height: "432px",
        }}
      >
        {/* Row 1 (5 Stats) */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: "5px",
            width: "1190px",
            height: "213px",
          }}
        >
          {renderPriceBox("Price (USD)", currentPriceNum, priceString, tokenDetails?.price7d)}
          {renderStatBox("Supply", supply)}
          {renderStatBox("Volume (7d)", `$${volume7d}`)}
          {renderStatBox("Domain", homeDomain)}
          {renderStatBox("Age (Days)", ageDays)}
        </div>

        {/* Row 2 (5 Stats) */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: "5px",
            width: "1190px",
            height: "213px",
          }}
        >
          {tokenDetails?.price7d
            ? renderPriceWeekStatBox("Price Last Week", tokenDetails.price7d)
            : renderStatBox("Price Last Week", "N/A")}
          {renderStatBox("Liquidity (USD)", liquidityVal ? `$${liquidityVal.toLocaleString()}` : "N/A")}
          {renderStatBox("Trades (sdex)", trades)}
          {renderPairsTokensBox("Soroban Market", poolsCount, tokensCount)}
          {renderStarRatingBox("Rating", ratingValue)}
        </div>
      </div>
    </div>
  );

  console.log("OG Image Generated Successfully");
  return new ImageResponse(element, {
    debug: false,
    ...size,
    fonts: [
      {
        name: "Noto Sans",
        data: fontData,
        weight: 400,
        style: "normal",
      },
    ],
  });
}

// ------------------------------------------------------------------
// 0) Tiny inline arrow icons so we can color them easily
function ArrowUpIcon({ color = "#00ff00" }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 320 512"
      style={{ marginRight: "4px", verticalAlign: "middle" }}
    >
      <path
        fill={color}
        d="M279 224H41c-21.4 0-32.1-25.9-17-41l119-119c9.4-9.4 24.6-9.4 33.9 0l119 119c15.1 15.1 4.4 41-17 41z"
      />
    </svg>
  );
}

function ArrowDownIcon({ color = "#ff0000" }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 320 512"
      style={{ marginRight: "4px", verticalAlign: "middle" }}
    >
      <path
        fill={color}
        d="M279 288H41c-21.4 0-32.1 25.9-17 41l119 119c9.4 9.4 24.6 9.4 33.9 0l119-119c15.1-15.1 4.4-41-17-41z"
      />
    </svg>
  );
}

// ------------------------------------------------------------------
// 1) Star Rating Box (using Lucide icons)
function renderStarRatingBox(title: string, ratingValue: number | null) {
  // If rating invalid or null, show "N/A"
  if (ratingValue === null || ratingValue < 0) {
    return (
      <div
        style={{
          width: "233px",
          height: "100%",
          backgroundColor: "#222",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid #444",
          padding: "10px",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#bbb",
            marginBottom: "4px",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          N/A
        </span>
      </div>
    );
  }
  // Scale rating from 10-point to 5-star scale (keeping decimals)
  const maxStars = 5;
  console.log(ratingValue);
  const scaledRating = ratingValue ? (ratingValue / 10) * maxStars : 0;
  const fullStars = Math.floor(scaledRating);
  const partialFill = scaledRating - fullStars;
  console.log(scaledRating);

  // Convert percentage to HSL luminance for last star
  const getFinalStarColor = (percent: number) => {
    const h = 0; // white is 0 hue
    const s = 0; // white is 0 saturation
    const l = percent * 100; // luminance varies with fill percentage
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  // We'll render exactly 5 stars
  const starsArray = Array.from({ length: maxStars }, (_, i) => {
    const isFullStar = i < fullStars;
    const isPartialStar = i === fullStars && partialFill > 0;
    const fillColor = isPartialStar ? getFinalStarColor(partialFill) : isFullStar ? "#fff" : "none";

    return (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        stroke="#777"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginRight: "4px" }}
      >
        <polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          fill={fillColor}
          stroke={isFullStar || isPartialStar ? "none" : "#777"}
        />
      </svg>
    );
  });

  return (
    <div
      style={{
        width: "233px",
        height: "100%",
        backgroundColor: "#222",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #444",
        padding: "10px",
      }}
    >
      <span
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#bbb",
          marginBottom: "4px",
        }}
      >
        {title}
      </span>
      <div style={{ display: "flex", flexDirection: "row" }}>{starsArray}</div>
    </div>
  );
}

// ------------------------------------------------------------------
// 2) Linear color interpolation (grey→green or grey→red)
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  const r1 = (c1 >> 16) & 0xff,
    g1 = (c1 >> 8) & 0xff,
    b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff,
    g2 = (c2 >> 8) & 0xff,
    b2 = c2 & 0xff;

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ------------------------------------------------------------------
// 3) Segmented SVG Chart for Price Last Week (middle 80% of box)
function generatePriceWeekChart(price7d: number[][], graphWidth: number, graphHeight: number) {
  const times = price7d.map(([t]) => t);
  const prices = price7d.map(([, p]) => p);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const getX = (timestamp: number) =>
    maxTime - minTime === 0 ? 0 : ((timestamp - minTime) / (maxTime - minTime)) * graphWidth;
  const getY = (price: number) =>
    maxPrice - minPrice === 0
      ? graphHeight / 2
      : graphHeight * 0.1 + graphHeight * 0.8 * (1 - (price - minPrice) / (maxPrice - minPrice));

  const segments = [];
  for (let i = 0; i < price7d.length - 1; i++) {
    const [t1, p1] = price7d[i];
    const [t2, p2] = price7d[i + 1];
    const x1 = getX(t1);
    const y1 = getY(p1);
    const x2 = getX(t2);
    const y2 = getY(p2);

    const range = maxPrice - minPrice;
    const delta = p2 - p1;
    const factor = range === 0 ? 0 : Math.min(Math.abs(delta) / range, 1);

    const segmentColor =
      delta >= 0
        ? interpolateColor("#808080", "#00ff00", factor)
        : interpolateColor("#808080", "#ff0000", factor);

    segments.push({ x1, y1, x2, y2, segmentColor });
  }

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        opacity: 0.85,
      }}
      viewBox={`0 0 ${graphWidth} ${graphHeight}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {segments.map((seg, idx) => (
        <line
          key={idx}
          x1={seg.x1}
          y1={seg.y1}
          x2={seg.x2}
          y2={seg.y2}
          stroke={seg.segmentColor}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// ------------------------------------------------------------------
// 4) Specialized Stat Box with Chart for Price Last Week
function renderPriceWeekStatBox(title: string, price7d: number[][]) {
  const total = price7d.reduce((sum, [, p]) => sum + p, 0);
  const averagePrice = total / price7d.length;
  const graphWidth = 216;
  const graphHeight = 60;

  return (
    <div
      style={{
        position: "relative",
        width: "233px",
        height: "100%",
        backgroundColor: "#222",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #444",
        padding: "10px",
        overflow: "hidden",
      }}
    >
      {generatePriceWeekChart(price7d, graphWidth, graphHeight)}
      <span
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#bbb",
          marginBottom: "4px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#fff",
          position: "relative",
          zIndex: 1,
        }}
      >
        {`$${averagePrice.toLocaleString(undefined, { minimumFractionDigits: 7 })}`}
      </span>
    </div>
  );
}

// ------------------------------------------------------------------
// 5) Generic Stat Box
function renderStatBox(title: string, value: string) {
  return (
    <div
      style={{
        width: "233px",
        height: "100%",
        backgroundColor: "#222",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #444",
        padding: "10px",
      }}
    >
      <span
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#bbb",
          marginBottom: "4px",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ------------------------------------------------------------------
// 6) Price Box with Up/Down Arrow & Red/Green Color
function renderPriceBox(
  title: string,
  currentPriceNum: number,
  priceString: string,
  price7d?: number[][],
) {
  let arrow = null;
  let textColor = "#fff";
  if (price7d && price7d.length > 0) {
    const avg7d = price7d.reduce((acc, [, p]) => acc + p, 0) / price7d.length;
    if (currentPriceNum > avg7d) {
      arrow = <ArrowUpIcon color="#0f0" />;
      textColor = "#0f0";
    } else if (currentPriceNum < avg7d) {
      arrow = <ArrowDownIcon color="#f00" />;
      textColor = "#f00";
    }
  }

  return (
    <div
      style={{
        width: "233px",
        height: "100%",
        backgroundColor: "#222",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #444",
        padding: "10px",
      }}
    >
      <span
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#bbb",
          marginBottom: "4px",
        }}
      >
        {title}
      </span>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {arrow}
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: textColor,
          }}
        >
          ${priceString}
        </span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 7) Pools/Tokens Box
function renderPairsTokensBox(title: string, poolsCount: number, tokensCount: number) {
  return (
    <div
      style={{
        width: "233px",
        height: "100%",
        backgroundColor: "#222",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #444",
        padding: "10px",
      }}
    >
      <span
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#bbb",
          marginBottom: "4px",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        {poolsCount} Pairs
      </span>
      <span
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        {tokensCount} Counter-Assets
      </span>
    </div>
  );
}
