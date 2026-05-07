import type { Metadata } from 'next'
import './globals.css'
import { ApiKeyProvider } from '@/lib/ApiKeyContext'

export const metadata: Metadata = {
  title: 'LLM Toolkit — Ethara AI',
  description: 'LLM Post-Training Toolkit: Prompt Quality Scorer & Multi-turn Conversation Analyzer',
  keywords: ['LLM', 'RLHF', 'prompt quality', 'conversation analysis', 'AI evaluation'],
  authors: [{ name: 'Shubham Singh', url: 'https://github.com/bihari-bhau' }],
  openGraph: {
    title: 'LLM Toolkit — Prompt Scorer & Conversation Analyzer',
    description: 'AI-powered tools for LLM post-training evaluation and RLHF dataset building.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grid-bg">
        <ApiKeyProvider>{children}</ApiKeyProvider>
      </body>
    </html>
  )
}
