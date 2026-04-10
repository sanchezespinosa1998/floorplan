import React from 'react';

interface ObjectPropertiesPanelProps {
  selectedObject: any;
  focusTarget: any;
  objectNameDraft: string;
  setObjectNameDraft: (value: string) => void;
  handleRenameSelectedObject: () => void;
  canEditObjectType: (type: string) => boolean;
  selectedObjectMetrics: any;
  onApplyObjectTransform: (payload: { x: number; z: number; rotationDeg: number }) => void;
  onApplyObjectArea: (area: number) => void;
  canManageReservations: boolean;
  openReservationForm: () => void;
  handleReleaseSelectedStand: () => void;
}

export function ObjectPropertiesPanel({
  selectedObject,
  focusTarget,
  objectNameDraft,
  setObjectNameDraft,
  handleRenameSelectedObject,
  canEditObjectType,
  selectedObjectMetrics,
  onApplyObjectTransform,
  onApplyObjectArea,
  canManageReservations,
  openReservationForm,
  handleReleaseSelectedStand,
}: ObjectPropertiesPanelProps) {
  const [transformDraft, setTransformDraft] = React.useState({ x: '', z: '', rotationDeg: '', area: '' });

  React.useEffect(() => {
    if (!selectedObject) {
      setTransformDraft({ x: '', z: '', rotationDeg: '', area: '' });
      return;
    }

    setTransformDraft({
      x: String(Number(selectedObject.position?.[0] ?? 0).toFixed(2)),
      z: String(Number(selectedObject.position?.[2] ?? 0).toFixed(2)),
      rotationDeg: String((((selectedObject.rotationY ?? 0) * 180) / Math.PI).toFixed(1)),
      area: selectedObjectMetrics ? String(Number(selectedObjectMetrics.area).toFixed(2)) : '',
    });
  }, [selectedObject, selectedObjectMetrics]);

  const canEditSelectedObject = Boolean(focusTarget && canEditObjectType(focusTarget.type));

  const handleApplyTransform = () => {
    const x = Number(transformDraft.x);
    const z = Number(transformDraft.z);
    const rotationDeg = Number(transformDraft.rotationDeg);
    if ([x, z, rotationDeg].some((value) => Number.isNaN(value))) return;
    onApplyObjectTransform({ x, z, rotationDeg });
  };

  const handleApplyArea = () => {
    const area = Number(transformDraft.area);
    if (Number.isNaN(area) || area <= 0) return;
    onApplyObjectArea(area);
  };

  return (
    <div className="polygon-card ds-card object-properties-panel">
      <h4>Propiedades</h4>
      {selectedObject ? (
        <div className="object-properties-content">
          <div className="object-property-row"><span>Tipo</span><strong>{focusTarget?.type === 'island' ? 'Isla' : 'Stand'}</strong></div>
          <div className="object-property-row"><span>ID</span><strong>{String(selectedObject.id)}</strong></div>
          <div className="object-property-row object-property-row-name">
            <span>Nombre</span>
            <div className="object-name-editor">
              <input
                type="text"
                value={objectNameDraft}
                onChange={(e) => setObjectNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRenameSelectedObject();
                  }
                }}
                disabled={!canEditObjectType(focusTarget.type)}
              />
              <button
                className="ds-btn ds-btn-outline"
                onClick={handleRenameSelectedObject}
                disabled={!canEditObjectType(focusTarget.type) || !objectNameDraft.trim() || objectNameDraft.trim() === selectedObject.name}
              >
                Guardar
              </button>
            </div>
          </div>
          <div className="object-transform-grid">
            <label className="object-transform-field">
              <span>Posición X</span>
              <input
                type="number"
                step="0.1"
                value={transformDraft.x}
                onChange={(e) => setTransformDraft((prev) => ({ ...prev, x: e.target.value }))}
                disabled={!canEditSelectedObject}
              />
            </label>
            <label className="object-transform-field">
              <span>Posición Z</span>
              <input
                type="number"
                step="0.1"
                value={transformDraft.z}
                onChange={(e) => setTransformDraft((prev) => ({ ...prev, z: e.target.value }))}
                disabled={!canEditSelectedObject}
              />
            </label>
            <label className="object-transform-field">
              <span>Rotación</span>
              <input
                type="number"
                step="1"
                value={transformDraft.rotationDeg}
                onChange={(e) => setTransformDraft((prev) => ({ ...prev, rotationDeg: e.target.value }))}
                disabled={!canEditSelectedObject}
              />
            </label>
            <button className="ds-btn ds-btn-outline object-transform-apply" onClick={handleApplyTransform} disabled={!canEditSelectedObject}>
              Aplicar transform
            </button>
          </div>
          {selectedObjectMetrics && (
            <>
              <div className="object-transform-grid object-transform-grid-area">
                <label className="object-transform-field">
                  <span>Área</span>
                  <input
                    type="number"
                    step="0.1"
                    value={transformDraft.area}
                    onChange={(e) => setTransformDraft((prev) => ({ ...prev, area: e.target.value }))}
                    disabled={!canEditSelectedObject}
                  />
                </label>
                <button className="ds-btn ds-btn-outline object-transform-apply" onClick={handleApplyArea} disabled={!canEditSelectedObject}>
                  Aplicar area
                </button>
              </div>
              <div className="object-property-row"><span>Ancho</span><strong>{selectedObjectMetrics.width.toFixed(2)} m</strong></div>
              <div className="object-property-row"><span>Fondo</span><strong>{selectedObjectMetrics.depth.toFixed(2)} m</strong></div>
              <div className="object-property-row"><span>Perímetro</span><strong>{selectedObjectMetrics.perimeter.toFixed(2)} m</strong></div>
            </>
          )}
          {focusTarget?.type === 'stand' && (
            <div className="object-reservation-block">
              <span className={`mvp-reservation-chip ${selectedObject.reserved ? 'is-reserved' : 'is-free'}`}>
                {selectedObject.reserved ? 'Reservado' : 'Disponible'}
              </span>
              {selectedObject.sourceStatus && (
                <div className="object-property-row"><span>Estado global</span><strong>{selectedObject.sourceStatus}</strong></div>
              )}
              {selectedObject.typeLabel && (
                <div className="object-property-row"><span>Tipo</span><strong>{selectedObject.typeLabel}</strong></div>
              )}
              <div className="object-reservation-actions">
                <button
                  className="ds-btn ds-btn-outline"
                  onClick={openReservationForm}
                  disabled={!canManageReservations || selectedObject.reserved}
                >
                  Reservar
                </button>
                <button
                  className="ds-btn ds-btn-outline"
                  onClick={handleReleaseSelectedStand}
                  disabled={!canManageReservations || !selectedObject.reserved}
                >
                  Liberar
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="object-properties-empty">Selecciona una isla o un stand para ver sus propiedades.</p>
      )}
    </div>
  );
}
