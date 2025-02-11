import { Button } from "@/components/ui/button";

interface ChartToolbarProps {
  inverted: boolean;
  setInverted: (val: boolean) => void;
  chartStyle: "candlestick" | "line" | "area";
  setChartStyle: (style: "candlestick" | "line" | "area") => void;
  showMACD: boolean;
  setShowMACD: (v: boolean) => void;
  showRSI: boolean;
  setShowRSI: (v: boolean) => void;
  showSMA: boolean;
  setShowSMA: (v: boolean) => void;
  showEMA: boolean;
  setShowEMA: (v: boolean) => void;
  showBollinger: boolean;
  setShowBollinger: (v: boolean) => void;
}

// Single row layout:
// Left: chart style buttons
// Middle: indicators
// Right: invert price button
export function ChartToolbar({
  inverted,
  setInverted,
  chartStyle,
  setChartStyle,
  showMACD,
  setShowMACD,
  showRSI,
  setShowRSI,
  showSMA,
  setShowSMA,
  showEMA,
  setShowEMA,
  showBollinger,
  setShowBollinger,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 gap-2 bg-background">
      {/* Left: Chart style buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant={chartStyle === "candlestick" ? "default" : "secondary"}
          onClick={() => {
            setChartStyle("candlestick");
          }}
        >
          Candlestick
        </Button>
        <Button
          variant={chartStyle === "line" ? "default" : "secondary"}
          onClick={() => {
            setChartStyle("line");
          }}
        >
          Line
        </Button>
        <Button
          variant={chartStyle === "area" ? "default" : "secondary"}
          onClick={() => {
            setChartStyle("area");
          }}
        >
          Area
        </Button>
      </div>

      {/* Middle: Indicators */}
      <div className="flex items-center gap-2">
        <Button
          variant={showMACD ? "default" : "secondary"}
          onClick={() => {
            setShowMACD(!showMACD);
          }}
        >
          MACD
        </Button>
        <Button
          variant={showRSI ? "default" : "secondary"}
          onClick={() => {
            setShowRSI(!showRSI);
          }}
        >
          RSI
        </Button>
        <Button
          variant={showSMA ? "default" : "secondary"}
          onClick={() => {
            setShowSMA(!showSMA);
          }}
        >
          SMA
        </Button>
        <Button
          variant={showEMA ? "default" : "secondary"}
          onClick={() => {
            setShowEMA(!showEMA);
          }}
        >
          EMA
        </Button>
        <Button
          variant={showBollinger ? "default" : "secondary"}
          onClick={() => {
            setShowBollinger(!showBollinger);
          }}
        >
          Bollinger
        </Button>
      </div>

      {/* Right: Invert price */}
      <div className="flex items-center gap-2">
        <Button
          variant={inverted ? "default" : "secondary"}
          onClick={() => {
            setInverted(!inverted);
          }}
        >
          Switch Base Price
        </Button>
      </div>
    </div>
  );
}
