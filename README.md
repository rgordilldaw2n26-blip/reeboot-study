# REBOOT Play — Inventari Local

Aplicació web per a la gestió d'inventari local d'equips informàtics desenvolupada per al client **Study / Play (Casal de Joves)** dins de la iniciativa **REBOOT**. El projecte està creat amb **React + Vite** i funciona completament al navegador mitjançant **`localStorage`**, sense requerir cap backend ni connexió a bases de dades externes.

---

## 🚀 Característiques principals

- **Dades inicials d'exemple (hardcoded):**
  - Incorpora d'origen els equips inicials especificats pel projecte:
    - `RB-A` | *Portàtil* | *En prova*
    - `RB-B` | *Portàtil* | *Apte*
    - `RB-C` | *Portàtil* | *Diagnosi*
- **Formulari de registre amb ID automàtic:**
  - Generació automàtica i correlativa de nous identificadors (`RB-001`, `RB-002`, `RB-003`...).
  - Selecció del tipus d'equip a partir d'un catàleg predefinit (*Portàtil*, *Ordinador de sobretaula*, *Servidor*, *Tauleta*, *Monitor*).
  - Estat inicial automàticament assignat a **«En prova»**.
- **Validació de dades integrada:**
  - Control de camps obligatoris amb missatge d'alerta en català: *«Si us plau, selecciona un tipus d'equip.»* si s'intenta desar sense triar categoria.
- **Selector d'estat interactiu en temps real:**
  - Cada equip disposa d'un menú desplegable (`<select>`) directe per alternar l'estat entre **«En prova»**, **«Apte»** i **«Diagnosi»**.
- **Comptadors i telemetria en viu (Live Telemetry):**
  - Mètriques reactives superiors que es recalculen a l'instant en afegir equips o modificar estats:
    - *Total Nodes* (100% de la flota)
    - *Aptes per a joc* (còmput i percentatge)
    - *En prova / Lab* (benchmarking i burn-in)
    - *En revisió* (diagnosi tècnica)
- **Cerca i filtratge ràpid:**
  - Barra de cerca en viu per identificador o model (amb distintiu de drecera `⌘K`).
  - Xips de filtrat ràpid per estat (*Tots els estats*, *Apte*, *En prova*, *Diagnosi*).
- **Selector de vista dual (Targetes / Taula):**
  - Permet commutar entre la vista de targetes riques amb fitxa tècnica de components (CPU, GPU, RAM, disc) i la vista tradicional de taula resumida.
- **Disseny visual Stitch (Dark / Neon-Lime):**
  - Interfície d'estil ciberpunk adaptada de Stitch amb fons fosc carbó, accents verd neó llima (`#ccff00` / `#c5f400`) i tons liles per a estats de laboratori.
  - Tipografies combinades: `Press Start 2P` (pixel-art per a la capçalera), `Space Grotesk`, `JetBrains Mono` i `Geist`.
  - Logotip corporatiu integrat amb iconografia SVG en línia i insígnia *CASAL DE JOVES*.
- **Persistència local:**
  - Tota l'activitat (altes, modificacions i estats) es sincronitza automàticament amb la clau `reeboot_inventory_devices` de `localStorage`, preservant les dades en recarregar la pàgina (`F5`).
- **Interfície 100% en català:**
  - Tots els textos, missatges de confirmació, alertes i etiquetes estan redactats íntegrament en català.

---

## 🛠️ Pila tecnològica (Tech Stack)

- **Framework / Llibreria UI:** [React](https://react.dev/) (v19)
- **Eina de construcció i empaquetament:** [Vite](https://vite.dev/) (v8)
- **Llenguatge:** JavaScript (ES Modules, JSX)
- **Estils i Maquetació:** [Tailwind CSS](https://tailwindcss.com/) (motor JIT via CDN amb tokens Stitch personalitzats) + CSS natiu
- **Fonts i Icones:** Google Fonts (`Geist`, `JetBrains Mono`, `Space Grotesk`, `Press Start 2P`) i Material Symbols Outlined
- **Persistència de dades:** Web Storage API (`localStorage`)

---

## 💻 Instruccions d'instal·lació i execució

### Requisits previs
Assegura't de tenir instal·lat [Node.js](https://nodejs.org/) (versió 18 o superior) i el gestor de paquets `npm`.

### 1. Clonar o accedir a la carpeta del repositori
```bash
cd c:\reeboot-study
```

### 2. Instal·lar les dependències
Executa la comanda següent per descarregar els paquets necessaris de `node_modules`:
```bash
npm install
```

### 3. Iniciar el servidor de desenvolupament
Inicia el servidor local amb recàrrega ràpida en calent (HMR):
```bash
npm run dev
```

Un cop engegat, obre el teu navegador i accedeix a la URL indicada (per defecte: [http://localhost:5173](http://localhost:5173)).

### Altres ordres disponibles
- **Compilació per a producció:**
  ```bash
  npm run build
  ```
  Genera la versió optimitzada del lloc web a la carpeta `dist/`.
- **Previsualització del build:**
  ```bash
  npm run preview
  ```
- **Revisió de linter (ESLint):**
  ```bash
  npm run lint
  ```

---

## 📁 Estructura del projecte

```text
reeboot-study/
├── public/                       # Recursos estàtics públics (favicons, icones SVG)
│   ├── favicon.svg
│   └── icons.svg
├── src/                          # Codi font de l'aplicació React
│   ├── assets/                   # Imatges i logotips de suport
│   ├── components/               # Components visuals de la interfície
│   │   ├── Inventory.jsx         # Component principal de la pantalla d'Inventari
│   │   └── Inventory.css         # Estils addicionals per al component
│   ├── data/                     # Dades estàtiques i catàlegs de referència
│   │   └── devices.js            # Llista inicial (RB-A, RB-B, RB-C), tipus i estats
│   ├── App.css                   # Estils globals del contenidor de l'aplicació
│   ├── App.jsx                   # Component arrel que renderitza la vista principal
│   ├── index.css                 # Estils base i configuració de pantalla completa
│   └── main.jsx                  # Punt d'entrada de React i muntatge al DOM
├── index.html                    # Plantilla HTML amb càrrega de fonts i Tailwind Stitch
├── package.json                  # Scripts de l'aplicació i dependències del projecte
├── vite.config.js                # Configuració de l'entorn de treball de Vite
└── README.md                     # Documentació tècnica del projecte
```

---

## 📋 Llicència i context educatiu

Aquest projecte s'emmarca en les activitats pràctiques d'aprenentatge del projecte **REBOOT Play** per al **Casal de Joves**, promovent la reutilització circular d'equips informàtics per a entorns lúdics i comunitaris lliures d'obsolescència.
