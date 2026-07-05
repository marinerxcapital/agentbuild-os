'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function NewProjectExact() {
  const [features, setFeatures] = useState(['Auth', 'Billing', 'Analytics', 'RAG search', 'Admin panel']);
  const [input, setInput] = useState('');
  const addFeature = () => { if (input.trim() && !features.includes(input.trim())) { setFeatures([...features, input.trim()]); setInput(''); } };
  const remove = (f: string) => setFeatures(features.filter(x => x !== f));
  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      <div className="text-[12px] text-[#6B6B78] mb-2">Dashboard / Projects / New Project</div>
      <div className="mb-6"><div className="text-[11px] text-[#6B6B78] mb-1">Step 2 / 5</div><div className="h-1 bg-[#E5E7EB] rounded"><div className="h-1 w-[40%] bg-[#6D5EF0] rounded" /></div></div>
      <div className="max-w-[560px] mx-auto">
        <div className="command-card p-8">
          <h2 className="text-center text-[20px] font-semibold mb-1 tracking-[-0.2px]">Core Features</h2>
          <p className="text-center text-[#6B6B78] text-sm mb-4">Add the key features your agent or system should support.</p>
          <div className="mb-2 text-[12px] text-[#6B6B78]">Add features</div>
          <div className="flex gap-2 mb-3"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e => { if (e.key==='Enter') addFeature(); }} placeholder="Type a feature and press enter" className="flex-1 border border-[#E5E7EB] rounded px-3 py-2 text-sm outline-none focus:border-[#6D5EF0]" /><button onClick={addFeature} className="btn-primary">Add</button></div>
          <div className="flex flex-wrap gap-2 mb-6 min-h-[36px]">{features.map(f => (<span key={f} className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#6D5EF0] bg-[#F0EDFF] text-[#6D5EF0] text-xs">{f} <button onClick={() => remove(f)} className="ml-1">x</button></span>))}</div>
          <div className="flex justify-between pt-2 border-t border-[#E5E7EB]"><Link href="/"><button className="btn-secondary">Back</button></Link><Link href="/projects/new"><button className="btn-primary">Continue</button></Link></div>
        </div>
      </div>
    </div>
  );
}