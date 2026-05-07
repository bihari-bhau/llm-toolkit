# LLM Toolkit — S3 & S4

> **LLM Post-Training Evaluation Tools** — Built at Ethara AI as part of the Saturday Projects series.

A production-grade Next.js application with two AI-powered tools for LLM post-training evaluation and RLHF dataset building.

**Live Demo:** `https://llm-toolkit.vercel.app` *(deploy to get your URL)*

---

## Tools

### S3 — Prompt Quality Scorer
Score any LLM prompt across **6 quality dimensions** with instant feedback and an improved rewrite.

| Dimension | What it checks |
|-----------|----------------|
| Clarity | Is the prompt unambiguous? |
| Specificity | How concrete are the requirements? |
| Context | Does the LLM have what it needs? |
| Constraints | Are limits and scope defined? |
| Output Format | Is the desired format specified? |
| Complexity Match | Is the difficulty appropriate? |

**Features:** Overall score (1–10) · Per-dimension feedback · Improvement tips · Rewritten prompt · JSON/CSV/JSONL export

---

### S4 — Multi-turn Conversation Analyzer
Analyze full LLM conversations across **8 quality dimensions** with RLHF-ready signals.

| Dimension | What it checks |
|-----------|----------------|
| Coherence | Does the conversation flow logically? |
| Helpfulness | Does the assistant actually help? |
| Instruction Following | Are user requests honored? |
| Factual Accuracy | Is information correct? |
| Context Retention | Does the assistant remember earlier turns? |
| Tone Consistency | Is the tone appropriate throughout? |
| Response Quality | Are responses well-formed? |
| Engagement | Does the assistant engage meaningfully? |

**Features:** 3 input modes (builder / paste / JSON) · Per-turn quality scores · RLHF signals (preference label, alignment risk, training value) · JSON/CSV/JSONL export

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude API (server-side via API routes)
- **Deploy:** Vercel

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/bihari-bhau/llm-toolkit.git
cd llm-toolkit

# 2. Install
npm install

# 3. Run — no env file needed
npm run dev
# → http://localhost:3000

# 4. Paste your Anthropic API key in the UI
# Get one free at https://console.anthropic.com
```

> **No API key setup required on the server.** Each user pastes their own Anthropic API key directly in the browser UI. The key is stored in `localStorage` — it never leaves the user's browser, never hits any server.

---

## Deploy to Vercel (2 steps)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new) → Deploy

No environment variables needed. Zero config.

---

## Project Structure

```
src/
├── app/
│   ├── prompt-scorer/page.tsx            # S3 UI
│   ├── conversation-analyzer/page.tsx    # S4 UI
│   ├── page.tsx                          # Home / landing
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/index.tsx                      # Shared components
│   ├── ui/ApiKeyBanner.tsx               # API key input banner
│   └── layout/AppNav.tsx                 # Navigation
├── lib/
│   ├── anthropic.ts                      # Browser-side Claude client
│   ├── ApiKeyContext.tsx                 # Key stored in localStorage
│   └── utils.ts                          # Helpers
└── types/index.ts                        # TypeScript types
```

---

## Saturday Projects Roadmap

| # | Project | Status |
|---|---------|--------|
| S1 | LLM Response Evaluator | ✅ [Live](https://llm-response-evaluator.streamlit.app) |
| S2 | RLHF Dataset Builder | ✅ Built |
| S3 | Prompt Quality Scorer | ✅ This repo |
| S4 | Multi-turn Conversation Analyzer | ✅ This repo |
| S5 | AI Agent Benchmark Visualizer | 🔲 Planned |
| S6 | Hallucination Detector | 🔲 Planned |

---

## Author

**Shubham Singh** — LLM Post-Training Intern @ Ethara AI, Gurugram

- GitHub: [@bihari-bhau](https://github.com/bihari-bhau)
- LinkedIn: [biharibhau](https://linkedin.com/in/biharibhau)

---

*Built as part of ongoing work in LLM evaluation, RLHF data collection, and AI agent benchmarking (Kaiju/Commit0).*
