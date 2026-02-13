import { useRef, useEffect, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import useGraphStore from '@/store/useGraphStore';
import { getGroupColor, getRelationStyle, getInitials, strengthToWidth } from '@/lib/colors';

export default function ForceGraph() {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const containerRef = useRef(null);
  const nodeGroupRef = useRef(null);
  const edgeSelectionRef = useRef(null);
  const edgeLabelSelectionRef = useRef(null);
  const linksDataRef = useRef([]);

  const viewMode = useGraphStore((s) => s.viewMode);
  const selectNode = useGraphStore((s) => s.selectNode);
  const selectEdge = useGraphStore((s) => s.selectEdge);
  const clearSelection = useGraphStore((s) => s.clearSelection);
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const selectedEdge = useGraphStore((s) => s.selectedEdge);
  const persons = useGraphStore((s) => s.persons);
  const relations = useGraphStore((s) => s.relations);
  const filters = useGraphStore((s) => s.filters);
  const customGroups = useGraphStore((s) => s.customGroups);
  const customRelationTypes = useGraphStore((s) => s.customRelationTypes);

  // Compute filtered data inside the component
  const filteredData = useMemo(() => {
    return useGraphStore.getState().getFilteredData();
  }, [persons, relations, filters]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Local references to custom maps for use in d3 callbacks
    const groups = customGroups;
    const relTypes = customRelationTypes;

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Clear previous
    svg.selectAll('*').remove();

    // Defs for glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Main group for zoom/pan
    const g = svg.append('g').attr('class', 'graph-root');

    // Layers
    const edgeLayer = g.append('g').attr('class', 'edges');
    const edgeLabelLayer = g.append('g').attr('class', 'edge-labels');
    const nodeLayer = g.append('g').attr('class', 'nodes');

    // Data
    const { persons: fp, relations: fr } = filteredData;

    if (fp.length === 0) {
      // Empty state
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('opacity', 0.4)
        .attr('font-size', '14px')
        .text('No people to show. Adjust filters or add people.');
      return;
    }

    const nodes = fp.map((p) => ({ ...p }));
    const links = fr.map((r) => ({
      ...r,
      source: r.source,
      target: r.target,
    }));

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links)
          .id((d) => d.id)
          .distance(120)
          .strength(0.4)
      )
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(500))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force('collision', d3.forceCollide().radius(35))
      .alphaDecay(0.02);

    // Cluster forces for 'clusters' and 'combined' modes
    if (viewMode === 'clusters' || viewMode === 'combined') {
      const groups = [...new Set(nodes.map((n) => n.group))];
      const groupCount = groups.length;
      const angleStep = (2 * Math.PI) / groupCount;
      const clusterRadius = Math.min(width, height) * 0.25;

      const groupCenters = {};
      groups.forEach((g, i) => {
        groupCenters[g] = {
          x: width / 2 + clusterRadius * Math.cos(angleStep * i - Math.PI / 2),
          y: height / 2 + clusterRadius * Math.sin(angleStep * i - Math.PI / 2),
        };
      });

      simulation
        .force('x', d3.forceX((d) => groupCenters[d.group]?.x || width / 2).strength(0.15))
        .force('y', d3.forceY((d) => groupCenters[d.group]?.y || height / 2).strength(0.15));
    }

    simulationRef.current = simulation;

    // Helper: apply highlight for a given node id
    const applyHighlight = (focusId) => {
      const connectedIds = new Set([focusId]);
      links.forEach((l) => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sourceId === focusId) connectedIds.add(targetId);
        if (targetId === focusId) connectedIds.add(sourceId);
      });

      nodeGroup.attr('opacity', (n) => (connectedIds.has(n.id) ? 1 : 0.1));
      edgeSelection.attr('stroke-opacity', (l) => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        return sourceId === focusId || targetId === focusId ? 0.9 : 0.04;
      });
      edgeLabelSelection.attr('opacity', (l) => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        return sourceId === focusId || targetId === focusId ? 1 : 0;
      });

      // Glow on the focused node
      nodeGroup.each(function (n) {
        d3.select(this).select('circle').attr('filter', n.id === focusId ? 'url(#glow)' : null);
      });
    };

    // Helper: apply highlight for a given edge id
    const applyEdgeHighlight = (edgeId) => {
      const edge = links.find((l) => l.id === edgeId);
      if (!edge) return;
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
      const pairIds = new Set([sourceId, targetId]);

      nodeGroup.attr('opacity', (n) => (pairIds.has(n.id) ? 1 : 0.1));
      edgeSelection.attr('stroke-opacity', (l) => (l.id === edgeId ? 0.9 : 0.04));
      edgeLabelSelection.attr('opacity', (l) => (l.id === edgeId ? 1 : 0));
      nodeGroup.each(function (n) {
        d3.select(this).select('circle').attr('filter', pairIds.has(n.id) ? 'url(#glow)' : null);
      });
    };

    const clearHighlight = () => {
      nodeGroup.attr('opacity', 1);
      edgeSelection.attr('stroke-opacity', 0.6);
      edgeLabelSelection.attr('opacity', 0.7);
      nodeGroup.each(function () {
        d3.select(this).select('circle').attr('filter', null);
      });
    };

    // ── Draw Edges ──
    const edgeSelection = edgeLayer
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => getRelationStyle(d.type, relTypes).color)
      .attr('stroke-width', (d) => strengthToWidth(d.strength))
      .attr('stroke-dasharray', (d) => getRelationStyle(d.type, relTypes).dash || 'none')
      .attr('stroke-opacity', 0.6)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        selectEdge(d.id);
      });

    // ── Edge Labels ──
    const edgeLabelSelection = edgeLabelLayer
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('class', 'edge-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -4)
      .attr('fill', (d) => getRelationStyle(d.type, relTypes).color)
      .attr('opacity', 0.7)
      .text((d) => getRelationStyle(d.type, relTypes).label);

    // ── Draw Nodes ──
    const nodeGroup = nodeLayer
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        selectNode(d.id);
      })
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node circle with glow
    nodeGroup
      .append('circle')
      .attr('r', 22)
      .attr('fill', (d) => {
        const c = getGroupColor(d.group, groups).color;
        return c + '20'; // transparent fill
      })
      .attr('stroke', (d) => getGroupColor(d.group, groups).color)
      .attr('stroke-width', 2.5);

    // Inner circle (avatar background)
    nodeGroup
      .append('circle')
      .attr('r', 18)
      .attr('fill', (d) => getGroupColor(d.group, groups).color + '30');

    // Initials text
    nodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', (d) => getGroupColor(d.group, groups).color)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('class', 'node-label')
      .text((d) => getInitials(d.name));

    // Name label below node
    nodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 36)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('class', 'node-label')
      .attr('opacity', 0.8)
      .text((d) => d.name.split(' ')[0]);

    // ── Hover interactions ──
    nodeGroup
      .on('mouseenter', function (event, d) {
        applyHighlight(d.id);
      })
      .on('mouseleave', function () {
        // Restore to active selection highlight, otherwise clear
        const state = useGraphStore.getState();
        if (state.selectedNode) {
          applyHighlight(state.selectedNode);
        } else if (state.selectedEdge) {
          applyEdgeHighlight(state.selectedEdge);
        } else {
          clearHighlight();
        }
      });

    // Store refs so the selection effect can access them
    nodeGroupRef.current = nodeGroup;
    edgeSelectionRef.current = edgeSelection;
    edgeLabelSelectionRef.current = edgeLabelSelection;
    linksDataRef.current = links;

    // ── Tick ──
    simulation.on('tick', () => {
      edgeSelection
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      edgeLabelSelection
        .attr('x', (d) => (d.source.x + d.target.x) / 2)
        .attr('y', (d) => (d.source.y + d.target.y) / 2);

      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // ── Zoom ──
    const zoom = d3.zoom()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Click on background to clear
    svg.on('click', () => {
      clearSelection();
      clearHighlight();
    });

    // Apply initial selection highlight if something was already selected
    const initState = useGraphStore.getState();
    if (initState.selectedNode) {
      applyHighlight(initState.selectedNode);
    } else if (initState.selectedEdge) {
      applyEdgeHighlight(initState.selectedEdge);
    }

    // Initial gentle zoom
    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(0.9);
    svg.call(zoom.transform, initialTransform);

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [filteredData, viewMode, selectNode, selectEdge, clearSelection, customGroups, customRelationTypes]);

  // Apply highlight when selectedNode or selectedEdge changes
  useEffect(() => {
    const nodeGroup = nodeGroupRef.current;
    const edgeSelection = edgeSelectionRef.current;
    const edgeLabelSelection = edgeLabelSelectionRef.current;
    const links = linksDataRef.current;
    if (!nodeGroup || !edgeSelection || !edgeLabelSelection) return;

    if (selectedNode) {
      const connectedIds = new Set([selectedNode]);
      links.forEach((l) => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sourceId === selectedNode) connectedIds.add(targetId);
        if (targetId === selectedNode) connectedIds.add(sourceId);
      });

      nodeGroup.attr('opacity', (n) => (connectedIds.has(n.id) ? 1 : 0.1));
      edgeSelection.attr('stroke-opacity', (l) => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        return sourceId === selectedNode || targetId === selectedNode ? 0.9 : 0.04;
      });
      edgeLabelSelection.attr('opacity', (l) => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        return sourceId === selectedNode || targetId === selectedNode ? 1 : 0;
      });
      nodeGroup.each(function (n) {
        d3.select(this).select('circle').attr('filter', n.id === selectedNode ? 'url(#glow)' : null);
      });
    } else if (selectedEdge) {
      const edge = links.find((l) => l.id === selectedEdge);
      if (edge) {
        const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
        const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
        const pairIds = new Set([sourceId, targetId]);

        nodeGroup.attr('opacity', (n) => (pairIds.has(n.id) ? 1 : 0.1));
        edgeSelection.attr('stroke-opacity', (l) => (l.id === selectedEdge ? 0.9 : 0.04));
        edgeLabelSelection.attr('opacity', (l) => (l.id === selectedEdge ? 1 : 0));
        nodeGroup.each(function (n) {
          d3.select(this).select('circle').attr('filter', pairIds.has(n.id) ? 'url(#glow)' : null);
        });
      }
    } else {
      nodeGroup.attr('opacity', 1);
      edgeSelection.attr('stroke-opacity', 0.6);
      edgeLabelSelection.attr('opacity', 0.7);
      nodeGroup.each(function () {
        d3.select(this).select('circle').attr('filter', null);
      });
    }
  }, [selectedNode, selectedEdge]);

  // Re-render on window resize
  useEffect(() => {
    const handleResize = () => {
      // Trigger re-render by forcing a state read
      const svg = d3.select(svgRef.current);
      const container = containerRef.current;
      if (container && svg) {
        svg.attr('width', container.clientWidth).attr('height', container.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="graph-container w-full h-full">
      <svg ref={svgRef} />
    </div>
  );
}
