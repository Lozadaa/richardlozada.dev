# Portafolio ASCII — Richard Lozada

**Fecha:** 2026-07-03
**Dominio objetivo:** richardlozada.com
**Estado:** Diseño aprobado — pendiente de revisión de spec

---

## 1. Visión

Portafolio personal de un ingeniero full-stack con ~10 años de carrera (developer → Technical
Lead en Openbank / Grupo Santander). Objetivo **50/50**: impresionar como pieza única *y*
comunicar con claridad el perfil profesional. La firma visual es la **cara del autor en ASCII
que reacciona físicamente al cursor** (los caracteres se apartan como al empujar arena y vuelven
con rebote).

El sitio debe leerse como el trabajo de alguien con experiencia: accesible, responsive, rápido y
pulido. La estética "terminal" nunca es excusa para bajar la calidad — al contrario, es la prueba
de dominio.

## 2. Principios no-negociables

1. **Accesibilidad primero.** El `<canvas>` no es accesible por sí solo: todo el contenido real
   vive en HTML semántico; el canvas es decorativo con alternativa textual (`role="img"` +
   `aria-label`). Navegación completa por teclado, foco visible, contraste AA verificado.
2. **`prefers-reduced-motion`.** Si el visitante lo pide, el hero se congela en una cara ASCII
   estática nítida; cero animación. Igual para cualquier otra transición.
3. **Responsive real.** El contenido reflow-ea en HTML fluido; la cara escala proporcional (o baja
   de columnas en móvil). El efecto de empuje se adapta o desactiva en touch (no hay hover).
4. **Performance.** Objetivo Lighthouse ~100 en las 4 categorías. El loop del canvas se **pausa
   fuera de viewport** (IntersectionObserver) y cuando la pestaña está oculta.
5. **Calidad de código.** Componentes chicos, una responsabilidad cada uno; contenido separado de
   presentación (data files); TypeScript estricto.

## 3. Lenguaje visual (el "anti-pattern" del skill de diseño)

Del skill de diseño tomamos **solo el andamiaje invisible**; descartamos toda su piel visual
(cards con sombra, gradientes, botones de plantilla, paletas sugeridas). La piel la reemplaza el
lenguaje ASCII.

**Lo que SÍ tomamos:**
- **Tipografía:** una monoespaciada de calidad y libre — **JetBrains Mono** o **IBM Plex Mono**
  (decisión final en implementación). Escala modular ~1.25 para jerarquía.
- **Espaciado:** ritmo base de 8px → tokens 8 / 16 / 24 / 32 / 48 / 64 / 96. Coherente en todo el
  sitio.
- **Medida de línea:** cuerpo de texto máx ~66ch para legibilidad.
- **Jerarquía y alineación:** rejilla y ritmo vertical disciplinados.

**Lo que reemplazamos con ASCII (la piel):**
- Bordes con caracteres (`+──+`, `│`, `╌`), divisores de guiones.
- "Botones"/links como texto entre corchetes: `[ contacto ]`, `[ ver repo → ]`.
- "Barras" de skills hechas de caracteres.
- Todo monoespaciado, B&N + un único acento.

**Paleta:**
- Fondo: `#000` (negro puro).
- Texto: rampa gris — `#e6e6e6` (primario) / `#8a8a8a` (secundario). Verificar AA sobre negro.
- Acento único: **naranja `#ff7a18`** — solo en hover, foco, links, y caracteres desplazados.
- Cero gradientes decorativos, cero segundo color.

## 4. El motor del hero

La cara se genera desde la foto fuente
(`C:\Users\richa\Pictures\46139620-b05f-4bec-9f54-bee97ee15a2b.jpg`) a una rejilla ASCII de
**120×62** mediante mapeo de brillo a una rampa de caracteres (el negro del fondo/ropa mapea a
espacio, así el rostro emerge de la oscuridad). Este preproceso produce un JSON con `rows`
(caracteres) y `bright` (brillo por celda) que se embebe en el build.

**Física (parámetros fijados en el brainstorming):**
- Cada celda tiene offset + velocidad (resorte + inercia).
- El cursor empuja las celdas dentro de un radio; se recomponen con rebote.
- Valores base: `radio = 38px`, `fuerza = 0.8`, `resorte k = 0.05`, `fricción = 0.80`,
  tamaño de celda `5×8px`, fuente `9px monospace`. (Afinables.)
- Los caracteres desplazados se tiñen hacia el naranja según su magnitud de desplazamiento.

**Comportamiento:**
- Loop continuo con `requestAnimationFrame`, **pausado fuera de viewport** y con pestaña oculta.
- `prefers-reduced-motion: reduce` → render estático, sin loop ni interacción.
- Touch: el empuje sigue al dedo, o (a decidir) se reemplaza por una "respiración" sutil.
- Isla Astro con `client:visible` para cargar el JS solo cuando el hero aparece.

## 5. Estructura (scroll largo, una página)

Orden fijado:

1. **Hero** — cara ASCII interactiva + `Richard Lozada` + tagline + links rápidos.
2. **Experiencia** — timeline **horizontal** (recorrido de lado con teclado/rueda/swipe),
   **agrupado por empresa**, con progresión de roles anidada dentro de cada hito.
3. **Proyectos** — selección destacada (repos + trabajo profesional), con stack y links.
4. **Sobre mí** — bio en medida legible.
5. **Stack** — tecnologías, con "barras" ASCII u organización por categoría.
6. **Contacto** — bloque ASCII con email, GitHub y redes.

### 5.1 Timeline de experiencia (agrupado por empresa)

Datos capturados (fuente: LinkedIn del autor). Empresas con varios roles muestran la progresión:

- **Openbank (Grupo Santander)** — Madrid · Híbrido · 2y10m
  - Technical Lead – Frontend · Ene 2024 – Presente · lidera la vertical de seguridad (de la
    landing a las opciones avanzadas de seguridad de usuario); mentoría de equipo, decisiones
    precisas, codebase limpio.
  - Senior Frontend Engineer · Oct 2023 – Ene 2024.
  - *(vía Entelgy)* Senior Frontend Engineer — OpenBank Grupo Santander · Feb 2023 – Oct 2023.
- **WiTI** — Santiago, Chile · 10 mos
  - Technical Lead · Ago 2022 – Mar 2023 · AWS.
  - Senior Full Stack Software Developer (en Cencosud) · Jun 2022 – Mar 2023 · AWS.
- **Globant** — Santiago · Software Developer Web UI Ssr Adv. · Ago 2021 – Jun 2022
  - Cliente **LATAM Airlines**: React + Next.js, experiencias accesibles y fluidas, BFF para
    mapear servicios, AWS.
- **Nala** — Santiago · Full Stack (Ruby on Rails & React) · Jul 2020 – Jul 2021 · arquitectura
  cloud AWS, APIs REST en RoR, UX en React.
- **TripleA Smart Solutions** — Santiago · Arquitecto de software I+D · Ene 2020 – Ago 2020 ·
  microservicios/serverless, Angular/React/Node/Spring, Docker/Kubernetes; clientes Sodimac,
  Falabella.
- **Streetrip SpA** — Full-Stack · Ago 2019 – Ene 2020 · Kotlin/Java/Swift/RoR; Android, iOS y Web.
- **Freelance (richardlozada.com)** — Full-Stack · Jul 2019 – Ene 2020 · Java 8/Spring Boot, RoR,
  React/Angular, Kotlin/Swift/React Native (Redwes, Click&Collect, Streetrip, Appunte, RecomiendaOK).
- **BBR SpA** — Full-Stack & Consultant · Dic 2017 – Jul 2019 · Java EE, Vaadin, RoR, DB2/Postgres,
  JMS/ActiveMQ, OpenShift/Ansible/Sonar/Jenkins; retail chileno.
- **Abstract Ltda** — Full-Stack Web & Android · Feb 2017 – Dic 2017 · Android Kotlin/Java, RoR,
  React, React Native.
- **Sinergia Internacional** — Full-Stack Web · Jun 2016 – Feb 2017 · Colombia · RoR, Android, PHP.
- **Fermat.org** — Android & Blockchain Developer · Ene 2016 – Jun 2016 · Java/Android, P2P,
  blockchain (framework financiero peer-to-peer).

### 5.2 Proyectos destacados (borrador, GitHub `Lozadaa` + trabajo real)

- **dexteria** — *AI Project Executor* (TypeScript, 2026) + landing `dexteria-web`.
- **vzla-info** — PWA humanitaria: reportarse a salvo, buscar familiares, ubicar ayuda.
  Next.js 16 + Supabase + Leaflet (2026).
- **FlareRead (JustRead)** — app de lectura enfocada. Electron + React + TypeScript.
- **progressive-img-loader** — librería OSS publicada (blur-thumb preloader para imágenes).
- **LATAM Airlines @ Globant** — experiencias accesibles React/Next con BFF (profesional, sin repo).

*(El autor afina la selección y el copy durante la implementación.)*

## 6. Arquitectura técnica

- **Astro + TypeScript** (estricto). HTML estático; hero como isla `client:visible`.
- **Contenido separado:** Content Collections / JSON para experiencia, proyectos, stack, bio →
  editable sin tocar componentes.
- **Componentes** (una responsabilidad c/u): `Hero` (+ `AsciiFace` island), `ExperienceTimeline`
  (+ `TimelineItem`), `ProjectList` (+ `ProjectCard`), `About`, `StackList`, `Contact`,
  y primitivas ASCII (`AsciiBox`, `AsciiDivider`, `AsciiButton`).
- **Preproceso de la cara:** script (Python/PIL o Node) foto → JSON ASCII, ejecutado en build o
  commit del artefacto generado.
- **Tokens de diseño** en CSS custom properties (espaciado, color, tipografía).
- **Deploy:** estático (a decidir: Vercel/Netlify/GitHub Pages) sobre richardlozada.com.

## 7. Modelo de contenido

Archivos de datos tipados:
- `experience.json` — empresas → roles (fechas, ubicación, resumen, tags de stack).
- `projects.json` — nombre, descripción, stack, links (demo/repo), destacado sí/no.
- `stack.json` — categorías → tecnologías.
- `about.md` / `site.json` — bio, tagline, links de contacto, metadatos SEO.

## 8. Criterios de éxito

- Lighthouse ~100 en Performance, Accessibility, Best Practices, SEO.
- Navegable 100% por teclado; auditoría axe sin violaciones críticas.
- `prefers-reduced-motion` respetado y verificado.
- Legible y usable de 320px a desktop.
- El hero corre a 60fps en desktop y no dispara la batería (pausa fuera de viewport).
- Un reclutador entiende en <30s quién es Richard y ve el timeline de 10 años.

## 9. Preguntas abiertas (a resolver en implementación)

- Fuente final: JetBrains Mono vs IBM Plex Mono.
- Comportamiento del hero en touch: seguir el dedo vs "respiración".
- ¿El efecto de empuje se repite sutil en encabezados de sección, o solo en el hero?
- Versión móvil de la cara: escalar la de 120 columnas vs generar una de menos columnas.
- Plataforma de deploy.
- Selección y copy final de proyectos (los define el autor).

## 10. Fuera de alcance (YAGNI por ahora)

- Blog / CMS.
- i18n (multi-idioma) — se evalúa después; contenido inicial en un idioma.
- Backend / formularios con servidor — contacto vía links (mailto, redes).
- Modo terminal interactiva (se descartó a favor del scroll largo).
