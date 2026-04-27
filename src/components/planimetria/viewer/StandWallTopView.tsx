import { useMemo } from 'react';

interface StandWallTopViewProps {
  stand: {
    points?: Array<[number, number]>;
    wallSides?: number[];
  };
  canEdit: boolean;
  onToggleWallSide: (sideIndex: number) => void;
}

export function StandWallTopView({ stand, canEdit, onToggleWallSide }: StandWallTopViewProps) {
  const points = stand.points ?? [];
  const wallSides = stand.wallSides ?? [];

  const svgData = useMemo(() => {
    if (points.length < 3) return null;

    const PAD = 18;
    const SIZE = 152;
    const inner = SIZE - PAD * 2;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(([x, y]) => {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    });

    const rangeX = Math.max(0.01, maxX - minX);
    const rangeY = Math.max(0.01, maxY - minY);
    const scale = inner / Math.max(rangeX, rangeY);
    const offsetX = PAD + (inner - rangeX * scale) / 2;
    const offsetY = PAD + (inner - rangeY * scale) / 2;

    const toSVG = ([x, y]: [number, number]): [number, number] => [
      offsetX + (x - minX) * scale,
      offsetY + (y - minY) * scale,
    ];

    const svgPts = points.map(toSVG);
    const polyStr = svgPts.map(([x, y]) => `${x},${y}`).join(' ');

    const edges = points.map((p, i) => {
      const next = points[(i + 1) % points.length];
      const [x1, y1] = toSVG(p);
      const [x2, y2] = toSVG(next);
      const isActive = wallSides.includes(i);
      return { i, x1, y1, x2, y2, isActive };
    });

    return { polyStr, edges, SIZE };
  }, [points, wallSides]);

  if (!svgData) {
    return <div className="stand-wall-topview-empty">Geometría insuficiente</div>;
  }

  const { polyStr, edges, SIZE } = svgData;

  return (
    <div className="stand-wall-topview-wrap">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="stand-wall-topview-svg"
        aria-label="Vista de planta con paredes activas"
      >
        <polygon points={polyStr} className="swt-fill" />

        {edges.map((edge) => (
          <g key={`swt-edge-${edge.i}`}>
            {/* Transparent wide hit area */}
            <line
              x1={edge.x1} y1={edge.y1}
              x2={edge.x2} y2={edge.y2}
              stroke="transparent"
              strokeWidth={14}
              style={{ cursor: canEdit ? 'pointer' : 'default' }}
              onClick={() => canEdit && onToggleWallSide(edge.i)}
            />
            {/* Visual line */}
            <line
              x1={edge.x1} y1={edge.y1}
              x2={edge.x2} y2={edge.y2}
              className={edge.isActive ? 'swt-edge swt-edge--active' : 'swt-edge swt-edge--inactive'}
              style={{ pointerEvents: 'none' }}
            />
          </g>
        ))}
      </svg>

      <p className="stand-wall-topview-hint">
        {canEdit
          ? 'Clic en un lado para activar/desactivar · Herramienta de paredes para editar en 3D'
          : 'Vista de planta — paredes activas'}
      </p>
    </div>
  );
}
