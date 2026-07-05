'use client';

/* eslint-disable @typescript-eslint/no-explicit-any -- existing pattern in fleet page for memory + store data; UI/UX only changes */
import { useStore } from '@/lib/store';
import { getProviderForTask, logProviderAssignment, enforceProviderIsolation } from '@/lib/providerRouting';
import { loadState, getCycleOutcomeMetrics } from '@/lib/autonomous/memoryStore';
import { Button } from '@/components/ui/button';
import { 
  Folder, Users, CheckCircle2, Shield, Zap, 
  Cpu, Search, UserSearch, Code2, Activity, ShieldCheck 
} from 'lucide-react';

// Exact visual data for 05_fleet_command.png (use store/memory underneath for logic)
const FLEET_PROJECTS = [
  {
    name: 'TradePulse Platform',
    status: 'Running',
    providers: ['Claude', 'Grok', 'Gemini', 'ChatGPT'],
    rate: '128 /hr',
    sparkPoints: [8, 14, 11, 19, 12, 22, 15, 26, 18, 24, 17],
  },
  {
    name: 'Sentinel Analytics',
    status: 'Running',
    providers: ['Claude', 'Gemini', 'ChatGPT'],
    rate: '96 /hr',
    sparkPoints: [18, 12, 20, 9, 22, 14, 17, 11, 19, 13],
  },
  {
    name: 'Nimbus UI Library',
    status: 'Review',
    providers: ['Grok', 'Claude', 'ChatGPT'],
    rate: '72 /hr',
    sparkPoints: [22, 15, 19, 8, 14, 20, 11, 17, 13, 16],
  },
];

const AGENT_ROSTER = [
  { name: 'Orchestrator', icon: Cpu, provider: 'Claude', project: 'TradePulse Platform', task: 'Coordinating agents and allocating tasks', status: 'running' as const },
  { name: 'Signal Discovery', icon: Search, provider: 'Grok', project: 'Sentinel Analytics', task: 'Scanning sources for high-value signals', status: 'running' as const },
  { name: 'Researcher', icon: UserSearch, provider: 'Gemini', project: 'TradePulse Platform', task: 'Deep researching tokenized equities', status: 'running' as const },
  { name: 'Executor A', icon: Code2, provider: 'ChatGPT', project: 'Nimbus UI Library', task: 'Building and integrating core components', status: 'review' as const },
  { name: 'Executor B', icon: Code2, provider: 'Claude', project: 'Sentinel Analytics', task: 'Implementing features and optimizations', status: 'running' as const },
  { name: 'Monitor', icon: Activity, provider: 'Grok', project: 'All Projects', task: 'Watching system health and performance', status: 'running' as const },
  { name: 'Isolated Verifier', icon: ShieldCheck, provider: 'Gemini', project: 'All Projects', task: 'Verifying outputs in isolated environment', status: 'running' as const },
];

export default function FleetCommandCenter() {
  const { apiKeys: _apiKeys } = useStore();

  // Keep routing + memory load capability for data logic intact (visual only)
  let loadedMemory: any = null;
  const loadMemoryIfNeeded = async () => {
    if (!loadedMemory) {
      loadedMemory = await loadState();
      await getCycleOutcomeMetrics(3);
    }
    return loadedMemory;
  };

  // Provider chip styling exact to PNG
  const getProviderClass = (provider: string) => {
    switch (provider) {
      case 'Claude': return 'provider-chip provider-claude';
      case 'Grok': return 'provider-chip provider-grok';
      case 'Gemini': return 'provider-chip provider-gemini';
      case 'ChatGPT': return 'provider-chip provider-chatgpt';
      default: return 'provider-chip bg-[#F3F4F6] text-[#6B6B78] border-[#6B6B78]';
    }
  };

  // Mini sparkline / wave graphic exactly as in Project Fleet cards
  const Sparkline = ({ points, color = '#6D5EF0' }: { points: number[]; color?: string }) => {
    const w = 84;
    const h = 26;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const stepX = w / (points.length - 1);
    const pathPoints = points.map((p, i) => {
      const x = i * stepX;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
    return (
      <svg width={w} height={h} className="inline-block align-middle" style={{ overflow: 'visible' }}>
        <path d={pathPoints} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const callLLM = async (provider: string, prompt: string, apiKey: string): Promise<string> => {
    if (!apiKey) return 'No API key provided for ' + provider;
    const p = provider.toLowerCase();
    try {
      if (p === 'grok' || p.includes('grok') || p.includes('xai')) {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'grok-beta', messages: [{ role: 'user', content: prompt }], max_tokens: 300 })
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'Grok response received';
      }
      if (p === 'claude') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
          body: JSON.stringify({ model: 'claude-3-sonnet-20240229', max_tokens: 300, messages: [{ role: 'user', content: prompt }] })
        });
        const data = await res.json();
        return data.content?.[0]?.text || 'Claude response received';
      }
      if (p === 'openai' || p.includes('chatgpt')) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 300 })
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'ChatGPT response received';
      }
      if (p === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini response received';
      }
      return `Simulated response from ${provider} (key provided but no direct impl)`;
    } catch (e: any) {
      return `Error calling ${provider}: ${e.message}`;
    }
  };

  const triggerFleetCycle = async () => {
    const state = useStore.getState();
    const keys = state.apiKeys;
    await loadMemoryIfNeeded();

    const assignments = [
      { taskType: 'Code scaffolding / development', task: 'fleet-grid-integration' },
      { taskType: 'Research / signal discovery', task: 'fleet-signal-ingest' },
      { taskType: 'Orchestration / management', task: 'fleet-cycle-orchestrate' },
      { taskType: 'Isolated verification / QA', task: 'fleet-verify', executingProvider: 'Claude' },
    ];
    for (const a of assignments) {
      const { primary } = getProviderForTask(a.taskType);
      const key = keys[primary.toLowerCase() as keyof typeof keys] || keys.grok;
      if (key) {
        try {
          const resp = await callLLM(primary, `Execute fleet task: ${a.task} cross-project.`, key);
          console.log(`[REAL ${primary}] ${a.taskType}: ${resp.slice(0, 90)}`);
        } catch (e) {
          console.log(`[ERROR ${primary}] ${a.taskType}`);
        }
      }
    }

    // Routing + isolation (data logic intact)
    const cycleAs = [
      { taskType: 'Code scaffolding / development', task: 'fleet-grid-cycle' },
      { taskType: 'Research / signal discovery', task: 'fleet-signal-cycle' },
      { taskType: 'Orchestration / management', task: 'fleet-orchestrate-cycle' },
      { taskType: 'Isolated verification / QA', task: 'fleet-verify-cycle', executingProvider: 'Claude' },
    ];
    cycleAs.forEach((a) => {
      const exec = (a as any).executingProvider || 'Claude';
      let { primary } = getProviderForTask(a.taskType, exec);
      if (a.taskType.includes('verification') || a.taskType.includes('QA')) {
        const iso = enforceProviderIsolation(exec, primary, 'cycle_fleet');
        primary = iso.verifierProvider;
      }
      logProviderAssignment(a.task, a.taskType, primary, 'Fleet Command trigger (exact PNG match)');
    });

    // eslint-disable-next-line no-alert
    alert('Fleet-Wide Cycle triggered. Providers assigned via routing + isolation enforced.');
  };

  return (
    <div className="p-8 bg-[#F8F9FB] min-h-full text-[#14141A]">
      {/* Header: Breadcrumb handled by AppTopbar; Title + violet trigger button with lightning */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] leading-none font-semibold tracking-[-0.4px]">Fleet Command Center</h1>
        </div>
        <Button
          onClick={triggerFleetCycle}
          className="h-9 px-4 rounded-[8px] bg-[#6D5EF0] hover:bg-[#5B4ED1] text-white text-[13px] font-medium flex items-center gap-2 border-0"
        >
          <Zap className="h-4 w-4" /> Trigger Fleet-Wide Cycle
        </Button>
      </div>

      {/* 4 KPI cards — exact layout, icons, sublabels, and pass-rate bar from PNG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Projects */}
        <div className="command-card p-5">
          <div className="w-8 h-8 rounded-full bg-[#F0EDFF] flex items-center justify-center mb-3">
            <Folder className="h-4 w-4 text-[#6D5EF0]" />
          </div>
          <div className="text-[28px] font-semibold tabular-nums">18</div>
          <div className="text-[13px] font-medium mt-0.5">Projects</div>
          <div className="text-[12px] text-[#6B6B78] mt-0.5">Across all workspaces</div>
        </div>

        {/* Active Agents */}
        <div className="command-card p-5">
          <div className="w-8 h-8 rounded-full bg-[#F0EDFF] flex items-center justify-center mb-3">
            <Users className="h-4 w-4 text-[#6D5EF0]" />
          </div>
          <div className="text-[28px] font-semibold tabular-nums">47</div>
          <div className="text-[13px] font-medium mt-0.5">Active Agents</div>
          <div className="text-[12px] text-[#6B6B78] mt-0.5">Across all projects</div>
        </div>

        {/* Total Tasks */}
        <div className="command-card p-5">
          <div className="w-8 h-8 rounded-full bg-[#F0EDFF] flex items-center justify-center mb-3">
            <CheckCircle2 className="h-4 w-4 text-[#6D5EF0]" />
          </div>
          <div className="text-[28px] font-semibold tabular-nums">368</div>
          <div className="text-[13px] font-medium mt-0.5">Total Tasks</div>
          <div className="text-[12px] text-[#6B6B78] mt-0.5">Running + queued</div>
        </div>

        {/* Fleet Verifier Pass Rate */}
        <div className="command-card p-5">
          <div className="w-8 h-8 rounded-full bg-[#F0EDFF] flex items-center justify-center mb-3">
            <Shield className="h-4 w-4 text-[#6D5EF0]" />
          </div>
          <div className="flex items-baseline gap-1">
            <div className="text-[28px] font-semibold tabular-nums">93%</div>
          </div>
          <div className="text-[13px] font-medium mt-0.5">Fleet Verifier Pass Rate</div>
          <div className="mt-2 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div className="h-1.5 bg-[#6D5EF0] rounded-full" style={{ width: '93%' }} />
          </div>
          <div className="text-[11px] text-[#6B6B78] mt-1">Target: 90%</div>
        </div>
      </div>

      {/* Project Fleet — 3 cards exactly as PNG: name + status badge + provider chips + Tasks/hour + sparkline + rate */}
      <div className="mb-8">
        <div className="text-[13px] font-semibold text-[#14141A] mb-3 tracking-[-0.1px]">Project Fleet</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FLEET_PROJECTS.map((proj, idx) => {
            const isRunning = proj.status === 'Running';
            return (
              <div key={idx} className="command-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-[14px]">{proj.name}</div>
                  <span
                    className={`status-pill ${isRunning ? 'running' : 'review'} text-[10px] px-2 py-px`}
                  >
                    {proj.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {proj.providers.map((prov, pidx) => (
                    <span key={pidx} className={getProviderClass(prov)}>{prov}</span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[12px] text-[#6B6B78]">
                  <span>Tasks / hour</span>
                  <Sparkline points={proj.sparkPoints} />
                  <span className="font-medium text-[#14141A] tabular-nums">{proj.rate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Project Agent Roster table — exact columns, 7 rows, icons, chips, status dots */}
      <div>
        <div className="text-[13px] font-semibold text-[#14141A] mb-3 tracking-[-0.1px]">Cross-Project Agent Roster</div>
        <div className="command-card overflow-hidden border border-[#E5E7EB]">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                <th className="p-3 text-left font-medium text-[#6B6B78]">Agent</th>
                <th className="p-3 text-left font-medium text-[#6B6B78]">Provider</th>
                <th className="p-3 text-left font-medium text-[#6B6B78]">Project</th>
                <th className="p-3 text-left font-medium text-[#6B6B78]">Current Task</th>
                <th className="p-3 text-left font-medium text-[#6B6B78] w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {AGENT_ROSTER.map((agent, idx) => {
                const Icon = agent.icon;
                const isRunning = agent.status === 'running';
                return (
                  <tr key={idx} className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F8F9FB]">
                    <td className="p-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Icon className="h-3.5 w-3.5 text-[#6B6B78]" />
                        {agent.name}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={getProviderClass(agent.provider)}>{agent.provider}</span>
                    </td>
                    <td className="p-3 text-[#6B6B78]">{agent.project}</td>
                    <td className="p-3 text-[#14141A]">{agent.task}</td>
                    <td className="p-3">
                      <span className={`status-pill ${isRunning ? 'running' : 'review'} inline-flex items-center gap-1.5`}>
                        <span className="status-dot" style={{ background: isRunning ? '#1FAE7A' : '#D99A1B' }} />
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-[#9B9BA8] text-right mt-1.5 pr-1">Showing 7 of 7 agents</div>
      </div>
    </div>
  );
}