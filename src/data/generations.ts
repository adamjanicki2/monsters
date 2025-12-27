const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type Generation = (typeof generations)[number];

export const gameToGen: Record<string, Generation> = {
  "red-blue": 1,
  yellow: 1,

  "gold-silver": 2,
  crystal: 2,

  "ruby-sapphire": 3,
  "firered-leafgreen": 3,
  emerald: 3,

  "diamond-pearl": 4,
  platinum: 4,
  "heartgold-soulsilver": 4,

  "black-white": 5,
  "black-2-white-2": 5,

  "x-y": 6,
  "omega-ruby-alpha-sapphire": 6,

  "sun-moon": 7,
  "ultra-sun-ultra-moon": 7,

  "lets-go-pikachu-lets-go-eevee": 8,
  "sword-shield": 8,
  "legends-arceus": 8,
  "brilliant-diamond-and-shining-pearl": 8,

  "scarlet-violet": 9,
};

export default generations;
