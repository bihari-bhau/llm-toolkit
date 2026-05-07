'use client'
import { useState, useCallback } from 'react'
import AppNav from '@/components/layout/AppNav'
import {
  Tag, SectionLabel, LoadingBar, ErrorBox, ScoreBar,
  CollapsibleSection, StatCard, Button, IssueItem, Select, Textarea, Chip
} from '@/components/ui'
import { ApiKeyBanner } from '@/components/ui/ApiKeyBanner'
import { useApiKey } from '@/lib/ApiKeyContext'
import { callAnthropic, parseJSON } from '@/lib/anthropic'
import { ConvAnalysisResult, ConvTurn, Turn, Role } from '@/types'
import { scoreColor, verdictColor, parsePasteText, parseJSONConversation, downloadFile, cn } from '@/lib/utils'

const ACCENT = '#06b6d4'
let idCounter = 0

const DOMAINS = [
  { value: 'general', label: 'General' },
  { value: 'coding', label: 'Coding / Technical' },
  { value: 'customer_support', label: 'Customer Support' },
  { value: 'education', label: 'Education / Tutoring' },
  { value: 'creative', label: 'Creative Writing' },
  { value: 'rlhf', label: 'RLHF Annotation' },
]

const MODELS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
]

const EXAMPLE_CONV: ConvTurn[] = [
  { role: 'system', content: 'You are a helpful Python tutor for beginners.' },
  { role: 'user', content: 'can u explain recursion' },
  { role: 'assistant', content: 'Recursion is when a function calls itself to solve a smaller version of the same problem. Every recursive function needs a base case to stop, and a recursive case that moves toward the base case.\n\nHere\'s a factorial example:\n```python\ndef factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n```' },
  { role: 'user', content: 'ok but why would i use this instead of a loop' },
  { role: 'assistant', content: 'Great question! Recursion vs loops depends on the problem. Recursion shines when the problem is naturally hierarchical — like traversing a tree or parsing nested structures. Loops are better for simple iteration and are usually more memory-efficient since they don\'t create new stack frames.\n\nFor factorial specifically, a loop is actually better in Python because Python has a recursion limit (~1000) and doesn\'t optimize tail calls.' },
  { role: 'user', content: 'what is a stack frame' },
]

const DIM_KEYS = ['coherence','helpfulness','instruction_following','factual_accuracy','context_retention','tone_consistency','response_quality','engagement'] as const

const RLHF_RISK_COLORS: Record<string, string> = {
  none: '#10b981', low: '#34d399', medium: '#f59e0b', high: '#ef4444'
}

type InputMode = 'builder' | 'paste' | 'json'

export default function ConversationAnalyzerPage() {
  const { apiKey } = useApiKey()
  const [mode, setMode] = useState<InputMode>('builder')
  const [turns, setTurns] = useState<Turn[]>([])
  const [pasteText, setPasteText] = useState('')
  const [jsonText, setJsonText] = useState('')
  const [model, setModel] = useState('claude-sonnet-4-20250514')
  const [domain, setDomain] = useState('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ConvAnalysisResult | null>(null)
  const [history, setHistory] = useState<ConvAnalysisResult[]>([])
  const [openTurns, setOpenTurns] = useState<Set<number>>(new Set())

  // ── Turn builder ────────────────────────────────────────────────────────────
  const addTurn = (role: Role) => {
    setTurns(t => [...t, { id: ++idCounter, role, content: '' }])
  }

  const delTurn = (id: number) => setTurns(t => t.filter(x => x.id !== id))

  const updateTurn = (id: number, field: 'role' | 'content', value: string) => {
    setTurns(t => t.map(x => x.id === id ? { ...x, [field]: value } : x))
  }

  const loadExample = () => {
    setTurns(EXAMPLE_CONV.map(t => ({ id: ++idCounter, ...t })))
  }

  // ── Get conversation ────────────────────────────────────────────────────────
  const getConversation = useCallback((): ConvTurn[] => {
    if (mode === 'builder') return turns.filter(t => t.content.trim()).map(t => ({ role: t.role, content: t.content.trim() }))
    if (mode === 'paste') return parsePasteText(pasteText)
    return parseJSONConversation(jsonText)
  }, [mode, turns, pasteText, jsonText])

  // ── Analyze ─────────────────────────────────────────────────────────────────
  const analyze = useCallback(async () => {
    let conv: ConvTurn[]
    try { conv = getConversation() } catch (e) { setError('Parse error: ' + (e as Error).message); return }
    if (!conv.length) { setError('No conversation turns found.'); return }
    if (!apiKey) { setError('Please add your Anthropic API key above.'); return }

    setLoading(true); setError(''); setResult(null)

    const convStr = conv
      .map((t, i) => `Turn ${i + 1} [${t.role.toUpperCase()}]: ${t.content}`)
      .join('\n\n')

    const systemPrompt = `You are an expert LLM conversation quality evaluator for an RLHF post-training pipeline.

Analyze the given multi-turn conversation and respond ONLY in this exact JSON format, no markdown:

{
  "overall": <1-10>,
  "verdict": "<Excellent|Good|Fair|Poor|Broken>",
  "summary": "<2-3 sentence holistic assessment>",
  "dimensions": {
    "coherence":             {"score":<1-10>,"label":"Coherence","detail":"<explanation>"},
    "helpfulness":           {"score":<1-10>,"label":"Helpfulness","detail":"<explanation>"},
    "instruction_following": {"score":<1-10>,"label":"Instruction Following","detail":"<explanation>"},
    "factual_accuracy":      {"score":<1-10>,"label":"Factual Accuracy","detail":"<explanation>"},
    "context_retention":     {"score":<1-10>,"label":"Context Retention","detail":"<explanation>"},
    "tone_consistency":      {"score":<1-10>,"label":"Tone Consistency","detail":"<explanation>"},
    "response_quality":      {"score":<1-10>,"label":"Response Quality","detail":"<explanation>"},
    "engagement":            {"score":<1-10>,"label":"Engagement","detail":"<explanation>"}
  },
  "turn_analysis": [
    {"turn_index":<0-based>,"role":"<role>","quality_score":<1-10>,"note":"<1-2 sentences>","flags":["<flag>"],"content_preview":"<first 60 chars>"}
  ],
  "issues": ["<issue 1>","<issue 2>","<issue 3>"],
  "strengths": ["<strength 1>","<strength 2>"],
  "suggestions": [{"title":"<short title>","detail":"<what to fix and how>"}],
  "rlhf_signals": {
    "preference_label": "<preferred|rejected|neutral>",
    "confidence": "<high|medium|low>",
    "annotation_notes": "<notes for human annotators>",
    "alignment_risk": "<none|low|medium|high>",
    "training_value": "<high|medium|low>",
    "recommended_action": "<use_as_positive|use_as_negative|needs_review|discard>"
  },
  "stats": {
    "total_turns":<n>,"user_turns":<n>,"assistant_turns":<n>,
    "avg_user_length":<words>,"avg_assistant_length":<words>,"topic_shifts":<n>
  }
}

Domain context: ${domain}`

    try {
      const raw = await callAnthropic({
        apiKey,
        model,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Analyze this conversation:\n\n${convStr}` }],
        maxTokens: 2000,
      })
      const data = parseJSON<ConvAnalysisResult>(raw)
      const full: ConvAnalysisResult = { ...data, conversation: conv, domain, model, timestamp: Date.now() }
      setResult(full)
      setHistory(h => [full, ...h].slice(0, 15))
    } catch (e) {
      setError((e as Error).message || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }, [getConversation, model, domain, apiKey])

  const roleStyles: Record<Role, string> = {
    user: 'border-cyan-500/40 text-cyan-400',
    assistant: 'border-emerald-500/40 text-emerald-400',
    system: 'border-purple-500/40 text-purple-400',
  }

  const roleBadge: Record<Role, string> = {
    user: 'bg-cyan-500/15 text-cyan-400',
    assistant: 'bg-emerald-500/15 text-emerald-400',
    system: 'bg-purple-500/15 text-purple-400',
  }

  const avgQ = history.length ? (history.reduce((a,b) => a + b.overall, 0) / history.length).toFixed(1) : '—'
  const avgT = history.length ? Math.round(history.reduce((a,b) => a + (b.stats?.total_turns || 0), 0) / history.length) : '—'

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Tag color={ACCENT}>S4 — Saturday Project</Tag>
            <h1 className="font-['Syne'] text-4xl md:text-5xl font-black mt-3 mb-2 leading-tight">
              Multi-turn <span style={{ color: ACCENT }}>Conversation</span> Analyzer
            </h1>
            <p className="text-[var(--text3)] text-[11px] tracking-wider">// LLM Post-Training Toolkit — Ethara AI</p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <StatCard value={history.length} label="Analyzed" color={ACCENT} />
            <StatCard value={avgT} label="Avg Turns" color={ACCENT} />
            <StatCard value={avgQ} label="Avg Quality" color={ACCENT} />
          </div>
        </div>

        {/* API Key Banner */}
        <ApiKeyBanner accentColor={ACCENT} />

        {/* Mode tabs */}
        <div className="flex gap-1 mb-4 bg-[var(--bg2)] border border-[var(--border)] rounded-md p-1 w-fit">
          {(['builder','paste','json'] as InputMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'text-[10px] font-bold tracking-[0.08em] uppercase px-4 py-1.5 rounded transition-all duration-150',
                mode === m ? 'text-black' : 'text-[var(--text3)] hover:text-[var(--text2)]'
              )}
              style={mode === m ? { background: ACCENT } : undefined}
            >
              {m === 'builder' ? 'Builder' : m === 'paste' ? 'Paste Text' : 'JSON'}
            </button>
          ))}
        </div>

        {/* Builder mode */}
        {mode === 'builder' && (
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg3)] border-b border-[var(--border)]">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--text2)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full animate-pulseDot" style={{ background: ACCENT }} />
                Conversation Turns
              </span>
              <span className="text-[10px] text-[var(--text3)]">{turns.length} turn{turns.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="p-4 flex flex-col gap-2.5 max-h-96 overflow-y-auto">
              {turns.length === 0 && (
                <p className="text-[11px] text-[var(--text3)] text-center py-6">
                  Add turns below or load an example conversation
                </p>
              )}
              {turns.map((t) => (
                <div key={t.id} className="flex gap-2 items-start animate-fadeUp">
                  <select
                    value={t.role}
                    onChange={e => updateTurn(t.id, 'role', e.target.value)}
                    className={cn(
                      'w-24 flex-shrink-0 bg-[var(--bg4)] border text-[11px] px-2 py-2 rounded outline-none cursor-pointer font-mono',
                      roleStyles[t.role]
                    )}
                  >
                    <option value="user">User</option>
                    <option value="assistant">Assistant</option>
                    <option value="system">System</option>
                  </select>
                  <textarea
                    value={t.content}
                    onChange={e => updateTurn(t.id, 'content', e.target.value)}
                    placeholder={t.role === 'system' ? 'System prompt...' : t.role === 'user' ? 'User message...' : 'Assistant response...'}
                    rows={2}
                    className="flex-1 bg-[var(--bg4)] border border-[var(--border2)] text-[var(--text)] font-mono text-[12px] px-3 py-2 rounded outline-none focus:border-cyan-500/50 transition-colors leading-relaxed resize-y"
                  />
                  <button
                    onClick={() => delTurn(t.id)}
                    className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-transparent border border-[var(--border)] text-[var(--text3)] hover:border-red-500/40 hover:text-red-400 rounded mt-1 transition-all duration-150 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 bg-[var(--bg3)] border-t border-[var(--border)] flex gap-2 flex-wrap">
              {(['user','assistant','system'] as Role[]).map(r => (
                <button key={r} onClick={() => addTurn(r)}
                  className="text-[10px] border border-[var(--border2)] text-[var(--text2)] hover:border-cyan-500/30 hover:text-cyan-400 px-3 py-1.5 rounded transition-all duration-150 capitalize font-mono">
                  + {r}
                </button>
              ))}
              <button onClick={loadExample}
                className="ml-auto text-[10px] border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded hover:bg-cyan-500/10 transition-all duration-150 font-mono">
                ⚡ Load Example
              </button>
            </div>
          </div>
        )}

        {/* Paste mode */}
        {mode === 'paste' && (
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg overflow-hidden mb-4">
            <div className="px-4 py-2.5 bg-[var(--bg3)] border-b border-[var(--border)]">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--text2)]">Paste Conversation</span>
            </div>
            <div className="p-4">
              <div className="text-[10px] text-[var(--text3)] leading-relaxed bg-[var(--bg3)] px-3 py-2 rounded border-l-2 border-cyan-500/50 mb-3">
                Prefix each turn: <span className="text-cyan-400 font-bold">User:</span> / <span className="text-emerald-400 font-bold">Assistant:</span> / <span className="text-purple-400 font-bold">System:</span>
              </div>
              <Textarea
                value={pasteText}
                onChange={setPasteText}
                placeholder={"User: What is recursion?\nAssistant: Recursion is when a function calls itself...\nUser: Can you show an example?"}
                minRows={8}
              />
            </div>
          </div>
        )}

        {/* JSON mode */}
        {mode === 'json' && (
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg overflow-hidden mb-4">
            <div className="px-4 py-2.5 bg-[var(--bg3)] border-b border-[var(--border)]">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--text2)]">JSON Input</span>
            </div>
            <div className="p-4">
              <div className="text-[10px] text-[var(--text3)] bg-[var(--bg3)] px-3 py-2 rounded border-l-2 border-cyan-500/50 mb-3 font-mono">
                {`[{"role":"user","content":"..."},{"role":"assistant","content":"..."}]`}
              </div>
              <Textarea value={jsonText} onChange={setJsonText} minRows={8} placeholder='[{"role":"user","content":"Hello"},{"role":"assistant","content":"Hi!"}]' />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2.5 mb-6 flex-wrap items-center">
          <Select value={model} onChange={setModel}>
            {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
          <Select value={domain} onChange={setDomain}>
            {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </Select>
          <Button onClick={analyze} disabled={loading} color={ACCENT}>
            {loading ? '⏳ Analyzing...' : '▶ Analyze'}
          </Button>
          <Button variant="ghost" onClick={() => { setTurns([]); setPasteText(''); setJsonText(''); setResult(null); setError('') }}>
            Clear
          </Button>
        </div>

        <LoadingBar active={loading} />
        <ErrorBox message={error} />

        {/* Empty state */}
        {!result && !loading && (
          <div className="text-center py-16 text-[var(--text3)]">
            <div className="text-4xl mb-4 opacity-30">↑</div>
            <p className="text-[12px] tracking-wider">Build or paste a conversation, then click Analyze</p>
            <p className="text-[10px] mt-2 text-[var(--text4)]">8 dimensions · per-turn breakdown · RLHF signals · JSONL export</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="animate-fadeUp">

            {/* Summary pills */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-4">
              {[
                { val: result.overall, lbl: 'Quality', color: scoreColor(result.overall) },
                { val: result.stats?.total_turns || result.conversation?.length || '—', lbl: 'Turns', color: ACCENT },
                { val: result.stats?.user_turns || '—', lbl: 'User Turns', color: ACCENT },
                { val: result.stats?.assistant_turns || '—', lbl: 'Asst Turns', color: '#10b981' },
                { val: result.stats?.avg_assistant_length ? result.stats.avg_assistant_length + 'w' : '—', lbl: 'Avg Length', color: 'var(--text)' },
                { val: result.verdict, lbl: 'Verdict', color: verdictColor(result.verdict) },
              ].map((s, i) => (
                <div key={i} className={cn('bg-[var(--bg2)] border border-[var(--border)] rounded p-3 animate-fadeUp')} style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                  <span className="font-['Syne'] text-xl font-extrabold block leading-none" style={{ color: s.color }}>{s.val}</span>
                  <span className="text-[9px] tracking-[0.1em] uppercase text-[var(--text3)] mt-1 block">{s.lbl}</span>
                </div>
              ))}
            </div>

            {/* Overall */}
            <CollapsibleSection title="Overall Quality" icon="◎" accentColor={ACCENT}>
              <div className="flex items-center gap-8 flex-wrap">
                <div
                  className="w-[84px] h-[84px] rounded-full flex flex-col items-center justify-content border-[3px] flex-shrink-0"
                  style={{ borderColor: scoreColor(result.overall), justifyContent: 'center' }}
                >
                  <span className="font-['Syne'] text-2xl font-black leading-none" style={{ color: scoreColor(result.overall) }}>
                    {result.overall}
                  </span>
                  <span className="text-[9px] text-[var(--text3)]">/10</span>
                </div>
                <div>
                  <div className="font-['Syne'] text-2xl font-black mb-1" style={{ color: verdictColor(result.verdict) }}>
                    {result.verdict}
                  </div>
                  <p className="text-[12px] text-[var(--text2)] leading-relaxed max-w-xl">{result.summary}</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Dimensions */}
            <CollapsibleSection title="Dimension Scores" icon="◈" accentColor={ACCENT}>
              <div className="flex flex-col gap-3">
                {DIM_KEYS.map(key => {
                  const d = result.dimensions[key]
                  const s = d?.score || 0
                  return (
                    <div key={key} className="grid gap-3" style={{ gridTemplateColumns: '160px 1fr 44px' }}>
                      <div className="text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--text2)] self-center">
                        {d?.label || key}
                      </div>
                      <div className="self-center">
                        <ScoreBar score={s} color={scoreColor(s)} />
                        {d?.detail && <p className="text-[10px] text-[var(--text3)] mt-1.5 leading-relaxed">{d.detail}</p>}
                      </div>
                      <div className="text-[12px] font-bold text-right self-start tabular-nums" style={{ color: scoreColor(s) }}>
                        {s}/10
                      </div>
                    </div>
                  )
                })}
              </div>
            </CollapsibleSection>

            {/* Per-turn breakdown */}
            <CollapsibleSection title="Per-Turn Breakdown" icon="▤" accentColor={ACCENT}>
              <div className="flex flex-col gap-2">
                {(result.turn_analysis || []).map((t, i) => (
                  <div key={i} className="border border-[var(--border)] rounded overflow-hidden">
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-[var(--bg3)] hover:bg-[var(--bg4)] transition-colors text-left"
                      onClick={() => setOpenTurns(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })}
                    >
                      <span className="text-[9px] font-bold text-[var(--text3)] w-8">T{t.turn_index + 1}</span>
                      <span className={cn('text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded', roleBadge[t.role])}>
                        {t.role}
                      </span>
                      <span className="text-[11px] text-[var(--text2)] flex-1 truncate">{t.content_preview}...</span>
                      <span className="text-[11px] font-bold ml-auto flex-shrink-0" style={{ color: scoreColor(t.quality_score) }}>
                        {t.quality_score}/10
                      </span>
                    </button>
                    {openTurns.has(i) && (
                      <div className="px-3 py-2.5 border-t border-[var(--border)]">
                        <p className="text-[11px] text-[var(--text2)] leading-relaxed mb-2">{t.note || 'No specific notes.'}</p>
                        {t.flags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {t.flags.map((f, fi) => (
                              <Chip key={fi} type={f.includes('✓') || f.toLowerCase().includes('good') ? 'good' : f.includes('!') || f.toLowerCase().includes('error') ? 'error' : 'warn'}>
                                {f}
                              </Chip>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Issues & Strengths */}
            <CollapsibleSection title="Issues & Strengths" icon="◉" accentColor="var(--text2)">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-red-400 mb-3">✗ Issues</div>
                  {result.issues?.length
                    ? result.issues.map((iss, i) => <IssueItem key={i} type="issue">{iss}</IssueItem>)
                    : <p className="text-[11px] text-[var(--text3)]">No major issues found</p>}
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-emerald-400 mb-3">✓ Strengths</div>
                  {result.strengths?.length
                    ? result.strengths.map((s, i) => <IssueItem key={i} type="strength">{s}</IssueItem>)
                    : <p className="text-[11px] text-[var(--text3)]">No standout strengths</p>}
                </div>
              </div>
            </CollapsibleSection>

            {/* Suggestions */}
            <CollapsibleSection title="Improvement Suggestions" icon="⚡" accentColor={ACCENT}>
              <div className="flex flex-col gap-2.5">
                {(result.suggestions || []).map((s, i) => (
                  <div key={i} className="grid gap-3 bg-[var(--bg3)] border border-[var(--border)] rounded p-3" style={{ gridTemplateColumns: 'auto 1fr' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: ACCENT }}>
                      {i + 1}
                    </div>
                    <div className="text-[12px] text-[var(--text2)] leading-relaxed">
                      <strong className="text-[var(--text)] font-semibold">{s.title}</strong>
                      {s.title && <br />}
                      {s.detail}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* RLHF Signals */}
            <CollapsibleSection title="RLHF Signals" icon="▣" accentColor="#8b5cf6">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.rlhf_signals && Object.entries({
                  'Preference Label': { val: result.rlhf_signals.preference_label, color: result.rlhf_signals.preference_label === 'preferred' ? '#10b981' : result.rlhf_signals.preference_label === 'rejected' ? '#ef4444' : 'var(--text)' },
                  'Confidence':        { val: result.rlhf_signals.confidence,        color: ACCENT },
                  'Alignment Risk':    { val: result.rlhf_signals.alignment_risk,    color: RLHF_RISK_COLORS[result.rlhf_signals.alignment_risk] || 'var(--text)' },
                  'Training Value':    { val: result.rlhf_signals.training_value,    color: result.rlhf_signals.training_value === 'high' ? '#10b981' : '#f59e0b' },
                  'Recommended Action':{ val: result.rlhf_signals.recommended_action, color: 'var(--text)' },
                  'Annotation Notes':  { val: result.rlhf_signals.annotation_notes,  color: 'var(--text2)' },
                }).map(([k, v]) => v.val && (
                  <div key={k} className="bg-[var(--bg3)] border border-[var(--border)] rounded p-3">
                    <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-[var(--text3)] mb-1.5">{k}</div>
                    <div className="text-[13px] font-semibold leading-snug" style={{ color: v.color }}>{v.val}</div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Export */}
            <div className="flex gap-2 justify-end mt-4 flex-wrap items-center">
              <SectionLabel>Export:</SectionLabel>
              <Button variant="outline" onClick={() => downloadFile(JSON.stringify(result, null, 2), 'conv_analysis.json', 'application/json')}>JSON</Button>
              <Button variant="outline" onClick={() => {
                const hdr = ['timestamp','overall','verdict','domain','turns',...DIM_KEYS,'preference_label','training_value'].join(',')
                const row = [result.timestamp, result.overall, result.verdict, result.domain, result.stats?.total_turns, ...DIM_KEYS.map(d => result.dimensions[d]?.score || ''), result.rlhf_signals?.preference_label, result.rlhf_signals?.training_value].join(',')
                downloadFile([hdr, row].join('\n'), 'conversations.csv', 'text/csv')
              }}>CSV</Button>
              <Button variant="outline" onClick={() => {
                const line = JSON.stringify({ conversation: result.conversation, overall_score: result.overall, verdict: result.verdict, dimensions: Object.fromEntries(DIM_KEYS.map(k => [k, result.dimensions[k]?.score])), rlhf_signals: result.rlhf_signals, stats: result.stats, domain: result.domain, timestamp: result.timestamp })
                downloadFile(line + '\n', 'conversation_analysis.jsonl', 'application/jsonl')
              }}>JSONL</Button>
            </div>

          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <SectionLabel>// Session History ({history.length})</SectionLabel>
            <div className="flex flex-col gap-2">
              {history.map((h, i) => (
                <button key={i} onClick={() => setResult(h)}
                  className="flex items-center gap-3 bg-[var(--bg2)] border border-[var(--border)] hover:border-[var(--border2)] px-3 py-2.5 rounded text-left transition-all duration-150 w-full">
                  <span className="font-bold text-[13px] w-8 flex-shrink-0" style={{ color: scoreColor(h.overall) }}>{h.overall}</span>
                  <span className="text-[11px] text-[var(--text2)] flex-1">{h.stats?.total_turns || h.conversation?.length} turns · {h.domain}</span>
                  <span className="text-[9px] text-[var(--text3)]">{h.verdict}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
