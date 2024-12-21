import {FC} from "react";
import { Switch, Popover, Transition, PopoverButton, PopoverPanel, PopoverBackdrop } from "@headlessui/react";
import { CogIcon } from "@heroicons/react/24/outline";

interface FilterOptionsPopoverProps {
  showTrackedOnly: boolean;
  showZeroBalances: boolean;
  showZeroLiquidity: boolean;
  setShowTrackedOnly: (value: boolean) => void;
  setShowZeroBalances: (value: boolean) => void;
  setShowZeroLiquidity: (value: boolean) => void;
  activeTab: "markets" | "pools" | "tokens" | "mywallet"; // remove mywallet for now /* | "mywallet"; */
  poolPeriod?: string;
  setPoolPeriod?: (value: string) => void;
}

export const FilterOptionsPopover: FC<FilterOptionsPopoverProps> = ({
  showTrackedOnly,
  showZeroBalances,
  showZeroLiquidity,
  setShowTrackedOnly,
  setShowZeroBalances,
  setShowZeroLiquidity,
  activeTab,
  poolPeriod,
  setPoolPeriod
}) => (
  <Popover className="relative">
    <PopoverButton className="popover-button">
      <CogIcon className="h-6 w-6" />
      <span className="hidden sm:inline">Filter Options</span>
    </PopoverButton>

    <Transition
      enter="transition ease-out duration-300"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-200"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <PopoverPanel className="absolute z-10 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
        <PopoverBackdrop className="fixed inset-0 bg-black/50" />
        <div className="space-y-4">
          {activeTab === "mywallet" && (
            <div className="flex items-center">
              <Switch checked={showTrackedOnly} onChange={setShowTrackedOnly} className={`${showTrackedOnly ? "bg-[#B7A7E5]" : "bg-red-200"} relative inline-flex items-center h-6 w-10 rounded-full`}>
                <span className="sr-only">Show Tracked Tokens Only</span>
                <span className={`${showTrackedOnly ? "translate-x-6" : "translate-x-1"} inline-block w-4 h-4 transform bg-white rounded-full transition`} />
              </Switch>
              <span className="ml-2 text-sm text-black dark:text-white">Show Tracked Tokens</span>
            </div>
          )}
          {(activeTab === "markets" || activeTab === "pools" || activeTab === "tokens") && (
            <div className="flex items-center">
              <Switch
                checked={showZeroLiquidity}
                onChange={setShowZeroLiquidity}
                className={`${showZeroLiquidity ? "bg-[#B7A7E5]" : "bg-red-200"} relative inline-flex items-center h-6 w-10 rounded-full`}
              >
                <span className="sr-only">Show Zero Liquidity</span>
                <span className={`${showZeroLiquidity ? "translate-x-6" : "translate-x-1"} inline-block w-4 h-4 transform bg-white rounded-full transition`} />
              </Switch>
              <span className="ml-2 text-sm text-black dark:text-white">Show Zero Liquidity</span>
            </div>
          )}
          {activeTab === "mywallet" && (
            <div className="flex items-center">
              <Switch
                checked={showZeroBalances}
                onChange={setShowZeroBalances}
                className={`${showZeroBalances ? "bg-[#B7A7E5]" : "bg-red-200"} relative inline-flex items-center h-6 w-10 rounded-full`}
              >
                <span className="sr-only">Show Zero Balances</span>
                <span className={`${showZeroBalances ? "translate-x-6" : "translate-x-1"} inline-block w-4 h-4 transform bg-white rounded-full transition`} />
              </Switch>
              <span className="ml-2 text-sm text-black dark:text-white">Show Zero Balances</span>
            </div>
          )}
          {activeTab === "pools" && poolPeriod && setPoolPeriod && (
            <div className="flex items-center">
              <label htmlFor="poolPeriod" className="mr-2 text-sm text-black dark:text-white">
                Period:
              </label>
              <select
                id="poolPeriod"
                value={poolPeriod}
                onChange={(e) => setPoolPeriod(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded p-2 text-black dark:text-white bg-white dark:bg-gray-800"
              >
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="60d">60 Days</option>
                <option value="90d">90 Days</option>
                <option value="180d">180 Days</option>
              </select>
            </div>
          )}
        </div>
      </PopoverPanel>
    </Transition>
  </Popover>
);
