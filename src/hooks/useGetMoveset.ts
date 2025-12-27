/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MoveFragment, PokemonKey } from "src/utils/types";
import { useEffect, useState } from "react";
import pokemon, { baseEvolutions } from "src/data/pokemon";
import { gameToGen, type Generation } from "src/data/generations";
import moves, { MoveKey } from "src/data/moves";
import { removeNonAlphanumeric } from "src/utils/helpers";

type Config = {
  key: string;
  skip?: boolean;
};

type Result = {
  loading: boolean;
  error?: string;
  moves: Map<Generation, MoveFragment[]> | undefined;
};

export default function useGetMoveset({ key, skip }: Config): Result {
  const [state, setState] = useState<Result>({
    loading: false,
    moves: undefined,
  });

  useEffect(() => {
    if (skip) {
      return setState({
        loading: false,
        error: undefined,
        moves: undefined,
      });
    }

    setState((prev: Result) => ({ ...prev, loading: true, error: undefined }));

    const baseEvolution = baseEvolutions[key as PokemonKey];
    const name = pokemon[key as PokemonKey];
    const baseEvolutionName = baseEvolution
      ? pokemon[baseEvolution]
      : undefined;

    const doApiCalls = async () => {
      setState((prev) => ({ ...prev, loading: true, error: undefined }));
      let moves = new Map<Generation, MoveFragment[]>();

      try {
        const baseMoves = await fetchApi(key, name);
        moves = mergeMaps(moves, baseMoves, mergeMoveFragments);

        if (baseEvolution && baseEvolutionName) {
          const additionalMoves = await fetchApi(
            baseEvolution,
            baseEvolutionName
          );
          moves = mergeMaps(moves, additionalMoves, mergeMoveFragments);
        }
      } catch (e) {
        return setState({
          loading: false,
          error: (e as Error).message,
          moves: undefined,
        });
      }

      setState({
        loading: false,
        error: undefined,
        moves,
      });
    };

    doApiCalls();
  }, [key, skip]);

  return state;
}

function formatName(key: string, name: string) {
  const sanitized = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return sanitized || key.toLowerCase();
}

async function fetchApi(key: string, name: string) {
  const target = `https://pokeapi.co/api/v2/pokemon/${formatName(key, name)}/`;
  const map = new Map<Generation, MoveFragment[]>();
  const used = new Set<string>();

  try {
    const data = await (await fetch(target)).json();
    data.moves.forEach((moveData: any) => {
      const moveKey = removeNonAlphanumeric(
        moveData.move.name
      ).toLowerCase() as MoveKey;
      const move = moves[moveKey];

      if (move) {
        moveData.version_group_details.forEach((groupDetails: any) => {
          const game = groupDetails.version_group.name;
          const gen = gameToGen[game];
          const hashKey = `${gen}${moveKey}`;
          if (gen && !used.has(hashKey)) {
            used.add(hashKey);
            const movesForGen = map.get(gen) || [];
            movesForGen.push({ ...move, key: moveKey });
            map.set(gen, movesForGen);
          }
        });
      }
    });
  } catch (e) {
    throw e;
  }

  return map;
}

function mergeMaps<K, V>(
  map1: Map<K, V>,
  map2: Map<K, V>,
  combiner: (v1: V, v2: V) => V
): Map<K, V> {
  const map = new Map<K, V>();

  map1.forEach((value, key) => {
    map.set(key, value);
  });

  map2.forEach((value, key) => {
    const map1Value = map.get(key);
    const newValue = map1Value ? combiner(map1Value, value) : value;
    map.set(key, newValue);
  });

  return map;
}

function mergeMoveFragments(m1: MoveFragment[], m2: MoveFragment[]) {
  const moves: MoveFragment[] = [];
  const used = new Set<string>();
  m1.forEach((move) => {
    if (!used.has(move.key)) {
      used.add(move.key);
      moves.push(move);
    }
  });

  m2.forEach((move) => {
    if (!used.has(move.key)) {
      used.add(move.key);
      moves.push(move);
    }
  });

  return moves;
}
