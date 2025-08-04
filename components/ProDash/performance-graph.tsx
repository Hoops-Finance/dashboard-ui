"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
//import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

import { cn } from "@/lib/utils";

import {
  forwardRef,
  ComponentProps,
  useId,
  ReactNode,
  ComponentType,
  createContext,
  CSSProperties,
  useContext,
  useMemo,
} from "react";

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: ChartItem[];
  className?: string;
  indicator?: "dot" | "line" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: ReactNode;
  labelFormatter?: (value: unknown, payload: unknown[]) => ReactNode;
  labelClassName?: string;
  formatter?: (
    value: unknown,
    name: string,
    item: unknown,
    index: number,
    payload?: unknown[],
  ) => ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}
interface ChartItem {
  dataKey?: string | number;
  name?: string;
  value?: number;
  payload?: {
    fill?: string;
    [key: string]: unknown;
  };
  color?: string;
  [key: string]: unknown;
}

export type ChartConfig = Record<
  string,
  {
    label?: ReactNode;
    icon?: ComponentType;
    theme?: Record<string, string>;
    color?: string;
  }
>;

interface ChartContextProps {
  config: ChartConfig;
}

// Removed duplicate ChartContext definition

const ChartContext = createContext<ChartContextProps>({ config: {} });

function useChart() {
  const context = useContext(ChartContext);

  return context;
}

const THEMES = { light: "", dark: ".dark" } as const;
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;

  const configLabelKey: string = key;
  const ChartTooltipContent = forwardRef<HTMLDivElement, ChartTooltipContentProps>(
    (
      {
        active,
        payload,
        className,
        indicator = "dot",
        hideLabel = false,
        hideIndicator = false,
        label,
        labelFormatter,
        labelClassName,
        formatter,
        color,
        nameKey,
        labelKey,
      },
      ref,
    ) => {
      const { config } = useChart();

      const tooltipLabel = useMemo(() => {
        if (hideLabel || !payload?.length) {
          return null;
        }

        const [item] = payload;
        const key = `${labelKey ?? item.dataKey ?? item.name ?? "value"}`;
        getPayloadConfigFromPayload(config, item, key);
        const itemConfig = {};
        let value: ReactNode = (itemConfig as { label?: ReactNode } | undefined)?.label;
        if (!labelKey && typeof label === "string" && label in config) {
          value = config[label].label ?? label;
        }

        if (labelFormatter) {
          return (
            <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
          );
        }

        if (!value) {
          return null;
        }

        return <div className={cn("font-medium", labelClassName)}>{value}</div>;
      }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

      if (!active || !payload?.length) {
        return null;
      }

      const nestLabel = payload.length === 1 && indicator !== "dot";

      return (
        <div
          ref={ref}
          className={cn(
            "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
            className,
          )}
        >
          {!nestLabel ? tooltipLabel : null}
          <div className="grid gap-1.5">
            {/*payload.map((item, index) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color ?? item.payload.fill ?? item.color;

          return (
            <div key={item.dataKey} className={cn("flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground", indicator === "dot" && "items-center")}>
              {formatter && item.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed"
                        })}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor
                          } as CSSProperties
                        }
                      />
                    )
                  )}
                  <div className={cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center")}>
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
                    </div>
                    {item.value && <span className="font-mono font-medium tabular-nums text-foreground">{item.value.toLocaleString()}</span>}
                  </div>
                </>
              )}
            </div>
          );
        })*/}
          </div>
        </div>
      );
    },
  );
  ChartTooltipContent.displayName = "ChartTooltip";

  const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
    const colorConfig = Object.entries(config).filter(([_, config]) => config.theme ?? config.color);

    if (!colorConfig.length) {
      return null;
    }

    return (
      <style
        dangerouslySetInnerHTML={{
          __html: Object.entries(THEMES)
            .map(
              ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme] ?? itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}`,
            )
            .join("\n"),
        }}
      />
    );
  };

  const ChartContext = createContext<ChartContextProps>({ config: {} });

  const ChartContainer = forwardRef<
    HTMLDivElement,
    ComponentProps<"div"> & {
      config: ChartConfig;
      children: ComponentProps<any>["children"]; // this library doesn't play nice it'll be replaced later (recharts)
    }
  >(({ id, className, children, config, ...props }, ref) => {
    const uniqueId = useId();
    const chartId = `chart-${id ?? uniqueId.replaceAll(":", "")}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          className={cn(
            "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
            className,
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          {/*  <ResponsiveContainer>{children}</ResponsiveContainer>*/}
        </div>
      </ChartContext.Provider>
    );
  });
  ChartContainer.displayName = "Chart";
  const generateDummyData = () => {
    const data = [];
    const startDate = new Date("2024-01-01");
    let value = 10000;

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      // Add some random variation but keep it subtle
      value = value * (1 + (Math.random() * 0.02 - 0.01));

      data.push({
        date: date.toISOString().split("T")[0],
        value: Math.round(value),
      });
    }

    return data;
  };

  const data = generateDummyData();
}
export default function PerformanceGraph() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Graph</CardTitle>
      </CardHeader>
      <CardContent>
        {/*
        <ChartContainer
          config={{
            value: {
              label: "Portfolio Value",
              color: "hsl(var(--primary))"
            }
          }}
          className="h-[400px]"
        >

         
          
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string | number) => {
                  const date = new Date(value);
                  const dateObj = new Date(value);
                  if (isNaN(dateObj.getTime())) throw new Error("Invalid Date");
                  return `${dateObj.getDate()}`;
                  return `${date.getDate()}`; // why was Jan here
                }}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                tick={{ fontSize: 12 }}
                tickMargin={8}
                domain={["dataMin - 1000", "dataMax + 1000"]}
              />
              <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--color-value)", strokeWidth: 1, strokeDasharray: "4 4" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
          */}
      </CardContent>
    </Card>
  );
}
