import type { Locale } from "../i18n/ui";

export interface Certification { name: string; issuer: string; href: string; seal: string }
export interface PressLink { name: string; href: string }

/** Coverage of "Abastece Combustible" (2015) — the gas-station app built at 17. */
export const press: PressLink[] = [
  { name: "Entrevista · Alta Densidad",
    href: "https://altadensidad.com/entrevista-jovenes-venezolanos-crean-aplicacion-para-encontrar-la-gasolinera-mas-cercana/" },
  { name: "Diario Contraste",
    href: "https://www.diariocontraste.com/2015/10/jovenes-zulianos-crean-app-que-informa-estado-de-las-estaciones-de-servicio-disponibles/" },
  { name: "TV · Dailymotion",
    href: "https://www.dailymotion.com/video/x3f7yyw" },
];

export const certifications: Certification[] = [
  { name: "Oracle Certified Associate, Java SE 8 Programmer", issuer: "Oracle", seal: "oracle",
    href: "https://www.youracclaim.com/badges/86ce95f2-7554-46fe-8a58-4cb676867a2d/linked_in_profile" },
  { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", seal: "aws",
    href: "https://www.credly.com/badges/7077fa91-c2bf-49c3-8ecf-846ffdd762fc" },
  { name: "Lifelong Learning", issuer: "CertiProf", seal: "certiprof",
    href: "https://www.credly.com/badges/4f0f92e4-ca8f-42e3-a20e-531b013a2798" },
  { name: "Ruta Blockchain y Criptomonedas", issuer: "Platzi", seal: "platzi",
    href: "https://platzi.com/p/lozadaaa/learning-path/39-blockchain-criptomonedas/diploma/detalle/" },
];

export const aboutParagraphs: Record<Locale, string[]> = {
  en: [
    "I'm Richard Lozada, a self-taught full-stack software engineer. I've spent close to a decade building products for web, mobile and the cloud, and teams that build them well.",
    "Today I'm a Technical Lead at Openbank (Grupo Santander), owning the security vertical's frontend end-to-end: architecture, code and mentoring. Getting here meant shipping for brands like LATAM Airlines, Cencosud and Falabella.",
    "Outside the office I keep shipping: TreeHealth, Vzla Terremoto Info, FlareRead, dexteria. I like building products that help people in their day-to-day, and that goes way back: at 17, before my career even started, I co-built “Abastece Combustible”, a gas-station availability app used by over 10,000 people. It made press and TV:",
  ],
  es: [
    "Soy Richard Lozada, ingeniero de software full-stack y autodidacta. Llevo cerca de una década construyendo productos web, móviles y en la nube, y equipos que los construyen bien.",
    "Hoy soy Technical Lead en Openbank (Grupo Santander), donde llevo el frontend del vertical de seguridad de punta a punta: arquitectura, código y mentoring. Llegar hasta aquí significó construir para marcas como LATAM Airlines, Cencosud y Falabella.",
    "Fuera de la oficina sigo construyendo: TreeHealth, Vzla Terremoto Info, FlareRead, dexteria. Me gusta crear productos que ayuden a las personas en el día a día, y eso viene de lejos: a los 17, antes de empezar mi carrera, creé junto a un amigo «Abastece Combustible», una app de disponibilidad de gasolineras que usaron más de 10.000 personas. Salió en prensa y TV:",
  ],
};
