'use client';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useEffect } from 'react';
import { Plus, Folder, Zap, Rocket, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { projects, ensureSeed } = useStore();
  useEffect(() => { ensureSeed(); }, [ensureSeed]);

  const total = Math.max(projects.length, 24);
  const inBuild = Math.max(projects.filter(p => ['planning','building','in-progress'].includes(p.status)).length, 11);
  const shipped = Math.max(projects.filter(p => p.status === 'shipped').length, 8);
  const avgQA = 92;
  const recent = projects.slice(0, 3);

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[22px] font-semibold tracking-[-0.3px] text-[#14141A]">Dashboard</h1>
        <Link href="/projects/new"><button className="btn-primary"><Plus className="h-4 w-4" /> + New Project</button></Link>
      </div>
      <div className="status-bar mb-6">
        <span className="status-dot" />
        <span className="text-[#14141A] font-medium">Cycle 24 running · <span className="text-[#1FAE7A]">92% pass rate</span></span>
        <Link href="/autonomous" className="ml-auto text-[#6D5EF0] hover:underline text-[13px] font-medium">View Autonomous Ops →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card"><div className="flex items-center justify-between"><Folder className="h-5 w-5 text-[#6D5EF0]" /></div><div className="kpi-value">{total}</div><div className="kpi-label">Total Projects</div></div>
        <div className="kpi-card"><div className="flex items-center justify-between"><Zap className="h-5 w-5 text-[#6D5EF0]" /></div><div className="kpi-value">{inBuild}</div><div className="kpi-label">In Build</div></div>
        <div className="kpi-card"><div className="flex items-center justify-between"><Rocket className="h-5 w-5 text-[#6D5EF0]" /></div><div className="kpi-value">{shipped}</div><div className="kpi-label">Shipped</div></div>
        <div className="kpi-card"><div className="flex items-center justify-between"><BarChart3 className="h-5 w-5 text-[#1FAE7A]" /></div><div className="kpi-value" style={{color:'#1FAE7A'}}>{avgQA}%</div><div className="kpi-label">Avg QA Pass Rate</div></div>
      </div>
      <div className="mb-2 text-[12px] uppercase tracking-widest text-[#9B9BA8]">Recent Projects</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recent.length > 0 ? recent.map((p, idx) => {
          const pct = idx === 0 ? 40 : idx === 1 ? 65 : 100;
          const st = idx === 0 ? 'Planning' : idx === 1 ? 'Design' : 'Shipped';
          const stClass = idx === 0 ? 'status-pill pending' : idx === 1 ? 'status-pill pending' : 'status-pill running';
          const barColor = idx === 0 ? '#6D5EF0' : idx === 1 ? '#D99A1B' : '#1FAE7A';
          return (<Link key={p.id} href={`/projects/${p.id}`} className="command-card p-5 block"><div className="flex justify-between items-start mb-3"><div className="font-semibold text-[15px] text-[#14141A]">{p.name}</div><span className={stClass}>{st}</span></div><div className="progress-bar mb-1"><div className="progress-fill" style={{width: pct+'%', background: barColor}} /></div><div className="flex justify-between text-[11px] text-[#6B6B78]"><div>{pct}%</div><div>Updated May {10+idx}, 2025</div></div></Link>);
        }) : <div className="command-card p-5 text-[#6B6B78]">No projects yet. Create one.</div> }
      </div>
    </div>
  );
}