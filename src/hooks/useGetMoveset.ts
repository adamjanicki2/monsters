import { useEffect, useState } from "react";
import { gameToGen, type Generation } from "src/data/generations";
import moves, { MoveKey } from "src/data/moves";
import { baseEvolutions } from "src/data/pokemon";
import { removeNonAlphanumeric } from "src/utils/helpers";
import type { LearnMethod, MoveFragment, PokemonKey } from "src/utils/types";
import { species } from "src/data/species";

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

    const doApiCalls = async () => {
      setState((prev) => ({ ...prev, loading: true, error: undefined }));
      let moves = new Map<Generation, MoveFragment[]>();

      try {
        // Get species data to determine the correct identifier
        const speciesInfo = species[key];
        if (!speciesInfo) {
          throw new Error(`Species data not found for ${key}`);
        }
        const identifier = speciesInfo.baseForm || speciesInfo.dexNumber;

        const baseMoves = await fetchApi(identifier);
        moves = mergeMaps(moves, baseMoves, mergeMoveFragments);

        if (baseEvolution) {
          const baseEvolutionSpecies = species[baseEvolution];
          if (!baseEvolutionSpecies) {
            throw new Error(`Species data not found for ${baseEvolution}`);
          }
          const baseEvolutionIdentifier =
            baseEvolutionSpecies.baseForm || baseEvolutionSpecies.dexNumber;

          const additionalMoves = await fetchApi(baseEvolutionIdentifier);
          moves = mergeMaps(moves, additionalMoves, mergeMoveFragments);
        }
        moves = dedupeMovesMap(moves);
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

async function fetchApi(identifier: string | number) {
  const target = `https://pokeapi.co/api/v2/pokemon/${identifier}/`;
  const map = new Map<Generation, MoveFragment[]>();
  const used = new Set<string>();

  try {
    const data = await (await fetch(target)).json();
    data.moves.forEach((moveData: any) => {
      const moveKey = removeNonAlphanumeric(
        moveData.move.name,
      ).toLowerCase() as MoveKey;
      const move = moves[moveKey];

      if (move) {
        moveData.version_group_details.forEach((groupDetails: any) => {
          const game = groupDetails.version_group.name;
          const method = groupDetails.move_learn_method.name as LearnMethod;
          const gen = gameToGen[game];
          const hashKey = `${gen}${moveKey}${method}`;
          if (gen && !used.has(hashKey)) {
            used.add(hashKey);
            const movesForGen = map.get(gen) || [];
            movesForGen.push({ ...move, key: moveKey, method });
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
  combiner: (v1: V, v2: V) => V,
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
  return dedupeMovesByMethod([...m1, ...m2]);
}

const LEARN_METHOD_PRIORITY: Record<LearnMethod, number> = {
  "level-up": 4,
  machine: 3,
  tutor: 2,
  egg: 1,
};

function dedupeMovesByMethod(moves: MoveFragment[]) {
  const bestByKey = new Map<MoveKey, MoveFragment>();
  const order: MoveKey[] = [];

  moves.forEach((move) => {
    const existing = bestByKey.get(move.key);
    if (!existing) {
      bestByKey.set(move.key, move);
      order.push(move.key);
      return;
    }

    if (
      LEARN_METHOD_PRIORITY[move.method] >
      LEARN_METHOD_PRIORITY[existing.method]
    ) {
      bestByKey.set(move.key, move);
    }
  });

  return order.map((key) => bestByKey.get(key)!).filter(Boolean);
}

function dedupeMovesMap(moves: Map<Generation, MoveFragment[]>) {
  const deduped = new Map<Generation, MoveFragment[]>();
  moves.forEach((value, key) => {
    deduped.set(key, dedupeMovesByMethod(value));
  });
  return deduped;
}
