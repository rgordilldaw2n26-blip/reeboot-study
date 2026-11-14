import { useState, useMemo, useEffect } from 'react';
import { INITIAL_DEVICES, TIPUS_EQUIP, ESTATS_DISPONIBLES } from '../data/devices';
import './Inventory.css';

const LOCAL_STORAGE_KEY = 'reeboot_inventory_devices';

export default function Inventory() {
  // Inicialització des de localStorage o amb les dades per defecte
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

  // Desa automàticament a localStorage quan canvia la llista d'equips
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(devices));
    } catch (err) {
      console.error("Error en desar les dades a localStorage:", err);
    }
  }, [devices]);

  const [filterEstat, setFilterEstat] = useState('tots');
  const [cerca, setCerca] = useState('');

  // Formulari de registre de nou equip
  const [nouTipus, setNouTipus] = useState('');
  const [errorValidacio, setErrorValidacio] = useState('');
  const [missatgeExit, setMissatgeExit] = useState('');

  // Càlcul de l'ID automàtic (RB-001, RB-002...)
  const seguentId = useMemo(() => {
    const numeros = devices.map((d) => {
      const match = d.id.match(/^RB-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = numeros.length > 0 ? Math.max(...numeros, 0) : 0;
    return `RB-${String(maxNum + 1).padStart(3, '0')}`;
  }, [devices]);

  // Gestió de l'enviament del formulari
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
      estat: 'En prova',
    };

    setDevices((prev) => [...prev, nouEquip]);
    setNouTipus('');
    setErrorValidacio('');
    setMissatgeExit(`S'ha donat d'alta l'equip ${seguentId} correctament.`);
  };

  // Canvi d'estat d'un equip des del desplegable
  const handleCanviEstat = (id, nouEstat) => {
    setDevices((prev) =>
      prev.map((equip) =>
        equip.id === id ? { ...equip, estat: nouEstat } : equip
      )
    );
  };

  // Recompte d'equips per a cada estat (a la part superior)
  const totalEquips = devices.length;
  const totalEnProva = devices.filter((d) => d.estat === 'En prova').length;
  const totalApte = devices.filter((d) => d.estat === 'Apte').length;
  const totalDiagnosi = devices.filter((d) => d.estat === 'Diagnosi').length;

  // Filtrar llista d'equips
  const equipsFiltrats = useMemo(() => {
    return devices.filter((equip) => {
      const coincideixEstat =
        filterEstat === 'tots' || equip.estat === filterEstat;
      const coincideixCerca =
        equip.id.toLowerCase().includes(cerca.toLowerCase()) ||
        equip.tipus.toLowerCase().includes(cerca.toLowerCase());
      return coincideixEstat && coincideixCerca;
    });
  }, [devices, filterEstat, cerca]);

  const getEstatClass = (estat) => {
    switch (estat) {
      case 'En prova':
        return 'estat-en-prova';
      case 'Apte':
        return 'estat-apte';
      case 'Diagnosi':
        return 'estat-diagnosi';
      default:
        return '';
    }
  };

  return (
    <div className="inventory-container">
      {/* Capçalera */}
      <header className="inventory-header">
        <div className="header-badge">REBOOT [client]</div>
        <h1 className="header-title">Inventari d'equips</h1>
        <p className="header-subtitle">
          Gestió i seguiment de l'estat dels equips informàtics disponibles.
        </p>
      </header>

      {/* Targetes de resum (Recompte d'equips per estat a la part superior) */}
      <section className="stats-grid" aria-label="Recompte d'equips per estat">
        <div className="stat-card">
          <span className="stat-label">Total d'equips</span>
          <span className="stat-value">{totalEquips}</span>
        </div>
        <div className="stat-card stat-en-prova">
          <span className="stat-label">En prova</span>
          <span className="stat-value">{totalEnProva}</span>
        </div>
        <div className="stat-card stat-apte">
          <span className="stat-label">Apte</span>
          <span className="stat-value">{totalApte}</span>
        </div>
        <div className="stat-card stat-diagnosi">
          <span className="stat-label">Diagnosi</span>
          <span className="stat-value">{totalDiagnosi}</span>
        </div>
      </section>

      {/* Formulari per donar d'alta un equip */}
      <section className="form-card">
        <h2 className="form-title">Donar d'alta un equip</h2>
        <form onSubmit={handleAltaEquip} className="add-device-form" noValidate>
          <div className="form-grid">
            {/* ID Generat automàticament */}
            <div className="form-group">
              <label htmlFor="device-id-field" className="form-label">
                Identificador (ID)
              </label>
              <div className="readonly-id-wrapper">
                <input
                  id="device-id-field"
                  type="text"
                  value={seguentId}
                  readOnly
                  disabled
                  className="form-input form-input-readonly font-mono"
                />
                <span className="form-helper-text">Generat automàticament</span>
              </div>
            </div>

            {/* Tipus d'equip */}
            <div className="form-group">
              <label htmlFor="device-type-select" className="form-label">
                Tipus d'equip <span className="required-star">*</span>
              </label>
              <select
                id="device-type-select"
                value={nouTipus}
                onChange={(e) => {
                  setNouTipus(e.target.value);
                  if (errorValidacio) setErrorValidacio('');
                }}
                className={`form-select ${errorValidacio ? 'input-error' : ''}`}
              >
                <option value="">-- Selecciona un tipus --</option>
                {TIPUS_EQUIP.map((tipus) => (
                  <option key={tipus} value={tipus}>
                    {tipus}
                  </option>
                ))}
              </select>
              <span className="form-helper-text">Llista de tipus del client</span>
            </div>

            {/* Estat inicial */}
            <div className="form-group">
              <label htmlFor="device-status-field" className="form-label">
                Estat inicial
              </label>
              <div className="initial-status-display">
                <span className="status-badge estat-en-prova">
                  <span className="status-dot"></span>
                  En prova
                </span>
                <span className="form-helper-text">Assignat per defecte</span>
              </div>
            </div>
          </div>

          {/* Missatge d'error de validació */}
          {errorValidacio && (
            <div className="form-message error-message" role="alert">
              <span className="message-icon" aria-hidden="true">⚠️</span>
              {errorValidacio}
            </div>
          )}

          {/* Missatge d'èxit */}
          {missatgeExit && (
            <div className="form-message success-message" role="status">
              <span className="message-icon" aria-hidden="true">✅</span>
              {missatgeExit}
            </div>
          )}

          {/* Botó per desar */}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Desar equip
            </button>
          </div>
        </form>
      </section>

      {/* Eines de cerca i filtratge */}
      <section className="inventory-controls">
        <div className="search-box">
          <label htmlFor="search-input" className="visually-hidden">
            Cerca equip
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="Cerca per ID o tipus d'equip..."
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <label htmlFor="filter-estat" className="filter-label">
            Estat:
          </label>
          <select
            id="filter-estat"
            value={filterEstat}
            onChange={(e) => setFilterEstat(e.target.value)}
            className="filter-select"
          >
            <option value="tots">Tots els estats</option>
            {ESTATS_DISPONIBLES.map((estat) => (
              <option key={estat} value={estat}>
                {estat}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Taula d'inventari */}
      <main className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th scope="col">Identificador (ID)</th>
              <th scope="col">Tipus</th>
              <th scope="col">Estat</th>
            </tr>
          </thead>
          <tbody>
            {equipsFiltrats.length > 0 ? (
              equipsFiltrats.map((equip) => (
                <tr key={equip.id}>
                  <td className="device-id font-mono">
                    <span className="id-tag">{equip.id}</span>
                  </td>
                  <td className="device-type">
                    <span className="type-icon" aria-hidden="true">💻</span>
                    {equip.tipus}
                  </td>
                  <td className="device-status">
                    {/* Desplegable per canviar l'estat de l'equip */}
                    <div className="status-dropdown-wrapper">
                      <label
                        htmlFor={`status-select-${equip.id}`}
                        className="visually-hidden"
                      >
                        Canvia l'estat de {equip.id}
                      </label>
                      <select
                        id={`status-select-${equip.id}`}
                        value={equip.estat}
                        onChange={(e) => handleCanviEstat(equip.id, e.target.value)}
                        className={`status-select ${getEstatClass(equip.estat)}`}
                        title={`Canvia l'estat de l'equip ${equip.id}`}
                      >
                        {ESTATS_DISPONIBLES.map((estat) => (
                          <option key={estat} value={estat}>
                            {estat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="empty-message">
                  No s'ha trobat cap equip amb aquests criteris de cerca.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>

      {/* Peu de taula amb resum de resultats */}
      <footer className="inventory-footer">
        <span>
          Mostrant {equipsFiltrats.length} de {totalEquips} equips
        </span>
      </footer>
    </div>
  );
}
