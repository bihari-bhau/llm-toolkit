'use client'
import Link from 'next/link'

const tools = [
  {
    tag: 'S3',
    href: '/prompt-scorer',
    title: 'Prompt Quality Scorer',
    desc: 'Score any LLM prompt across 6 quality dimensions — Clarity, Specificity, Context, Constraints, Output Format, Complexity Match. Get an improved rewrite instantly.',
    accent: '#f59e0b',
    accentDim: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.2)',
    dims: ['Clarity', 'Specificity', 'Context', 'Constraints', 'Output Format', 'Complexity'],
    badge: '6 dimensions',
  },
  {
    tag: 'S4',
    href: '/conversation-analyzer',
    title: 'Conversation Analyzer',
    desc: 'Analyze multi-turn LLM conversations across 8 quality dimensions with per-turn breakdown, RLHF signals, alignment risk scoring, and training value assessment.',
    accent: '#06b6d4',
    accentDim: 'rgba(6,182,212,0.08)',
    accentBorder: 'rgba(6,182,212,0.2)',
    dims: ['Coherence', 'Helpfulness', 'Instruction Following', 'Factual Accuracy', 'Context Retention', 'Tone', 'Response Quality', 'Engagement'],
    badge: '8 dimensions',
  },
]

export default function HomePage() {
  return (
    <main className="relative z-10 max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--cyan)] bg-[var(--cyan-dim)] border border-[rgba(6,182,212,0.2)] px-3 py-1 rounded-sm mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulseDot" />
          LLM Post-Training Toolkit
        </div>
        <h1 className="font-['Syne'] text-5xl md:text-6xl font-black leading-[1.0] tracking-tight mb-4">
          Evaluate.<br />
          <span className="text-[var(--cyan)]">Improve.</span><br />
          Ship better prompts.
        </h1>
        <p className="text-[var(--text2)] text-sm leading-relaxed max-w-xl mt-5">
          AI-powered tools for LLM post-training evaluation and RLHF dataset building.
          Built at{' '}
          <span className="text-[var(--text)] font-semibold">Ethara AI</span>{' '}
          as part of the Saturday Projects series.
        </p>

        <div className="flex gap-3 mt-7 flex-wrap">
          <a
            href="https://github.com/bihari-bhau"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[11px] text-[var(--text2)] border border-[var(--border)] hover:border-[var(--border2)] hover:text-[var(--text)] px-4 py-2 rounded transition-all duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            bihari-bhau
          </a>
          <a
            href="https://linkedin.com/in/biharibhau"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[11px] text-[var(--text2)] border border-[var(--border)] hover:border-[var(--border2)] hover:text-[var(--text)] px-4 py-2 rounded transition-all duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            biharibhau
          </a>
        </div>
      </div>

      {/* Tool cards */}
      <div className="grid md:grid-cols-2 gap-5 mb-16">
        {tools.map((tool) => (
          <Link key={tool.tag} href={tool.href}>
            <div
              className="group relative border rounded-lg p-6 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: tool.accentDim,
                borderColor: tool.accentBorder,
              }}
            >
              {/* Tag */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-1 rounded-sm border"
                  style={{ color: tool.accent, background: tool.accentDim, borderColor: tool.accentBorder }}
                >
                  {tool.tag} — Saturday Project
                </span>
                <span
                  className="text-[9px] font-semibold tracking-[0.1em] uppercase"
                  style={{ color: tool.accent }}
                >
                  {tool.badge}
                </span>
              </div>

              {/* Title */}
              <h2
                className="font-['Syne'] text-2xl font-bold mb-3 group-hover:opacity-90 transition-opacity"
                style={{ color: tool.accent }}
              >
                {tool.title}
              </h2>

              {/* Desc */}
              <p className="text-[var(--text2)] text-[12px] leading-relaxed mb-5">
                {tool.desc}
              </p>

              {/* Dimension chips */}
              <div className="flex flex-wrap gap-1.5">
                {tool.dims.map((d) => (
                  <span
                    key={d}
                    className="text-[9px] font-semibold tracking-[0.06em] uppercase px-2 py-0.5 rounded-sm border"
                    style={{ color: tool.accent, borderColor: tool.accentBorder, background: 'rgba(0,0,0,0.3)' }}
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div
                className="absolute bottom-5 right-5 text-lg opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
                style={{ color: tool.accent }}
              >
                →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border)] pt-8 flex items-center justify-between flex-wrap gap-4">
        <div className="text-[10px] text-[var(--text3)] tracking-wider">
          // Built by Shubham Singh · LLM Post-Training Intern · Ethara AI · Gurugram
        </div>
        <div className="flex gap-4">
          {['S1 — LLM Evaluator ✓', 'S2 — RLHF Builder ✓', 'S3 — Prompt Scorer ✓', 'S4 — Conv Analyzer ✓'].map(s => (
            <span key={s} className="text-[9px] text-[var(--green)] tracking-wider">{s}</span>
          ))}
        </div>
      </div>
    </main>
  )
}
