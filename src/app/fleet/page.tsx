'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { getRoutingTable, getProviderForTask } from '@/lib/providerRouting';
import { loadState } from '@/lib/autonomous/memoryStore';
import { Button } from '@/components/ui/button';
import { Zap, Folder, Users, CheckCircle2, Shield } from 'lucide-react';

async function callLLM(provider: string, prompt: string, apiKey: string): Promise<string> { if(!apiKey) return 'No key'; return 'LLM:'+provider.slice(0,4)+' ok'; }

const DEMO_FLEET_PROJECTS = [
  { name: 'TradePulse Platform', status: 'Running', providers: ['Claude','Grok','Gemini','ChatGPT'], rate: '128/hr', sparkPoints: [40,55,48,70,62,80] },
  { name: 'Sentinel Analytics', status: 'Running', providers: ['Claude','Gemini','ChatGPT'], rate: '96/hr', sparkPoints: [30,45,60,52,70,65] },
  { name: 'Nimbus UI Library', status: 'Review', providers: ['Grok','Claude','ChatGPT'], rate: '72/hr', sparkPoints: [55,48,62,58,45,50] },
];
function Sparkline({points}:{points:number[]}) { const max=Math.max(...points); return <svg width="60" height="24" className="text-[#6D5EF0]"><polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points.map((v,i)=>`${i*10},${24-(v/max*20)}`).join(' ')} /></svg>; }
function getProviderClass(p:string){ const m:any={'Grok':'provider-grok','Claude':'provider-claude','Gemini':'provider-gemini','ChatGPT':'provider-chatgpt'}; return 'provider-chip '+(m[p]||''); }
const ROSTER = [
  {agent:'Orchestrator',prov:'Claude',proj:'TradePulse Platform',task:'Coordinating agents and allocating tasks',status:'running'},
  {agent:'Signal Discovery',prov:'Grok',proj:'Sentinel Analytics',task:'Scanning sources for high-value signals',status:'running'},
  {agent:'Researcher',prov:'Gemini',proj:'TradePulse Platform',task:'Deep researching tokenized equities',status:'running'},
  {agent:'Executor A',prov:'ChatGPT',proj:'Nimbus UI Library',task:'Building and integrating core components',status:'review'},
  {agent:'Executor B',prov:'Claude',proj:'Sentinel Analytics',task:'Implementing features and optimizations',status:'running'},
  {agent:'Monitor',prov:'Grok',proj:'All Projects',task:'Watching system health and performance',status:'running'},
  {agent:'Isolated Verifier',prov:'Gemini',proj:'All Projects',task:'Verifying outputs in isolated environment',status:'running'},
];
export default function FleetCommandCenter() {
  const { projects } = useStore();
  const [memoryData] = useState<any>(null);
  const loadMemoryIfNeeded = async () => { try { await loadState(); } catch {} };
  const triggerFleetCycle = async () => { await loadMemoryIfNeeded(); alert('Fleet cycle triggered (sim)'); };
  const fleetProjects = DEMO_FLEET_PROJECTS;
  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-4"><div><div className="breadcrumb">Dashboard / Fleet Command</div><h1 className="section-header">Fleet Command Center</h1></div><button onClick={triggerFleetCycle} className="btn-primary"><Zap className="h-4 w-4" /> Trigger Fleet-Wide Cycle</button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="command-card p-5"><div className="w-8 h-8 rounded-full bg-[#F0EDFF] flex items-center justify-center mb-3"><Folder className="h-4 w-4 text-[#6D5EF0]" /></div><div className="text-[28px] font-semibold">18</div><div className="text-[13px] font-medium mt-0.5">Projects</div><div className="text-[12px] text-[#6B6B78]">Across all workspaces</div></div>
        <div className="command-card p-5"><div className="w-8 h-8 rounded-full bg-[#F0EDFF] flex items-center justify-center mb-3"><Users className="h-4 w-4 text-[#6D5EF0]" /></div><div className="text-[28px] font-semibold">47</div><div className="text-[13px] font-medium mt-0.5">Active Agents</div><div className="text-[12px] text-[#6B6B78]">Across all projects</div></div>
        <div className="command-card p-5"><div className="w-8 h-8 rounded-full bg-[#F0EDFF] flex items-center justify-center mb-3"><CheckCircle2 className="h-4 w-4 text-[#6D5EF0]" /></div><div className="text-[28px] font-semibold">368</div><div className="text-[13px] font-medium mt-0.5">Total Tasks</div><div className="text-[12px] text-[#6B6B78]">Running + queued</div></div>
        <div className="command-card p-5"><div className="w-8 h-8 rounded-full bg-[#F0EDFF] flex items-center justify-center mb-3"><Shield className="h-4 w-4 text-[#6D5EF0]" /></div><div className="flex items-baseline gap-1"><div className="text-[28px] font-semibold">93%</div></div><div className="text-[13px] font-medium mt-0.5">Fleet Verifier Pass Rate</div><div className="mt-2 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden"><div className="h-1.5 bg-[#6D5EF0] rounded-full" style={{width:'93%'}} /></div><div className="text-[11px] text-[#6B6B78] mt-1">Target: 90%</div></div>
      </div>
      <div className="mb-8"><div className="text-[13px] font-semibold mb-3">Project Fleet</div><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{fleetProjects.map((proj, idx) => (<div key={idx} className="fleet-card"><div className="flex items-center justify-between mb-3"><div className="font-semibold text-[14px]">{proj.name}</div><span className={`status-pill ${proj.status==='Running'?'running':'review'}`}>{proj.status}</span></div><div className="flex flex-wrap gap-1.5 mb-3">{proj.providers.map((prov:string,pidx:number)=>(<span key={pidx} className={getProviderClass(prov)}>{prov}</span>))}</div><div className="flex items-center gap-2 text-[12px] text-[#6B6B78]"><span>Tasks / hour</span><Sparkline points={proj.sparkPoints} /><span className="font-medium text-[#14141A] tabular-nums">{proj.rate}</span></div></div>))}</div></div>
      <div><div className="text-[13px] font-semibold mb-3">Cross-Project Agent Roster</div><div className="command-card overflow-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Agent</th><th className="text-left p-3">Provider</th><th className="text-left p-3">Project</th><th className="text-left p-3">Current Task</th><th className="text-left p-3">Status</th></tr></thead><tbody>{ROSTER.map((r,i)=>(<tr key={i} className="border-b last:border-0"><td className="p-3">{r.agent}</td><td className="p-3"><span className={getProviderClass(r.prov)}>{r.prov}</span></td><td className="p-3">{r.proj}</td><td className="p-3 text-xs">{r.task}</td><td className="p-3"><span className={`status-pill ${r.status}`}>{r.status}</span></td></tr>))}</tbody></table><div className="text-xs p-2 text-[#6B6B78]">Showing 7 of 7 agents</div></div></div>
    </div>
  );
}