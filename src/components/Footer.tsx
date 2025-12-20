import Link from "src/components/Link";
import { ui } from "@adamjanicki/ui";

export default function Footer() {
  return (
    <ui.footer
      vfx={{
        axis: "x",
        align: "center",
        justify: "center",
        paddingY: "xxl",
        borderTop: true,
      }}
    >
      <ui.p vfx={{ fontWeight: 5 }}>
        Est. 2025 Built from scratch by{" "}
        <Link external to="https://adamjanicki.xyz">
          Adam
        </Link>
      </ui.p>
    </ui.footer>
  );
}
