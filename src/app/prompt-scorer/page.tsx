'use client'
import { useState, useCallback } from 'react'
import AppNav from '@/components/layout/AppNav'
import {
  Tag, SectionLabel, LoadingBar, ErrorBox, ScoreBar,
  CollapsibleSection, StatCard, Button, IssueItem, Select, Textarea
} from '@/components/ui'
import { ApiKeyBanner } from '@/components/ui/ApiKeyBanner'
import { useApiKey } from '@/lib/ApiKeyContext'
import { callAnthropic, parseJSON } from '@/lib/anthropic'
import { PromptScoreResult } from '@/types'
import { scoreColor, gradeColor, downloadFile, copyToClipboard, cn } from '@/lib/utils'

const ACCENT = '#f59e0b'

const USE_CASES = [
  { value: 'general', label: 'General Purpose' },
  { value: 'coding', label: 'Coding / Technical' },
  { value: 'creative', label: 'Creative Writing' },
  { value: 'analysis', label: 'Analysis / Research' },
  { value: 'instruction', label: 'Instruction Following' },
  { value: 'rlhf', label: 'RLHF / Annotation' },
]

const MODELS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
]

const DIM_META = [
  { key: 'clarity', icon: '◎', label: 'Clarity' },
  { key: 'specificity', icon: '◈', label: 'Specificity' },
  { key: 'context', icon: '◉', label: 'Context' },
  { key: 'constraints', icon: '▣', label: 'Constraints' },
  { key: 'output_format', icon: '▤', label: 'Output Format' },
  { key: 'complexity_match', icon: '◐', label: 'Complexity Match' },
] as const

const EXAMPLE_PROMPTS = [
  'Write a Python function that sorts a list',
  'Explain quantum entanglement to a 10-year-old in 3 paragraphs with a real-world analogy. Avoid jargon.',
  'You are a senior software engineer. Review this code for bugs, performance issues, and style violations. Return a JSON array where each item has: line, severity (error|warning|info), and message.',
]

export default function PromptScorerPage() {
  const { apiKey } = useApiKey()
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('claude-sonnet-4-20250514')
  const [useCase, setUseCase] = useState('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<PromptScoreResult | null>(null)
  const [history, setHistory] = useState<PromptScoreResult[]>([])
  const [copied, setCopied] = useState(false)

  const score = useCallback(async () => {
    if (!prompt.trim()) { setError('Please enter a prompt to score.'); return }
    if (!apiKey) { setError('Please add your Anthropic API key above.'); return }
    setLoading(true); setError(''); setResult(null)

    const systemPrompt = `You are an expert LLM prompt quality evaluator for an RLHF post-training pipeline at an AI research company.

Score the given prompt on EXACTLY these 6 dimensions, each from 1–10:

1. CLARITY — Is the prompt unambiguous? Does it say exactly what it wants?
2. SPECIFICITY — How concrete and detailed are the requirements?
3. CONTEXT — Does it provide necessary background? Does the LLM have what it needs?
4. CONSTRAINTS — Are limits, format, length, tone, or scope defined?
5. OUTPUT_FORMAT — Is the desired output format specified (JSON, list, paragraph, code, etc.)?
6. COMPLEXITY_MATCH — Is the difficulty appropriate for the use case?

Use case context: ${useCase}

Respond ONLY in this exact JSON format, no markdown, no extra text:
{
  "overall": <number 1-10>,
  "grade": "<one of: Excellent | Good | Fair | Poor | Terrible>",
  "summary": "<2-3 sentence overall assessment>",
  "dimensions": {
    "clarity":          { "score": <1-10>, "feedback": "<1-2 sentences>", "tip": "<specific fix if score < 8>" },
    "specificity":      { "score": <1-10>, "feedback": "<1-2 sentences>", "tip": "<specific fix if score < 8>" },
    "context":          { "score": <1-10>, "feedback": "<1-2 sentences>", "tip": "<specific fix if score < 8>" },
    "constraints":      { "score": <1-10>, "feedback": "<1-2 sentences>", "tip": "<specific fix if score < 8>" },
    "output_format":    { "score": <1-10>, "feedback": "<1-2 sentences>", "tip": "<specific fix if score < 8>" },
    "complexity_match": { "score": <1-10>, "feedback": "<1-2 sentences>", "tip": "<specific fix if score < 8>" }
  },
  "issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "improved_prompt": "<full rewritten version scoring 9+ on all dimensions>"
}`

    try {
      const raw = await callAnthropic({
        apiKey,
        model,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Score this prompt:\n\n${prompt}` }],
        maxTokens: 1500,
      })
      const data = parseJSON<PromptScoreResult>(raw)
      const full: PromptScoreResult = { ...data, prompt, useCase, model, timestamp: Date.now() }
      setResult(full)
      setHistory(h => [full, ...h].slice(0, 20))
    } catch (e) {
      setError((e as Error).message || 'Scoring failed.')
    } finally {
      setLoading(false)
    }
  }, [prompt, model, useCase, apiKey])

  const avgScore = history.length
    ? (history.reduce((a, b) => a + b.overall, 0) / history.length).toFixed(1)
    : '—'
  const bestScore = history.length ? Math.max(...history.map(h => h.overall)) : null

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Tag color={ACCENT}>S3 — Saturday Project</Tag>
            <h1 className="font-['Syne'] text-4xl md:text-5xl font-black mt-3 mb-2 leading-tight">
              Prompt <span style={{ color: ACCENT }}>Quality</span> Scorer
            </h1>
            <p className="text-[var(--text3)] text-[11px] tracking-wider">// LLM Post-Training Toolkit — Ethara AI</p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <StatCard value={history.length} label="Scored" color={ACCENT} />
            <StatCard value={avgScore} label="Avg Score" color={ACCENT} />
            <StatCard value={bestScore ?? '—'} label="Best" color={ACCENT} />
          </div>
        </div>

        {/* API Key Banner */}
        <ApiKeyBanner accentColor={ACCENT} />

        {/* Input panel */}
        <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg overflow-hidden mb-4 focus-within:border-amber-500/40 transition-colors duration-200">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg3)] border-b border-[var(--border)]">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--text2)]">
              // Prompt Input
            </span>
            <span className="text-[10px] text-[var(--text3)] tabular-nums">{prompt.length} chars</span>
          </div>
          <Textarea
            value={prompt}
            onChange={setPrompt}
            placeholder={`Paste or type your prompt here...\n\nExamples:\n• "Write a Python function that sorts a list"\n• "Explain quantum entanglement to a 10-year-old in 3 paragraphs with an analogy"`}
            minRows={7}
            className="rounded-none border-0 focus:border-0 bg-transparent"
          />
        </div>

        {/* Example prompts */}
        <div className="flex gap-2 flex-wrap mb-4">
          <span className="text-[9px] text-[var(--text3)] uppercase tracking-wider self-center">Examples:</span>
          {EXAMPLE_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPrompt(p)}
              className="text-[10px] text-[var(--text3)] hover:text-amber-400 border border-[var(--border)] hover:border-amber-500/30 px-2.5 py-1 rounded transition-all duration-150 max-w-[200px] truncate"
            >
              {p.slice(0, 40)}...
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2.5 mb-6 flex-wrap items-center">
          <Select value={model} onChange={setModel}>
            {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
          <Select value={useCase} onChange={setUseCase}>
            {USE_CASES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </Select>
          <Button
            onClick={score}
            disabled={loading}
            color={ACCENT}
          >
            {loading ? '⏳ Scoring...' : '▶ Score Prompt'}
          </Button>
          <Button variant="ghost" onClick={() => { setPrompt(''); setResult(null); setError('') }}>
            Clear
          </Button>
          <span className="text-[9px] text-[var(--text3)] ml-1">or Ctrl+Enter</span>
        </div>

        <LoadingBar active={loading} />
        <ErrorBox message={error} />

        {/* Results */}
        {result && (
          <div className="animate-fadeUp">

            {/* Overall card */}
            <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-6 mb-4 flex items-center gap-8 flex-wrap">
              {/* Ring score */}
              <div className="relative flex-shrink-0">
                <svg width="96" height="96" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={scoreColor(result.overall)}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="251.3"
                    strokeDashoffset={251.3 * (1 - result.overall / 10)}
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-['Syne'] text-2xl font-black leading-none" style={{ color: scoreColor(result.overall) }}>
                    {result.overall}
                  </span>
                  <span className="text-[9px] text-[var(--text3)]">/10</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-['Syne'] text-3xl font-black mb-1" style={{ color: gradeColor(result.grade) }}>
                  {result.grade}
                </div>
                <div className="text-[10px] text-[var(--text3)] uppercase tracking-wider mb-3">
                  Overall Quality — {useCase} use case
                </div>
                <p className="text-[12px] text-[var(--text2)] leading-relaxed max-w-xl">{result.summary}</p>
              </div>
            </div>

            {/* Dimensions */}
            <CollapsibleSection title="Dimension Breakdown" icon="◈" accentColor={ACCENT}>
              <div className="grid md:grid-cols-2 gap-3">
                {DIM_META.map(({ key, icon, label }, i) => {
                  const d = result.dimensions[key as keyof typeof result.dimensions]
                  const s = d?.score || 0
                  return (
                    <div
                      key={key}
                      className={cn('bg-[var(--bg3)] border border-[var(--border)] rounded p-3.5 animate-fadeUp')}
                      style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[var(--text2)] flex items-center gap-1.5">
                          <span>{icon}</span>{label}
                        </span>
                        <span
                          className="text-[12px] font-bold px-2 py-0.5 rounded text-sm"
                          style={{ color: scoreColor(s), background: `${scoreColor(s)}18` }}
                        >
                          {s}/10
                        </span>
                      </div>
                      <ScoreBar score={s} color={scoreColor(s)} />
                      <p className="text-[11px] text-[var(--text2)] leading-relaxed mt-2.5">{d?.feedback}</p>
                      {d?.tip && s < 8 && (
                        <div className="mt-2 text-[10px] text-[var(--text3)] bg-[var(--bg4)] px-2.5 py-1.5 rounded border-l-2 leading-relaxed" style={{ borderColor: ACCENT }}>
                          → {d.tip}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CollapsibleSection>

            {/* Issues & Strengths */}
            <CollapsibleSection title="Issues & Strengths" icon="◉" accentColor="var(--text2)">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-red-400 mb-3 flex items-center gap-2">
                    ✗ Issues Found
                  </div>
                  {result.issues.length
                    ? result.issues.map((iss, i) => <IssueItem key={i} type="issue">{iss}</IssueItem>)
                    : <p className="text-[11px] text-[var(--text3)]">No major issues found</p>}
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-emerald-400 mb-3 flex items-center gap-2">
                    ✓ Strengths
                  </div>
                  {result.strengths.length
                    ? result.strengths.map((s, i) => <IssueItem key={i} type="strength">{s}</IssueItem>)
                    : <p className="text-[11px] text-[var(--text3)]">No standout strengths</p>}
                </div>
              </div>
            </CollapsibleSection>

            {/* Improved rewrite */}
            <CollapsibleSection title="Improved Rewrite" icon="⚡" accentColor={ACCENT}>
              <div className="bg-[var(--bg3)] border border-[var(--border)] rounded overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
                  <span className="text-[9px] text-[var(--text3)] tracking-wider uppercase">Optimized prompt — scores 9+ on all dimensions</span>
                  <button
                    onClick={async () => {
                      await copyToClipboard(result.improved_prompt)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }}
                    className={cn(
                      'text-[10px] px-2.5 py-1 rounded border transition-all duration-150',
                      copied
                        ? 'border-emerald-500/40 text-emerald-400'
                        : 'border-[var(--border)] text-[var(--text3)] hover:border-amber-500/40 hover:text-amber-400'
                    )}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 text-[12px] text-[var(--text)] leading-relaxed whitespace-pre-wrap font-mono">
                  {result.improved_prompt}
                </pre>
              </div>
            </CollapsibleSection>

            {/* Export */}
            <div className="flex gap-2 justify-end mt-4 flex-wrap">
              <SectionLabel>Export:</SectionLabel>
              <Button variant="outline" onClick={() => downloadFile(JSON.stringify(result, null, 2), 'prompt_score.json', 'application/json')}>
                JSON
              </Button>
              <Button variant="outline" onClick={() => {
                const dims = ['clarity','specificity','context','constraints','output_format','complexity_match']
                const hdr = ['timestamp','overall','grade','use_case','prompt',...dims].join(',')
                const row = [result.timestamp, result.overall, result.grade, result.useCase, JSON.stringify(result.prompt), ...dims.map(d => result.dimensions[d as keyof typeof result.dimensions]?.score)].join(',')
                downloadFile([hdr, row].join('\n'), 'prompt_scores.csv', 'text/csv')
              }}>
                CSV
              </Button>
              <Button variant="outline" onClick={() => {
                const line = JSON.stringify({ prompt: result.prompt, overall_score: result.overall, grade: result.grade, dimensions: Object.fromEntries(Object.entries(result.dimensions).map(([k,v]) => [k, v.score])), improved_prompt: result.improved_prompt, use_case: result.useCase, timestamp: result.timestamp })
                downloadFile(line + '\n', 'prompt_quality.jsonl', 'application/jsonl')
              }}>
                JSONL
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="text-center py-16 text-[var(--text3)]">
            <div className="text-4xl mb-4 opacity-30">↑</div>
            <p className="text-[12px] tracking-wider">Paste a prompt above and click Score Prompt</p>
            <p className="text-[10px] mt-2 text-[var(--text4)]">6 dimensions · improved rewrite · JSONL export</p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <SectionLabel>// Session History ({history.length})</SectionLabel>
            <div className="flex flex-col gap-2">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setPrompt(h.prompt || ''); setResult(h) }}
                  className="flex items-center gap-3 bg-[var(--bg2)] border border-[var(--border)] hover:border-[var(--border2)] px-3 py-2.5 rounded text-left transition-all duration-150 w-full"
                >
                  <span className="font-bold text-[13px] w-8 flex-shrink-0 tabular-nums" style={{ color: scoreColor(h.overall) }}>{h.overall}</span>
                  <span className="text-[11px] text-[var(--text2)] flex-1 truncate">{h.prompt}</span>
                  <span className="text-[9px] text-[var(--text3)] flex-shrink-0">{h.grade}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
