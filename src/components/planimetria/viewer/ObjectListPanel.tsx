import React from 'react';

type ReservationItem = {
  id: string;
  standId: string;
  standCode?: string;
  company?: string;
  status: string;
  requester?: string;
};

interface ObjectListPanelProps {
  activeRole: string;
  roleLabels: Record<string, string>;
  objectSearchTerm: string;
  setObjectSearchTerm: (value: string) => void;
  filteredIslands: any[];
  stands: any[];
  focusTarget: any;
  setFocusTarget: (value: any) => void;
  handleFocusStand: (stand: any) => void;
  layerVisibility: { islands: boolean; stands: boolean };
  setLayerVisibility: (updater: (prev: { islands: boolean; stands: boolean }) => { islands: boolean; stands: boolean }) => void;
  reservations: ReservationItem[];
  canManageReservations: boolean;
  onQuickApproveReservation: (reservationId: string) => void;
  onQuickCancelReservation: (reservationId: string) => void;
}

export function ObjectListPanel({
  activeRole,
  roleLabels,
  objectSearchTerm,
  setObjectSearchTerm,
  filteredIslands,
  stands,
  focusTarget,
  setFocusTarget,
  handleFocusStand,
  layerVisibility,
  setLayerVisibility,
  reservations,
  canManageReservations,
  onQuickApproveReservation,
  onQuickCancelReservation,
}: ObjectListPanelProps) {
  const [activeTab, setActiveTab] = React.useState<'elements' | 'layers' | 'reservations'>('elements');
  const [reservationFilter, setReservationFilter] = React.useState<'all' | 'pending' | 'reserved' | 'available' | 'unavailable'>('all');
  const [sizeFilter, setSizeFilter] = React.useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'available' | 'reserved' | 'unavailable'>('all');

  const computeArea = (points: any[]) => {
    if (!points || points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      const [nx, ny] = points[(i + 1) % points.length];
      area += x * ny - nx * y;
    }
    return Math.abs(area / 2);
  };

  const getSizeCategory = (area: number) => {
    if (area < 20) return 'small';
    if (area < 50) return 'medium';
    return 'large';
  };

  const standsById = React.useMemo(() => {
    const next = new Map<string, any>();
    stands.forEach((stand) => {
      next.set(String(stand.id), stand);
      if (stand.fairStandId) {
        next.set(String(stand.fairStandId), stand);
      }
    });
    return next;
  }, [stands]);

  const pendingReservations = React.useMemo(
    () => reservations.filter((reservation) => ['solicitud', 'pendiente', 'en_revision'].includes(reservation.status)),
    [reservations]
  );

  const pendingStandIds = React.useMemo(() => {
    const ids = new Set<string>();
    pendingReservations.forEach((reservation) => ids.add(String(reservation.standId)));
    return ids;
  }, [pendingReservations]);

  const reservedStands = React.useMemo(
    () => stands.filter((stand) => stand.reserved || ['approved', 'sold'].includes(String(stand.sourceStatus))),
    [stands]
  );

  const availableStands = React.useMemo(
    () => stands.filter((stand) => !stand.reserved && ['available', 'proposed', 'review'].includes(String(stand.sourceStatus || 'available'))),
    [stands]
  );

  const unavailableStands = React.useMemo(
    () => stands.filter((stand) => ['blocked', 'unavailable', 'conflict'].includes(String(stand.sourceStatus))),
    [stands]
  );

  const filteredPendingReservations = React.useMemo(() => {
    const normalized = objectSearchTerm.trim().toLowerCase();
    if (!normalized) return pendingReservations;
    const matches = (value: unknown) => String(value ?? '').toLowerCase().includes(normalized);
    return pendingReservations.filter((reservation) => {
      const stand = standsById.get(String(reservation.standId));
      return (
        matches(reservation.company) ||
        matches(reservation.requester) ||
        matches(reservation.standCode) ||
        matches(stand?.name) ||
        matches(stand?.id)
      );
    });
  }, [objectSearchTerm, pendingReservations, standsById]);

  const showPending = reservationFilter === 'all' || reservationFilter === 'pending';
  const showReserved = reservationFilter === 'all' || reservationFilter === 'reserved';
  const showAvailable = reservationFilter === 'all' || reservationFilter === 'available';
  const showUnavailable = reservationFilter === 'all' || reservationFilter === 'unavailable';

  const renderStandList = (items: any[], emptyLabel: string) => {
    if (!items.length) {
      return <div className="object-list-empty">{emptyLabel}</div>;
    }

    return (
      <div className="object-list-items">
        {items.map((stand) => (
          <button
            key={stand.id}
            className={`object-list-item ${stand.reserved ? 'is-reserved' : ''} ${focusTarget?.type === 'stand' && focusTarget.id === stand.id ? 'is-active' : ''}`}
            onClick={() => handleFocusStand(stand)}
          >
            <span>{stand.name}</span>
            <small>{stand.reservedBy || stand.sourceStatus || (stand.reserved ? 'Reservado' : 'Libre')}</small>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="polygon-card ds-card object-list-panel">
      <div className="object-list-header">
        <h4>Navegacion</h4>
        <div className="mvp-field">
          <span className="mvp-field-label">Perfil activo</span>
          <div className="min-h-[40px] border-2 border-border bg-background px-3 py-2 text-[13px] text-foreground">
            {roleLabels[activeRole] || activeRole}
          </div>
        </div>
        <div className="object-list-tabs" role="tablist" aria-label="Panel de navegacion">
          <button
            className={`object-list-tab ${activeTab === 'elements' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('elements')}
            role="tab"
            aria-selected={activeTab === 'elements'}
          >
            Elementos
          </button>
          <button
            className={`object-list-tab ${activeTab === 'layers' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('layers')}
            role="tab"
            aria-selected={activeTab === 'layers'}
          >
            Capas
          </button>
          <button
            className={`object-list-tab ${activeTab === 'reservations' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('reservations')}
            role="tab"
            aria-selected={activeTab === 'reservations'}
          >
            Reservas
          </button>
        </div>

        {activeTab !== 'layers' && (
          <input
            type="text"
            value={objectSearchTerm}
            onChange={(e) => setObjectSearchTerm(e.target.value)}
            placeholder={activeTab === 'elements' ? 'Buscar isla o stand...' : 'Buscar por empresa o stand...'}
            className="object-list-search"
          />
        )}

        {activeTab === 'elements' && (
          <div className="object-list-filters">
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value as 'all' | 'small' | 'medium' | 'large')}
              aria-label="Filtrar por tamaño"
            >
              <option value="all">Todos los tamaños</option>
              <option value="small">Pequeño (&lt;20m²)</option>
              <option value="medium">Mediano (20-50m²)</option>
              <option value="large">Grande (&gt;50m²)</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'reserved' | 'unavailable')}
              aria-label="Filtrar por estado"
            >
              <option value="all">Todos los estados</option>
              <option value="available">Disponible</option>
              <option value="reserved">Reservado</option>
              <option value="unavailable">No disponible</option>
            </select>
          </div>
        )}

        {activeTab === 'reservations' && (
          <select
            value={reservationFilter}
            onChange={(event) => setReservationFilter(event.target.value as 'all' | 'pending' | 'reserved' | 'available' | 'unavailable')}
            aria-label="Filtrar reservas"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Reservas pendientes</option>
            <option value="reserved">Stands reservados</option>
            <option value="available">Stands disponibles</option>
            <option value="unavailable">Stands no disponibles</option>
          </select>
        )}
      </div>
      {activeTab === 'elements' && (
        <div className="object-list-section">
          <div className="object-list-groups">
            {filteredIslands.map((island) => {
              const allIslandStands = stands.filter((s) => s.islandId === island.id);
              const filteredIslandStands = allIslandStands.filter((stand) => {
                const area = computeArea(stand.points);
                const sizeCategory = getSizeCategory(area);
                const isAvailable = !stand.reserved && ['available', 'proposed', 'review'].includes(String(stand.sourceStatus || 'available'));
                const isReserved = stand.reserved || ['approved', 'sold'].includes(String(stand.sourceStatus));
                const isUnavailable = ['blocked', 'unavailable', 'conflict'].includes(String(stand.sourceStatus));

                if (sizeFilter !== 'all' && sizeCategory !== sizeFilter) return false;
                if (statusFilter === 'available' && !isAvailable) return false;
                if (statusFilter === 'reserved' && !isReserved) return false;
                if (statusFilter === 'unavailable' && !isUnavailable) return false;

                return true;
              });

              return (
                <div key={island.id} className="object-list-group">
                  <button
                    className={`object-list-item ${focusTarget?.type === 'island' && focusTarget.id === island.id ? 'is-active' : ''}`}
                    onClick={() => setFocusTarget({ id: island.id, type: 'island', x: island.position[0], y: island.position[1], z: island.position[2] })}
                    style={{ border: 'none', background: 'transparent', padding: '0 0 6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: 0, marginBottom: '6px' }}
                  >
                    <strong style={{ fontSize: '13px', color: 'var(--ds-text-primary)' }}>{island.name}</strong>
                    <small>{filteredIslandStands.length} stands</small>
                  </button>
                  {filteredIslandStands.length > 0 && (
                    <div className="object-list-items" style={{ marginLeft: '4px', paddingLeft: '8px', borderLeft: '1px solid var(--ds-border-medium)' }}>
                      {filteredIslandStands.map((stand) => {
                        const area = computeArea(stand.points);
                        return (
                          <button
                            key={stand.id}
                            className={`object-list-item ${stand.reserved ? 'is-reserved' : ''} ${focusTarget?.type === 'stand' && focusTarget.id === stand.id ? 'is-active' : ''}`}
                            onClick={() => handleFocusStand(stand)}
                          >
                            <span>{stand.name}</span>
                            <small>{area.toFixed(1)}m² · {stand.reserved ? (stand.reservedBy || 'Reservado') : 'Libre'}</small>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'layers' && (
        <div className="object-list-section">
          <div className="object-list-toggles object-list-toggles-vertical">
            <label>
              <input
                type="checkbox"
                checked={layerVisibility.islands}
                onChange={() => setLayerVisibility((prev) => ({ ...prev, islands: !prev.islands }))}
              />{' '}
              Ver islas
            </label>
            <label className="mvp-field">
              <input
                type="checkbox"
                checked={layerVisibility.stands}
                onChange={() => setLayerVisibility((prev) => ({ ...prev, stands: !prev.stands }))}
              />{' '}
              Ver stands
            </label>
          </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="object-list-section object-reservations-section">
          {showPending && (
            <div className="object-list-group">
              <div className="object-list-group-title">
                <strong>Reservas pendientes</strong>
                <small>{filteredPendingReservations.length}</small>
              </div>
              {filteredPendingReservations.length === 0 ? (
                <div className="object-list-empty">No hay reservas pendientes.</div>
              ) : (
                <div className="object-list-items">
                  {filteredPendingReservations.map((reservation) => {
                    const linkedStand = standsById.get(String(reservation.standId));
                    return (
                      <div key={reservation.id} className="object-reservation-row">
                        <button
                          className={`object-list-item ${focusTarget?.type === 'stand' && linkedStand && focusTarget.id === linkedStand.id ? 'is-active' : ''}`}
                          onClick={() => linkedStand && handleFocusStand(linkedStand)}
                        >
                          <span>{linkedStand?.name || reservation.standCode || reservation.standId}</span>
                          <small>{reservation.company || reservation.requester || reservation.status}</small>
                        </button>
                        <div className="object-reservation-actions-inline">
                          <button
                            className="ds-btn ds-btn-outline"
                            onClick={() => onQuickApproveReservation(reservation.id)}
                            disabled={!canManageReservations}
                          >
                            Confirmar
                          </button>
                          <button
                            className="ds-btn ds-btn-outline"
                            onClick={() => onQuickCancelReservation(reservation.id)}
                            disabled={!canManageReservations}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {showReserved && (
            <div className="object-list-group">
              <div className="object-list-group-title">
                <strong>Stands reservados</strong>
                <small>{reservedStands.length}</small>
              </div>
              {renderStandList(reservedStands, 'No hay stands reservados.')}
            </div>
          )}

          {showAvailable && (
            <div className="object-list-group">
              <div className="object-list-group-title">
                <strong>Stands disponibles</strong>
                <small>{availableStands.length}</small>
              </div>
              {renderStandList(availableStands, 'No hay stands disponibles.')}
            </div>
          )}

          {showUnavailable && (
            <div className="object-list-group">
              <div className="object-list-group-title">
                <strong>Stands no disponibles</strong>
                <small>{unavailableStands.length}</small>
              </div>
              {renderStandList(unavailableStands, 'No hay stands no disponibles.')}
            </div>
          )}

          {(showReserved || showAvailable || showUnavailable) && pendingStandIds.size > 0 && (
            <div className="object-list-inline-hint">Hay {pendingStandIds.size} stands con solicitudes en curso.</div>
          )}
        </div>
      )}
    </div>
  );
}
