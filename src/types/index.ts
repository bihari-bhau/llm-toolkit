// ─── Prompt Scorer Types ─────────────────────────────────────────────────────

export interface DimensionScore {
  score: number
  feedback: string
  tip?: string
}

export interface PromptScoreResult {
  overall: number
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Terrible'
  summary: string
  dimensions: {
    clarity: DimensionScore
    specificity: DimensionScore
    context: DimensionScore
    constraints: DimensionScore
    output_format: DimensionScore
    complexity_match: DimensionScore
  }
  issues: string[]
  strengths: string[]
  improved_prompt: string
  // meta
  prompt?: string
  useCase?: string
  model?: string
  timestamp?: number
}

// ─── Conversation Analyzer Types ─────────────────────────────────────────────

export type Role = 'user' | 'assistant' | 'system'

export interface Turn {
  id: number
  role: Role
  content: string
}

export interface ConvTurn {
  role: Role
  content: string
}

export interface ConvDimensionScore {
  score: number
  label: string
  detail: string
}

export interface TurnAnalysis {
  turn_index: number
  role: Role
  quality_score: number
  note: string
  flags: string[]
  content_preview: string
}

export interface RLHFSignals {
  preference_label: 'preferred' | 'rejected' | 'neutral'
  confidence: 'high' | 'medium' | 'low'
  annotation_notes: string
  alignment_risk: 'none' | 'low' | 'medium' | 'high'
  training_value: 'high' | 'medium' | 'low'
  recommended_action: 'use_as_positive' | 'use_as_negative' | 'needs_review' | 'discard'
}

export interface ConvStats {
  total_turns: number
  user_turns: number
  assistant_turns: number
  avg_user_length: number
  avg_assistant_length: number
  topic_shifts: number
}

export interface ConvAnalysisResult {
  overall: number
  verdict: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Broken'
  summary: string
  dimensions: {
    coherence: ConvDimensionScore
    helpfulness: ConvDimensionScore
    instruction_following: ConvDimensionScore
    factual_accuracy: ConvDimensionScore
    context_retention: ConvDimensionScore
    tone_consistency: ConvDimensionScore
    response_quality: ConvDimensionScore
    engagement: ConvDimensionScore
  }
  turn_analysis: TurnAnalysis[]
  issues: string[]
  strengths: string[]
  suggestions: { title: string; detail: string }[]
  rlhf_signals: RLHFSignals
  stats: ConvStats
  // meta
  conversation?: ConvTurn[]
  domain?: string
  model?: string
  timestamp?: number
}
