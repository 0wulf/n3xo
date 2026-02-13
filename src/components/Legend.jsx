import { useMemo } from 'react';
import useGraphStore from '@/store/useGraphStore';

export default function Legend() {
  const persons = useGraphStore((s) => s.persons);
  const relations = useGraphStore((s) => s.relations);
  const filters = useGraphStore((s) => s.filters);
  const customGroups = useGraphStore((s) => s.customGroups);
  const customRelationTypes = useGraphStore((s) => s.customRelationTypes);

  const filteredData = useMemo(() => {
    return useGraphStore.getState().getFilteredData();
  }, [persons, relations, filters]);

  // Only show groups and relation types that are present in current data
  const activeGroups = [...new Set(filteredData.persons.map((p) => p.group))];
  const activeTypes = [...new Set(filteredData.relations.map((r) => r.type))];

  if (activeGroups.length === 0) return null;

  return (
    <div className="absolute bottom-24 left-4 z-20">
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl shadow-lg p-3 space-y-2 max-w-[180px]">
        <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Groups
        </h5>
        <div className="space-y-1">
          {activeGroups.map((key) => {
            const g = customGroups[key] || { color: '#78716C', label: key };
            return (
              <div key={key} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: g.color }}
                />
                <span>{g.label}</span>
              </div>
            );
          })}
        </div>

        {activeTypes.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Relations
            </h5>
            <div className="space-y-1">
              {activeTypes.map((key) => {
                const r = customRelationTypes[key] || { color: '#9CA3AF', dash: null, label: key };
                return (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <div className="w-5 flex items-center">
                      <div
                        className="h-0.5 w-full rounded"
                        style={{
                          backgroundColor: r.color,
                          ...(r.dash ? { backgroundImage: `repeating-linear-gradient(90deg, ${r.color} 0px, ${r.color} 3px, transparent 3px, transparent 6px)`, backgroundColor: 'transparent' } : {}),
                        }}
                      />
                    </div>
                    <span>{r.label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
