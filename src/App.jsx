import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/ErrorBoundary';
import ForceGraph from '@/components/graph/ForceGraph';
import Toolbar from '@/components/toolbar/Toolbar';
import FilterBar from '@/components/filters/FilterBar';
import DetailPanel from '@/components/panels/DetailPanel';
import FormModals from '@/components/panels/FormModals';
import SettingsPanel from '@/components/panels/SettingsPanel';
import Legend from '@/components/Legend';

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="relative w-full h-full overflow-hidden bg-background">
          {/* Toolbar at top center */}
          <Toolbar />

          {/* Settings top-right */}
          <SettingsPanel />

          {/* Legend bottom-left */}
          <Legend />

          {/* The force-directed graph fills the viewport */}
          <ForceGraph />

          {/* Filter bar at bottom center */}
          <FilterBar />

          {/* Detail panel slides in from right */}
          <DetailPanel />

          {/* Form modals (add/edit person/relation) */}
          <FormModals />
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
