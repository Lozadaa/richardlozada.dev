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
  { name: "Oracle Certified Associate — Java SE 8 Programmer", issuer: "Oracle", seal: "oracle",
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
    "I'm Richard Lozada, a full-stack software engineer born in Venezuela and based in Madrid. I've spent close to a decade building products for web, mobile and the cloud — and building teams that build them well.",
    "Today I'm a Technical Lead at Openbank (Grupo Santander), where I own the security vertical's frontend end-to-end: architecture, code, and mentoring the team so every decision maximizes value for the business. Getting here took me through Venezuela, Colombia, Chile and Spain, shipping for brands like LATAM Airlines, Cencosud, Falabella and Sodimac at companies like Globant, WiTI and TripleA.",
    "Outside the office I keep shipping: TreeHealth, a collaborative family health map; Vzla Terremoto Info, a humanitarian PWA for emergencies in Venezuela; FlareRead, an open-source EPUB reader; and dexteria, an AI project executor. I like building products that, one way or another, help people in their day-to-day — and that goes way back: at 17, before my career even started, I co-built “Abastece Combustible”, an app reporting gas-station availability in real time in Venezuela. Over 10,000 people used it, and it made press and TV.",
    "A lifelong self-learner, I work with React, Next.js and Angular on the frontend; Ruby on Rails, Java/Spring and Node on the backend; React Native, Kotlin and Swift on mobile — all on AWS. I care about software that is accessible, fast and well built: TDD, solid CI/CD, and code you can still read a year later.",
  ],
  es: [
    "Soy Richard Lozada, ingeniero de software full-stack nacido en Venezuela y radicado en Madrid. Llevo cerca de una década construyendo productos web, móviles y en la nube — y equipos que los construyen bien.",
    "Hoy soy Technical Lead en Openbank (Grupo Santander), donde llevo el frontend del vertical de seguridad de punta a punta: arquitectura, código y mentoring del equipo, cuidando que cada decisión maximice el valor para el negocio. Llegar hasta aquí me llevó por Venezuela, Colombia, Chile y España, construyendo para marcas como LATAM Airlines, Cencosud, Falabella y Sodimac en empresas como Globant, WiTI y TripleA.",
    "Fuera de la oficina sigo construyendo: TreeHealth, un mapa colaborativo de salud familiar; Vzla Terremoto Info, una PWA humanitaria para emergencias en Venezuela; FlareRead, un lector de EPUB open-source; y dexteria, un ejecutor de proyectos con IA. Me gusta crear productos que ayuden de una u otra forma a las personas en el día a día — y eso viene de lejos: a los 17, antes de empezar mi carrera, creé junto a un amigo «Abastece Combustible», una app que informaba en tiempo real la disponibilidad de las gasolineras en Venezuela. La usaron más de 10.000 personas y salió en prensa y TV.",
    "Autodidacta de por vida, trabajo con React, Next.js y Angular en el frontend; Ruby on Rails, Java/Spring y Node en el backend; React Native, Kotlin y Swift en móvil — todo sobre AWS. Me importa que el software sea accesible, rápido y esté bien hecho: TDD, buen CI/CD y código que se pueda seguir leyendo dentro de un año.",
  ],
};
