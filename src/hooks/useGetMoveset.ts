import type { Generation } from "src/data/generations";
import type { MoveKey } from "src/data/moves";
import { species } from "src/data/species";
import type { LearnMethod, MoveFragment, SpeciesKey } from "src/utils/types";
import { pokeapi } from "src/api/pokeapi";
import useQuery from "./useQuery";

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
  const baseEvolution = species[key as SpeciesKey]?.baseEvolution;

  const { data, loading, error } = useQuery(
    async () => {
      let moves = new Map<Generation, MoveFragment[]>();

      const speciesInfo = species[key as SpeciesKey];
      if (!speciesInfo) {
        throw new Error(`Species data not found for ${key}`);
      }
      const identifier = speciesInfo.baseForm || (key as SpeciesKey);

      const baseMoves = await pokeapi.getMovesetForPokemon(identifier);
      moves = mergeMaps(moves, baseMoves, mergeMoveFragments);

      if (baseEvolution) {
        const baseEvolutionSpecies = species[baseEvolution];
        const baseEvolutionIdentifier =
          baseEvolutionSpecies.baseForm || baseEvolution;

        const additionalMoves = await pokeapi.getMovesetForPokemon(
          baseEvolutionIdentifier,
        );
        moves = mergeMaps(moves, additionalMoves, mergeMoveFragments);
      }

      return dedupeMovesMap(moves);
    },
    [key, baseEvolution],
    !skip,
  );

  return { moves: data, loading, error };
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
