/* eslint-disable @next/next/no-img-element */
import "source-map-support/register"; // No real effect on the sourcemap warnings, but included.
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
import { generateTokenRoutes } from "@/app/tokens/[tokenid]/page";
import { JSX } from "react";

export const alt = "Pair Stats";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 86400;
export const config = {
  //runtime: "experimental-edge",
};
/*
export async function generateStaticParams() {
  // This merges both tokens + pairs routes from the cache
  const { tokenRoutes, pairRoutes } = await getCachedRoutes(generateTokenRoutes, generatePairRoutes);
  return pairRoutes;
}
*/
export default async function ogImage({
  params,
}: {
  params: Promise<{ protocol: string; pair: string }>;
}) {
  const { protocol, pair } = await params;

  // Load font
  const fontPath = path.resolve("public/fonts/noto-sans-v27-latin-regular.ttf");
  const fontData = fs.readFileSync(fontPath);

  // Fetch main data
  const [{ tokens, pairs }, { poolRiskData }] = await Promise.all([
    fetchCoreData(),
    fetchPeriodDataFromServer("14d"),
  ]);

  // 1) Find the Pair object by checking both the pair ID and the token name combination
  const matchedPair = pairs.find((p) => {
    // Check if the route matches the pair ID directly
    if (p.id.toLowerCase() === pair.toLowerCase()) return true;

    // Fallback: Check if it matches the token name combination and protocol
    const t0n = p.token0Details?.name ?? p.token0;
    const t1n = p.token1Details?.name ?? p.token1;
    const combined = `${t0n.replace(/:/g, "-")}-${t1n.replace(/:/g, "-")}`.toLowerCase();
    return combined === pair.toLowerCase() && p.protocol.toLowerCase() === protocol.toLowerCase();
  });

  if (!matchedPair) {
    // Fallback image if pair not found
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
            color: "#fff",
            fontSize: "32px",
          }}
        >
          Unknown Pair
        </div>
      ),
      { ...size },
    );
  }

  // 2) Load AssetDetails for each token in the pair
  let token0Details: AssetDetails | null = null;
  let token1Details: AssetDetails | null = null;
  try {
    token0Details = await fetchTokenDetailsWithCache(matchedPair.token0, tokens);
  } catch {}
  try {
    token1Details = await fetchTokenDetailsWithCache(matchedPair.token1, tokens);
  } catch {}

  // 3) Prepare stats from the pair
  const risk = poolRiskData.find((r) => r.pairId === matchedPair.id);
  const volume7d = risk ? Number(risk.volume) : 0;
  const apr = risk ? Number(risk.apr.split("%")[0]) : 0;
  const trendingApr = risk ? Number(risk.trendingapr.split("%")[0]) : 0;
  const utilization = risk ? Number(risk.utilization.split("%")[0]) : 0;
  const riskScore = risk?.riskScore ?? "N/A";

  // Pair-level stats
  const tvlVal = matchedPair.tvl || 0;
  const reserve0 = matchedPair.reserve0 || 0;
  const reserve1 = matchedPair.reserve1 || 0;
  const lpSupply = matchedPair.lptSupply || 0;

  const otherPairs = renderOtherPairsBox("Pairs on Other Protocols", matchedPair, pairs);

  // 4) Now let's handle the top row, which will show both tokens side-by-side
  //    plus the brand box. We'll do it in a single row (height=183px),
  //    with brand box on the left (236px) and two "token info" boxes splitting the rest.
  //    Each token box ~ (945/2)=472.5 px wide. We'll do 472 px & 473 px to fill 945 px total.

  // Token info extraction
  function getTokenLogoUrl(details: AssetDetails | null): string {
    // if the token is "XLM" or "native", fallback to stellar.svg
    if (!details?.asset) return "";
    const [code] = details.asset.split("-");
    if (code.toUpperCase() === "XLM" || code.toLowerCase() === "native") {
      return "/images/stellar.svg";
    }
    // else use toml info if available
    return details.toml_info?.image ?? details.toml_info?.orgLogo ?? "";
  }

  // return the org logo. If not available, return the token logo.
  function getOrgLogoUrl(details: AssetDetails | null): string {
    // if the token is "XLM" or "native", fallback to stellar.svg
    if (!details?.asset) return "";
    const [code] = details.asset.split("-");
    if (code.toUpperCase() === "XLM" || code.toLowerCase() === "native") {
      return "/images/stellar.svg";
    }
    // else use toml info if available
    return details.toml_info?.orgLogo ?? details.toml_info?.image ?? "";
  }

  // return the token symbol
  function getTokenSymbol(details: AssetDetails | null): string {
    if (!details?.asset) return "Unknown";
    return details.asset.split("-")[0] || "Unknown";
  }
  function getTokenIssuer(details: AssetDetails | null): string {
    if (!details?.asset) return "";
    return details.asset.split("-")[1] || "";
  }
  function getTokenDomain(details: AssetDetails | null): string {
    if (!details) return "";
    return (details.home_domain ?? details.contract) || "";
  }

  const t0logo = getTokenLogoUrl(token0Details);
  const t1logo = getTokenLogoUrl(token1Details);

  const t0org = getOrgLogoUrl(token0Details);
  const t1org = getOrgLogoUrl(token1Details);

  const t0symbol = getTokenSymbol(token0Details);
  const t1symbol = getTokenSymbol(token1Details);

  const t0issuer = getTokenIssuer(token0Details);
  const t1issuer = getTokenIssuer(token1Details);

  const t0domain = getTokenDomain(token0Details);
  const t1domain = getTokenDomain(token1Details);
  // ReactElement
  const pairElement = (
    <div
      style={{
        width: "1200px",
        height: "630px",
        // maxWidth: "100%",
        backgroundColor: "#000", // Black background
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "5px",
        gap: "5px",
      }}
    >
      {/* Top Section, encloses the logobox and the titlebox.*/}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          gap: "5px", // gap between the two boxes on top
          width: "100%",
          height: "25%",
        }}
      >
        {/* Hoops Finance Logo Box */}
        <div
          style={{
            width: "155px",
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
              //marginRight: "220px",
            }}
          >
            {/* Hoops Logo */}
            {
              <img
                src="https://app.hoops.finance/images/logo.svg"
                alt="Logo"
                style={{
                  filter: "invert(1)",
                }}
              />
            }
          </div>
        </div>
        {/* Pairs Tokens Box holding the pair logo and token info. */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#222",
            borderRadius: "12px",
            paddingLeft: "5px",

            border: "2px solid #444",
            width: "1030px",
            height: "100%",
          }}
        >
          {/* Pairs Logos. */}
          <div
            style={{
              display: "flex",
              width: "82px",
              height: "143px",
              borderRadius: "8px",
              backgroundColor: "#444",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "82px",
                height: "143px",
                flexDirection: "column",
                justifyContent: "space-around",
                alignItems: "center",
                overflow: "visible", // allow overlapping parts to show
              }}
            >
              {/* First Token Logo */}
              <div
                style={{
                  display: "flex",
                  width: "75px",
                  height: "75px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #fff",
                  backgroundColor: "#f0f0f0",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={t0logo}
                  alt="Token 0 Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              {/* Second Token Logo (overlapping the first) */}
              <div
                style={{
                  display: "flex",
                  width: "75px",
                  height: "75px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #fff",
                  backgroundColor: "#f0f0f0",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "-20px", // adjust to control vertical overlap
                }}
              >
                <img
                  src={t1logo}
                  alt="Token 1 Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>

          {/* Pairs Tokens Box holding the pair token info. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "942px",
              height: "100%",
              gap: "5px",
              padding: "5px",
            }}
          >
            {/* Token0 Box */}
            <div
              style={{
                backgroundColor: "#222",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "5px",
                padding: "5px",
                border: "2px solid #444",
                height: "50%",
              }}
            >
              <div
                style={{
                  width: "15%",
                  height: "100%",
                  backgroundColor: "#333",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Token Symbol */}
                <span
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  {t0symbol}
                </span>
              </div>

              {t0org && (
                <div
                  style={{
                    display: "flex",
                    width: "6%",
                    height: "100%",
                    borderRadius: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#333",
                  }}
                >
                  <img
                    src={t0org}
                    alt="Org Logo"
                    style={{ width: "95%", height: "95%", borderRadius: "8px", objectFit: "contain" }}
                  />
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {t0issuer}
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      color: "#bbb",
                    }}
                  >
                    {t0domain}
                  </span>
                </div>
              </div>
            </div>

            {/* Token1 Box */}
            <div
              style={{
                backgroundColor: "#222",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "5px",
                gap: "5px",
                border: "2px solid #444",
                height: "50%",
              }}
            >
              <div
                style={{
                  width: "15%",
                  height: "100%",
                  backgroundColor: "#333",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginRight: "220px",
                }}
              >
                <span
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  {t1symbol}
                </span>
              </div>
              {t0org && (
                <div
                  style={{
                    display: "flex",
                    width: "6%",
                    height: "100%",
                    borderRadius: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#333",
                  }}
                >
                  <img
                    src={t1org}
                    alt="Org Logo"
                    style={{ width: "95%", height: "95%", borderRadius: "8px", objectFit: "contain" }}
                  />
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  //width: "85%",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {t1issuer}
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      color: "#bbb",
                    }}
                  >
                    {t1domain}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Pair Details Box with Pair Address and Protocol */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "5px", // gap between the two boxes on top
          width: "100%",
          height: "10%",
        }}
      >
        <div
          style={{
            backgroundColor: "#222",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            //padding: "5px",
            border: "2px solid #444",
            height: "100%",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              //justifyContent: "center",
              //padding: "5px",
              width: "25%",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#bbb",
              }}
            >
              Protocol
            </span>
            <span
              style={{
                fontSize: "24px",
                color: "#bbb",
              }}
            >
              {protocol}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "75%",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#bbb",
              }}
            >
              Soroban Contract Address
            </span>
            <span
              style={{
                fontSize: "24px",
                color: "#bbb",
              }}
            >
              {matchedPair.id}
            </span>
          </div>
        </div>
      </div>
      {/* Bottom Section: 8 Stat Boxes */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingBottom: "15px",
          gap: "5px",
          width: "100%",
          height: "65%",
        }}
      >
        {/* Row 1 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            gap: "15px",
            paddingRight: "5px",
            paddingLeft: "5px",
            height: "50%",
          }}
        >
          {renderStatBox("TVL (USD)", `$${tvlVal.toLocaleString()}`)}
          {renderStatBox("Volume (7d)", `$${volume7d.toLocaleString()}`)}
          {/* renderStatBox("APR", apr ? `${apr.toFixed(2)}%` : "N/A") */}
          {renderTrendingAprBox(apr, trendingApr)}
          {renderStatBox("Utilization", utilization.toFixed(2))}
        </div>

        {/* Row 2 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            gap: "15px",
            paddingRight: "5px",
            paddingLeft: "5px",
            height: "50%",
          }}
        >
          {renderReservesBox(
            "Reserves",
            t0symbol,
            Number(reserve0 * 1e-7),
            t1symbol,
            Number(reserve1 * 1e-7),
          )}
          {renderStatBox("LP Supply", lpSupply ? Number(lpSupply * 1e-7).toLocaleString() : "N/A")}
          {renderRiskScoreBox("Risk Score", riskScore)}
          {otherPairs || renderStatBox("Fees (14d)", risk?.fees ?? "N/A")}
        </div>
      </div>
    </div>
  );

  // Return final
  console.log("Pair OG Image Generated Successfully");
  return new ImageResponse(pairElement, {
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

function renderReservesBox(
  title: string,
  t0Symbol: string,
  reserve0: number,
  t1Symbol: string,
  reserve1: number,
) {
  // If reserve1 is zero, fallback
  const ratio = reserve1 > 0 ? (reserve0 / reserve1).toFixed(5) : "N/A";

  return (
    <div
      style={{
        width: "25%",
        height: "100%",
        backgroundColor: "#222",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #444",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "5px",
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
            fontSize: "18px",
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          {t0Symbol}: {reserve0.toLocaleString()}
        </span>
        <span
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          {t1Symbol}: {reserve1.toLocaleString()}
        </span>
        <span
          style={{
            marginTop: "4px",
            fontSize: "16px",
            color: "#bbb",
          }}
        >
          Price:
        </span>
        <span
          style={{
            marginTop: "4px",
            fontSize: "18px",
            color: "#fff",
          }}
        >
          {ratio} {t0Symbol} / {t1Symbol}
        </span>
      </div>
    </div>
  );
}

function renderStatBox(title: string, value: string) {
  // Returns the entire container, with your original styling
  return (
    <div
      style={{
        width: "25%",
        height: "100%",
        backgroundColor: "#222",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #444",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "5px",
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
    </div>
  );
}

/**
 * For each pair that shares the same tokens but has a different protocol,
 * display that protocol and a quick "price" ratio (p.t0usd / p.t1usd).
 * You can adapt the math if your pair data uses a different approach.
 */
function renderOtherPairsBox(title: string, matchedPair: Pair, allPairs: Pair[]) {
  // 1) Identify token0 / token1 from the matched pair
  const t0 = matchedPair.token0;
  const t1 = matchedPair.token1;
  const baseProtocol = matchedPair.protocol;

  // 2) Filter for pairs that share the same two tokens but are in a different protocol
  //    We'll check both (t0, t1) and (t1, t0) in case they're reversed in the list.
  const crossPairs = allPairs.filter((p) => {
    const sameTokens = (p.token0 === t0 && p.token1 === t1) || (p.token0 === t1 && p.token1 === t0);
    const differentProtocol = p.protocol !== baseProtocol;
    return sameTokens && differentProtocol;
  });

  // 3) For each crossPair, compute a "price" from t0usd / t1usd if available
  //    (This is a naive approach – adapt as needed.)
  const lines: JSX.Element[] = crossPairs.map((p, idx) => {
    let displayPrice = "N/A";
    if (p.t0usd && p.t1usd) {
      const t0num = parseFloat(p.t0usd);
      const t1num = parseFloat(p.t1usd);
      if (t0num > 0 && t1num > 0) {
        // e.g. Price of token0 in terms of token1
        displayPrice = (t0num / t1num).toFixed(4);
      }
    }
    return (
      <span
        key={idx}
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        {p.protocol}: {displayPrice}
      </span>
    );
  });

  // If no cross-protocol pairs found, return false to display something else like fees..
  if (crossPairs.length === 0) {
    return false;
  }

  // 4) Return a fully styled stat box container
  //    identical to your placeholders, with the sub-content inside
  return (
    <div
      style={{
        width: "25%",
        height: "100%",
        backgroundColor: "#222",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #444",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "5px",
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
        {/* We list each cross-pair’s protocol & computed price */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            alignItems: "center",
          }}
        >
          {lines}
        </div>
      </div>
    </div>
  );
}

/**
 * Displays trending APR vs. the full APR, color-coded:
 * - If trendingAPR > baseAPR => green
 * - If trendingAPR < baseAPR => red
 *   plus slight brightness factor if the difference is large
 */
function renderTrendingAprBox(baseApr: number, trendingApr: number) {
  // compute difference ratio
  const diff = trendingApr - baseApr; // can be negative
  const base = baseApr || 1; // avoid div0
  const factor = Math.min(Math.abs(diff) / base, 1); // clamp 0..1

  // Decide red or green
  const isUp = diff > 0;
  // Base color #0f0 or #f00
  // We'll scale brightness from 80% down to 50% depending on factor
  const brightness = 80 - 30 * factor; // 80..50
  const color = isUp ? `hsl(120, 100%, ${brightness}%)` : `hsl(0, 100%, ${brightness}%)`;

  const text = `${trendingApr.toFixed(2)}%`;
  return (
    <div
      style={{
        width: "25%",
        height: "100%",
        backgroundColor: "#222",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #444",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "5px",
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
          Apr (1y):
        </span>
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#bbb",
          }}
        >
          {baseApr}%
        </span>
        <span
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#bbb",
            marginBottom: "4px",
          }}
        >
          Trending Apr (14d):
        </span>
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

/**
 * Renders the risk score color-coded:
 * - If < 50 => red
 * - If >=50 => green
 * If riskScore is "N/A", just show normal.
 */
function renderRiskScoreBox(title: string, riskScore: string) {
  // parse riskScore => number if possible
  const val = parseFloat(riskScore);
  if (isNaN(val)) {
    // fallback
    return renderStatBox(title, "N/A");
  }

  // color-coded
  const color = val < 50 ? "#f00" : "#0f0";

  return (
    <div
      style={{
        width: "25%",
        height: "100%",
        backgroundColor: "#222",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #444",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "5px",
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
            color,
          }}
        >
          {val.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
// this is unused but kept for reference
/*
  const quadStatElements = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        //alignItems: "center",
        paddingBottom: "15px",
        gap: "5px", // gap between the two boxes on top
        width: "100%",
        height: "65%",
      }}
    >
      //{/* Bottom Section: 8 Stat Boxes */ //}
//{/* Row 1 *///}
/*
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          gap: "15px", // gap between boxes. it should be 5 px but some reason setting it to 15 works as it seems to set the total extra space.
          paddingRight: "5px", // still need right and left padding for some dumb reason.
          paddingLeft: "5px",
          height: "50%",
        }}
      >
        <div
          style={{
            width: "25%",
            height: "100%",
            backgroundColor: "#222",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #444",
          }}
        ></div>
        <div
          style={{
            width: "25%",
            height: "100%",
            backgroundColor: "#222",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #444",
          }}
        ></div>
        <div
          style={{
            width: "25%",
            height: "100%",
            backgroundColor: "#222",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #444",
          }}
        ></div>
        <div
          style={{
            width: "25%",
            height: "100%",
            backgroundColor: "#222",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #444",
          }}
        ></div>
      </div>
      */
{
  /* Row 2 */
}
/*
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          //alignItems: "center",
          gap: "15px", // gap between boxes.
          //width: "100%",
          //padding: "5px",
          paddingRight: "5px",
          paddingLeft: "5px",
          height: "50%",
        }}
      >
        <div
          style={{
            width: "25%",
            height: "100%",
            backgroundColor: "#222",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #444",
          }}
        ></div>
        <div
          style={{
            width: "25%",
            height: "100%",
            backgroundColor: "#222",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #444",
          }}
        ></div>
        <div
          style={{
            width: "25%",
            height: "100%",
            backgroundColor: "#222",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #444",
          }}
        ></div>
        <div
          style={{
            width: "25%",
            height: "100%",
            backgroundColor: "#222",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #444",
          }}
        ></div>
      </div>
    </div>
  );*/
