import { useState, useEffect } from "react";
import { pokeapi } from "src/api/pokeapi";
import { MoveKey } from "src/data/moves";
import type { Category, Move, Type } from "src/utils/types";

type Config = {
  key: string;
  skip: boolean;
};

function formatMoveName(key: string): string {
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function useGetMove({ key, skip }: Config) {
  const [move, setMove] = useState<Move | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

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
          (e) => e.language.name === "en",
        )!;

        const transformed: Move = {
          key: key as MoveKey,
          name: formatMoveName(key),
          type: moveData.type.name as Type,
          category: moveData.damage_class.name as Category,
          accuracy: moveData.accuracy || undefined,
          power: moveData.power || undefined,
          pp: moveData.pp,
          priority: moveData.priority,
          target: moveData.target.name,
          desc: effectEntry.short_effect,
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
