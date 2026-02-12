// Custom types describing PokeAPI V2 shape
type PokeAPIPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: { name: string };
  }>;
  types: Array<{
    slot: number;
    type: { name: string };
  }>;
  abilities: Array<{
    ability: { name: string; url: string };
    is_hidden: boolean;
    slot: number;
  }>;
  sprites: {
    front_default: string;
  };
  moves?: Array<{
    move: { name: string; url: string };
    version_group_details: Array<{
      version_group: { name: string };
      move_learn_method: { name: string };
    }>;
  }>;
};

type PokeAPISpecies = {
  id: number;
  name: string;
  gender_rate: number;
  capture_rate: number;
  is_legendary: boolean;
  is_mythical: boolean;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }>;
  genera: Array<{
    genus: string;
    language: { name: string };
  }>;
};

type PokeAPIMove = {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number;
  priority: number;
  damage_class: { name: string };
  type: { name: string };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
  names: Array<{
    name: string;
    language: { name: string };
  }>;
  target: { name: string };
  generation: { name: string };
  meta: {
    ailment: { name: string };
    ailment_chance: number;
    flinch_chance: number;
    crit_rate: number;
    stat_chance: number;
  };
  stat_changes: Array<{
    change: number;
    stat: { name: string };
  }>;
  learned_by_pokemon: Array<{
    name: string;
    url: string;
  }>;
};

type PokeAPIAbility = {
  name: string;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
  names: Array<{
    name: string;
    language: { name: string };
  }>;
};

import {
  type Pokemon,
  type SpeciesKey,
  type PokemonFragment,
  type Move,
  type Type,
  type Stat,
  type LearnMethod,
  type Ability,
  type MoveFragment,
  learnMethods,
} from "src/utils/types";
import type { MoveKey } from "src/data/moves";
import type { Generation } from "src/data/generations";
import { FormKey, forms, species, speciesKeys } from "src/data/species";
import {
  buildSprite,
  computeWeaknessesFromTypes,
  computeAttackingInfo,
  capitalize,
} from "src/utils/helpers";
import moves from "src/data/moves";
import { gameToGen } from "src/data/generations";

function findEnglish<T extends { language: { name: string } }>(
  entries: T[],
): T {
  return entries.find((entry) => entry.language.name === "en") as T;
}

function sumStats(stats: Record<Stat, number>): number {
  return Object.values(stats).reduce((total, stat) => total + stat, 0);
}

function extractStats(pokemonData: PokeAPIPokemon): Record<Stat, number> {
  const statsMap = new Map(
    pokemonData.stats.map((statEntry) => [
      statEntry.stat.name,
      statEntry.base_stat,
    ]),
  );
  return {
    hp: statsMap.get("hp")!,
    attack: statsMap.get("attack")!,
    defense: statsMap.get("defense")!,
    "special-attack": statsMap.get("special-attack")!,
    "special-defense": statsMap.get("special-defense")!,
    speed: statsMap.get("speed")!,
  };
}

function extractTypes(pokemonData: PokeAPIPokemon): Type[] {
  return pokemonData.types
    .sort((typeA, typeB) => typeA.slot - typeB.slot)
    .map((typeEntry) => typeEntry.type.name as Type);
}

function convertAbility(
  abilitySlot: { ability: { name: string } },
  abilityData: PokeAPIAbility,
): Ability {
  const effectEntry = findEnglish(abilityData.effect_entries);
  const nameEntry = findEnglish(abilityData.names);
  return {
    key: abilitySlot.ability.name,
    name: nameEntry.name,
    shortDesc: effectEntry.short_effect,
  };
}

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

class PokeAPIClient {
  private cache = new Map<string, any>();
  private inFlightRequests = new Map<string, Promise<any>>();

  private async fetchWithCache<T>(url: string): Promise<T> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    if (this.inFlightRequests.has(url)) {
      return this.inFlightRequests.get(url);
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`PokeAPI error: ${response.statusText}`);
        }

        const data = await response.json();
        this.cache.set(url, data);
        return data;
      } finally {
        this.inFlightRequests.delete(url);
      }
    })();

    this.inFlightRequests.set(url, requestPromise);
    return requestPromise;
  }

  private async getPokemonRaw(
    nameOrId: string | number,
  ): Promise<PokeAPIPokemon> {
    return this.fetchWithCache(`${POKEAPI_BASE}/pokemon/${nameOrId}/`);
  }

  private async getPokemonSpeciesRaw(
    nameOrId: string | number,
  ): Promise<PokeAPISpecies> {
    return this.fetchWithCache(`${POKEAPI_BASE}/pokemon-species/${nameOrId}/`);
  }

  private async getMoveRaw(nameOrId: string | number): Promise<PokeAPIMove> {
    return this.fetchWithCache(`${POKEAPI_BASE}/move/${nameOrId}/`);
  }

  private async getAbilityRaw(
    nameOrId: string | number,
  ): Promise<PokeAPIAbility> {
    return this.fetchWithCache(`${POKEAPI_BASE}/ability/${nameOrId}/`);
  }

  getAllPokemon(): PokemonFragment[] {
    return speciesKeys.map((key, index) => {
      const speciesData = species[key];
      return {
        key,
        name: speciesData.name,
        dexNumber: index + 1,
        sprite: buildSprite(key),
        type: speciesData.types as [Type] | [Type, Type],
        baseTotal: speciesData.base,
        effectiveBaseTotal: speciesData.eff,
      };
    });
  }

  async getPokemon(key: SpeciesKey, form?: string): Promise<Pokemon> {
    const speciesInfo = species[key];
    const pokemonIdentifier = form || speciesInfo.baseForm || key;

    const [speciesData, pokemonData] = await Promise.all([
      this.getPokemonSpeciesRaw(key),
      this.getPokemonRaw(pokemonIdentifier),
    ]);

    const baseStats = extractStats(pokemonData);
    const baseStatsTotal = sumStats(baseStats);
    const types = extractTypes(pokemonData);
    const weaknesses = computeWeaknessesFromTypes(types);

    const sortedAbilities = [...pokemonData.abilities].sort(
      (abilityA, abilityB) => {
        if (abilityA.is_hidden) return 1;
        if (abilityB.is_hidden) return -1;
        return abilityA.slot - abilityB.slot;
      },
    );

    const abilitiesData = await Promise.all(
      sortedAbilities
        .slice(0, 3)
        .map((ability) => this.getAbilityRaw(ability.ability.name)),
    );

    const abilities = {
      first: convertAbility(sortedAbilities[0], abilitiesData[0]),
      second:
        sortedAbilities[1] && !sortedAbilities[1].is_hidden
          ? convertAbility(sortedAbilities[1], abilitiesData[1])
          : null,
      hidden: sortedAbilities.find((ability) => ability.is_hidden)
        ? convertAbility(
            sortedAbilities.find((ability) => ability.is_hidden)!,
            abilitiesData[
              sortedAbilities.findIndex((ability) => ability.is_hidden)
            ],
          )
        : null,
    };

    const flavorEntry = findEnglish(speciesData.flavor_text_entries);
    const flavorText = {
      flavor: flavorEntry.flavor_text.replace(/\n|\f/g, " "),
      game: capitalize(flavorEntry.version.name),
    };

    const genderRate = speciesData.gender_rate;
    const gender =
      genderRate === -1
        ? null
        : {
            male: `${(((8 - genderRate) / 8) * 100).toFixed(1)}%`,
            female: `${((genderRate / 8) * 100).toFixed(1)}%`,
          };

    const rarity = speciesData.is_mythical
      ? "mythical"
      : speciesData.is_legendary
        ? "legendary"
        : null;

    const isAltForm = !!form;
    const sprite = buildSprite(pokemonIdentifier, { altForm: isAltForm });
    const shinySprite = buildSprite(pokemonIdentifier, {
      shiny: true,
      altForm: isAltForm,
    });

    const evYields: Record<Stat, number> = Object.fromEntries(
      pokemonData.stats.map((statEntry) => [
        statEntry.stat.name,
        statEntry.effort,
      ]),
    ) as Record<Stat, number>;

    const { attackerType, effectiveBaseTotal } = computeAttackingInfo({
      baseStats,
      baseStatsTotal,
    });

    return {
      key,
      name: speciesInfo.name,
      desc: findEnglish(speciesData.genera).genus,
      abilities,
      attackerType,
      baseStats,
      baseTotal: baseStatsTotal,
      effectiveBaseTotal,
      evolutionLevel: null,
      evYields,
      flavorText,
      gender,
      height: pokemonData.height / 10,
      weight: pokemonData.weight / 10,
      dexNumber: speciesData.id,
      variants: speciesInfo.forms || [],
      sprite,
      shinySprite,
      weaknesses,
      rarity,
      type: types as [Type] | [Type, Type],
      catchRate: [
        speciesData.capture_rate,
        `${((speciesData.capture_rate / 255) * 100).toFixed(1)}%`,
      ],
    };
  }

  async getMove(key: MoveKey): Promise<Move> {
    const localMove = moves[key];
    const moveData = await this.getMoveRaw(key);

    const effectEntry = findEnglish(moveData.effect_entries);
    const nameEntry = findEnglish(moveData.names);

    const generationMatch = moveData.generation.name.match(/generation-(\w+)/);
    const generation = romanNumerals[(generationMatch as RegExpMatchArray)[1]];

    let description = effectEntry.short_effect;
    const substitutions: Record<string, string | number> = {
      effect_chance: moveData.meta.stat_chance || moveData.meta.ailment_chance,
      power: moveData.power || 0,
      accuracy: moveData.accuracy || 0,
    };

    Object.entries(substitutions).forEach(([key, value]) => {
      description = description.replace(
        new RegExp(`\\$${key}`, "g"),
        String(value),
      );
    });

    const used = new Set<string>();

    const learnedBy: PokemonFragment[] = moveData.learned_by_pokemon
      .map((pokemon) => {
        const key =
          forms[pokemon.name as FormKey] || (pokemon.name as SpeciesKey);
        const speciesData = species[key];
        if (!speciesData || used.has(key)) return null;

        used.add(key);

        return {
          key,
          name: speciesData.name,
          dexNumber: -1,
          sprite: buildSprite(key),
          type: speciesData.types as [Type] | [Type, Type],
          baseTotal: speciesData.base,
          effectiveBaseTotal: speciesData.eff,
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => a.dexNumber - b.dexNumber);

    return {
      key,
      ...localMove,
      name: nameEntry.name,
      pp: moveData.pp,
      priority: moveData.priority,
      target: moveData.target.name,
      desc: description,
      generation,
      learnedBy,
    };
  }

  async getMovesetForPokemon(
    identifier: string | number,
  ): Promise<Map<Generation, MoveFragment[]>> {
    const pokemonData = await this.getPokemonRaw(identifier);
    const map = new Map<Generation, MoveFragment[]>();
    const used = new Set<string>();

    pokemonData.moves?.forEach((moveData) => {
      const moveKey = moveData.move.name as MoveKey;
      const move = moves[moveKey];

      if (move) {
        moveData.version_group_details.forEach((groupDetails) => {
          const game = groupDetails.version_group.name;
          const rawMethod = groupDetails.move_learn_method.name;
          const method = (
            (learnMethods as readonly string[]).includes(rawMethod)
              ? rawMethod
              : "special"
          ) as LearnMethod;
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

    return map;
  }
}

const romanNumerals: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
};

export const pokeapi = new PokeAPIClient();
