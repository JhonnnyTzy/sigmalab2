import * as React from "react";
import { Tooltip } from "./recharts-lazy";

const ChartTooltip = Tooltip;

const ChartTooltipContent = ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey, ref }: React.ComponentProps<typeof Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    } & { ref?: React.Ref<HTMLDivElement> }) => ChartTooltipContent.displayName = "ChartTooltip";

export { ChartTooltip, ChartTooltipContent };
