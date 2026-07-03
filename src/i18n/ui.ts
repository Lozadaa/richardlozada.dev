export type Locale = "en" | "es";

export const locales: Locale[] = ["en", "es"];
export const defaultLocale: Locale = "en";

/** A translatable field in content files. */
export type Localized = { en: string; es: string };

/** Pick a locale's value from a Localized field (or pass a plain string through). */
export const pick = (v: string | Localized, locale: Locale): string =>
  typeof v === "string" ? v : v[locale];

export const ui = {
  en: {
    "meta.title": "Richard Lozada — Software Engineer",
    "meta.description":
      "Full-stack engineer with ~10 years of experience, from developer to Technical Lead at Openbank (Grupo Santander).",
    "skip": "Skip to content",
    "hero.face-label": "ASCII portrait of Richard Lozada",
    "hero.links": "Quick links",
    "exp.heading": "Experience",
    "exp.tooltip":
      "Each mark is either the company’s real logo rendered in ASCII, or — where no logo was available — a unique “sigil” generated deterministically from the company’s name. Same name, same emblem, every time.",
    "exp.tooltip-label":
      "About the marks: each emblem is either the company's real logo in ASCII, or a unique sigil generated from the company name.",
    "exp.role": "role",
    "exp.roles": "roles",
    "proj.heading": "Projects",
    "about.heading": "About",
    "stack.heading": "Stack",
    "contact.heading": "Contact",
    "contact.links": "Contact links",
    "footer.sig": "— built in ASCII",
    "lang.label": "Language",
  },
  es: {
    "meta.title": "Richard Lozada — Ingeniero de Software",
    "meta.description":
      "Ingeniero full-stack con ~10 años de experiencia, de developer a Technical Lead en Openbank (Grupo Santander).",
    "skip": "Saltar al contenido",
    "hero.face-label": "Retrato ASCII de Richard Lozada",
    "hero.links": "Enlaces rápidos",
    "exp.heading": "Experiencia",
    "exp.tooltip":
      "Cada marca es el logo real de la empresa renderizado en ASCII o — cuando no había logo disponible — un “sigilo” único generado determinísticamente a partir del nombre de la empresa. Mismo nombre, mismo emblema, siempre.",
    "exp.tooltip-label":
      "Sobre las marcas: cada emblema es el logo real de la empresa en ASCII, o un sigilo único generado a partir del nombre de la empresa.",
    "exp.role": "rol",
    "exp.roles": "roles",
    "proj.heading": "Proyectos",
    "about.heading": "Sobre mí",
    "stack.heading": "Stack",
    "contact.heading": "Contacto",
    "contact.links": "Enlaces de contacto",
    "footer.sig": "— hecho en ASCII",
    "lang.label": "Idioma",
  },
} as const;

export type UiKey = keyof (typeof ui)["en"];

export const useT = (locale: Locale) => (key: UiKey): string => ui[locale][key];
