import { useEffect, useRef, useState } from "react";
import type { Graph as GraphData, GraphEdge, GraphNode } from "@retangle/types";
import {
  SimulationNodeDatum,
  SimulationLinkDatum,
  Selection,
  drag,
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  select,
  D3DragEvent,
} from "d3";
import { useFilteredGraph } from "../hooks/useFilteredGraph";
import { graphColors } from "../lib/constants";

export type SimNode = GraphNode & SimulationNodeDatum;
export type SimLink = Omit<GraphEdge, "source" | "target"> &
  SimulationLinkDatum<SimNode>;

type GraphProps = {
  graph: GraphData;
  hiddenComponentNodes: GraphNode[];
  hiddenHookNodes: GraphNode[];
  selectedNode: SimNode | null;
  setSelectedNode: (node: SimNode | null) => void;
};

const Graph = ({
  graph,
  hiddenComponentNodes,
  hiddenHookNodes,
  selectedNode,
  setSelectedNode,
}: GraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const selectedNodeRef = useRef(selectedNode);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const { filteredGraph } = useFilteredGraph(
    graph,
    hiddenComponentNodes,
    hiddenHookNodes,
  );

  const onNodeClick = useRef<
    (node: SimNode, selectedNode: SimNode | null) => void
  >(() => {});
  const dimensionsRef = useRef(dimensions);

  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  useEffect(() => {
    selectedNodeRef.current = selectedNode;
  }, [selectedNode]);

  useEffect(() => {
    onNodeClick.current = (node: SimNode, selectedNode: SimNode | null) => {
      setSelectedNode(selectedNode?.id === node.id ? null : node);
    };
  }, [setSelectedNode]);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry?.contentRect;
      if (rect) setDimensions({ width: rect.width, height: rect.height });
    });
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const links: SimLink[] = filteredGraph.edges.map((edge: GraphEdge) => ({
      ...edge,
    }));
    const nodes: SimNode[] = [
      ...filteredGraph.componentNodes,
      ...filteredGraph.hookNodes,
    ].map((node: GraphNode) => ({
      ...node,
    }));

    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links).id((d) => d.id),
      )
      .force("charge", forceManyBody().strength(-1000))
      .force("x", forceX())
      .force("y", forceY());

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", "3px");

    const nodeGroup = svg.append("g");

    const node = nodeGroup
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 10)
      .attr("stroke", "#fff")
      .attr("fill", (d) => graphColors[d.type])
      .attr("cursor", "pointer");

    const labelGroup = nodeGroup
      .selectAll<SVGGElement, SimNode>("g.label")
      .data(nodes)
      .join("g")
      .attr("class", "label")
      .attr("pointer-events", "none");

    labelGroup
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", "-2em")
      .attr("fill", "white")
      .attr("font-size", "12px");

    labelGroup.each(function () {
      const g = select(this);
      const text = g.select<SVGTextElement>("text").node()!;
      const bbox = text.getBBox();
      g.insert("rect", "text")
        .attr("x", bbox.x - 4)
        .attr("y", bbox.y - 2)
        .attr("width", bbox.width + 8)
        .attr("height", bbox.height + 4)
        .attr("fill", "black")
        .attr("opacity", 0.8)
        .attr("rx", 3);
    });

    node.on("click", (_, d) => onNodeClick.current(d, selectedNodeRef.current));

    (
      node as unknown as Selection<
        SVGCircleElement,
        SimNode,
        SVGGElement,
        unknown
      >
    ).call(
      drag<SVGCircleElement, SimNode>()
        .on(
          "start",
          (event: D3DragEvent<SVGCircleElement, SimNode, SimNode>) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          },
        )
        .on(
          "drag",
          (event: D3DragEvent<SVGCircleElement, SimNode, SimNode>) => {
            event.subject.fx = Math.max(
              -dimensionsRef.current.width / 2,
              Math.min(dimensionsRef.current.width / 2, event.x),
            );
            event.subject.fy = Math.max(
              -dimensionsRef.current.height / 2,
              Math.min(dimensionsRef.current.height / 2, event.y),
            );
          },
        )
        .on("end", (event: D3DragEvent<SVGCircleElement, SimNode, SimNode>) => {
          if (!event.active) simulation.alphaTarget(0);
        }),
    );

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      node.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);
      labelGroup.attr(
        "transform",
        (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`,
      );
    });

    return () => {
      simulation.stop();
    };
  }, [filteredGraph, dimensions]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${-dimensions.width / 2} ${-dimensions.height / 2} ${dimensions.width} ${dimensions.height}`}
        style={{ display: "block" }}
      />
    </div>
  );
};

export default Graph;
