import { useState, useEffect } from "react";
import { pokeapi } from "src/api/pokeapi";
import { computeAttackingInfo } from "src/utils/helpers";
import pokemon from "src/data/pokemon";
import type { PokemonFragment, PokemonKey, Type, Stat } from "src/utils/types";

export default function useListPokemon() {
  const [data, setData] = useState<PokemonFragment[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        setLoading(true);

        // Get list of all Pokemon
        const listResponse = await pokeapi.getAllPokemon(10000);

        // Filter to only base forms we have in our pokemon.ts data
        const pokemonKeys = Object.keys(pokemon) as PokemonKey[];
        const relevantPokemon = listResponse.results.filter((p) =>
          pokemonKeys.includes(p.name as PokemonKey)
        );

        // Fetch details for each Pokemon in parallel
        const detailsPromises = relevantPokemon.map((p) =>
          pokeapi.getPokemon(p.name)
        );
        const allDetails = await Promise.all(detailsPromises);

        // Transform to PokemonFragment
        const fragments: PokemonFragment[] = allDetails.map((p) => {
          const key = p.name as PokemonKey;
          const name = pokemon[key];

          // Extract stats
          const statsMap = new Map(
            p.stats.map((s) => [s.stat.name.replace("-", ""), s.base_stat])
          );
          const baseStats: Record<Stat, number> = {
            hp: statsMap.get("hp")!,
            attack: statsMap.get("attack")!,
            defense: statsMap.get("defense")!,
            specialattack: statsMap.get("specialattack")!,
            specialdefense: statsMap.get("specialdefense")!,
            speed: statsMap.get("speed")!,
          };
          const baseStatsTotal = Object.values(baseStats).reduce(
            (a, b) => a + b
          );

          // Compute attacking info
          const { effectiveBaseTotal } = computeAttackingInfo({
            baseStats,
            baseStatsTotal,
          } as any);

          // Extract types
          const type = p.types
            .sort((a, b) => a.slot - b.slot)
            .map((t) => t.type.name as Type) as [Type] | [Type, Type];

          return {
            key,
            name,
            dexNumber: p.id,
            sprite: `https://play.pokemonshowdown.com/sprites/home-centered/${key}.png`,
            type,
            baseTotal: baseStatsTotal,
            effectiveBaseTotal,
          };
        });

        setData(fragments);
        setError(undefined);
      } catch (e) {
        setError(`Failed to fetch Pokemon list: ${(e as Error).message}`);
        setData(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPokemon();
  }, []);

  return { pokemon: data, loading, error };
}
