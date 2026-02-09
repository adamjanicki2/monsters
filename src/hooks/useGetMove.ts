import { useState, useEffect } from "react";
import { pokeapi } from "src/api/pokeapi";
import type { Move } from "src/utils/types";

type Config = {
  key: string;
  accuracy: boolean | number | undefined;
};

function formatMoveName(key: string): string {
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function useGetMove({ key, accuracy }: Config) {
  const [move, setMove] = useState<Move | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const skip = typeof accuracy === "number" || accuracy === undefined;

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    const fetchMove = async () => {
      try {
        setLoading(true);

        const moveData = await pokeapi.getMove(key);

        const effectEntry = moveData.effect_entries.find(
          (e) => e.language.name === "en"
        );

        const transformed: Move = {
          key: key as any,
          name: formatMoveName(key),
          type: moveData.type.name as any,
          category: moveData.damage_class.name as any,
          accuracy: moveData.accuracy === null ? true : moveData.accuracy,
          power: moveData.power || 0,
          pp: moveData.pp,
          priority: moveData.priority,
          zPower: 0, // PokeAPI doesn't provide this easily
          target: moveData.target.name,
          desc: effectEntry?.effect || effectEntry?.short_effect || "",
        };

        setMove(transformed);
        setError(undefined);
      } catch (e) {
        setError(`Failed to fetch move: ${(e as Error).message}`);
        setMove(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchMove();
  }, [key, skip]);

  return { move, loading, error };
}
