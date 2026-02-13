import { useState } from 'react';
import { Settings, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import useGraphStore from '@/store/useGraphStore';
import { COLOR_PALETTE } from '@/lib/colors';

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const customGroups = useGraphStore((s) => s.customGroups);
  const customRelationTypes = useGraphStore((s) => s.customRelationTypes);
  const addGroup = useGraphStore((s) => s.addGroup);
  const updateGroup = useGraphStore((s) => s.updateGroup);
  const deleteGroup = useGraphStore((s) => s.deleteGroup);
  const addRelationType = useGraphStore((s) => s.addRelationType);
  const updateRelationType = useGraphStore((s) => s.updateRelationType);
  const deleteRelationType = useGraphStore((s) => s.deleteRelationType);

  const [newGroup, setNewGroup] = useState(() => ({ label: '', color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)] }));
  const [newRelType, setNewRelType] = useState(() => ({ label: '', color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)], dash: '' }));

  const handleAddGroup = () => {
    if (!newGroup.label.trim()) return;
    const key = newGroup.label.trim().toLowerCase().replace(/\s+/g, '-');
    if (customGroups[key]) { alert('That group already exists'); return; }
    addGroup(key, newGroup);
    setNewGroup({ label: '', color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)] });
  };

  const handleAddRelType = () => {
    if (!newRelType.label.trim()) return;
    const key = newRelType.label.trim().toLowerCase().replace(/\s+/g, '-');
    if (customRelationTypes[key]) { alert('That type already exists'); return; }
    addRelationType(key, newRelType);
    setNewRelType({ label: '', color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)], dash: '' });
  };

  if (!open) {
    return (
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 bg-card/80 backdrop-blur-xl border border-border rounded-xl shadow-lg hover:bg-accent"
          onClick={() => setOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-30 w-[320px] max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4" /> Settings
        </h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="p-3 space-y-4">
        {/* ── Groups ── */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Groups</h4>
          <div className="space-y-1.5">
            {Object.entries(customGroups).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2 text-xs group">
                <input
                  type="color"
                  value={val.color}
                  onChange={(e) => updateGroup(key, { color: e.target.value, label: val.label })}
                  className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent p-0"
                  disabled={key === 'me'}
                />
                <Input
                  value={val.label}
                  onChange={(e) => updateGroup(key, { color: val.color, label: e.target.value })}
                  className="h-7 text-xs flex-1"
                  disabled={key === 'me'}
                />
                {key !== 'me' && key !== 'other' && (
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive-foreground cursor-pointer"
                    onClick={() => deleteGroup(key)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {key === 'me' && (
                  <span className="text-[9px] text-yellow-500 font-medium">special</span>
                )}
              </div>
            ))}
          </div>

          {/* Add new group */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="color"
              value={newGroup.color}
              onChange={(e) => setNewGroup({ ...newGroup, color: e.target.value })}
              className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent p-0"
            />
            <Input
              value={newGroup.label}
              onChange={(e) => setNewGroup({ ...newGroup, label: e.target.value })}
              placeholder="New group..."
              className="h-7 text-xs flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15"
              onClick={handleAddGroup}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* ── Relation Types ── */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Relation Types</h4>
          <div className="space-y-1.5">
            {Object.entries(customRelationTypes).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2 text-xs group">
                <input
                  type="color"
                  value={val.color}
                  onChange={(e) => updateRelationType(key, { color: e.target.value })}
                  className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent p-0"
                />
                <Input
                  value={val.label}
                  onChange={(e) => updateRelationType(key, { label: e.target.value })}
                  className="h-7 text-xs flex-1"
                />
                <Input
                  value={val.dash || ''}
                  onChange={(e) => updateRelationType(key, { dash: e.target.value || null })}
                  placeholder="dash"
                  className="h-7 text-xs w-14"
                  title="Dash pattern (e.g. 6,3). Empty = solid line"
                />
                {key !== 'other' && (
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive-foreground cursor-pointer"
                    onClick={() => deleteRelationType(key)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add new relation type */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="color"
              value={newRelType.color}
              onChange={(e) => setNewRelType({ ...newRelType, color: e.target.value })}
              className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent p-0"
            />
            <Input
              value={newRelType.label}
              onChange={(e) => setNewRelType({ ...newRelType, label: e.target.value })}
              placeholder="New type..."
              className="h-7 text-xs flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRelType()}
            />
            <Input
              value={newRelType.dash}
              onChange={(e) => setNewRelType({ ...newRelType, dash: e.target.value })}
              placeholder="dash"
              className="h-7 text-xs w-14"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15"
              onClick={handleAddRelType}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
