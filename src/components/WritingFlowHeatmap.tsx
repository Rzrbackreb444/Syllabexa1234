import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

interface FlowData {
  id: number;
  wordCount: number;
  complexity: number;
  pacing: number;
}

interface WritingFlowHeatmapProps {
  text: string;
}
export default function WritingFlowHeatmap({ text }: WritingFlowHeatmapProps) {
  const d3Container = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{ title: string; subtitle: string } | null>(null);

  useEffect(() => {
    if (!text || !d3Container.current) return;

    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const container = d3Container.current;
    
    // Clear previous render
    d3.select(container).selectAll("*").remove();

    if (paragraphs.length === 0) return;

    const data: FlowData[] = paragraphs.map((p, i) => {
      const words = p.split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;
      const avgWordLength = wordCount > 0 ? words.reduce((acc, w) => acc + w.length, 0) / wordCount : 0;
      
      return {
        id: i,
        wordCount,
        complexity: avgWordLength,
        pacing: Math.max(0, Math.min(1, 1 - (wordCount / 100)))
      };
    });

    const width = Math.max(container.clientWidth || 600, data.length * 24);
    const height = 160;
    const margin = { top: 20, right: 20, bottom: 25, left: 55 };

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMinYMid meet");

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale with band constraints
    const xScale = d3.scaleBand<number>()
      .domain(data.map(d => d.id))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleBand<string>()
      .domain(['Complexity', 'Pacing'])
      .range([innerHeight, 0])
      .padding(0.25);

    const pacingColorScale = d3.scaleSequential(d3.interpolateOranges).domain([0, 1]);
    const maxComplexity = d3.max(data, d => d.complexity) || 10;
    const complexityColorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, maxComplexity]);

    // Draw Pacing Rectangles
    g.selectAll(".pacing-rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "transition-all duration-150 hover:opacity-85 cursor-pointer")
      .attr("x", d => xScale(d.id) || 0)
      .attr("y", yScale('Pacing') || 0)
      .attr("width", Math.max(4, xScale.bandwidth()))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => pacingColorScale(d.pacing))
      .attr("rx", 3)
      .on("mouseenter", (_, d) => {
        setTooltipData({
          title: `Paragraph ${d.id + 1}`,
          subtitle: `Words: ${d.wordCount} | Pacing: ${(d.pacing * 100).toFixed(0)}%`
        });
      })
      .on("mouseleave", () => setTooltipData(null));

    // Draw Complexity Rectangles
    g.selectAll(".comp-rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "transition-all duration-150 hover:opacity-85 cursor-pointer")
      .attr("x", d => xScale(d.id) || 0)
      .attr("y", yScale('Complexity') || 0)
      .attr("width", Math.max(4, xScale.bandwidth()))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => complexityColorScale(d.complexity))
      .attr("rx", 3)
      .on("mouseenter", (_, d) => {
        setTooltipData({
          title: `Paragraph ${d.id + 1}`,
          subtitle: `Words: ${d.wordCount} | Avg Word Length: ${d.complexity.toFixed(1)} chars`
        });
      })
      .on("mouseleave", () => setTooltipData(null));

    // Axis Labels
    g.append("text")
      .attr("x", -10)
      .attr("y", (yScale('Pacing') || 0) + yScale.bandwidth() / 2)
      .attr("dy", "0.32em")
      .attr("text-anchor", "end")
      .attr("class", "font-mono text-[10px] fill-slate-400 font-bold uppercase")
      .text("Pace");

    g.append("text")
      .attr("x", -10)
      .attr("y", (yScale('Complexity') || 0) + yScale.bandwidth() / 2)
      .attr("dy", "0.32em")
      .attr("text-anchor", "end")
      .attr("class", "font-mono text-[10px] fill-slate-400 font-bold uppercase")
      .text("Comp.");

  }, [text]);

  const wordsCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const paragraphsCount = text.split(/\n+/).filter(p => p.trim().length > 0).length;

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#0c0e12] border border-white/5 rounded-2xl shadow-xl">
      <div className="flex justify-between items-end border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <BarChart3 size={15} />
          </div>
          <div>
            <h3 className="font-serif text-xs tracking-wide text-slate-200 font-bold uppercase">Flow & Complexity Analytics</h3>
            <p className="text-[10px] font-mono text-slate-400">{paragraphsCount} paragraphs analyzed</p>
          </div>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
          {wordsCount.toLocaleString()} Words
        </div>
      </div>

      <div className="relative">
        <div ref={d3Container} className="w-full h-[160px] overflow-x-auto overflow-y-hidden custom-scrollbar pb-1" />
        
        {tooltipData && (
          <div className="absolute top-0 right-0 bg-slate-900/95 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-lg pointer-events-none flex items-center gap-2 backdrop-blur-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <div className="text-[10px] font-mono">
              <span className="text-slate-300 font-bold mr-1">{tooltipData.title}:</span>
              <span className="text-amber-300">{tooltipData.subtitle}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase border-t border-white/5 pt-2">
        <span className="flex items-center gap-1"><TrendingUp size={10} className="text-amber-400" /> Slower / Simple Rhythm</span>
        <span>Faster / Complex Density</span>
      </div>
    </div>
  );
}