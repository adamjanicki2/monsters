import type { Type } from "src/utils/pokemon";
import { Box } from "@adamjanicki/ui";

type Props = {
  type: Type;
  vfx?: React.ComponentProps<typeof Box>["vfx"];
};

export const colors: Record<Type, [string, string]> = {
  normal: ["#8E8C6E", "#5C5B3F"],
  fire: ["#E2562E", "#B02D14"],
  water: ["#3B7BDB", "#1F4EA4"],
  electric: ["#D4AC1B", "#9A7600"],
  grass: ["#2FA34A", "#1B6C30"],
  ice: ["#35A3A0", "#1F6F6C"],
  fighting: ["#C13232", "#8C1B1B"],
  poison: ["#8A2F8E", "#551D57"],
  ground: ["#C28A3C", "#885718"],
  flying: ["#7C6CF1", "#4C3DB7"],
  psychic: ["#E03B84", "#A3235B"],
  bug: ["#7FB81A", "#4C7D0E"],
  rock: ["#B48A32", "#7A5A16"],
  ghost: ["#5C4B9E", "#382E62"],
  dragon: ["#5A2FE8", "#3618A1"],
  dark: ["#574038", "#2F1E18"],
  steel: ["#8D9BC7", "#566287"],
  fairy: ["#D757A5", "#9D2C73"],
};

export default function TypeBadge({ type, vfx }: Props) {
  const [backgroundColor, borderColor] = colors[type];
  return (
    <Box
      vfx={{
        border: true,
        padding: "xxs",
        textAlign: "center",
        shadow: "subtle",
        radius: "rounded",
        fontWeight: 9,
        fontSize: "s",
        ...vfx,
      }}
      style={{
        backgroundColor,
        borderColor,
        color: "white",
      }}
    >
      {type.toUpperCase()}
    </Box>
  );
}
