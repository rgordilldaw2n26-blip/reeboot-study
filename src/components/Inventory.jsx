import { useState, useMemo, useEffect } from 'react';
import { INITIAL_DEVICES, TIPUS_EQUIP, ESTATS_DISPONIBLES } from '../data/devices';

const LOCAL_STORAGE_KEY = 'reeboot_inventory_devices';

// Especificacions per defecte si un dispositiu no en té
const getDefaultSpecsForType = (tipus) => {
  switch (tipus) {
    case 'Portàtil':
      return {
        cpu: 'Intel i5-1135G7',
        gpu: 'Iris Xe Graphics',
        ram: '16GB DDR4',
        disc: '512GB NVMe SSD',
      };
    case 'Ordinador de sobretaula':
      return {
        cpu: 'Ryzen 5 5600X',
        gpu: 'RTX 3060 12GB',
        ram: '32GB DDR4 3600',
        disc: '1TB NVMe Gen4',
      };
    case 'Servidor':
      return {
        cpu: 'Xeon Silver 4210R',
        gpu: 'Matrox G200',
        ram: '64GB ECC DDR4',
        disc: '2x 2TB RAID1',
      };
    case 'Tauleta':
      return {
        cpu: 'Snapdragon 870',
        gpu: 'Adreno 650',
        ram: '8GB LPDDR5',
        disc: '128GB UFS 3.1',
      };
    case 'Monitor':
      return {
        cpu: '165Hz IPS Panel',
        gpu: '1ms Response time',
        ram: 'DisplayPort 1.4',
        disc: 'HDR400 Ready',
      };
    default:
      return {
        cpu: 'Processador estàndard',
        gpu: 'Gràfics integrats',
        ram: '16GB RAM',
        disc: '512GB SSD',
      };
  }
};

const getDeviceIcon = (tipus) => {
  switch (tipus) {
    case 'Portàtil':
      return 'laptop_chromebook';
    case 'Ordinador de sobretaula':
      return 'desktop_windows';
    case 'Servidor':
      return 'dns';
    case 'Tauleta':
      return 'tablet_mac';
    case 'Monitor':
      return 'tv';
    default:
      return 'developer_board';
  }
};

export default function Inventory() {
  // Inicialització des de localStorage o dades per defecte
  const [devices, setDevices] = useState(() => {
    try {
      const guardat = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (guardat) {
        const parsed = JSON.parse(guardat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Error en carregar les dades de localStorage:", err);
    }
    return INITIAL_DEVICES;
  });

  // Guardat reactiu a localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(devices));
    } catch (err) {
      console.error("Error en desar les dades a localStorage:", err);
    }
  }, [devices]);

  const [filterEstat, setFilterEstat] = useState('all');
  const [cerca, setCerca] = useState('');
  const [vistaTaula, setVistaTaula] = useState(false); // Toggle Targetes / Taula
  const [mostrarFormulari, setMostrarFormulari] = useState(false);

  // Formulari de registre
  const [nouTipus, setNouTipus] = useState('');
  const [errorValidacio, setErrorValidacio] = useState('');
  const [missatgeExit, setMissatgeExit] = useState('');

  // Càlcul de l'ID automàtic (RB-001, RB-002...)
  const seguentId = useMemo(() => {
    const numeros = devices.map((d) => {
      const match = d.id.match(/^RB-(?:PLAY-)?(\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = numeros.length > 0 ? Math.max(...numeros, 0) : 0;
    return `RB-${String(maxNum + 1).padStart(3, '0')}`;
  }, [devices]);

  // Gestió de l'alta d'equip
  const handleAltaEquip = (e) => {
    e.preventDefault();

    if (!nouTipus.trim()) {
      setErrorValidacio("Si us plau, selecciona un tipus d'equip.");
      setMissatgeExit('');
      return;
    }

    const nouEquip = {
      id: seguentId,
      tipus: nouTipus,
      model: `${nouTipus} REBOOT Circular`,
      estat: 'En prova',
      specs: getDefaultSpecsForType(nouTipus),
    };

    setDevices((prev) => [nouEquip, ...prev]);
    setNouTipus('');
    setErrorValidacio('');
    setMissatgeExit(`S'ha donat d'alta l'equip ${seguentId} correctament.`);

    // Tancar el formulari després de 2 segons
    setTimeout(() => {
      setMissatgeExit('');
      setMostrarFormulari(false);
    }, 2200);
  };

  // Canvi d'estat des del desplegable
  const handleCanviEstat = (id, nouEstat) => {
    setDevices((prev) =>
      prev.map((equip) =>
        equip.id === id ? { ...equip, estat: nouEstat } : equip
      )
    );
  };

  // Comptadors en temps real
  const totalEquips = devices.length;
  const totalApte = devices.filter((d) => d.estat === 'Apte').length;
  const totalEnProva = devices.filter((d) => d.estat === 'En prova').length;
  const totalDiagnosi = devices.filter((d) => d.estat === 'Diagnosi').length;

  const percentApte = totalEquips ? ((totalApte / totalEquips) * 100).toFixed(1) : '0';
  const percentEnProva = totalEquips ? ((totalEnProva / totalEquips) * 100).toFixed(1) : '0';
  const percentDiagnosi = totalEquips ? ((totalDiagnosi / totalEquips) * 100).toFixed(1) : '0';

  // Filtrar llista d'equips
  const equipsFiltrats = useMemo(() => {
    return devices.filter((equip) => {
      const estatMap = {
        all: true,
        apte: equip.estat === 'Apte',
        prova: equip.estat === 'En prova',
        diagnosi: equip.estat === 'Diagnosi',
      };
      const coincideixEstat = estatMap[filterEstat] ?? true;

      const q = cerca.toLowerCase().trim();
      const coincideixCerca =
        !q ||
        equip.id.toLowerCase().includes(q) ||
        equip.tipus.toLowerCase().includes(q) ||
        (equip.model && equip.model.toLowerCase().includes(q));

      return coincideixEstat && coincideixCerca;
    });
  }, [devices, filterEstat, cerca]);

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-body-md text-on-surface">
      {/* HEADER FIX SEGONS DISSENY STITCH */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-base/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="h-16 px-gutter-sm flex items-center justify-between gap-space-sm max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 flex-shrink-0 select-none" aria-label="REBOOT PLAY Logo">
                {/* Badge fosc amb triangle de retrocés/play en verd neó */}
                <div className="w-6 h-6 rounded-[6px] bg-[#1a1a1a] border border-white/15 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#ccff00" className="mr-0.5">
                    <polygon points="19,4 5,12 19,20" />
                  </svg>
                </div>
                {/* Text REBOOT en majúscules negreta blanc */}
                <span className="font-headline-sm font-extrabold text-white text-[15px] tracking-tight leading-none">
                  REBOOT
                </span>
                {/* Pill verd neó amb text PLAY en negreta negre */}
                <span className="bg-[#ccff00] text-black font-extrabold text-[9px] tracking-wider px-1.5 py-0.5 rounded-[4px] leading-tight uppercase font-label-caps">
                  PLAY
                </span>
              </div>
              <div className="w-[1px] h-6 bg-surface-container-highest flex-shrink-0"></div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-label-caps text-[9px] text-text-muted tracking-wider uppercase truncate">
                  CASAL DE JOVES
                </span>
                <span
                  className="font-headline-sm text-text-primary tracking-tight truncate leading-none"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '11px',
                    lineHeight: '14px',
                  }}
                >
                  Inventari
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-space-xs">
            {/* Selector d'idiomes visual */}
            <div className="inline-flex items-center bg-surface-overlay rounded-full p-0.5">
              <button
                className="px-2 py-1 rounded-full font-label-caps text-label-caps bg-primary-container text-on-primary-container min-h-[36px] flex items-center justify-center cursor-default"
                type="button"
              >
                CA
              </button>
              <button
                className="px-2 py-1 rounded-full font-label-caps text-label-caps text-text-muted hover:text-text-primary min-h-[36px] flex items-center justify-center opacity-60 cursor-not-allowed"
                type="button"
                title="De moment l'aplicació està només en català"
              >
                ES
              </button>
              <button
                className="px-2 py-1 rounded-full font-label-caps text-label-caps text-text-muted hover:text-text-primary min-h-[36px] flex items-center justify-center opacity-60 cursor-not-allowed"
                type="button"
                title="De moment l'aplicació està només en català"
              >
                EN
              </button>
            </div>

            {/* Notificacions */}
            <button
              aria-label="Notificacions"
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors relative"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface-base"></span>
            </button>

            {/* Perfil */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* CONTINGUT PRINCIPAL */}
      <main className="flex flex-col relative w-full pt-16 pb-28 bg-surface min-h-screen max-w-4xl mx-auto">
        <div className="flex flex-col w-full">
          {/* SECCIÓ TELEMETRIA I CONTADORS */}
          <div className="px-gutter-sm pt-space-md pb-space-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  LAB LOG // LIVE TELEMETRY
                </span>
              </div>
              <span className="font-mono-data-sm text-mono-data-sm text-text-muted">
                SYNCED: {totalEquips} NODES
              </span>
            </div>

            {/* Targetes de Mètriques en Graella 2x2 */}
            <div className="grid grid-cols-2 gap-space-xs">
              {/* Total Nodes */}
              <div className="bg-surface-raised rounded-lg p-space-sm flex flex-col justify-between shadow-sm border border-border-hairline">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-text-muted">TOTAL NODES</span>
                  <span className="material-symbols-outlined text-[16px] text-text-muted">dns</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-headline-lg text-headline-lg text-text-primary leading-none">
                    {String(totalEquips).padStart(2, '0')}
                  </span>
                  <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                    100%
                  </span>
                </div>
                <span className="font-mono-data-sm text-mono-data-sm text-text-muted mt-1 truncate">
                  Equips totals al lab
                </span>
              </div>

              {/* Aptes per a Joc */}
              <div className="bg-surface-raised rounded-lg p-space-sm flex flex-col justify-between shadow-sm border border-border-hairline">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-primary-container">
                    APTES PER A JOC
                  </span>
                  <span
                    className="material-symbols-outlined text-[16px] text-primary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    sports_esports
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-headline-lg text-headline-lg text-primary-container leading-none">
                    {String(totalApte).padStart(2, '0')}
                  </span>
                  <span className="font-mono-data-sm text-mono-data-sm text-primary-container">
                    {percentApte}%
                  </span>
                </div>
                <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant mt-1 truncate">
                  Operatius ara
                </span>
              </div>

              {/* En Prova / Lab */}
              <div className="bg-surface-raised rounded-lg p-space-sm flex flex-col justify-between shadow-sm border border-border-hairline">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-secondary">
                    EN PROVA / LAB
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-secondary">science</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-headline-lg text-headline-lg text-secondary leading-none">
                    {String(totalEnProva).padStart(2, '0')}
                  </span>
                  <span className="font-mono-data-sm text-mono-data-sm text-text-muted">
                    {percentEnProva}%
                  </span>
                </div>
                <span className="font-mono-data-sm text-mono-data-sm text-text-muted mt-1 truncate">
                  Benchmarking i burn-in
                </span>
              </div>

              {/* En Revisió / Diagnosi */}
              <div className="bg-surface-raised rounded-lg p-space-sm flex flex-col justify-between shadow-sm border border-border-hairline">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-tertiary-fixed-dim">
                    EN REVISIÓ
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">
                    build_circle
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-headline-lg text-headline-lg text-on-surface leading-none">
                    {String(totalDiagnosi).padStart(2, '0')}
                  </span>
                  <span className="font-mono-data-sm text-mono-data-sm text-text-muted">
                    {percentDiagnosi}%
                  </span>
                </div>
                <span className="font-mono-data-sm text-mono-data-sm text-text-muted mt-1 truncate">
                  Diagnosi i canvi pasta
                </span>
              </div>
            </div>

            {/* Banner d'Acció: Donar d'alta equip */}
            <button
              onClick={() => setMostrarFormulari((prev) => !prev)}
              className="group relative w-full bg-primary-container text-on-primary-container rounded-lg p-space-sm flex items-center justify-between shadow-md active:scale-[0.98] transition-transform text-left cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-lg bg-surface-base text-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">
                    {mostrarFormulari ? 'close' : 'add_task'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-headline-sm text-surface-base font-bold leading-tight truncate">
                    {mostrarFormulari ? 'Tancar formulari' : "Donar d'alta nou equip"}
                  </span>
                  <span className="font-mono-data-sm text-mono-data-sm text-surface-base/80 truncate">
                    {mostrarFormulari
                      ? 'Cancel·la el registre actual'
                      : 'Escaneja xassís o component per afegir'}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-base/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-surface-base text-[20px] group-hover:translate-x-0.5 transition-transform">
                  {mostrarFormulari ? 'expand_less' : 'arrow_forward'}
                </span>
              </div>
            </button>

            {/* FORMULARI DESPLEGABLE D'ALTA D'EQUIP */}
            {mostrarFormulari && (
              <div className="bg-surface-raised border border-primary-container/30 rounded-xl p-space-sm sm:p-space-md flex flex-col gap-space-sm shadow-xl transition-all">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-[20px]">
                      add_circle
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-text-primary text-base">
                      Registrar equip al node
                    </h2>
                  </div>
                  <span className="font-mono-data-sm text-mono-data-sm text-primary-container bg-primary-container/10 px-2 py-0.5 rounded">
                    ESTAT: EN PROVA
                  </span>
                </div>

                <form onSubmit={handleAltaEquip} className="flex flex-col gap-3" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* ID Automàtic */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-caps text-label-caps text-text-muted">
                        IDENTIFICADOR (ID)
                      </label>
                      <input
                        type="text"
                        value={seguentId}
                        readOnly
                        disabled
                        className="bg-surface-base text-text-primary font-mono-data-lg text-mono-data-lg px-3 py-2 rounded-lg border border-border-active opacity-90 cursor-not-allowed"
                      />
                      <span className="font-mono-data-sm text-[10px] text-text-dim">
                        Assignat automàticament
                      </span>
                    </div>

                    {/* Selector de Tipus */}
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label htmlFor="select-tipus-alta" className="font-label-caps text-label-caps text-text-muted">
                        TIPUS D'EQUIP <span className="text-error">*</span>
                      </label>
                      <select
                        id="select-tipus-alta"
                        value={nouTipus}
                        onChange={(e) => {
                          setNouTipus(e.target.value);
                          if (errorValidacio) setErrorValidacio('');
                        }}
                        className={`bg-surface-base text-text-primary font-body-md text-body-md px-3 py-2 rounded-lg border focus:outline-none ${
                          errorValidacio
                            ? 'border-error bg-error-container/20 text-error'
                            : 'border-border-active focus:border-primary-container'
                        }`}
                      >
                        <option value="">-- Selecciona un tipus --</option>
                        {TIPUS_EQUIP.map((t) => (
                          <option key={t} value={t} className="bg-surface-raised text-on-surface">
                            {t}
                          </option>
                        ))}
                      </select>
                      <span className="font-mono-data-sm text-[10px] text-text-dim">
                        Llista de maquinari autoritzat
                      </span>
                    </div>
                  </div>

                  {/* Missatge d'error */}
                  {errorValidacio && (
                    <div className="flex items-center gap-2 p-2.5 bg-error-container/20 border border-error/40 rounded-lg text-error font-body-md text-sm">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      <span>{errorValidacio}</span>
                    </div>
                  )}

                  {/* Missatge d'èxit */}
                  {missatgeExit && (
                    <div className="flex items-center gap-2 p-2.5 bg-primary-container/20 border border-primary-container/40 rounded-lg text-primary-container font-body-md text-sm">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>{missatgeExit}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setMostrarFormulari(false)}
                      className="px-3 py-2 rounded-lg font-headline-sm text-sm text-text-muted hover:text-text-primary"
                    >
                      Cancel·lar
                    </button>
                    <button
                      type="submit"
                      className="bg-primary-container text-on-primary-container font-headline-sm text-sm font-bold px-4 py-2 rounded-lg hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span>Desar equip</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* CONTROLS DE CERCA I FILTRATGE */}
            <div className="flex flex-col gap-space-xs mt-1">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
                  search
                </span>
                <input
                  id="equipment-search"
                  type="text"
                  value={cerca}
                  onChange={(e) => setCerca(e.target.value)}
                  placeholder="Cerca per ID (ex. RB-PLAY-008)..."
                  className="w-full bg-surface-raised text-on-surface font-body-md text-body-md pl-10 pr-24 py-3 rounded-lg placeholder-text-dim focus:outline-none focus:bg-surface-overlay border border-border-hairline focus:border-border-active"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {/* Botó per alternar vista Targetes / Taula */}
                  <button
                    onClick={() => setVistaTaula((prev) => !prev)}
                    className="flex items-center gap-1 font-label-caps text-[10px] text-text-muted hover:text-text-primary bg-surface-overlay px-2 py-1 rounded border border-border-hairline"
                    title={vistaTaula ? 'Veure com a targetes' : 'Veure com a taula'}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {vistaTaula ? 'grid_view' : 'table_rows'}
                    </span>
                    <span>{vistaTaula ? 'TARGETES' : 'TAULA'}</span>
                  </button>
                  <span className="font-label-caps text-label-caps text-text-dim bg-surface-overlay px-1.5 py-0.5 rounded">
                    ⌘K
                  </span>
                </div>
              </div>

              {/* Fila de Filtres (Filter Chips) */}
              <div className="flex items-center gap-space-xs overflow-x-auto py-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setFilterEstat('all')}
                  className={`filter-chip flex-shrink-0 px-3 py-1.5 rounded-full font-label-caps text-label-caps transition-colors ${
                    filterEstat === 'all'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-raised text-on-surface hover:text-text-primary'
                  }`}
                >
                  TOTS ELS ESTATS ({totalEquips})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterEstat('apte')}
                  className={`filter-chip flex-shrink-0 px-3 py-1.5 rounded-full font-label-caps text-label-caps transition-colors ${
                    filterEstat === 'apte'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-raised text-on-surface hover:text-text-primary'
                  }`}
                >
                  APTE ({totalApte})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterEstat('prova')}
                  className={`filter-chip flex-shrink-0 px-3 py-1.5 rounded-full font-label-caps text-label-caps transition-colors ${
                    filterEstat === 'prova'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-raised text-on-surface hover:text-text-primary'
                  }`}
                >
                  EN PROVA ({totalEnProva})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterEstat('diagnosi')}
                  className={`filter-chip flex-shrink-0 px-3 py-1.5 rounded-full font-label-caps text-label-caps transition-colors ${
                    filterEstat === 'diagnosi'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-raised text-on-surface hover:text-text-primary'
                  }`}
                >
                  DIAGNOSI ({totalDiagnosi})
                </button>
              </div>
            </div>
          </div>

          {/* LLISTAT D'EQUIPS: VISTA TARGETES O TAULA */}
          <div className="flex flex-col gap-space-sm px-gutter-sm pb-space-md" id="equipment-list">
            {equipsFiltrats.length > 0 ? (
              vistaTaula ? (
                /* VISTA EN TAULA ESTILITZADA STITCH */
                <div className="bg-surface-raised rounded-xl overflow-x-auto border border-border-hairline shadow-sm">
                  <table className="w-full text-left border-collapse font-body-md text-sm">
                    <thead>
                      <tr className="border-b border-border-active/60 bg-surface-overlay/50">
                        <th className="p-3 font-label-caps text-label-caps text-text-muted">IDENTIFICADOR</th>
                        <th className="p-3 font-label-caps text-label-caps text-text-muted">TIPUS</th>
                        <th className="p-3 font-label-caps text-label-caps text-text-muted">ESTAT (CANVIAR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-hairline">
                      {equipsFiltrats.map((equip) => (
                        <tr key={equip.id} className="hover:bg-surface-overlay/30 transition-colors">
                          <td className="p-3 font-mono-data-lg text-mono-data-lg text-text-primary font-bold">
                            <span className="flex items-center gap-1.5">
                              {equip.id}
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  equip.estat === 'Apte'
                                    ? 'bg-primary-container'
                                    : equip.estat === 'En prova'
                                    ? 'bg-secondary'
                                    : 'bg-tertiary-fixed-dim'
                                }`}
                              ></span>
                            </span>
                          </td>
                          <td className="p-3 text-on-surface">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-text-muted">
                                {getDeviceIcon(equip.tipus)}
                              </span>
                              <span>{equip.tipus}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <select
                              value={equip.estat}
                              onChange={(e) => handleCanviEstat(equip.id, e.target.value)}
                              aria-label={`Canviar estat de ${equip.id}`}
                              className={`font-label-caps text-label-caps px-2.5 py-1 rounded-full cursor-pointer outline-none border transition-all ${
                                equip.estat === 'Apte'
                                  ? 'bg-primary-container/15 text-primary-container border-primary-container/40'
                                  : equip.estat === 'En prova'
                                  ? 'bg-secondary/15 text-secondary border-secondary/40'
                                  : 'bg-secondary-container/30 text-secondary-fixed-dim border-secondary-container/50'
                              }`}
                            >
                              {ESTATS_DISPONIBLES.map((estat) => (
                                <option key={estat} value={estat} className="bg-surface-raised text-on-surface">
                                  {estat}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* VISTA TARGETES STITCH (PREDETERMINADA) */
                equipsFiltrats.map((equip) => {
                  const specs = equip.specs || getDefaultSpecsForType(equip.tipus);
                  const isApte = equip.estat === 'Apte';
                  const isEnProva = equip.estat === 'En prova';

                  const badgeClass = isApte
                    ? 'bg-primary-container/15 text-primary-container'
                    : isEnProva
                    ? 'bg-secondary/15 text-secondary'
                    : 'bg-secondary-container/30 text-secondary-fixed-dim';

                  const dotColor = isApte
                    ? 'bg-primary-container'
                    : isEnProva
                    ? 'bg-secondary'
                    : 'bg-tertiary-fixed-dim';

                  const iconColor = isApte
                    ? 'text-primary-container'
                    : isEnProva
                    ? 'text-secondary'
                    : 'text-secondary-fixed';

                  return (
                    <div
                      key={equip.id}
                      className="equipment-card bg-surface-raised rounded-xl p-space-sm flex flex-col gap-space-sm shadow-sm border border-border-hairline"
                      data-id={equip.id}
                      data-category={equip.estat.toLowerCase()}
                    >
                      {/* Fila Superior de la Targeta */}
                      <div className="flex items-start justify-between gap-space-xs">
                        <div className="flex items-center gap-space-xs min-w-0">
                          <div
                            className={`w-10 h-10 rounded-lg bg-surface-overlay flex items-center justify-center flex-shrink-0 ${iconColor}`}
                          >
                            <span className="material-symbols-outlined text-[22px]">
                              {getDeviceIcon(equip.tipus)}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono-data-lg text-mono-data-lg text-text-primary font-bold">
                                {equip.id}
                              </span>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                            </div>
                            <span className="font-body-md text-body-md text-text-muted truncate">
                              {equip.model || `${equip.tipus} - Casal REBOOT`}
                            </span>
                          </div>
                        </div>

                        {/* Etiqueta d'estat superior */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-caps text-label-caps ${badgeClass}`}
                        >
                          {isApte
                            ? '[APTE PER JOC]'
                            : isEnProva
                            ? '[EN PROVA]'
                            : '[EN DIAGNOSI]'}
                        </span>
                      </div>

                      {/* Specs Pills Grid */}
                      <div className="grid grid-cols-2 gap-1.5 bg-surface-base/80 p-2.5 rounded-lg border border-border-hairline">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="material-symbols-outlined text-[14px] text-text-dim flex-shrink-0">
                            memory
                          </span>
                          <span className="font-mono-data-sm text-mono-data-sm text-on-surface truncate">
                            {specs.cpu}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="material-symbols-outlined text-[14px] text-text-dim flex-shrink-0">
                            videogame_asset
                          </span>
                          <span className={`font-mono-data-sm text-mono-data-sm truncate ${iconColor}`}>
                            {specs.gpu}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="material-symbols-outlined text-[14px] text-text-dim flex-shrink-0">
                            storage
                          </span>
                          <span className="font-mono-data-sm text-mono-data-sm text-on-surface truncate">
                            {specs.ram}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="material-symbols-outlined text-[14px] text-text-dim flex-shrink-0">
                            hard_drive
                          </span>
                          <span className="font-mono-data-sm text-mono-data-sm text-on-surface truncate">
                            {specs.disc}
                          </span>
                        </div>
                      </div>

                      {/* Selector desplegable interactiu per canviar l'estat */}
                      <div className="flex items-center justify-between gap-2 bg-surface-base/60 px-2.5 py-1.5 rounded-lg border border-border-hairline">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="material-symbols-outlined text-[15px] text-text-muted">
                            tune
                          </span>
                          <span className="font-label-caps text-label-caps text-text-muted uppercase text-[10px]">
                            CANVIAR ESTAT:
                          </span>
                        </div>
                        <select
                          value={equip.estat}
                          onChange={(e) => handleCanviEstat(equip.id, e.target.value)}
                          aria-label={`Canviar estat de l'equip ${equip.id}`}
                          className={`font-label-caps text-label-caps px-2.5 py-1 rounded-full cursor-pointer outline-none border transition-all ${
                            isApte
                              ? 'bg-primary-container/15 text-primary-container border-primary-container/40'
                              : isEnProva
                              ? 'bg-secondary/15 text-secondary border-secondary/40'
                              : 'bg-secondary-container/30 text-secondary-fixed-dim border-secondary-container/50'
                          }`}
                        >
                          {ESTATS_DISPONIBLES.map((estat) => (
                            <option key={estat} value={estat} className="bg-surface-raised text-on-surface">
                              {estat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Botons d'Acció de la Targeta */}
                      <div className="flex items-center gap-space-xs pt-1">
                        <button
                          type="button"
                          className={`flex-1 min-h-[42px] font-headline-sm text-headline-sm text-sm rounded-lg flex items-center justify-center gap-1 px-3 active:scale-[0.98] transition-transform ${
                            isApte
                              ? 'bg-primary-container text-on-primary-container font-bold'
                              : 'bg-surface-overlay text-text-primary hover:text-primary-container'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isApte ? 'read_more' : isEnProva ? 'network_check' : 'build'}
                          </span>
                          <span>
                            {isApte
                              ? 'Veure Fitxa de Vida'
                              : isEnProva
                              ? 'Dades de Prova'
                              : 'Inspeccionar Fallada'}
                          </span>
                        </button>
                        <button
                          aria-label="Passaport Públic QR"
                          type="button"
                          className="w-12 min-h-[42px] bg-surface-overlay text-text-primary rounded-lg flex items-center justify-center hover:text-primary-container active:scale-[0.98] transition-transform border border-border-hairline"
                        >
                          <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              <div className="bg-surface-raised rounded-xl p-8 text-center text-text-muted border border-border-hairline">
                <span className="material-symbols-outlined text-[36px] text-text-dim mb-2">
                  search_off
                </span>
                <p className="font-body-md">No s'ha trobat cap equip amb aquests criteris.</p>
              </div>
            )}
          </div>

          {/* ACCÉS RÀPID AL SISTEMA (HUB) */}
          <div className="px-gutter-sm pb-space-md">
            <div className="bg-surface-raised rounded-xl p-space-md flex flex-col gap-space-sm shadow-md border border-border-hairline">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container text-[20px]">hub</span>
                <span className="font-headline-sm text-headline-sm text-text-primary">
                  Accés Ràpid al Sistema
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-muted">
                Navega directament als formularis actius i als visors d'identitat verificada d'aquest node.
              </p>
              <div className="flex flex-col gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setMostrarFormulari(true)}
                  className="w-full bg-surface-overlay hover:bg-surface-container rounded-lg p-3 flex items-center justify-between transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-sm text-text-primary">
                        Formulari d'Alta d'Equip
                      </span>
                      <span className="font-mono-data-sm text-mono-data-sm text-text-muted">
                        Registrar xassís i components recuperats
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-text-dim text-[18px]">
                    chevron_right
                  </span>
                </button>

                <div className="w-full bg-surface-overlay hover:bg-surface-container rounded-lg p-3 flex items-center justify-between transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">memory</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-sm text-text-primary">
                        Fitxa de Vida ({devices[0]?.id || 'RB-A'})
                      </span>
                      <span className="font-mono-data-sm text-mono-data-sm text-text-muted">
                        Historial tècnic, peces substituïdes i benchmarks
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-text-dim text-[18px]">
                    chevron_right
                  </span>
                </div>

                <div className="w-full bg-surface-overlay hover:bg-surface-container rounded-lg p-3 flex items-center justify-between transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-sm text-text-primary">
                        Passaport Públic QR
                      </span>
                      <span className="font-mono-data-sm text-mono-data-sm text-text-muted">
                        Certificació comunitària de reparabilitat oberta
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-text-dim text-[18px]">
                    chevron_right
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* IMPACTE SOSTENIBLE AL FINAL */}
          <div className="px-gutter-sm pb-space-xl">
            <div className="w-full bg-surface-base rounded-xl p-space-md flex items-center gap-space-sm shadow-inner border border-border-hairline">
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center flex-shrink-0 text-primary-container">
                <span
                  className="material-symbols-outlined text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  eco
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-lg text-headline-lg text-primary-container leading-none font-bold">
                    3.360 kg
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    CO₂e EVITATS
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-muted text-xs mt-1">
                  Gràcies a la recuperació circular de maquinari al Casal de Joves per jocs lliures d'obsolescència.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BARRA DE NAVEGACIÓ INFERIOR FIXA */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-base/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.5)] border-t border-border-hairline"
        data-active-classes="text-primary-container"
      >
        <div className="flex justify-around items-center h-16 px-space-xs max-w-4xl mx-auto">
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-h-[44px] transition-colors text-primary-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            <span className="font-label-caps text-label-caps">INVENTARI</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-h-[44px] text-text-muted transition-colors hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">memory</span>
            <span className="font-label-caps text-label-caps">FITXA</span>
          </button>
          <button
            type="button"
            onClick={() => setMostrarFormulari(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-h-[44px] text-text-muted transition-colors hover:text-primary-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
            <span className="font-label-caps text-label-caps">ALTA</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-h-[44px] text-text-muted transition-colors hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">verified</span>
            <span className="font-label-caps text-label-caps">PASSAPORT</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
