'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { X } from 'lucide-react';

const DEFAULT_FEATURES = ['Auth', 'Billing', 'Analytics', 'RAG search', 'Admin panel'];

export default function IntakeWizard() {
  const [features, setFeatures] = useState<string[]>([...DEFAULT_FEATURES]);
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const create = useStore(s => s.createProject);

  function addFeature() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (features.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('');
      return;
    }
    setFeatures([...features, trimmed]);
    setInputValue('');
  }

  function removeFeature(featureToRemove: string) {
    setFeatures(features.filter(f => f !== featureToRemove));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  }

  function handleBack() {
    router.push('/');
  }

  function handleContinue() {
    const id = create({
      name: 'New Agent Project',
      description: 'Created via Intake Wizard',
      intake: {
        problemStatement: '',
        targetUsers: 'Developers',
        coreFeatures: features.length > 0 ? features : DEFAULT_FEATURES,
        nonGoals: [],
        constraints: '',
        successCriteria: '',
        timeline: ''
      },
      stack: {
        framework: 'Next.js',
        language: 'TS',
        styling: 'Tailwind',
        stateManagement: 'Zustand',
        database: 'local',
        deployment: 'Vercel',
        testing: 'manual'
      }
    });
    router.push(`/projects/${id}`);
  }

  // Exact visual for Step 2 Core Features per reference PNG
  return (
    <div className="px-6 pt-8 pb-12 flex justify-center">
      <div className="w-full max-w-[520px]">
        {/* Progress: Step 2 / 5 with thin violet progress bar */}
        <div className="mb-6">
          <div className="text-[13px] text-[#6B6B78] font-medium tracking-[-0.1px] mb-1.5">
            Step 2 / 5
          </div>
          <div className="h-[2px] w-full bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-[2px] bg-[#6D5EF0] transition-all"
              style={{ width: '40%' }}
            />
          </div>
        </div>

        {/* Centered white card: 12px radius, subtle border, command-card polish */}
        <div className="command-card p-8">
          <h1 className="text-[20px] font-semibold tracking-[-0.3px] text-[#14141A] mb-6">
            Core Features
          </h1>

          {/* Input with exact placeholder */}
          <div className="mb-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a feature and press enter"
              className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-[14px] placeholder:text-[#9B9BA8] text-[#14141A] focus:outline-none focus:border-[#6D5EF0] focus:ring-1 focus:ring-[#6D5EF0]/30 transition-colors"
            />
          </div>

          {/* Helper text exactly as specified */}
          <p className="text-[13px] leading-snug text-[#6B6B78] mb-5">
            Add the key features your agent or system should support.
          </p>

          {/* Removable feature chips: purple-bordered violet pills */}
          <div className="flex flex-wrap gap-2 min-h-[32px] mb-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-[13px] font-medium border border-[#6D5EF0] bg-[#F0EDFF] text-[#6D5EF0] select-none"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-[#6D5EF0]/10 text-[#6D5EF0] transition-colors"
                  aria-label={`Remove ${feature}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {features.length === 0 && (
              <span className="text-[12px] text-[#9B9BA8]">No features yet. Add some above.</span>
            )}
          </div>

          {/* Bottom actions inside card: Back (gray) | Continue (violet primary) — one primary action */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
            <button
              onClick={handleBack}
              className="btn-secondary px-5 py-[7px] text-[13px] font-medium rounded-[8px]"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              className="btn-primary px-6 py-[7px] text-[13px] font-medium rounded-[8px]"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}