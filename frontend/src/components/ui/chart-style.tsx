import * as React from "react";
import type { ChartConfig } from "./chart-utils";
import { THEMES } from "./chart-utils";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  const cssText = Object.entries(THEMES)
    .map(
      ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .flatMap(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
    return color ? [`  --color-${key}: ${color};`] : [];
  })
  .join("\n")}
}
`,
    )
    .join("\n");

  return <style>{cssText}</style>;
};

export { ChartStyle };
