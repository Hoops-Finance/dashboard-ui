import React from "react";
import { ExpanderComponentProps } from "react-data-table-component";
import { TokenToken } from "../../utils/types";

export const ExpandedTokenComponent: React.FC<ExpanderComponentProps<TokenToken>> = ({ data }) => (
  <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white">
    {data.markets.map((market, index) => (
      <div key={index} className="mb-4 border-b pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Market: {market.counterTokenSymbol}</h3>
          <span>Total TVL: {`$${market.totalTVL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Pair ID</th>
              <th className="text-left">Protocol</th>
              <th className="text-left">TVL</th>
              <th className="text-left">Reserve0</th>
              <th className="text-left">Reserve1</th>
            </tr>
          </thead>
          <tbody>
            {market.pairs.map((pair, pairIndex) => (
              <tr key={pairIndex}>
                <td>{pair._id}</td>
                <td>{pair.protocol}</td>
                <td>
                  {pair.tvl !== undefined
                    ? `$${pair.tvl.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`
                    : "-"}
                </td>
                <td>{pair.reserve0}</td>
                <td>{pair.reserve1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))}
  </div>
);
