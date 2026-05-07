'use client'
import { cn } from '@/lib/utils'
import { ReactNode, useState } from 'react'

// ─── Tag badge ────────────────────────────────────────────────────────────────
export function Tag({ children, color = '#06b6d4' }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm border"
      style={{ color, background: `${color}18`, borderColor: `${color}33` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulseDot"
        style={{ background: color }}
      />
      {children}
    </span>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--text3)] mb-3">
      {children}
    </div>
  )
}

// ─── Loading bar ──────────────────────────────────────────────────────────────
export function LoadingBar({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="w-full h-[2px] bg-[var(--border)] rounded-full overflow-hidden mb-6">
      <div className="h-full w-[35%] bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent animate-sweep" />
    </div>
  )
}

// ─── Error box ────────────────────────────────────────────────────────────────
export function ErrorBox({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="bg-red-950/30 border border-red-500/25 rounded px-4 py-3 text-[12px] text-red-300 mb-4">
      ⚠ {message}
    </div>
  )
}

// ─── Score bar ────────────────────────────────────────────────────────────────
export function ScoreBar({ score, color, animated = true }: { score: number; color: string; animated?: boolean }) {
  return (
    <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-700', animated && 'score-bar')}
        style={{ width: `${score * 10}%`, background: color }}
      />
    </div>
  )
}

// ─── Collapsible section ──────────────────────────────────────────────────────
export function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
  accentColor = 'var(--text2)',
}: {
  title: string
  icon: string
  defaultOpen?: boolean
  children: ReactNode
  accentColor?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg overflow-hidden mb-3">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg3)] hover:bg-[var(--bg4)] transition-colors border-b border-[var(--border)] text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-[10px] font-bold tracking-[0.14em] uppercase flex items-center gap-2" style={{ color: accentColor }}>
          <span>{icon}</span>
          {title}
        </span>
        <span className={cn('text-[var(--text3)] text-xs transition-transform duration-200', !open && '-rotate-90')}>▾</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ value, label, color = 'var(--cyan)' }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded p-3 text-right">
      <span className="font-['Syne'] text-2xl font-extrabold block leading-none" style={{ color }}>{value}</span>
      <span className="text-[9px] tracking-[0.12em] uppercase text-[var(--text3)] mt-1 block">{label}</span>
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  color = '#06b6d4',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'outline'
  disabled?: boolean
  color?: string
  className?: string
}) {
  if (variant === 'primary') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'px-6 py-2.5 text-[12px] font-bold tracking-[0.08em] uppercase rounded transition-all duration-150',
          disabled
            ? 'bg-[var(--bg4)] text-[var(--text3)] border border-[var(--border)] cursor-not-allowed'
            : 'text-black hover:-translate-y-px active:translate-y-0',
          className
        )}
        style={!disabled ? { background: color } : undefined}
      >
        {children}
      </button>
    )
  }
  if (variant === 'ghost') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'px-4 py-2.5 text-[11px] tracking-[0.05em] rounded border border-[var(--border)] text-[var(--text3)] hover:border-[var(--border2)] hover:text-[var(--text2)] transition-all duration-150',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {children}
      </button>
    )
  }
  // outline
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 text-[10px] tracking-[0.06em] uppercase rounded border border-[var(--border)] text-[var(--text2)] transition-all duration-150',
        !disabled && 'hover:border-[var(--cyan)] hover:text-[var(--cyan)]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
export function Chip({ children, type = 'neutral' }: { children: ReactNode; type?: 'warn' | 'error' | 'good' | 'neutral' }) {
  const styles = {
    warn:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error:   'bg-red-500/10 text-red-400 border-red-500/20',
    good:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    neutral: 'bg-[var(--bg4)] text-[var(--text3)] border-[var(--border)]',
  }
  return (
    <span className={cn('text-[9px] font-semibold tracking-[0.05em] px-2 py-0.5 rounded border', styles[type])}>
      {children}
    </span>
  )
}

// ─── Issue item ───────────────────────────────────────────────────────────────
export function IssueItem({ children, type }: { children: ReactNode; type: 'issue' | 'strength' }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 border-b border-[var(--border)] last:border-0 text-[11px] text-[var(--text2)] leading-relaxed">
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
        style={{ background: type === 'strength' ? 'var(--green)' : 'var(--red)' }}
      />
      {children}
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({
  value,
  onChange,
  children,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  children: ReactNode
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'bg-[var(--bg2)] border border-[var(--border)] text-[var(--text)] font-mono text-[11px] px-3 py-2.5 rounded outline-none cursor-pointer pr-8',
        className
      )}
    >
      {children}
    </select>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({
  value,
  onChange,
  placeholder,
  minRows = 5,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minRows?: number
  className?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className={cn(
        'w-full bg-[var(--bg4)] border border-[var(--border2)] text-[var(--text)] font-mono text-[12px] px-3 py-2.5 rounded outline-none focus:border-[var(--cyan)] transition-colors duration-150 leading-relaxed',
        className
      )}
    />
  )
}
