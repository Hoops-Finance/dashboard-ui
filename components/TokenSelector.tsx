import React from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
interface Token {
  symbol: string;
  name: string;
  icon: string;
}

interface TokenSelectorProps {
  selectedToken: Token;
  tokens: Token[];
  isOpen: boolean;
  toggleOpen: () => void;
  onSelectToken: (token: Token) => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ selectedToken, tokens, isOpen, toggleOpen, onSelectToken }) => {
  return (
    <div className="relative">
      <button onClick={toggleOpen} className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full py-1 px-2 mr-2">
        <Image src={selectedToken.icon} alt={selectedToken.name} width={24} height={24} className="rounded-full mr-1" />
        <span className="text-gray-800 dark:text-gray-200 mr-1">{selectedToken.symbol}</span>
        <ChevronDownIcon className="text-gray-500 dark:text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10">
          {tokens.map((token) => (
            <button
              key={token.symbol}
              className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => {
                onSelectToken(token);
                toggleOpen();
              }}
            >
              <Image src={token.icon} alt={token.name} width={24} height={24} className="rounded-full mr-2" />
              <span className="text-gray-800 dark:text-gray-200">{token.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
