const replacements = {
  "♂": "m",
  "♀": "f",
} as const;

export function slugifyName(name: string) {
  let slug = name.toLowerCase().replace(/\s+/g, "-"); // Replace spaces with dashes

  Object.entries(replacements).forEach(([k, v]) => {
    slug = slug.replace(k, v);
  });

  return slug.replace(/[^a-z0-9-]/g, "");
}

export function titlize(str: string) {
  return str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
