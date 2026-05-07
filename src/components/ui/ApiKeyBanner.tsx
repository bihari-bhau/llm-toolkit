'use client'
import { useState } from 'react'
import { useApiKey } from '@/lib/ApiKeyContext'
import { cn } from '@/lib/utils'

interface ApiKeyGateProps {
  accentColor?: string
}

export function ApiKeyBanner({ accentColor = '#06b6d4' }: ApiKeyGateProps) {
  const { apiKey, setApiKey, clearApiKey, hasKey } = useApiKey()
  const [input, setInput] = useState('')
  const [show, setShow] = useState(false)
  const [visible, setVisible] = useState(false)

  if (hasKey) {
    return (
      <div className="flex items-center gap-2 mb-5 bg-emerald-950/30 border border-emerald-500/20 rounded px-3 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulseDot flex-shrink-0" />
        <span className="text-[10px] text-emerald-400 tracking-wider flex-1">
          API key active — calls go directly browser → Anthropic
        </span>
        <button
          onClick={clearApiKey}
          className="text-[9px] text-emerald-600 hover:text-red-400 transition-colors tracking-wider uppercase"
        >
          Clear key
        </button>
      </div>
    )
  }

  return (
    <div
      className="mb-6 border rounded-lg overflow-hidden"
      style={{ borderColor: `${accentColor}33`, background: `${accentColor}08` }}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <span className="text-[18px]">🔑</span>
        <div className="flex-1">
          <div className="text-[11px] font-bold tracking-wider" style={{ color: accentColor }}>
            Anthropic API Key Required
          </div>
          <div className="text-[10px] text-[var(--text3)] mt-0.5">
            Your key stays in your browser — never sent to any server.{' '}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--text2)] transition-colors"
            >
              Get a free key →
            </a>
          </div>
        </div>
        <button
          onClick={() => setShow(!show)}
          className="text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded border transition-all duration-150"
          style={{ color: accentColor, borderColor: `${accentColor}40` }}
        >
          {show ? 'Cancel' : 'Add Key'}
        </button>
      </div>

      {show && (
        <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={visible ? 'text' : 'password'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && input.startsWith('sk-ant-')) {
                    setApiKey(input.trim())
                    setShow(false)
                    setInput('')
                  }
                }}
                placeholder="sk-ant-api03-..."
                className="w-full bg-[var(--bg4)] border border-[var(--border2)] text-[var(--text)] font-mono text-[12px] px-3 py-2.5 rounded outline-none focus:border-[var(--cyan)] transition-colors pr-10"
              />
              <button
                onClick={() => setVisible(!visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text3)] hover:text-[var(--text2)] text-[12px]"
              >
                {visible ? '🙈' : '👁'}
              </button>
            </div>
            <button
              onClick={() => {
                if (input.startsWith('sk-ant-')) {
                  setApiKey(input.trim())
                  setShow(false)
                  setInput('')
                }
              }}
              disabled={!input.startsWith('sk-ant-')}
              className={cn(
                'px-4 py-2.5 text-[11px] font-bold tracking-wider uppercase rounded transition-all duration-150',
                input.startsWith('sk-ant-')
                  ? 'text-black'
                  : 'bg-[var(--bg4)] text-[var(--text3)] border border-[var(--border)] cursor-not-allowed'
              )}
              style={input.startsWith('sk-ant-') ? { background: accentColor } : undefined}
            >
              Save
            </button>
          </div>
          <div className="mt-2 text-[10px] text-[var(--text3)] leading-relaxed">
            Key is saved in <code className="text-[var(--text2)]">localStorage</code> — private to your browser.
            Never logged, never transmitted to us. ~$5 credit = months of usage.
          </div>
        </div>
      )}
    </div>
  )
}

// Full-page gate — blocks UI until key is set
export function ApiKeyGate({ children, accentColor = '#06b6d4' }: { children: React.ReactNode; accentColor?: string }) {
  const { hasKey } = useApiKey()

  if (!hasKey) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <ApiKeyBanner accentColor={accentColor} />
          <p className="text-center text-[11px] text-[var(--text3)] mt-4">
            Add your key above to start using the tool.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
