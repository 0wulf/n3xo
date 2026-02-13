import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2, Calendar, MapPin, Tag, ExternalLink, Users, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import useGraphStore from '@/store/useGraphStore';
import { getGroupColor, getRelationStyle } from '@/lib/colors';
import { formatDate } from '@/lib/date-utils';

export default function DetailPanel() {
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const selectedEdge = useGraphStore((s) => s.selectedEdge);
  const detailPanelOpen = useGraphStore((s) => s.detailPanelOpen);
  const clearSelection = useGraphStore((s) => s.clearSelection);
  const persons = useGraphStore((s) => s.persons);
  const relations = useGraphStore((s) => s.relations);
  const openForm = useGraphStore((s) => s.openForm);
  const deletePerson = useGraphStore((s) => s.deletePerson);
  const deleteRelation = useGraphStore((s) => s.deleteRelation);
  const customGroups = useGraphStore((s) => s.customGroups);
  const customRelationTypes = useGraphStore((s) => s.customRelationTypes);

  const gc = (group) => getGroupColor(group, customGroups);
  const rs = (type) => getRelationStyle(type, customRelationTypes);

  const person = selectedNode ? persons.find((p) => p.id === selectedNode) : null;
  const relation = selectedEdge ? relations.find((r) => r.id === selectedEdge) : null;

  const personConnections = person
    ? relations.filter((r) => r.source === person.id || r.target === person.id)
    : [];

  const getPersonName = (id) => {
    const p = persons.find((p) => p.id === id);
    return p ? p.name : 'Unknown';
  };

  return (
    <AnimatePresence>
      {detailPanelOpen && (person || relation) && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-[340px] z-30 bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-semibold">
              {person ? 'Person' : 'Relation'}
            </h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  if (person) openForm('editPerson', person);
                  if (relation) openForm('editRelation', relation);
                }}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive-foreground"
                onClick={() => {
                  if (person && confirm(`Delete ${person.name}?`)) {
                    deletePerson(person.id);
                  }
                  if (relation && confirm('Delete this relation?')) {
                    deleteRelation(relation.id);
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearSelection}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Person detail */}
          {person && (
            <div className="p-4 space-y-4">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: gc(person.group).color + '20',
                    color: gc(person.group).color,
                    border: `2px solid ${gc(person.group).color}`,
                  }}
                >
                  {person.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{person.name}</h4>
                  <Badge
                    className="text-[10px] mt-0.5"
                    style={{
                      backgroundColor: gc(person.group).color + '20',
                      color: gc(person.group).color,
                    }}
                  >
                    {gc(person.group).label}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{person.group === 'me' ? 'Birthday' : 'Met'}: {formatDate(person.metAt)}</span>
                </div>
                {person.group !== 'me' && person.metContext && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{person.metContext}</span>
                  </div>
                )}
                {person.tags && person.tags.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {person.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {person.notes && (
                <>
                  <Separator />
                  <p className="text-xs text-muted-foreground leading-relaxed">{person.notes}</p>
                </>
              )}

              {/* Socials */}
              {person.socials && Object.keys(person.socials).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    {Object.entries(person.socials).map(([platform, handle]) => (
                      <div key={platform} className="flex items-center gap-2 text-xs">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground capitalize">{platform}:</span>
                        <span className="font-medium">@{handle}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Connections */}
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Connections ({personConnections.length})
                  </h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 text-[10px] px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15"
                    onClick={() => openForm('addRelation', { prefilledSource: person.id })}
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {personConnections.map((rel) => {
                    const otherId = rel.source === person.id ? rel.target : rel.source;
                    const style = rs(rel.type);
                    return (
                      <div
                        key={rel.id}
                        className="flex items-center gap-2 text-xs p-1.5 rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => useGraphStore.getState().selectNode(otherId)}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: style.color }}
                        />
                        <span className="font-medium">{getPersonName(otherId)}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
                        <span className="text-muted-foreground">{style.label}</span>
                        <div className="ml-auto flex gap-0.5">
                          {Array.from({ length: rel.strength || 1 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: style.color }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Relation detail */}
          {relation && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  className="text-[10px]"
                  style={{
                    backgroundColor: rs(relation.type).color + '20',
                    color: rs(relation.type).color,
                  }}
                >
                  {rs(relation.type).label}
                </Badge>
                <div className="flex gap-0.5 ml-auto">
                  {Array.from({ length: relation.strength || 1 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: rs(relation.type).color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{getPersonName(relation.source)}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{getPersonName(relation.target)}</span>
              </div>

              {relation.label && (
                <p className="text-xs font-medium">{relation.label}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(relation.metDate)}</span>
                </div>
                {relation.metContext && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{relation.metContext}</span>
                  </div>
                )}
              </div>

              {relation.notes && (
                <>
                  <Separator />
                  <p className="text-xs text-muted-foreground leading-relaxed">{relation.notes}</p>
                </>
              )}

              {/* Evolution */}
              {relation.evolution && relation.evolution.length > 0 && (
                <>
                  <Separator />
                  <h5 className="text-xs font-semibold">Evolution</h5>
                  <div className="space-y-1.5 pl-2 border-l-2 border-border">
                    {relation.evolution.map((ev, i) => (
                      <div key={i} className="text-xs">
                        <span className="text-muted-foreground">{ev.date}</span>
                        <span className="mx-1.5">→</span>
                        <span className="font-medium capitalize">{ev.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
