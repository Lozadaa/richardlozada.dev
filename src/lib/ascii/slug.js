// Shared slug function — used by the generator (scripts/gen-projects.mjs) and the
// components so a project's data lookup always matches its generated key.
export function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
