# Part 1: Architecture Document — AI-Powered Discovery Engine

> **Reference**: [problemStatement.md](file:///d:/AI-Powered%20Discovery%20Engine/docs/problemStatement.md)  
> **Constraint**: Zero additional cost — leverage existing **Gemini Pro** + **ChatGPT Go** subscriptions.  
> **Data Window**: Last **4 months** only (March–July 2025) for fresh, relevant insights.

---

## 1. System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    AI-POWERED DISCOVERY ENGINE                    │
│                                                                  │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────────┐  │
│  │   LAYER 1   │──▶│   LAYER 2    │──▶│      LAYER 3         │  │
│  │   Collect    │   │   Analyze    │   │   Present + Deploy   │  │
│  │  (Scrapers)  │   │ (AI Engine)  │   │   (Dashboard)        │  │
│  └─────────────┘   └──────────────┘   └──────────────────────┘  │
│                                                                  │
│  Raw Reviews ──▶ Structured Data ──▶ Themes ──▶ Insights ──▶ UI │
└──────────────────────────────────────────────────────────────────┘
```

The engine is a **3-layer pipeline** that transforms raw user feedback into structured, evidence-backed insights — all running for free.

---

## 2. Architecture Layers (Detailed)

### Layer 1: Data Collection

**Purpose**: Gather real user feedback about Blinkit from multiple public sources.

```
┌────────────────────────────────────────────────────────────┐
│                   DATA COLLECTION LAYER                     │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Play Store   │  │  App Store   │  │     Reddit       │ │
│  │  Scraper      │  │  Scraper     │  │     Scraper      │ │
│  │  (npm free)   │  │  (npm free)  │  │  (.json API)     │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
│         │                 │                    │           │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌────────┴─────────┐ │
│  │  Twitter/X   │  │  Forums &    │  │   Blog Posts &   │ │
│  │  (manual     │  │  Communities │  │   Review Sites   │ │
│  │   curation)  │  │  (scraping)  │  │   (curation)     │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
│         │                 │                    │           │
│         ▼                 ▼                    ▼           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Unified Raw Data Store (JSON files)       │   │
│  │           /data/raw/*.json                          │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

#### Tools & Methods (All Free)

| Source | Tool / Method | Difficulty | Realistic Volume (4 months) |
|--------|--------------|-----------|----------------------------|
| Google Play Store | `google-play-scraper` npm package | 🟢 Easy | **500+ reviews** (automated) |
| Apple App Store | `app-store-scraper` npm package | 🟢 Easy | **200+ reviews** (automated) |
| Reddit | Reddit `.json` API (append `.json` to any URL) | 🟡 Medium | **100-200 posts** (rate-limited, 1 req/2 sec) |
| Twitter/X | Manual curation via search | 🔴 Hard (API is paid) | **50+ tweets** (manually curated) |
| Forums/Blogs | Google search + manual extraction | 🟡 Medium | **50+ posts** (manually curated) |

> **Total realistic target: 800–1200 data points** from the last 4 months.
> Play Store + App Store alone give us 700+ automated reviews. Reddit + manual curation fills the rest.

#### Unified Data Schema

Every review/post from any source is normalized into this schema:

```json
{
  "id": "unique-id",
  "source": "play_store | app_store | reddit | twitter | forum | blog",
  "platform": "Blinkit",
  "author": "anonymous or username",
  "date": "2025-01-15",
  "rating": 4,
  "title": "Post/review title if available",
  "text": "The actual review or comment text...",
  "url": "https://source-url",
  "metadata": {
    "subreddit": "r/bangalore",
    "app_version": "4.2.1",
    "likes": 12
  }
}
```

#### Collection Scripts

```
/scripts/
├── collect-playstore.js     # Uses google-play-scraper, fetches 500+ reviews
├── collect-appstore.js      # Uses app-store-scraper, fetches 200+ reviews
├── collect-reddit.js        # Uses Reddit .json API, fetches 300+ posts
├── collect-curated.js       # Loads manually curated data from /data/curated/
└── merge-all.js             # Merges all sources into /data/raw/all-reviews.json
```

**Target**: 800–1200 data points from the last 4 months across all sources.

> **Data Window**: Only collect reviews/posts from **March–July 2025**. This ensures insights reflect the current app experience, not outdated versions.

---

### Layer 2: AI Analysis Engine

**Purpose**: Transform raw reviews into themes, sentiments, and actionable insights.

```
┌──────────────────────────────────────────────────────────────┐
│                    AI ANALYSIS LAYER                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Step 1: PREPROCESSING                              │     │
│  │  • Remove duplicates & spam                         │     │
│  │  • Normalize text (lowercase, trim)                 │     │
│  │  • Filter relevance (Blinkit + shopping behavior)   │     │
│  │  • Language detection (keep English + Hindi-English) │     │
│  └─────────────────────┬───────────────────────────────┘     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Step 2: SENTIMENT ANALYSIS                         │     │
│  │  • Rule-based + keyword scoring (free, no API)      │     │
│  │  • Categories: Positive / Neutral / Negative        │     │
│  │  • Intensity: Low / Medium / High                   │     │
│  └─────────────────────┬───────────────────────────────┘     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Step 3: THEME EXTRACTION (AI-Powered)              │     │
│  │  • Keyword clustering (TF-IDF based, free)          │     │
│  │  • AI batch analysis via free Claude/ChatGPT web    │     │
│  │  • Pre-generated theme mappings stored as JSON      │     │
│  └─────────────────────┬───────────────────────────────┘     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Step 4: INSIGHT GENERATION                         │     │
│  │  • Map themes to the 8 key questions                │     │
│  │  • Attach supporting evidence (actual quotes)       │     │
│  │  • Calculate confidence scores                      │     │
│  │  • Rank by frequency + sentiment strength           │     │
│  └─────────────────────┬───────────────────────────────┘     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Step 5: QUALITY VALIDATION                         │     │
│  │  • Cross-source triangulation                       │     │
│  │  • Statistical significance checks                  │     │
│  │  • Bias detection (rating skew, recency)            │     │
│  │  • Human spot-check on random sample                │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

#### AI Strategy — Powered by Gemini Pro API (Free with Subscription)

With **Gemini Pro subscription**, we have access to **Google AI Studio API** — free API calls within subscription limits.

| Component | Method | Tool | Automation |
|-----------|--------|------|------------|
| **Sentiment Analysis** | Gemini 1.5 Flash API | Google AI Studio | ✅ Fully automated |
| **Theme Extraction** | Gemini 1.5 Pro API | Google AI Studio | ✅ Fully automated |
| **Insight Generation** | Gemini 1.5 Pro API | Google AI Studio | ✅ Fully automated |
| **Quality Validation** | Statistical scripts + Gemini cross-check | JS + API | ✅ Fully automated |
| **Backup** | ChatGPT Go (GPT-4) | Web interface | Manual fallback |

**API Limits (Gemini Pro subscription — more than enough):**
- Gemini 1.5 Flash: 1,500 requests/day (use for sentiment — high volume)
- Gemini 1.5 Pro: 50 requests/day (use for theme extraction + insights — fewer, richer calls)

#### How AI Analysis Actually Happens

```
Step A: Collect all reviews into /data/raw/all-reviews.json
              │
Step B: Run preprocessing script (automated, local)
              │
Step C: Gemini 1.5 Flash API — Sentiment analysis
        ├── Send batches of 20 reviews per request
        ├── Prompt: "Classify sentiment and extract category-exploration signals"
        └── ~50 API calls for 1000 reviews (well within 1,500/day limit)
              │
Step D: Gemini 1.5 Pro API — Theme extraction
        ├── Send preprocessed + sentiment-tagged reviews in 5 large batches
        ├── Prompt: "Identify recurring themes related to category exploration..."
        └── ~5-10 API calls (within 50/day limit)
              │
Step E: Gemini 1.5 Pro API — Insight generation
        ├── Send themes + supporting quotes
        ├── Prompt: "Map these themes to these 8 questions, generate findings..."
        └── ~8 API calls (1 per question)
              │
Step F: Run quality validation script (cross-source checks, automated)
              │
Step G: Output final insights to /data/analysis/final-insights.json
```

> **Key Point**: The entire pipeline is **fully automated** — no manual copy-paste needed. All AI calls go through Gemini API via Google AI Studio. ChatGPT Go serves as a backup for manual verification.

#### Analysis Output Schema

```json
{
  "themes": [
    {
      "id": "theme-01",
      "name": "Reorder Habit Loop",
      "description": "Users default to reorder/past orders, never browsing categories",
      "frequency": 187,
      "sentiment": "negative",
      "sources": ["play_store", "reddit", "twitter"],
      "confidence": 0.89,
      "supporting_quotes": [
        {
          "text": "I just hit reorder every time, never scroll further",
          "source": "play_store",
          "rating": 4,
          "date": "2025-03-12"
        }
      ],
      "mapped_questions": [1, 2, 4]
    }
  ],
  "insights": [
    {
      "id": "insight-01",
      "question_id": 1,
      "question": "Why do users repeatedly buy from the same categories?",
      "finding": "The reorder UX is so frictionless that users never enter the browse flow",
      "evidence_count": 187,
      "confidence": 0.89,
      "themes": ["theme-01", "theme-03"],
      "recommendation": "Inject category discovery into the reorder flow"
    }
  ],
  "validation": {
    "total_reviews_analyzed": 1247,
    "cross_source_agreement": 0.82,
    "bias_flags": ["play_store skews negative (users review when frustrated)"],
    "spot_check_accuracy": 0.91
  }
}
```

---

### Layer 3: Presentation Dashboard

**Purpose**: Interactive web dashboard that lets evaluators explore the full pipeline and insights.

```
┌──────────────────────────────────────────────────────────────┐
│                   DASHBOARD (Single Page App)                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  HEADER: "Blinkit Discovery Engine"                    │  │
│  │  Nav: Overview | Pipeline | Sources | Themes | Insights│  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────────────────────┐  │
│  │  Section 1:      │  │  Section 2:                      │  │
│  │  PIPELINE VIEW   │  │  SOURCE EXPLORER                 │  │
│  │                  │  │                                  │  │
│  │  Animated flow   │  │  Browse raw reviews by source    │  │
│  │  showing:        │  │  Filter by: source, rating,      │  │
│  │  Collect →       │  │  sentiment, date                 │  │
│  │  Process →       │  │  Search within reviews           │  │
│  │  Analyze →       │  │  See sentiment distribution      │  │
│  │  Validate        │  │                                  │  │
│  └──────────────────┘  └──────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────────────────────┐  │
│  │  Section 3:      │  │  Section 4:                      │  │
│  │  THEME CLUSTERS  │  │  INSIGHT CARDS                   │  │
│  │                  │  │                                  │  │
│  │  Visual clusters │  │  8 questions → answers            │  │
│  │  of themes with  │  │  Each with:                      │  │
│  │  size = frequency│  │  • Finding summary               │  │
│  │  color = sentimnt│  │  • Supporting quotes             │  │
│  │  Click to drill  │  │  • Confidence score              │  │
│  │  down            │  │  • Source breakdown              │  │
│  └──────────────────┘  └──────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Section 5: QUALITY VALIDATION                         │  │
│  │  • Cross-source agreement score                        │  │
│  │  • Bias flags with explanations                        │  │
│  │  • Spot-check accuracy metrics                         │  │
│  │  • Methodology transparency                            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

#### Dashboard Sections

| Section | What It Shows | Purpose (maps to requirement) |
|---------|-------------|-------------------------------|
| **Pipeline View** | Animated flow diagram of Collect → Process → Analyze → Validate | "How your workflow gathers and analyzes data" |
| **Source Explorer** | Raw reviews with filters, search, sentiment tags | Shows real data was collected |
| **Theme Clusters** | Interactive visualization of extracted themes | "How themes are identified" |
| **Insight Cards** | 8 questions answered with evidence | "How insights are generated" |
| **Quality Validation** | Metrics, bias checks, cross-source agreement | "How you validated quality" |
| **Stats Bar** | Total reviews, sources, themes, confidence | At-a-glance credibility |

---

## 3. Tech Stack (All Free)

| Layer | Technology | Cost | Why This Choice |
|-------|-----------|------|----------------|
| **Frontend Framework** | Vanilla HTML/CSS/JS | Free | No build tools needed, deploys instantly to Vercel |
| **CSS** | Custom CSS with CSS variables | Free | Premium design with dark mode, glassmorphism, animations |
| **Charts** | Chart.js (CDN) | Free | Beautiful charts, no install needed |
| **Icons** | Lucide Icons (CDN) | Free | Modern, clean icon set |
| **Fonts** | Google Fonts (Inter, JetBrains Mono) | Free | Premium typography |
| **Data Scraping** | Node.js scripts (google-play-scraper, app-store-scraper) | Free | Runs locally, no API key |
| **AI — Sentiment** | Gemini 1.5 Flash API (Google AI Studio) | Free (Gemini Pro sub) | Fast, accurate, 1,500 req/day |
| **AI — Themes & Insights** | Gemini 1.5 Pro API (Google AI Studio) | Free (Gemini Pro sub) | Deep analysis, 50 req/day |
| **AI — Backup** | ChatGPT Go (GPT-4) | Free (existing sub) | Manual fallback if Gemini is down |
| **Data Storage** | JSON files (embedded in JS) | Free | No database needed |
| **Deployment** | Vercel (free tier) | Free | Static site hosting, custom domain |
| **Version Control** | Git + GitHub | Free | Source control + Vercel integration |

---

## 4. Project Folder Structure

```
d:\AI-Powered Discovery Engine\
│
├── docs/
│   ├── problemStatement.txt          # Original problem statement
│   ├── problemStatement.md           # Part 1 scoped problem statement
│   └── architecture.md               # This file
│
├── scripts/                          # Data collection & analysis scripts
│   ├── collect-playstore.js          # Scrape Play Store reviews
│   ├── collect-appstore.js           # Scrape App Store reviews
│   ├── collect-reddit.js             # Fetch Reddit discussions
│   ├── collect-curated.js            # Load manually curated data
│   ├── merge-sources.js              # Merge all sources into unified format
│   ├── analyze-sentiment.js          # Rule-based sentiment analysis
│   ├── extract-themes.js             # TF-IDF keyword clustering
│   ├── generate-insights.js          # Map themes to 8 key questions
│   ├── validate-quality.js           # Cross-source validation checks
│   └── build-dashboard-data.js       # Package analysis for dashboard
│
├── data/                             # All data (raw + processed)
│   ├── raw/                          # Raw scraped data
│   │   ├── playstore-reviews.json
│   │   ├── appstore-reviews.json
│   │   ├── reddit-posts.json
│   │   └── curated-sources.json
│   ├── processed/                    # Cleaned & normalized data
│   │   └── all-reviews-clean.json
│   └── analysis/                     # AI analysis outputs
│       ├── sentiments.json
│       ├── themes.json
│       ├── insights.json
│       └── validation.json
│
├── public/                           # Dashboard (deployed to Vercel)
│   ├── index.html                    # Main dashboard page
│   ├── css/
│   │   └── styles.css                # All styling (dark mode, animations)
│   ├── js/
│   │   ├── app.js                    # Main application logic
│   │   ├── data.js                   # Pre-generated analysis data (embedded)
│   │   ├── charts.js                 # Chart.js visualizations
│   │   ├── pipeline.js               # Pipeline animation logic
│   │   ├── themes.js                 # Theme cluster visualization
│   │   ├── insights.js               # Insight cards rendering
│   │   └── filters.js                # Search & filter functionality
│   └── assets/
│       └── icons/                    # Any custom assets
│
├── package.json                      # Node.js dependencies (scrapers only)
├── vercel.json                       # Vercel deployment config
├── .gitignore
└── README.md                         # Project overview + setup instructions
```

---

## 5. Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                LOCAL DEVELOPMENT                     │
│                                                     │
│  Node.js scripts ──▶ Collect data                   │
│  Node.js scripts ──▶ Analyze data                   │
│  AI web interface ──▶ Generate insights (one-time)   │
│  Build script    ──▶ Package into /public/js/data.js │
│                                                     │
│         Output: Static files in /public/             │
└─────────────────────┬───────────────────────────────┘
                      │
                      │  git push
                      ▼
┌─────────────────────────────────────────────────────┐
│                 GITHUB REPOSITORY                    │
│                                                     │
│  /public/ folder contains the complete dashboard    │
│  /scripts/ and /data/ are source-only (not served)  │
└─────────────────────┬───────────────────────────────┘
                      │
                      │  Auto-deploy on push
                      ▼
┌─────────────────────────────────────────────────────┐
│              VERCEL (FREE TIER)                      │
│                                                     │
│  Serves /public/ as static site                     │
│  URL: https://blinkit-discovery.vercel.app          │
│                                                     │
│  Free tier limits (more than enough):               │
│  • 100 GB bandwidth/month                           │
│  • Unlimited static deployments                     │
│  • Custom domain support                            │
│  • Automatic HTTPS                                  │
└─────────────────────────────────────────────────────┘
```

### Vercel Configuration

```json
{
  "buildCommand": null,
  "outputDirectory": "public",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> No build step needed — just serves static HTML/CSS/JS from `/public/`.

---

## 6. Data Flow (End-to-End)

```
PHASE 1: COLLECT (Automated Scripts)
─────────────────────────────────────
  Play Store ──┐
  App Store  ──┤
  Reddit     ──┼──▶ /data/raw/*.json ──▶ merge-sources.js ──▶ /data/processed/all-reviews-clean.json
  Twitter    ──┤                                                       │
  Forums     ──┤                                                       │
  Blogs      ──┘                                                       │
                                                                       │
PHASE 2: ANALYZE (Automated + One-time AI)                             │
──────────────────────────────────────────                              │
                                                                       ▼
  analyze-sentiment.js ◀── all-reviews-clean.json ──▶ extract-themes.js
         │                                                    │
         ▼                                                    ▼
  /data/analysis/sentiments.json              /data/analysis/themes.json
         │                                                    │
         └──────────────┬─────────────────────────────────────┘
                        ▼
              generate-insights.js  ◀── (AI-generated theme labels from free ChatGPT/Claude)
                        │
                        ▼
              /data/analysis/insights.json
                        │
                        ▼
              validate-quality.js
                        │
                        ▼
              /data/analysis/validation.json

PHASE 3: PACKAGE (Automated)
────────────────────────────
  build-dashboard-data.js
         │
         ├── Reads all /data/analysis/*.json
         ├── Bundles into a single JS module
         └── Outputs to /public/js/data.js

PHASE 4: DEPLOY
────────────────
  git push ──▶ GitHub ──▶ Vercel auto-deploy ──▶ Live URL
```

---

## 7. AI Analysis Engine (Gemini API-Powered)

With **Gemini Pro subscription**, all analysis is done via API — fully automated, no manual work.

### 7a. Sentiment Analysis (Gemini 1.5 Flash)

```
INPUT: Batch of 20 reviews

API CALL to Gemini 1.5 Flash:
  Prompt: "Analyze each review's sentiment toward Blinkit.
           For each, return:
           - sentiment: positive/neutral/negative
           - score: -1.0 to 1.0
           - relevance: how relevant is this to category exploration (high/medium/low)
           - category_signals: any mentions of product categories, discovery, habits
           Return as JSON array."

OUTPUT per review:
{
  "sentiment": "negative",
  "score": -0.45,
  "relevance": "high",
  "category_signals": ["same products", "never explore", "reorder habit"]
}
```

**Volume**: ~50 API calls for 1000 reviews (batches of 20) — well within 1,500/day Flash limit.

### 7b. Theme Extraction (Gemini 1.5 Pro)

```
INPUT: All sentiment-tagged reviews grouped by relevance

API CALL to Gemini 1.5 Pro (5 batches of ~200 reviews):
  Prompt: "You are analyzing Blinkit user reviews to understand
           why users don't explore new product categories.
           
           Identify recurring THEMES from these reviews.
           For each theme, provide:
           - theme_name: concise label
           - description: what this theme captures
           - frequency: how many reviews mention this
           - sentiment: overall sentiment of this theme
           - example_quotes: 3-5 actual quotes from the reviews
           - mapped_questions: which of these 8 questions does this theme answer?
             [list the 8 key questions]
           
           Return as JSON array of themes."

OUTPUT: 10-15 distinct themes with evidence
```

**Volume**: ~5-10 API calls — well within 50/day Pro limit.

### 7c. Insight Generation (Gemini 1.5 Pro)

```
INPUT: Extracted themes + supporting quotes + 8 key questions

API CALL to Gemini 1.5 Pro (1 call per question = 8 calls):
  Prompt: "Based on these themes and user quotes from Blinkit reviews,
           answer this question:
           [Question X]
           
           Provide:
           - finding: 1-2 sentence answer
           - evidence_count: how many reviews support this
           - confidence: 0-1 score
           - supporting_quotes: top 5 most compelling user quotes
           - recommendation: 1 specific product suggestion
           Return as JSON."

OUTPUT: Structured insight per question
```

**Volume**: 8 API calls — well within 50/day Pro limit.

### Gemini API Setup (Google AI Studio)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with Google account (Gemini Pro subscription)
3. Navigate to "Get API Key" → Create API key
4. Store in `.env` file: `GEMINI_API_KEY=your-key-here`
5. Use `@google/generative-ai` npm package in scripts

### ChatGPT Go as Backup

If Gemini API is down or rate-limited:
1. Copy review batches into ChatGPT Go web interface
2. Use the same prompts as above
3. Copy structured JSON output
4. Save to `/data/analysis/` files manually

> This backup is manual but only needed if Gemini fails — unlikely for our volume.

---

## 9. Quality Validation Methodology

| Validation Check | Method | What It Catches |
|-----------------|--------|-----------------|
| **Cross-source triangulation** | Check if theme appears in ≥2 sources | Single-source bias |
| **Frequency threshold** | Theme must appear in ≥5% of reviews | Noise / outlier themes |
| **Sentiment consistency** | Same theme should have consistent sentiment across sources | Contradictory signals |
| **Rating correlation** | Check if negative themes correlate with low ratings | Validates sentiment accuracy |
| **Temporal stability** | Theme appears across multiple months | Not a one-time event |
| **Random spot-check** | Manually verify 50 random review-to-theme mappings | Algorithm accuracy |
| **Bias detection** | Check for platform bias (Play Store skews negative) | Adjusts confidence scores |

### Validation Output

```json
{
  "total_reviews_analyzed": 1247,
  "themes_extracted": 12,
  "themes_validated": 10,
  "themes_rejected": 2,
  "cross_source_agreement": 0.82,
  "spot_check_accuracy": 0.91,
  "bias_flags": [
    "Play Store reviews skew negative (users more likely to review when frustrated)",
    "Reddit discussions over-represent tech-savvy urban users"
  ],
  "confidence_adjustments": {
    "play_store_negative_weight": 0.85,
    "reddit_representation_note": "Insights may not apply to Tier 2/3 cities"
  }
}
```

---

## 10. Dashboard UI Design Specifications

### Design System

| Token | Value |
|-------|-------|
| **Primary Color** | `#0C831F` (Blinkit Green) |
| **Accent Color** | `#FFD60A` (Blinkit Yellow) |
| **Background** | `#0a0a0f` (Deep Dark) |
| **Surface** | `#12121a` (Card Background) |
| **Surface Hover** | `#1a1a2e` |
| **Text Primary** | `#e4e4e7` |
| **Text Secondary** | `#a1a1aa` |
| **Border** | `#27272a` |
| **Positive** | `#22c55e` |
| **Negative** | `#ef4444` |
| **Neutral** | `#eab308` |
| **Font Family** | `Inter` (body), `JetBrains Mono` (data/code) |
| **Border Radius** | `12px` (cards), `8px` (buttons) |

### Visual Effects

- **Glassmorphism**: Cards with `backdrop-filter: blur(12px)` and semi-transparent backgrounds
- **Gradient accents**: Subtle green-to-yellow gradients on active elements
- **Micro-animations**: Fade-in on scroll, hover scale on cards, animated counters
- **Pipeline animation**: Flowing dots along the pipeline path
- **Dark mode only**: Optimized for readability and premium feel

### Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| `≥1200px` | 3-column grid |
| `≥768px` | 2-column grid |
| `<768px` | Single column, stacked |

---

## 11. Build & Run Instructions

### Prerequisites (All Free)
- Node.js v18+ (free: https://nodejs.org)
- Git (free: https://git-scm.com)
- Vercel CLI (free: `npm i -g vercel`)
- A Vercel account (free: https://vercel.com)

### Step-by-Step

```bash
# 1. Install dependencies (scrapers only)
npm install

# 2. Collect data from all sources
node scripts/collect-playstore.js
node scripts/collect-appstore.js
node scripts/collect-reddit.js
node scripts/merge-sources.js

# 3. Run analysis pipeline
node scripts/analyze-sentiment.js
node scripts/extract-themes.js
node scripts/generate-insights.js
node scripts/validate-quality.js

# 4. Package data for dashboard
node scripts/build-dashboard-data.js

# 5. Preview locally
cd public && npx serve .

# 6. Deploy to Vercel
vercel --prod
```

---

## 12. Mapping to Evaluation Criteria

| What Evaluator Looks For | Where It's Demonstrated |
|-------------------------|------------------------|
| "How your workflow gathers and analyzes data" | Pipeline View section + Source Explorer |
| "How themes are identified" | Theme Clusters visualization |
| "How insights are generated" | Insight Cards (8 questions answered) |
| "How you validated quality" | Quality Validation section with metrics |
| "Link to test out your workflow" | Live Vercel URL |
| "1-slider that outlines how this works" | Pipeline diagram exported as slide |

---

## 13. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scraper gets blocked | No data from that source | Use rate limiting, fallback to curated data |
| Reddit API changes | Can't fetch discussions | Pre-collect data, cache locally |
| Too few relevant reviews | Weak insights | Broaden search terms, include competitor reviews |
| Sentiment engine inaccurate | Wrong analysis | Validate with spot-checks, adjust lexicon |
| Vercel free tier limits hit | Site goes down | Static site uses minimal bandwidth, won't hit limits |
| Reviews are mostly about delivery, not categories | Irrelevant insights | Filter for category-relevant keywords before analysis |
