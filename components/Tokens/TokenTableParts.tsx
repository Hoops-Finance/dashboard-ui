// TokenTableComponents.tsx — IMPORTANT: do NOT add "use client" here.
// These are purely presentational components that can be used by
// either server or client files.

import { Pair, Token } from "@/utils/types";
import { MouseEvent } from "react";
/**
 * Each column is dynamic so you can show e.g. "Token", "Price", etc.
 */
export interface TableColumn {
  label: string;
  align: "left" | "right" | "center" | "justify";
}

/**
 * Props for the dynamic table header.
 * We'll render a <colgroup> + <thead> based on `headers`.
 */
interface TokenTableHeaderProps {
  ColLabels: TableColumn[];
}

/**
 * Renders <colgroup> and <thead> from your HEADERS array.
 * E.g.:
 *   <TableHeader headers={HEADERS} />
 */
export function TokenTableHeader({ ColLabels }: TokenTableHeaderProps) {
  return (
    <>
      <colgroup>
        {ColLabels.map((col, i) => (
          <col
            key={i}
            className={col.align === "left" ? "text-left" : col.align === "right" ? "text-right" : ""}
          />
        ))}
      </colgroup>

      <thead>
        <tr role="row">
          {ColLabels.map(({ align, label }, i) => (
            <th key={i} className={`text-${align}`} role="columnheader">
              {label}
            </th>
          ))}
        </tr>
      </thead>
    </>
  );
}

/**
 * The row-level component, mirroring the logic you already have:
 *   - Row is clickable -> onClick redirects to detail page
 *   - Price display logic (0.00 if missing)
 *   - Symbol, name, Explorer link, etc.
 */
interface TokenTableRowProps {
  token: Token;
  pairMap: Map<string, Pair>;
  volumeMap: Map<string, number>;
  tvlMap: Map<string, number>;
  isServer?: boolean;
}

/**
 * A single <tr> that:
 *  - Figures out token details URL
 *  - Builds Explorer link
 *  - Derives TVL & "counter assets" from tvlMap & pairMap
 *  - Is clickable (onClick -> window.location.href = detailsUrl)
 *  - Leaves "Explorer" link clickable (stops event propagation)
 */
export function TokenTableRow({
  token,
  pairMap,
  volumeMap,
  tvlMap,
  isServer = false,
}: TokenTableRowProps) {
  const [symbolName] = token.name.split(":");
  const symbolIssuer =
    token.name === "native"
      ? "XLM"
      : `${token.name.substring(0, 8)}...${token.name.substring(token.name.length - 4)}`;
  // Price
  let price = token.price;
  if (!price || price === 0) {
    const pairWithPrice = token.pairs.find((pair) => pair.price && pair.price > 0);
    if (pairWithPrice) {
      price = pairWithPrice.price;
    }
  }
  const priceDisplay =
    price && price > 0
      ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 7 })
      : "0.00";

  // TVL
  const tvl = tvlMap.get(token.id) ?? 0;
  const tvlDisplay = tvl.toLocaleString();
  const volume = volumeMap.get(token.id) ?? 0;
  const volDisplay = volume.toLocaleString();
  // Count how many distinct pairs exist
  let counterCount = 0;
  for (const tokenPair of token.pairs) {
    const p = pairMap.get(tokenPair.pairId);
    if (p) {
      counterCount++;
    }
  }

  // Build detailsUrl
  let detailsUrl: string;
  if (token.symbol.toUpperCase() === "XLM") {
    detailsUrl = "/tokens/native";
  } else {
    detailsUrl = `/tokens/${token.name.replace(/:/g, "-")}`;
  }

  // Build explorer link
  let explorerLink: string;
  if (token.symbol.toUpperCase() === "XLM") {
    explorerLink = "https://stellar.expert/explorer/public/asset/native";
  } else {
    const [sym, iss] = token.name.split(":");
    explorerLink = `https://stellar.expert/explorer/public/asset/${sym}-${iss}`;
  }

  // Last updated
  const lastUpdated = new Date(token.lastUpdated).toLocaleString();
  //
  // If `isServer` is false => row is clickable
  // If `isServer` is true => no onClick on the row
  //
  const rowClickProps = isServer
    ? {}
    : {
        onClick: () => (window.location.href = detailsUrl),
        style: { cursor: "pointer" },
      };
  const expLinkProps = isServer
    ? {}
    : {
        onClick: (e: MouseEvent) => {
          e.stopPropagation();
        },
      };
  // For the first cell, if isServer, we wrap the name/symbol in an <a> link
  // (so that the user can still navigate if they wish).
  // If not server, we rely on the row's onClick.
  const firstCellContent = isServer ? (
    <a href={detailsUrl} className="tokenSymbolContainer ">
      <div className="tokenSymbolLabel">{token.symbol.slice(0, 1).toUpperCase()}</div>
      <div>
        <div className="tokenSymbolTitle">{symbolName}</div>
        <div className="tokenSymbolSubtitle">{symbolIssuer}</div>
      </div>
    </a>
  ) : (
    <div className="tokenSymbolContainer ">
      <div className="tokenSymbolLabel">{token.symbol.slice(0, 1).toUpperCase()}</div>
      <div>
        <div className="tokenSymbolTitle">{symbolName}</div>
        <div className="tokenSymbolSubtitle">{symbolIssuer}</div>
      </div>
    </div>
  );

  return (
    <tr
      key={token.id}
      role="row"
      aria-label={`Token ${symbolName}`}
      className="token-row group"
      {...rowClickProps}
    >
      <td role="cell" className="text-left TokenTableCell">
        {firstCellContent}
      </td>

      <td role="cell" className="TokenTableCell">
        ${priceDisplay}
      </td>

      <td role="cell" className="TokenTableCell">
        ${tvlDisplay}
      </td>

      <td role="cell" className="TokenTableCell">
        ${volDisplay}
      </td>

      <td role="cell" className="TokenTableCell">
        {counterCount}
      </td>

      <td role="cell" className="tokenLastUpdateCell TokenTableCell">
        {lastUpdated}
      </td>

      <td role="cell" className="TokenTableCell">
        <a
          href={explorerLink}
          target="_blank"
          rel="noreferrer"
          className="tokenExplorerLink"
          {...expLinkProps}
        >
          Explorer
        </a>
      </td>
    </tr>
  );
}

/**
 * Props for the <tbody> part of the table.
 * We pass in the tokens we want to render, plus optional
 * getTokenTVL/getCounterAssetsCount if you want them.
 */
interface TokenTableBodyProps {
  tokens: Token[];
  pairMap: Map<string, Pair>;
  tvlMap: Map<string, number>;
  volumeMap: Map<string, number>;
  isServer?: boolean;
  noTokensColSpan?: number;
}

/**
 * Renders <tbody>, including:
 *  - "No tokens found" row if `tokens.length === 0`
 *  - Otherwise maps over tokens to <TokenTableRow>
 */
export function TokenTableBody({
  tokens,
  pairMap,
  tvlMap,
  volumeMap,
  isServer = false,
  noTokensColSpan = 7,
}: TokenTableBodyProps) {
  if (tokens.length === 0) {
    return (
      <tbody>
        <tr role="row">
          <td colSpan={noTokensColSpan} className="noTokensFoundCell" role="cell">
            No tokens found
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {tokens.map((token) => (
        <TokenTableRow
          key={token.id}
          token={token}
          pairMap={pairMap}
          volumeMap={volumeMap}
          tvlMap={tvlMap}
          isServer={isServer}
        />
      ))}
    </tbody>
  );
}
