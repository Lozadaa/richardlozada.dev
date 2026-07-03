import type { Locale } from "../i18n/ui";

export interface Certification { name: string; issuer: string; href: string }

export const certifications: Certification[] = [
  { name: "Oracle Certified Associate — Java SE 8 Programmer", issuer: "Oracle",
    href: "https://www.youracclaim.com/badges/86ce95f2-7554-46fe-8a58-4cb676867a2d/linked_in_profile" },
  { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services",
    href: "https://www.credly.com/badges/7077fa91-c2bf-49c3-8ecf-846ffdd762fc" },
  { name: "Lifelong Learning", issuer: "CertiProf",
    href: "https://www.credly.com/badges/4f0f92e4-ca8f-42e3-a20e-531b013a2798" },
  { name: "Ruta Blockchain y Criptomonedas", issuer: "Platzi",
    href: "https://platzi.com/p/lozadaaa/learning-path/39-blockchain-criptomonedas/diploma/detalle/" },
];

export const aboutParagraphs: Record<Locale, string[]> = {
  en: [
    "I'm Richard Lozada, a full-stack software engineer with around a decade of experience building products across web, mobile and the cloud.",
    "I've grown from developer to Technical Lead — most recently leading the security frontend vertical at Openbank (Grupo Santander) in Madrid. Along the way I've built for LATAM Airlines, Cencosud, Falabella and Sodimac through companies like Globant, WiTI and TripleA.",
    "My toolkit spans React, Next.js and Angular on the frontend; Ruby on Rails, Java/Spring and Node on the backend; React Native, Kotlin and Swift on mobile — all on AWS. I care about accessible, fast, well-crafted software.",
  ],
  es: [
    "Soy Richard Lozada, ingeniero de software full-stack. Llevo cerca de una década construyendo productos web, móviles y en la nube.",
    "Pasé de developer a Technical Lead: hoy lidero el frontend del vertical de seguridad en Openbank (Grupo Santander), en Madrid. Antes construí para LATAM Airlines, Cencosud, Falabella y Sodimac desde empresas como Globant, WiTI y TripleA.",
    "Trabajo con React, Next.js y Angular en el frontend; Ruby on Rails, Java/Spring y Node en el backend; React Native, Kotlin y Swift en móvil — todo sobre AWS. Me importa que el software sea accesible, rápido y esté bien hecho.",
  ],
};
