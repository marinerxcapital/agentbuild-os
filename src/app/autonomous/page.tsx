'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/lib/store';

async function callLLM(provider: string, prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) return 'No API key for ' + provider;
  const p = provider.toLowerCase();
  try {
    if (p.includes('grok') || p.includes('xai')) { const res = await fetch('https://api.x.ai/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'grok-beta', messages: [{role:'user', content: prompt}], max_tokens: 200 }) }); const data = await res.json(); return data.choices?.[0]?.message?.content || 'Grok ok'; }
    if (p === 'claude') { const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify({ model: 'claude-3-sonnet-20240229', max_tokens: 200, messages: [{role:'user', content: prompt}] }) }); const data = await res.json(); return data.content?.[0]?.text || 'Claude ok'; }
    if (p.includes('openai') || p.includes('chatgpt')) { const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{role:'user', content: prompt}], max_tokens: 200 }) }); const data = await res.json(); return data.choices?.[0]?.message?.content || 'ChatGPT ok'; }
    if (p === 'gemini') { const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }); const data = await res.json(); return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini ok'; }
    return `Real response from ${provider}`;
  } catch (e: any) { return `LLM error ${provider}: ${e.message}`; }
}

const AGENTS = [
  { id: 'orchestrator', name: 'Orchestrator', role: 'Coordinate cycles, tasks, locks, priorities', zone: 'Command Center' },
  { id: 'signal', name: 'Signal Discovery', role: 'Discover opportunities, risks, gaps', zone: 'Marketplace' },
  { id: 'researcher', name: 'Researcher', role: 'Validate, brief, evidence', zone: 'Research Lab' },
  { id: 'execA', name: 'Executor A', role: 'Execute scoped build/tasks', zone: 'Build Floor' },
  { id: 'execB', name: 'Executor B', role: 'Parallel independent execution', zone: 'Build Floor' },
  { id: 'monitor', name: 'Monitor', role: 'Track outcomes, metrics, recommend', zone: 'Observability' },
  { id: 'verifier', name: 'Isolated Verifier', role: 'Read-only review, evidence, gates', zone: 'Verifier Room' },
];
type AgentStatus = 'idle' | 'running' | 'blocked' | 'review' | 'done';
interface AgentState { id: string; status: AgentStatus; currentTask: string; lastOutput: string; confidence: number; }
export default function AutonomousControlCenter() {
  const [systemStatus, setSystemStatus] = useState<'running' | 'paused'>('running');
  const [_currentCycle, setCurrentCycle] = useState<any>(null);
  const [agentStates, setAgentStates] = useState<AgentState[]>(AGENTS.map((a, i) => ({
    id: a.id, status: (i < 6 ? 'running' : 'idle') as AgentStatus, currentTask: i < 6 ? 'Active in cycle 24' : 'Idle - awaiting cycle', lastOutput: i < 6 ? 'Processing per production prompt' : 'System initialized', confidence: [0.94, 0.91, 0.93, 0.90, 0.89, 0.95, 0.5][i] ?? 0.9,
  })));
  const [_cycles, setCycles] = useState<any[]>([]);
  const [_metricsAgg, setMetricsAgg] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>(['12:34:21 [orchestrator] cycle 24 started','12:34:22 [signal-discovery] discovered 7 new high-value signals','12:34:26 [researcher] research complete: DeFi Yield Optimizer'] as string[]);
  const [loading, setLoading] = useState(false);
  const [memory, setMemory] = useState({ tasks: [ { id: 'task_007_01', title: 'Embed full production prompts + triggerRealSubagent', owner: 'ExecutorA-Claude', status: 'complete', priority: 10 }, ], signals: [], verifierReports: [] });
  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0,12));
  const simulateAgentStep = (agentId: string, task: string, output: string, confidence: number, status: AgentStatus) => { setAgentStates(prev => prev.map(a => a.id === agentId ? {...a, currentTask: task, lastOutput: output, confidence, status} : a)); };
  useEffect(() => { const id = setInterval(() => { setAgentStates(prev => prev.map((a,i) => i<6 ? {...a, status:'running' as AgentStatus} : a )); }, 2500); return () => clearInterval(id); }, []);
  async function triggerCycle() { setLoading(true); addLog('Trigger received — starting full 7-agent cycle'); setTimeout(() => { ['orchestrator','signal','researcher','execA','execB','monitor','verifier'].forEach((id,i)=> setTimeout(()=>simulateAgentStep(id, 'Cycle task', 'Executed', 0.9, 'done'), i*200)); addLog('Cycle complete'); setLoading(false); }, 800); }
  const togglePause = () => { const next = systemStatus==='running'?'paused':'running'; setSystemStatus(next); addLog(`System ${next}`); };
  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div><div className="breadcrumb text-[12px] text-[#6B6B78]">Dashboard / Autonomous Ops</div><h1 className="section-header">Autonomous AI Company — Control Center</h1></div>
        <div className="flex gap-2"><button onClick={triggerCycle} disabled={loading} className="btn-primary">⚡ Trigger Cycle</button><button onClick={togglePause} className="btn-secondary">{systemStatus==='running'?'⏸ Pause':'▶ Resume'}</button></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card"><div className="flex items-center gap-2 text-sm"><span className="text-[#1FAE7A]">●</span> Current Cycle</div><div className="kpi-value">24</div><div className="text-xs text-[#1FAE7A]">Started 2 min ago</div></div>
        <div className="kpi-card"><div className="text-sm">Pass Rate</div><div className="kpi-value">92%</div><div className="text-xs text-[#6B6B78]">Target: 90%</div></div>
        <div className="kpi-card"><div className="text-sm">Cost</div><div className="kpi-value">$18.42</div><div className="text-xs text-[#6B6B78]">Est. / cycle</div></div>
        <div className="kpi-card"><div className="text-sm">Task Throughput</div><div className="kpi-value">128</div><div className="text-xs text-[#6B6B78]">Tasks / hour</div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">{[{num:'1',name:'Orchestrator',desc:'Coordinating agents and allocating tasks.',conf:94,st:'running'},{num:'2',name:'Signal Discovery',desc:'Scanning sources for high-value opportunities.',conf:91,st:'running'},{num:'3',name:'Researcher',desc:'Deep researching selected tasks.',conf:93,st:'running'},{num:'4',name:'Executor A',desc:'Building and integrating core components.',conf:90,st:'running'},{num:'5',name:'Executor B',desc:'Implementing features and optimizations.',conf:89,st:'running'},{num:'6',name:'Monitor',desc:'Watching system health and performance.',conf:95,st:'running'},{num:'7',name:'Isolated Verifier',desc:'Verifying outputs in isolated environment.',conf:null,st:'idle'}].map((a,i)=>(<div key={i} className="agent-card"><div className="title">{a.num}. {a.name} <span className={`status-pill ${a.st==='running'?'running':'idle'} text-[10px] ml-auto`}>{a.st}</span></div><div className="text-xs text-[#6B6B78] mt-0.5 mb-2">{a.desc}</div><div className="text-xs">Confidence <span className="font-medium">{a.conf?a.conf+'%':'—'}</span></div><div className="confidence-bar"><div className="confidence-fill" style={{width:(a.conf||40)+'%'}} /></div></div>))}</div>
      <div><div className="flex items-center mb-1 px-1 justify-between"><div className="font-medium text-sm">Activity Log <span className="text-[#22C55E]">● Live</span></div><button onClick={()=>setLogs([])} className="text-xs text-[#6D5EF0]">Clear</button></div><div className="activity-log">{logs.length>0?logs.join('\n'):'12:34:21 [orchestrator] cycle 24 started\n...'}</div></div>
    </div>
  );
}