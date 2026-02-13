import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import {
  Palette,
  Group,
  Layers,
  Download,
  Upload,
  Plus,
  Image as ImageIcon,
  FileJson,
  UserPlus,
  Link,
} from 'lucide-react';
import useGraphStore from '@/store/useGraphStore';
import { exportSVG, exportPNG, exportJSON, importJSON } from '@/lib/export';
import { useState, useRef, useEffect } from 'react';

export default function Toolbar() {
  const viewMode = useGraphStore((s) => s.viewMode);
  const setViewMode = useGraphStore((s) => s.setViewMode);
  const openForm = useGraphStore((s) => s.openForm);
  const exportData = useGraphStore((s) => s.exportData);
  const importData = useGraphStore((s) => s.importData);
  const [exportOpen, setExportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addRef.current && !addRef.current.contains(e.target)) setAddOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportSVG = () => {
    const svg = document.querySelector('.graph-container svg');
    if (svg) exportSVG(svg);
    setExportOpen(false);
  };

  const handleExportPNG = () => {
    const svg = document.querySelector('.graph-container svg');
    if (svg) exportPNG(svg);
    setExportOpen(false);
  };

  const handleExportJSON = () => {
    exportJSON(exportData());
    setExportOpen(false);
  };

  const handleImport = async () => {
    try {
      const data = await importJSON();
      importData(data);
    } catch (err) {
      console.error('Import failed:', err);
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
      {/* View Mode Toggle */}
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-1 shadow-lg">
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v)}>
          <ToggleGroupItem value="color" aria-label="Color mode" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Color</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="clusters" aria-label="Cluster mode" className="gap-1.5">
            <Group className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Clusters</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="combined" aria-label="Combined mode" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Both</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Add button with dropdown */}
      <div ref={addRef} className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-1 shadow-lg relative">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15"
          onClick={() => setAddOpen(!addOpen)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add</span>
        </Button>

        {addOpen && (
          <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-xl p-1 min-w-[140px]">
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-accent transition-colors cursor-pointer"
              onClick={() => { openForm('addPerson'); setAddOpen(false); }}
            >
              <UserPlus className="h-3.5 w-3.5" /> Person
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-accent transition-colors cursor-pointer"
              onClick={() => { openForm('addRelation'); setAddOpen(false); }}
            >
              <Link className="h-3.5 w-3.5" /> Relation
            </button>
          </div>
        )}
      </div>

      {/* Export/Import */}
      <div ref={exportRef} className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-1 shadow-lg flex gap-0.5 relative">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setExportOpen(!exportOpen)}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleImport}
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Import</span>
        </Button>

        {/* Export dropdown */}
        {exportOpen && (
          <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-xl p-1 min-w-[140px]">
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-accent transition-colors cursor-pointer"
              onClick={handleExportPNG}
            >
              <ImageIcon className="h-3.5 w-3.5" /> Export PNG
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-accent transition-colors cursor-pointer"
              onClick={handleExportSVG}
            >
              <FileJson className="h-3.5 w-3.5" /> Export SVG
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-accent transition-colors cursor-pointer"
              onClick={handleExportJSON}
            >
              <FileJson className="h-3.5 w-3.5" /> Export JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
