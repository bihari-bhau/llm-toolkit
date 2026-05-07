import { ConvTurn, Role } from '@/types'

// ─── Score color helpers ──────────────────────────────────────────────────────
export function scoreColor(s: number): string {
  if (s >= 9) return '#10b981'
  if (s >= 7) return '#34d399'
  if (s >= 5) return '#f59e0b'
  if (s >= 3) return '#fb923c'
  return '#ef4444'
}

export function verdictColor(v: string): string {
  const map: Record<string, string> = {
    Excellent: '#10b981',
    Good: '#34d399',
    Fair: '#f59e0b',
    Poor: '#fb923c',
    Broken: '#ef4444',
    Terrible: '#ef4444',
  }
  return map[v] || '#e2e8f0'
}

export function gradeColor(g: string): string {
  return verdictColor(g)
}

// ─── Parse helpers ────────────────────────────────────────────────────────────
export function parsePasteText(raw: string): ConvTurn[] {
  const lines = raw.split('\n')
  const result: ConvTurn[] = []
  let cur: ConvTurn | null = null

  for (const line of lines) {
    const m = line.match(/^(user|assistant|system)\s*:\s*(.*)/i)
    if (m) {
      if (cur) result.push(cur)
      cur = { role: m[1].toLowerCase() as Role, content: m[2].trim() }
    } else if (cur) {
      cur.content += (cur.content ? '\n' : '') + line
    }
  }
  if (cur) result.push(cur)
  return result
}

export function parseJSONConversation(raw: string): ConvTurn[] {
  const data = JSON.parse(raw.trim())
  if (!Array.isArray(data)) throw new Error('Expected an array of {role, content} objects')
  return data.map((d: { role?: string; content?: string }) => ({
    role: (d.role || 'user') as Role,
    content: d.content || '',
  }))
}

// ─── Download helper ──────────────────────────────────────────────────────────
export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

// ─── Copy to clipboard ────────────────────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// ─── Class merging ────────────────────────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
