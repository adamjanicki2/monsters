import { IconButton, ui, Box } from "@adamjanicki/ui";
import { Tooltip } from "@adamjanicki/ui-extended";
import { useRef, useState } from "react";
import { idify } from "src/utils/helpers";

type Props = { children: string; id?: string };

const vfx = { fontWeight: 9, margin: "none" } as const;

export default function Header({ children, id }: Props) {
  return (
    <ui.h1 id={id} className="page-title-text" vfx={vfx}>
      {children}
    </ui.h1>
  );
}

export function Subheader({ children, id }: Props) {
  return (
    <ui.h2 id={id} vfx={vfx}>
      {children.toUpperCase()}
    </ui.h2>
  );
}

export function CopyableSubheader({ children }: Pick<Props, "children">) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const id = idify(children);

  const handleCopy = () => {
    const url = window.location.origin + window.location.pathname + `#${id}`;
    window.navigator.clipboard.writeText(url);
    setCopied(true);
    timeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    }, 5000);
  };

  return (
    <Box vfx={{ axis: "x", align: "center", gap: "s" }}>
      <Subheader id={id}>{children}</Subheader>
      <Tooltip offset={4} tooltipContent={copied ? "Copied" : "Copy URL"}>
        <IconButton icon="link" onClick={handleCopy} />
      </Tooltip>
    </Box>
  );
}
