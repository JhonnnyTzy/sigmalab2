import * as React from "react";
import { cn } from "@/lib/utils";
import { useChart, getPayloadConfigFromPayload } from "./chart-utils";

import { Legend } from "./recharts-lazy";

const ChartLegend = Legend;

const ChartLegendContent = ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey, ref }: React.ComponentProps<"div"> &
    React.ComponentProps<typeof Legend> & {
      hideIcon?: boolean;
      nameKey?: string;
    } & { ref?: React.Ref<HTMLDivElement> }) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload
        .flatMap((item) => {
          if (item.type === "none") return [];
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          return [(
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )];
        })}
    </div>
  );
}
ChartLegendContent.displayName = "ChartLegend";

export { ChartLegend, ChartLegendContent };
