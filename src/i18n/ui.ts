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
      "Each mark is either the company’s real logo rendered in ASCII, or — where no logo was available — the company’s initials set big in the same ASCII texture.",
    "exp.tooltip-label":
      "About the marks: each emblem is either the company's real logo in ASCII, or the company's initials set big in ASCII.",
    "exp.role": "role",
    "exp.roles": "roles",
    "exp.more": "show more · +{y} years of experience",
    "proj.heading": "Latest projects",
    "about.heading": "About",
    "about.certs": "Certifications",
    "stack.heading": "Stack",
    "contact.heading": "Contact",
    "contact.links": "Contact links",
    "lang.label": "Language",
  },
  es: {
    "meta.title": "Richard Lozada — Ingeniero de Software",
    "meta.description":
      "Ingeniero de software full-stack con ~10 años de experiencia. De developer a Technical Lead en Openbank (Grupo Santander).",
    "skip": "Saltar al contenido",
    "hero.face-label": "Retrato de Richard Lozada en ASCII",
    "hero.links": "Enlaces rápidos",
    "exp.heading": "Experiencia",
    "exp.tooltip":
      "Cada marca es el logo real de la empresa dibujado en ASCII. Si no hay logo disponible, son sus iniciales en grande, con la misma textura.",
    "exp.tooltip-label":
      "Sobre las marcas: el logo real de la empresa dibujado en ASCII o, si no hay logo, sus iniciales en grande.",
    "exp.role": "rol",
    "exp.roles": "roles",
    "exp.more": "ver más · +{y} años de experiencia",
    "proj.heading": "Últimos proyectos",
    "about.heading": "Sobre mí",
    "about.certs": "Certificaciones",
    "stack.heading": "Stack",
    "contact.heading": "Contacto",
    "contact.links": "Enlaces de contacto",
    "lang.label": "Idioma",
  },
} as const;

export type UiKey = keyof (typeof ui)["en"];

export const useT = (locale: Locale) => (key: UiKey): string => ui[locale][key];
