// Internal PokeAPI type definitions (not exported)
interface PokeAPIPokemon {
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
}

interface PokeAPISpecies {
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
}

interface PokeAPIMove {
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
  target: { name: string };
}

interface PokeAPIAbility {
  name: string;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
}

interface PokeAPIPokemonList {
  count: number;
  results: Array<{
    name: string;
    url: string;
  }>;
}

// Import types for conversion
import type {
  Pokemon,
  PokemonKey,
  PokemonFragment,
  Move,
  Type,
  Stat,
  LearnMethod,
  Ability,
  MoveFragment,
} from "src/utils/types";
import type { MoveKey } from "src/data/moves";
import type { Generation } from "src/data/generations";
import { species } from "src/data/species";
import {
  computeWeaknessesFromTypes,
  computeAttackingInfo,
} from "src/utils/helpers";
import movesData from "src/data/moves";
import { gameToGen } from "src/data/generations";
import moves from "src/data/moves";

// Helper functions (internal to module)
function formatAbilityName(key: string): string {
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function calculateCatchRatePercentage(captureRate: number): string {
  const percentage = (captureRate / 255) * 100;
  return `${percentage.toFixed(1)}%`;
}

function extractStats(pokemonData: PokeAPIPokemon): Record<Stat, number> {
  const statsMap = new Map(
    pokemonData.stats.map((s) => [s.stat.name.replace("-", ""), s.base_stat]),
  );
  return {
    hp: statsMap.get("hp")!,
    attack: statsMap.get("attack")!,
    defense: statsMap.get("defense")!,
    specialattack: statsMap.get("specialattack")!,
    specialdefense: statsMap.get("specialdefense")!,
    speed: statsMap.get("speed")!,
  };
}

function extractTypes(pokemonData: PokeAPIPokemon): Type[] {
  return pokemonData.types
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name as Type);
}

function convertAbility(
  abilitySlot: any,
  abilityData: PokeAPIAbility | undefined,
): Ability | null {
  if (!abilitySlot || !abilityData) return null;
  const effectEntry = abilityData.effect_entries.find(
    (e) => e.language.name === "en",
  );
  return {
    key: abilitySlot.ability.name,
    name: formatAbilityName(abilitySlot.ability.name),
    shortDesc: effectEntry?.short_effect || "",
  };
}

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

class PokeAPIClient {
  private cache = new Map<string, any>();

  private async fetchWithCache<T>(url: string): Promise<T> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PokeAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(url, data);
    return data;
  }

  // Raw API methods (private)
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

  async getAllPokemonList(limit = 1025): Promise<PokeAPIPokemonList> {
    return this.fetchWithCache(`${POKEAPI_BASE}/pokemon?limit=${limit}`);
  }

  /**
   * Fetches and converts a complete Pokemon (pokemon + species data)
   */
  async getPokemonFull(key: PokemonKey, properName: string): Promise<Pokemon> {
    // Get species data to find dex number
    const speciesInfo = species[key];
    if (!speciesInfo) {
      throw new Error(`Species data not found for ${key}`);
    }

    // Determine identifier for pokemon endpoint
    const pokemonIdentifier = speciesInfo.baseForm || speciesInfo.dexNumber;

    // Fetch both in parallel
    const [speciesData, pokemonData] = await Promise.all([
      this.getPokemonSpeciesRaw(speciesInfo.dexNumber),
      this.getPokemonRaw(pokemonIdentifier),
    ]);

    // Extract and compute data
    const baseStats = extractStats(pokemonData);
    const baseStatsTotal = Object.values(baseStats).reduce((a, b) => a + b, 0);
    const types = extractTypes(pokemonData);
    const weaknesses = computeWeaknessesFromTypes(types);

    // Fetch abilities
    const abilitiesData = await Promise.all(
      pokemonData.abilities
        .slice(0, 3)
        .map((a) => this.getAbilityRaw(a.ability.name)),
    );

    const abilities = {
      first: convertAbility(
        pokemonData.abilities.find((a) => a.slot === 1),
        abilitiesData.find((_, i) => pokemonData.abilities[i].slot === 1),
      )!,
      second: convertAbility(
        pokemonData.abilities.find((a) => a.slot === 2),
        abilitiesData.find((_, i) => pokemonData.abilities[i].slot === 2),
      ),
      hidden: convertAbility(
        pokemonData.abilities.find((a) => a.is_hidden),
        abilitiesData.find((_, i) => pokemonData.abilities[i].is_hidden),
      ),
    };

    // Extract flavor text
    const flavorEntry = speciesData.flavor_text_entries.find(
      (e) => e.language.name === "en",
    );
    const flavorText = {
      flavor: flavorEntry?.flavor_text.replace(/\n|\f/g, " ") || "",
      game: flavorEntry?.version.name || "",
    };

    // Gender ratio
    const genderRate = speciesData.gender_rate;
    const gender =
      genderRate === -1
        ? null
        : {
            male: `${(((8 - genderRate) / 8) * 100).toFixed(1)}%`,
            female: `${((genderRate / 8) * 100).toFixed(1)}%`,
          };

    // Rarity
    const rarity = speciesData.is_mythical
      ? "mythical"
      : speciesData.is_legendary
        ? "legendary"
        : null;

    // Sprites
    const sprite = `https://play.pokemonshowdown.com/sprites/home-centered/${key}.png`;
    const shinySprite = `https://play.pokemonshowdown.com/sprites/home-centered-shiny/${key}.png`;

    // EV yields
    const evYields: Record<Stat, number> = Object.fromEntries(
      pokemonData.stats.map((s) => [s.stat.name.replace("-", ""), s.effort]),
    ) as Record<Stat, number>;

    // Compute attacking info
    const { attackerType, effectiveBaseTotal } = computeAttackingInfo({
      baseStats,
      baseStatsTotal,
    } as any);

    // Get alternate forms
    const speciesLookup = species[pokemonData.name];
    const variants = (speciesLookup?.altForms || []) as PokemonKey[];

    return {
      key,
      name: properName,
      desc:
        speciesData.genera.find((g) => g.language.name === "en")?.genus || "",
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
      variants,
      sprite,
      shinySprite,
      weaknesses,
      rarity,
      type: types as [Type] | [Type, Type],
      catchRate: [
        speciesData.capture_rate,
        calculateCatchRatePercentage(speciesData.capture_rate),
      ],
    };
  }

  /**
   * Fetches and converts a Pokemon fragment (lightweight, for list view)
   */
  async getPokemonFragment(
    key: PokemonKey,
    name: string,
  ): Promise<PokemonFragment> {
    const pokemonData = await this.getPokemonRaw(key);

    const baseStats = extractStats(pokemonData);
    const baseStatsTotal = Object.values(baseStats).reduce((a, b) => a + b);
    const types = extractTypes(pokemonData);

    const { effectiveBaseTotal } = computeAttackingInfo({
      baseStats,
      baseStatsTotal,
    } as any);

    return {
      key,
      name,
      dexNumber: pokemonData.id,
      sprite: `https://play.pokemonshowdown.com/sprites/home-centered/${key}.png`,
      type: types as [Type] | [Type, Type],
      baseTotal: baseStatsTotal,
      effectiveBaseTotal,
    };
  }

  /**
   * Fetches and converts a move
   */
  async getMoveFull(key: MoveKey): Promise<Move> {
    const localMove = moves[key];
    const moveData = await this.getMoveRaw(key);

    const effectEntry = moveData.effect_entries.find(
      (e) => e.language.name === "en",
    );

    return {
      key,
      ...localMove,
      pp: moveData.pp,
      priority: moveData.priority,
      target: moveData.target.name,
      desc: effectEntry?.short_effect || "",
    };
  }

  /**
   * Fetches and converts moveset for a Pokemon
   */
  async getMovesetForPokemon(
    identifier: string | number,
  ): Promise<Map<Generation, MoveFragment[]>> {
    const pokemonData = await this.getPokemonRaw(identifier);
    const map = new Map<Generation, MoveFragment[]>();
    const used = new Set<string>();

    pokemonData.moves?.forEach((moveData: any) => {
      const moveKey = moveData.move.name
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase() as MoveKey;
      const move = movesData[moveKey];

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

    return map;
  }
}

export const pokeapi = new PokeAPIClient();
