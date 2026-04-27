import { MonitorUp, Save, Unplug } from 'lucide-react';

interface ViewerActionBarProps {
  onSave: () => void;
  onPublish: () => void;
  onExit: () => void;
  visible: boolean;
}

export function ViewerActionBar({ onSave, onPublish, onExit, visible }: ViewerActionBarProps) {
  if (!visible) return null;

  return (
    <div className="polygon-toolbar polygon-toolbar-action-bar">
      <div className="polygon-toolbar-group">
        <button
          className="toolbar-btn"
          onClick={onSave}
          title="Guardar"
        >
          <Save size={20} />
          <span className="toolbar-tooltip">Save</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={onPublish}
          title="Publish version"
        >
          <MonitorUp size={20} />
          <span className="toolbar-tooltip">Publish version</span>
        </button>
      </div>
      <div className="toolbar-divider" />
      <div className="polygon-toolbar-group">
        <button
          className="toolbar-btn toolbar-btn-exit"
          onClick={onExit}
          title="Exit"
        >
          <Unplug size={20} />
          <span className="toolbar-tooltip">Exit</span>
        </button>
      </div>
    </div>
  );
}
