import { useState, useEffect } from "react";
import { pokeapi } from "src/api/pokeapi";
import { MoveKey } from "src/data/moves";
import type { Move } from "src/utils/types";

type Config = {
  key: string;
  skip: boolean;
};

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
        const move = await pokeapi.getMoveFull(key as MoveKey);
        setMove(move);
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
