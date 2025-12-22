import { Badge } from "@adamjanicki/ui";

type BadgeProps = React.ComponentProps<typeof Badge>;

type Props = Omit<BadgeProps, "type" | "children"> & {
  type?: BadgeProps["type"];
  children: string;
};

export default function BigBadge({ children, vfx, type, ...rest }: Props) {
  return (
    <Badge
      vfx={{
        padding: "xxs",
        textAlign: "center",
        shadow: "subtle",
        fontWeight: 9,
        ...vfx,
      }}
      {...rest}
      type={type ?? "static"}
    >
      {children.toUpperCase()}
    </Badge>
  );
}
