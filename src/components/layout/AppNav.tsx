'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/prompt-scorer', label: 'S3 — Prompt Scorer', color: '#f59e0b' },
  { href: '/conversation-analyzer', label: 'S4 — Conv Analyzer', color: '#06b6d4' },
]

export default function AppNav() {
  const path = usePathname()
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--bg2)]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-1 h-12">
        <Link href="/" className="text-[11px] font-bold tracking-[0.12em] uppercase text-[var(--text2)] mr-4 hover:text-[var(--text)] transition-colors">
          LLM Toolkit
        </Link>
        <div className="h-4 w-px bg-[var(--border)] mr-3" />
        {nav.slice(1).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-[10px] font-semibold tracking-[0.08em] uppercase px-3 py-1.5 rounded transition-all duration-150',
              path === item.href
                ? 'text-black'
                : 'text-[var(--text3)] hover:text-[var(--text2)]'
            )}
            style={path === item.href ? { background: item.color } : undefined}
          >
            {item.label}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <a
            href="https://github.com/bihari-bhau/llm-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[var(--text3)] hover:text-[var(--text2)] transition-colors flex items-center gap-1.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
