import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import graphData from '../../data/graph-data.json';
import { isDateInRange } from '../lib/date-utils';
import { DEFAULT_GROUPS, DEFAULT_RELATION_TYPES } from '../lib/colors';

const useGraphStore = create(
  persist(
    (set, get) => ({
      // ── Data ──────────────────────────────────
      persons: graphData.persons,
      relations: graphData.relations,
      config: graphData.config,

      // ── Custom Groups & Relation Types ────────
      customGroups: { ...DEFAULT_GROUPS },
      customRelationTypes: { ...DEFAULT_RELATION_TYPES },

      // ── Filters ───────────────────────────────
      filters: {
        dateRange: { start: null, end: null },
        groups: [],           // empty = all
        relationTypes: [],    // empty = all
        searchQuery: '',
      },

      // ── UI State ──────────────────────────────
      viewMode: 'color',      // 'color' | 'clusters' | 'combined'
      selectedNode: null,     // person id
      selectedEdge: null,     // relation id
      detailPanelOpen: false,
      formModal: null,        // null | 'addPerson' | 'addRelation' | 'editPerson' | 'editRelation'
      editingItem: null,      // the item being edited

      // ── Filter Actions ────────────────────────
      setDateRange: (start, end) =>
        set((s) => ({ filters: { ...s.filters, dateRange: { start, end } } })),

      setGroupFilter: (groups) =>
        set((s) => ({ filters: { ...s.filters, groups } })),

      setRelationTypeFilter: (types) =>
        set((s) => ({ filters: { ...s.filters, relationTypes: types } })),

      setSearchQuery: (query) =>
        set((s) => ({ filters: { ...s.filters, searchQuery: query } })),

      clearFilters: () =>
        set({
          filters: {
            dateRange: { start: null, end: null },
            groups: [],
            relationTypes: [],
            searchQuery: '',
          },
        }),

      // ── View Mode ─────────────────────────────
      setViewMode: (mode) => set({ viewMode: mode }),

      // ── Selection ─────────────────────────────
      selectNode: (id) =>
        set({ selectedNode: id, selectedEdge: null, detailPanelOpen: !!id }),

      selectEdge: (id) =>
        set({ selectedEdge: id, selectedNode: null, detailPanelOpen: !!id }),

      clearSelection: () =>
        set({ selectedNode: null, selectedEdge: null, detailPanelOpen: false }),

      // ── CRUD: Persons ─────────────────────────
      addPerson: (person) =>
        set((s) => {
          // Enforce only one "me"
          if (person.group === 'me' && s.persons.some((p) => p.group === 'me')) {
            alert('A person with the "Me" group already exists. Only one is allowed.');
            return {};
          }
          return { persons: [...s.persons, { ...person, id: `p${Date.now()}` }] };
        }),

      updatePerson: (id, updates) =>
        set((s) => {
          if (updates.group === 'me') {
            const existing = s.persons.find((p) => p.group === 'me' && p.id !== id);
            if (existing) {
              alert('A person with the "Me" group already exists. Only one is allowed.');
              return {};
            }
          }
          return { persons: s.persons.map((p) => (p.id === id ? { ...p, ...updates } : p)) };
        }),

      deletePerson: (id) =>
        set((s) => ({
          persons: s.persons.filter((p) => p.id !== id),
          relations: s.relations.filter((r) => r.source !== id && r.target !== id),
          selectedNode: s.selectedNode === id ? null : s.selectedNode,
          detailPanelOpen: s.selectedNode === id ? false : s.detailPanelOpen,
        })),

      // ── CRUD: Relations ───────────────────────
      addRelation: (relation) =>
        set((s) => ({
          relations: [...s.relations, { ...relation, id: `r${Date.now()}` }],
        })),

      updateRelation: (id, updates) =>
        set((s) => ({
          relations: s.relations.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteRelation: (id) =>
        set((s) => ({
          relations: s.relations.filter((r) => r.id !== id),
          selectedEdge: s.selectedEdge === id ? null : s.selectedEdge,
          detailPanelOpen: s.selectedEdge === id ? false : s.detailPanelOpen,
        })),

      // ── Form Modal ────────────────────────────
      openForm: (type, item = null) =>
        set({ formModal: type, editingItem: item }),

      closeForm: () =>
        set({ formModal: null, editingItem: null }),

      // ── CRUD: Custom Groups ───────────────────
      addGroup: (key, data) =>
        set((s) => ({
          customGroups: { ...s.customGroups, [key]: { color: data.color, bg: data.color + '20', label: data.label } },
        })),

      updateGroup: (key, data) =>
        set((s) => ({
          customGroups: { ...s.customGroups, [key]: { ...s.customGroups[key], ...data, bg: (data.color || s.customGroups[key]?.color) + '20' } },
        })),

      deleteGroup: (key) =>
        set((s) => {
          if (key === 'me' || key === 'other') return {}; // protected
          const { [key]: _, ...rest } = s.customGroups;
          // Reassign persons in deleted group to 'other'
          return {
            customGroups: rest,
            persons: s.persons.map((p) => p.group === key ? { ...p, group: 'other' } : p),
          };
        }),

      // ── CRUD: Custom Relation Types ───────────
      addRelationType: (key, data) =>
        set((s) => ({
          customRelationTypes: { ...s.customRelationTypes, [key]: { color: data.color, dash: data.dash || null, label: data.label } },
        })),

      updateRelationType: (key, data) =>
        set((s) => ({
          customRelationTypes: { ...s.customRelationTypes, [key]: { ...s.customRelationTypes[key], ...data } },
        })),

      deleteRelationType: (key) =>
        set((s) => {
          if (key === 'other') return {}; // protected
          const { [key]: _, ...rest } = s.customRelationTypes;
          return {
            customRelationTypes: rest,
            relations: s.relations.map((r) => r.type === key ? { ...r, type: 'other' } : r),
          };
        }),

      // ── Import/Export ─────────────────────────
      importData: (data) =>
        set({
          persons: data.persons || [],
          relations: data.relations || [],
          config: data.config || get().config,
        }),

      exportData: () => {
        const { persons, relations, config } = get();
        return { persons, relations, config };
      },

      resetToDefault: () =>
        set({
          persons: graphData.persons,
          relations: graphData.relations,
          config: graphData.config,
        }),

      // ── Computed (selectors) ──────────────────
      getFilteredData: () => {
        const { persons, relations, filters } = get();
        const { dateRange, groups, relationTypes, searchQuery } = filters;

        // Filter persons
        let filteredPersons = persons.filter((p) => {
          // Date filter
          if (!isDateInRange(p.metAt, dateRange.start, dateRange.end)) return false;
          // Group filter
          if (groups.length > 0 && !groups.includes(p.group)) return false;
          // Search filter
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const match =
              p.name.toLowerCase().includes(q) ||
              (p.notes && p.notes.toLowerCase().includes(q)) ||
              (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));
            if (!match) return false;
          }
          return true;
        });

        const personIds = new Set(filteredPersons.map((p) => p.id));

        // Filter relations
        let filteredRelations = relations.filter((r) => {
          if (!personIds.has(r.source) || !personIds.has(r.target)) return false;
          if (relationTypes.length > 0 && !relationTypes.includes(r.type)) return false;
          return true;
        });

        return { persons: filteredPersons, relations: filteredRelations };
      },
    }),
    {
      name: 'n3xo-storage',
      partialize: (state) => ({
        persons: state.persons,
        relations: state.relations,
        config: state.config,
        customGroups: state.customGroups,
        customRelationTypes: state.customRelationTypes,
      }),
    }
  )
);

export default useGraphStore;
