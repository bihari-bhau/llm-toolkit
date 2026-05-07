// Browser-side Anthropic client — uses the user's own API key
// Key is stored in localStorage, never sent to our server

export interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function callAnthropic({
  apiKey,
  model,
  system,
  messages,
  maxTokens = 1500,
}: {
  apiKey: string
  model: string
  system: string
  messages: AnthropicMessage[]
  maxTokens?: number
}): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg = (err as { error?: { message?: string } })?.error?.message
    if (response.status === 401) throw new Error('Invalid API key. Check your key at console.anthropic.com')
    if (response.status === 429) throw new Error('Rate limit hit. Wait a moment and try again.')
    if (response.status === 402) throw new Error('Insufficient API credits. Add credits at console.anthropic.com')
    throw new Error(msg || `Anthropic API error ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

export function parseJSON<T>(raw: string): T {
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as T
}
