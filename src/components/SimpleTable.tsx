import { Box, ui } from "@adamjanicki/ui";
import React from "react";

type Props = {
  rows: Array<[string, React.ReactNode] | null>;
};

export default function SimpleTable({ rows }: Props) {
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: "8px 12px",
        alignItems: "baseline",
      }}
    >
      {rows.map((row) => {
        if (!row) return null;
        const [k, v] = row;
        return (
          <React.Fragment key={k}>
            <ui.span vfx={{ color: "muted" }}>{k}</ui.span>
            <ui.strong>{v}</ui.strong>
          </React.Fragment>
        );
      })}
    </Box>
  );
}
