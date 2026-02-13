import { useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import useGraphStore from '@/store/useGraphStore';
import { dateToValue, valueToDate, formatMonthYear, getDateRange } from '@/lib/date-utils';

export default function FilterBar() {
  const persons = useGraphStore((s) => s.persons);
  const relations = useGraphStore((s) => s.relations);
  const filters = useGraphStore((s) => s.filters);
  const customGroups = useGraphStore((s) => s.customGroups);
  const customRelationTypes = useGraphStore((s) => s.customRelationTypes);
  const setDateRange = useGraphStore((s) => s.setDateRange);
  const setGroupFilter = useGraphStore((s) => s.setGroupFilter);
  const setRelationTypeFilter = useGraphStore((s) => s.setRelationTypeFilter);
  const setSearchQuery = useGraphStore((s) => s.setSearchQuery);
  const clearFilters = useGraphStore((s) => s.clearFilters);

  const filteredData = useMemo(() => {
    return useGraphStore.getState().getFilteredData();
  }, [persons, relations, filters]);
  const totalPersons = persons.length;

  // Date range boundaries
  const dateRange = useMemo(() => {
    const dates = persons.map((p) => p.metAt);
    return getDateRange(dates);
  }, [persons]);

  const minVal = dateToValue(dateRange.min);
  const maxVal = dateToValue(dateRange.max);

  const currentStart = filters.dateRange.start ? dateToValue(filters.dateRange.start) : minVal;
  const currentEnd = filters.dateRange.end ? dateToValue(filters.dateRange.end) : maxVal;

  const handleDateSlider = (values) => {
    const start = values[0] <= minVal ? null : valueToDate(values[0]);
    const end = values[1] >= maxVal ? null : valueToDate(values[1]);
    setDateRange(start, end);
  };

  const toggleGroup = (group) => {
    const current = filters.groups;
    if (current.includes(group)) {
      setGroupFilter(current.filter((g) => g !== group));
    } else {
      setGroupFilter([...current, group]);
    }
  };

  const toggleRelationType = (type) => {
    const current = filters.relationTypes;
    if (current.includes(type)) {
      setRelationTypeFilter(current.filter((t) => t !== type));
    } else {
      setRelationTypeFilter([...current, type]);
    }
  };

  const hasActiveFilters =
    filters.groups.length > 0 ||
    filters.relationTypes.length > 0 ||
    filters.searchQuery ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl">
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl shadow-lg p-3">
        {/* Top row: search + stats + clear */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search person..."
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background/50"
            />
            {filters.searchQuery && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {filteredData.persons.length} of {totalPersons} people ·{' '}
            {filteredData.relations.length} connections
          </span>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={clearFilters}>
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>

        {/* Date slider */}
        <div className="mb-3 px-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              {formatMonthYear(valueToDate(currentStart)) || 'Start'}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">Period</span>
            <span className="text-[10px] text-muted-foreground">
              {formatMonthYear(valueToDate(currentEnd)) || 'Fin'}
            </span>
          </div>
          <Slider
            value={[currentStart, currentEnd]}
            min={minVal}
            max={maxVal}
            step={30}
            onValueChange={handleDateSlider}
          />
        </div>

        {/* Groups + Relation Types */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(customGroups).map(([key, val]) => (
            <Badge
              key={key}
              variant={filters.groups.length === 0 || filters.groups.includes(key) ? 'default' : 'outline'}
              className="cursor-pointer text-[10px] transition-all hover:scale-105"
              style={{
                backgroundColor:
                  filters.groups.length === 0 || filters.groups.includes(key)
                    ? val.color + '30'
                    : 'transparent',
                color: val.color,
                borderColor: val.color + '40',
              }}
              onClick={() => toggleGroup(key)}
            >
              {val.label}
            </Badge>
          ))}

          <div className="w-px h-5 bg-border mx-1 self-center" />

          {Object.entries(customRelationTypes).map(([key, val]) => (
            <Badge
              key={key}
              variant={
                filters.relationTypes.length === 0 || filters.relationTypes.includes(key)
                  ? 'default'
                  : 'outline'
              }
              className="cursor-pointer text-[10px] transition-all hover:scale-105"
              style={{
                backgroundColor:
                  filters.relationTypes.length === 0 || filters.relationTypes.includes(key)
                    ? val.color + '20'
                    : 'transparent',
                color: val.color,
                borderColor: val.color + '30',
              }}
              onClick={() => toggleRelationType(key)}
            >
              {val.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
