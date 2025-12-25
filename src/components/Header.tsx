import { ui } from "@adamjanicki/ui";

type Props = { children: string };

const vfx = { fontWeight: 9, margin: "none" } as const;

export default function Header({ children }: Props) {
  return (
    <ui.h1 className="page-title-text" vfx={vfx}>
      {children}
    </ui.h1>
  );
}

export function Subheader({ children }: Props) {
  return <ui.h2 vfx={vfx}>{children.toUpperCase()}</ui.h2>;
}
