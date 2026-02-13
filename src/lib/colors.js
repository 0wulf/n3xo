// Default groups — used as seed; the store holds the live version
export const DEFAULT_GROUPS = {
  me:          { color: '#FACC15', bg: '#FACC1520', label: 'Me' },
  work:        { color: '#3B82F6', bg: '#3B82F620', label: 'Work' },
  university:  { color: '#8B5CF6', bg: '#8B5CF620', label: 'University' },
  event:       { color: '#F59E0B', bg: '#F59E0B20', label: 'Event' },
  friends:     { color: '#10B981', bg: '#10B98120', label: 'Friends' },
  family:      { color: '#EF4444', bg: '#EF444420', label: 'Family' },
  online:      { color: '#EC4899', bg: '#EC489920', label: 'Online' },
  community:   { color: '#06B6D4', bg: '#06B6D420', label: 'Community' },
  other:       { color: '#78716C', bg: '#78716C20', label: 'Other' },
};

// Default relation types — used as seed
export const DEFAULT_RELATION_TYPES = {
  friend:      { color: '#10B981', dash: null,    label: 'Friend' },
  colleague:   { color: '#3B82F6', dash: null,    label: 'Colleague' },
  mentor:      { color: '#F59E0B', dash: '6,3',   label: 'Mentor' },
  acquaintance:{ color: '#6B7280', dash: '3,3',   label: 'Acquaintance' },
  classmate:   { color: '#8B5CF6', dash: null,    label: 'Classmate' },
  neighbor:    { color: '#78716C', dash: '8,4',   label: 'Neighbor' },
  family:      { color: '#EF4444', dash: null,    label: 'Family' },
  other:       { color: '#9CA3AF', dash: '2,2',   label: 'Other' },
};

// Legacy aliases
export const GROUP_COLORS = DEFAULT_GROUPS;
export const RELATION_COLORS = DEFAULT_RELATION_TYPES;

const FALLBACK_GROUP = { color: '#78716C', bg: '#78716C20', label: 'Other' };
const FALLBACK_RELATION = { color: '#9CA3AF', dash: '2,2', label: 'Other' };

// Get color for a group — accepts optional custom map
export function getGroupColor(group, customGroups) {
  const map = customGroups || DEFAULT_GROUPS;
  return map[group] || FALLBACK_GROUP;
}

// Get style for a relation type — accepts optional custom map
export function getRelationStyle(type, customTypes) {
  const map = customTypes || DEFAULT_RELATION_TYPES;
  return map[type] || FALLBACK_RELATION;
}

// Generate initials from a name
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Strength to pixel width (1-5 → 1-5px)
export function strengthToWidth(strength) {
  return Math.max(1, Math.min(5, strength || 1)) * 1.2;
}

// Color palette for new custom groups/types
export const COLOR_PALETTE = [
  '#EF4444', '#F59E0B', '#FACC15', '#10B981', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6',
  '#6366F1', '#A855F7', '#E11D48', '#78716C', '#9CA3AF',
];
