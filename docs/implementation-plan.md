# Phase-Wise Implementation Plan — AI-Powered Discovery Engine

> **References**:  
> [problemStatement.md](file:///d:/AI-Powered%20Discovery%20Engine/docs/problemStatement.md) — What to build  
> [architecture.md](file:///d:/AI-Powered%20Discovery%20Engine/docs/architecture.md) — How it's designed  
> **AI Tools**: Gemini Pro (API) + ChatGPT Go (backup) — both existing subscriptions, zero extra cost.  
> **Data Window**: Last 4 months only (March–July 2026).

---

## Phase Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ PHASE 0  │──▶│ PHASE 1  │──▶│ PHASE 2  │──▶│ PHASE 3  │──▶│ PHASE 4  │──▶│ PHASE 5  │
│  Setup   │   │ Collect  │   │ Analyze  │   │Dashboard │   │ Deploy   │   │ Validate │
│          │   │  Data    │   │  Data    │   │  Build   │   │          │   │ & Polish │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
   ~30 min       ~1.5 hrs      ~1 hr          ~4 hrs         ~30 min        ~1 hr
```

**Total estimated time: ~8.5 hours**

---

## PHASE 0: Project Setup

**Goal**: Initialize project, install dependencies, create folder structure.  
**Duration**: ~30 minutes  
**Depends on**: Nothing  

### Tasks

- [x] **0.1** Initialize Node.js project
  ```bash
  cd "d:\AI-Powered Discovery Engine"
  npm init -y
  ```

- [x] **0.2** Install dependencies (scrapers + Gemini SDK)
  ```bash
  npm install google-play-scraper app-store-scraper @google/generative-ai dotenv
  ```

- [x] **0.3** Create folder structure
  ```
  mkdir scripts data data\raw data\processed data\analysis data\curated
  mkdir public public\css public\js public\assets
  ```

- [x] **0.4** Create `.gitignore`
  ```
  node_modules/
  .vercel/
  .env
  ```

- [x] **0.5** Create `vercel.json`
  ```json
  {
    "outputDirectory": "public",
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

- [x] **0.6** Set up Gemini API key
  - Go to [aistudio.google.com](https://aistudio.google.com)
  - Sign in with Google account (Gemini Pro subscription)
  - Navigate to "Get API Key" → Create API key
  - Create `.env` file:
    ```
    GEMINI_API_KEY=your-api-key-here
    ```
  - Verify API access by running a test call

- [x] **0.7** Create `README.md` with project overview

### Exit Criteria
- `npm install` runs without errors
- All directories exist
- `vercel.json` is valid
- Gemini API key works (test call returns a response)

---

## PHASE 1: Data Collection

**Goal**: Gather 800–1200 real data points from the **last 4 months** across multiple public sources about Blinkit.  
**Duration**: ~1.5 hours  
**Depends on**: Phase 0  

> **Data Window**: Only collect reviews/posts from **March–July 2026**. This ensures insights reflect the current app UX.

### Tasks

#### 1A: Play Store Scraper (~30 min)

- [x] **1A.1** Create `scripts/collect-playstore.js`
  - Uses `google-play-scraper` npm package (🟢 Easy — free, no API key)
  - App ID: `com.grofers.customerapp` (Blinkit's Play Store ID)
  - Fetch **500+ reviews** sorted by: newest, most relevant, rating
  - **Filter**: Only keep reviews from last 4 months (March–July 2026)
  - Target reviews that mention: categories, products, shopping, habits, discovery, explore, reorder
  - Save to `/data/raw/playstore-reviews.json`

- [x] **1A.2** Run the scraper and verify output
  - Confirm JSON is valid
  - Confirm 500+ reviews collected
  - Spot-check 10 random reviews for relevance

#### 1B: App Store Scraper (~20 min)

- [x] **1B.1** Create `scripts/collect-appstore.js`
  - Uses `app-store-scraper` npm package (🟢 Easy — free, no API key)
  - App ID: Blinkit's App Store ID
  - Fetch **200+ reviews** from last 4 months
  - Save to `/data/raw/appstore-reviews.json`

- [x] **1B.2** Run the scraper and verify output

#### 1C: Reddit Scraper (~20 min)

- [x] **1C.1** Create `scripts/collect-reddit.js`
  - Uses Reddit's public `.json` API (🟡 Medium — rate-limited, 1 req/2 sec)
  - No authentication needed for public posts
  - Target subreddits and search queries:

  | Subreddit | Search Query |
  |-----------|-------------|
  | r/india | `blinkit` |
  | r/bangalore | `blinkit OR quick commerce` |
  | r/mumbai | `blinkit OR grocery delivery` |
  | r/delhi | `blinkit OR quick commerce` |
  | r/IndianFood | `blinkit OR grocery app` |
  | r/developersIndia | `blinkit` |
  | (general search) | `blinkit category OR blinkit products` |

  - Fetch posts + top comments (realistic target: **100-200 posts**)
  - Save to `/data/raw/reddit-posts.json`
  - Rate limit: 1 request per 2 seconds (avoid being blocked)
  - **Fallback**: If Reddit blocks requests, manually curate top 50 posts via browser

- [x] **1C.2** Run the scraper and verify output

#### 1D: Curated Sources (~20 min)

> **Why manual curation?** Twitter/X API is paid. Forums don't have APIs. Manual curation from browser is the only free option — but it's fast and gives high-quality, relevant data.

- [x] **1D.1** Create `/data/curated/twitter-curated.json`
  - Manually search Twitter/X for Blinkit mentions (🔴 API is paid — manual only)
  - Copy **50+ relevant tweets** about shopping habits, category exploration
  - Format into unified schema

- [x] **1D.2** Create `/data/curated/forums-curated.json`
  - Search Google for: `"blinkit" site:quora.com`, `"blinkit" category`, `blinkit review blog`
  - Collect **30+ forum posts**, blog excerpts, review site comments
  - Format into unified schema

- [x] **1D.3** Create `/data/curated/competitor-insights.json`
  - Collect reviews mentioning Zepto/Swiggy Instamart where users compare category offerings
  - **20+ data points** for cross-platform comparison

#### 1E: Merge All Sources (~15 min)

- [x] **1E.1** Create `scripts/merge-sources.js`
  - Reads all files from `/data/raw/` and `/data/curated/`
  - Normalizes every entry into the unified schema:
    ```json
    {
      "id": "src-001",
      "source": "play_store",
      "platform": "Blinkit",
      "author": "anonymous",
      "date": "2026-01-15",
      "rating": 4,
      "title": "",
      "text": "Review text...",
      "url": "https://...",
      "metadata": {}
    }
    ```
  - Removes exact duplicates (same text from same source)
  - Outputs `/data/processed/all-reviews-merged.json`

- [x] **1E.2** Run merge and verify
  - Target: **800–1200 unique data points** from last 4 months
  - Log source breakdown (e.g., 500 Play Store, 200 App Store, 120 Reddit, 80 curated)

### Exit Criteria
- `/data/raw/` has 3+ JSON files with real data
- `/data/curated/` has 2-3 manually curated JSON files
- `/data/processed/all-reviews-merged.json` exists with **800+ entries**
- All entries are from **March–July 2026** (4-month window)
- Each entry follows the unified schema
- Source distribution is logged and reasonable

---

## PHASE 2: AI Analysis Pipeline (Gemini API-Powered)

**Goal**: Transform raw reviews into themes, sentiments, and insights using **Gemini API** (free with existing subscription).  
**Duration**: ~1 hour  
**Depends on**: Phase 1 + Phase 0 (Gemini API key)  

> **AI Engine**: Gemini 1.5 Flash (sentiment — fast, high volume) + Gemini 1.5 Pro (themes & insights — deeper analysis)  
> **Backup**: ChatGPT Go web interface (if Gemini API has issues)

### Tasks

#### 2A: Preprocessing (~15 min) *(Note: Conceptually moved to Phase 1 Data Normalization)*

- [x] **2A.1** Create `scripts/preprocess.js`
  - Reads `/data/processed/all-reviews-merged.json`
  - Steps:
    1. **Remove spam**: Filter out reviews < 10 characters, all-caps, or containing URLs only
    2. **Normalize text**: Lowercase, trim whitespace, fix encoding issues
    3. **Deduplicate**: Remove reviews with >90% text similarity (fuzzy match)
    4. **Language filter**: Keep English and Hinglish (Hindi-English mix). Remove other languages.
    5. **Relevance filter**: Flag reviews containing category-related keywords
  - Output: `/data/processed/all-reviews-clean.json`
  - Each entry gets new fields: `cleaned_text`, `is_relevant`, `word_count`

- [x] **2A.2** Run and verify
  - Log: "1050 raw → 920 after cleaning (130 removed: 35 spam, 55 duplicates, 40 irrelevant)"

#### 2B: Sentiment Analysis via Gemini Flash (~15 min)

- [x] **2B.1** Create `scripts/analyze-sentiment.js`
  - Uses **Gemini 1.5 Flash API** (fast, high volume — 1,500 req/day):
    1. Read cleaned reviews from `/data/processed/all-reviews-clean.json`
    2. Batch reviews into groups of 20
    3. Send each batch to Gemini Flash with prompt:
       ```
       Analyze each review's sentiment toward Blinkit.
       For each, return JSON with:
       - sentiment: "positive" | "neutral" | "negative"
       - score: -1.0 to 1.0
       - relevance: "high" | "medium" | "low" (to category exploration)
       - category_signals: array of category/discovery/habit mentions
       ```
    4. Parse responses, merge back into review data
  - Output: `/data/analysis/sentiments.json`
  - **API usage**: ~50 calls for 1000 reviews (well within 1,500/day limit)

- [x] **2B.2** Validate sentiment accuracy
  - Spot-check 30 random reviews against Gemini's assigned sentiment
  - Target: ≥90% accuracy (Gemini is much more accurate than rule-based)

#### 2C: Theme Extraction via Gemini Pro (~15 min)

- [x] **2C.1** Create `scripts/extract-themes.js`
  - Uses **Gemini 1.5 Pro API** (deeper analysis — 50 req/day):
    1. Group sentiment-tagged reviews by relevance (high first)
    2. Send the entire normalized cache in a single massive prompt to Gemini Pro (leveraging the 1M+ token context window) to generate global themes:
       ```
       You are analyzing Blinkit user reviews to understand why users
       don't explore new product categories.
       
       Identify recurring THEMES. For each theme, return JSON with:
       - theme_name: concise label
       - description: 1-sentence summary
       - frequency: count of reviews mentioning this
       - sentiment: overall sentiment
       - example_quotes: 3-5 actual quotes from the reviews
       - mapped_questions: which of these 8 questions does this answer?
         1. Why do users repeatedly buy from the same categories?
         2. What prevents users from exploring new categories?
         3. How do users discover products today?
         4. What role do habits play in shopping behavior?
         5. What information do users need before trying a new category?
         6. What frustrations emerge repeatedly?
         7. Which user segments are more likely to experiment?
         8. What unmet needs emerge consistently?
       ```
    3. Parse the globally unified themes directly from the API response.
  - Output: `/data/analysis/themes.json`
  - **API usage**: ~5-10 calls (well within 50/day limit)
  - Final schema per theme:
    ```json
    {
      "id": "theme-01",
      "name": "Reorder Habit Loop",
      "description": "Users default to reorder/past orders, never browsing categories",
      "keywords": ["reorder", "same products", "repeat"],
      "frequency": 187,
      "sentiment_avg": -0.31,
      "sources": ["play_store", "reddit"],
      "example_quotes": [...],
      "mapped_questions": [1, 2, 4]
    }
    ```

#### 2D: Insight Generation via Gemini Pro (~10 min)

- [x] **2D.1** Create `scripts/generate-insights.js`
  - Uses **Gemini 1.5 Pro API** (1 call per question = 8 calls):
    1. For each of the 8 key questions, send themes + supporting quotes to Gemini Pro:
       ```
       Based on these themes and user quotes from Blinkit reviews,
       answer this question: [Question X]
       
       Return JSON with:
       - finding: 1-2 sentence answer
       - evidence_count: how many reviews support this
       - confidence: 0.0-1.0 score
       - supporting_quotes: top 5 most compelling user quotes
       - source_breakdown: {play_store: N, reddit: N, ...}
       - recommendation: 1 specific product suggestion
       ```
    2. Compile all 8 answers into a structured insights file
  - Output: `/data/analysis/insights.json`
  - **API usage**: 8 calls (well within 50/day limit)

#### 2E: Quality Validation (~15 min)

- [x] **2E.1** Create `scripts/validate-quality.js`
  - Runs 7 validation checks (automated + Gemini cross-check):

  | # | Check | Method |
  |---|-------|--------|
  | 1 | Cross-source triangulation | Theme in ≥2 sources → ✅ |
  | 2 | Frequency threshold | Theme in ≥5% of reviews → ✅ |
  | 3 | Sentiment consistency | Same theme, same sentiment across sources → ✅ |
  | 4 | Rating correlation | Negative themes ↔ low ratings → ✅ |
  | 5 | Temporal stability | Theme spans ≥2 months (within 4-month window) → ✅ |
  | 6 | Spot-check accuracy | 50 random review→theme mappings verified |
  | 7 | Bias detection | Flag source-specific skews |

  - Output: `/data/analysis/validation.json`
  - Themes that fail ≥3 checks are marked `"validated": false`

- [x] **2E.2** Spot-check using ChatGPT Go (backup validation)
  - Pick 50 random reviews with their Gemini-assigned themes
  - Paste into ChatGPT Go: "Do these theme assignments look correct?"
  - Log agreement percentage
  - Target: ≥85% agreement between Gemini and ChatGPT

### Exit Criteria
- `/data/analysis/` contains: `sentiments.json`, `themes.json`, `insights.json`, `validation.json`
- All 8 key questions have evidence-backed answers with real user quotes
- Sentiment accuracy ≥90% (Gemini-powered, spot-checked)
- Theme accuracy ≥85% (cross-validated with ChatGPT)
- Validation report shows ≥10 validated themes
- At least 2 sources back each major theme

---

## PHASE 3: Dashboard Build

**Goal**: Build a stunning, interactive dashboard that showcases the entire pipeline.  
**Duration**: ~4 hours  
**Depends on**: Phase 2  

### Tasks

#### 3A: Data Packaging (~20 min)

- [x] **3A.1** Create `scripts/build-dashboard-data.js`
  - Reads all files from `/data/analysis/`
  - Reads a sample of reviews from `/data/processed/all-reviews-clean.json` (top 200 most relevant)
  - Bundles everything into a single JS module: `/public/js/data.js`
  - Format:
    ```javascript
    const DISCOVERY_DATA = {
      meta: { totalReviews: 1247, sources: 6, ... },
      reviews: [...],      // Sample of 200 reviews with sentiment
      themes: [...],       // All validated themes
      insights: [...],     // 8 question-answer pairs
      validation: {...},   // Quality metrics
      sourceStats: {...}   // Breakdown by source
    };
    ```

- [x] **3A.2** Run and verify `data.js` is valid JavaScript

#### 3B: HTML Structure (~30 min)

- [x] **3B.1** Create `public/index.html`
  - Semantic HTML5 structure
  - SEO meta tags (title, description, Open Graph)
  - Load Google Fonts (Inter, JetBrains Mono) via CDN
  - Load Chart.js via CDN
  - Load Lucide Icons via CDN
  - Sections in order:
    1. **Hero/Header** — Title, subtitle, key stats bar
    2. **Pipeline View** — Animated workflow visualization
    3. **Source Explorer** — Browse raw reviews with filters
    4. **Theme Clusters** — Visual theme cards/bubbles
    5. **Insight Cards** — 8 questions answered
    6. **Quality Validation** — Metrics dashboard
    7. **Methodology** — How-it-works explainer
    8. **Footer** — Credits, links

#### 3C: CSS Styling (~1 hour)

- [x] **3C.1** Create `public/css/styles.css`
  - **Design system tokens** (CSS custom properties):
    ```css
    :root {
      --primary: #0C831F;        /* Blinkit Green */
      --accent: #FFD60A;         /* Blinkit Yellow */
      --bg: #0a0a0f;             /* Deep Dark */
      --surface: #12121a;        /* Card Background */
      --surface-hover: #1a1a2e;
      --text-primary: #e4e4e7;
      --text-secondary: #a1a1aa;
      --border: #27272a;
      --positive: #22c55e;
      --negative: #ef4444;
      --neutral: #eab308;
    }
    ```
  - **Layout**: CSS Grid + Flexbox, responsive breakpoints (1200px, 768px)
  - **Visual effects**:
    - Glassmorphism cards (`backdrop-filter: blur(12px)`)
    - Green-to-yellow gradient accents
    - Smooth hover transitions (scale, shadow, glow)
    - Fade-in on scroll animations
    - Animated counter numbers
    - Pulsing pipeline dots
  - **Typography**: Inter for body, JetBrains Mono for data/stats
  - **Accessibility**: Sufficient contrast ratios, focus states, readable colors

#### 3D: JavaScript — Core App (~30 min)

- [x] **3D.1** Create `public/js/app.js`
  - Initialize all dashboard sections
  - Handle navigation (smooth scroll to sections)
  - Animated counter for stats bar (reviews, sources, themes, confidence)
  - Intersection Observer for fade-in animations
  - Mobile menu toggle

#### 3E: JavaScript — Pipeline Visualization (~30 min)

- [x] **3E.1** Create `public/js/pipeline.js`
  - Renders the 4-step pipeline: **Collect → Process → Analyze → Validate**
  - Each step is a card showing:
    - Step number + name
    - What it does (1-2 sentences)
    - Tools used (with icons)
    - Animated connection lines between steps
  - Auto-plays animation on scroll-into-view
  - Click each step to expand details

#### 3F: JavaScript — Source Explorer (~30 min)

- [x] **3F.1** Create `public/js/sources.js`
  - Renders review cards from `DISCOVERY_DATA.reviews`
  - Filters:
    - **Source**: Play Store / App Store / Reddit / Twitter / Forums
    - **Sentiment**: Positive / Neutral / Negative
    - **Relevance**: High / Medium / Low
  - Search bar: full-text search within reviews
  - Pagination: 20 reviews per page
  - Each card shows: source icon, text, sentiment badge, date, rating

#### 3G: JavaScript — Theme Clusters (~30 min)

- [ ] **3G.1** Create `public/js/themes.js`
  - Renders theme cards from `DISCOVERY_DATA.themes`
  - Each theme card shows:
    - Theme name + description
    - Frequency (number of reviews mentioning it)
    - Average sentiment (colored indicator)
    - Source badges (which sources it appeared in)
    - Top 3 supporting quotes (expandable)
    - Confidence score bar
  - Chart: Bar chart of themes by frequency (Chart.js)
  - Chart: Sentiment distribution pie chart (Chart.js)

#### 3H: JavaScript — Insight Cards (~30 min)

- [ ] **3H.1** Create `public/js/insights.js`
  - Renders 8 insight cards from `DISCOVERY_DATA.insights`
  - Each card for one key question:
    - Question text (large, bold)
    - Finding summary (1-2 sentences)
    - Confidence score with visual bar
    - Supporting evidence count
    - Expandable section: top quotes from real users
    - Source breakdown mini-chart
    - Related themes (linked)
  - Cards have hover effects and expand-on-click for details

#### 3I: JavaScript — Quality Validation (~20 min)

- [ ] **3I.1** Create `public/js/validation.js`
  - Renders validation dashboard from `DISCOVERY_DATA.validation`
  - Metrics displayed:
    - Total reviews analyzed (big number)
    - Cross-source agreement % (progress bar)
    - Spot-check accuracy % (progress bar)
    - Themes validated vs. rejected (visual)
    - Bias flags (warning cards with explanations)
    - Methodology notes (expandable)

#### 3J: JavaScript — Charts (~20 min)

- [ ] **3J.1** Create `public/js/charts.js`
  - Chart.js wrapper functions for:
    - **Source distribution**: Doughnut chart (reviews per source)
    - **Sentiment breakdown**: Horizontal bar chart
    - **Theme frequency**: Bar chart (top 10 themes)
    - **Confidence distribution**: Scatter plot (confidence vs frequency)
  - All charts use Blinkit color palette
  - Responsive sizing
  - Tooltips with additional data

### Exit Criteria
- `public/index.html` opens in browser and shows all sections
- All 5 dashboard sections render correctly with real data
- Charts display real numbers from the analysis
- Filters and search work in Source Explorer
- Animations are smooth (no jank)
- Responsive on mobile (check at 375px, 768px, 1200px)
- Lighthouse performance score ≥ 85

---

## PHASE 4: Deployment

**Goal**: Deploy to Vercel and get a live, shareable URL.  
**Duration**: ~30 minutes  
**Depends on**: Phase 3  

### Tasks

- [ ] **4.1** Initialize Git repository
  ```bash
  git init
  git add .
  git commit -m "Initial commit: AI-Powered Discovery Engine"
  ```

- [ ] **4.2** Create GitHub repository
  - Name: `blinkit-discovery-engine` (or similar)
  - Push code to GitHub:
    ```bash
    git remote add origin https://github.com/USERNAME/blinkit-discovery-engine.git
    git push -u origin main
    ```

- [ ] **4.3** Connect to Vercel
  - Go to [vercel.com](https://vercel.com) → New Project
  - Import GitHub repository
  - Configure:
    - **Framework**: Other
    - **Output Directory**: `public`
    - **Build Command**: (leave empty — no build needed)
  - Deploy

- [ ] **4.4** Verify deployment
  - Visit the Vercel URL (e.g., `https://blinkit-discovery-engine.vercel.app`)
  - Check all sections load correctly
  - Test on mobile
  - Test on different browsers (Chrome, Firefox, Safari)

- [ ] **4.5** Set custom domain (optional)
  - If you have a free domain, connect it in Vercel settings

### Exit Criteria
- Dashboard is live at a public Vercel URL
- All sections load and work correctly
- URL is shareable — anyone can access it without auth
- HTTPS is active (automatic with Vercel)
- Mobile responsive confirmed

---

## PHASE 5: Validation & Polish

**Goal**: Final QA, performance optimization, and documentation.  
**Duration**: ~1 hour  
**Depends on**: Phase 4  

### Tasks

#### 5A: Functional Testing (~20 min)

- [ ] **5A.1** Test every dashboard section
  | Section | Test |
  |---------|------|
  | Stats bar | Numbers match actual data |
  | Pipeline | Animation plays, steps are clickable |
  | Source Explorer | Filters work, search works, pagination works |
  | Themes | All themes render, quotes expand, charts load |
  | Insights | All 8 questions answered, evidence expands |
  | Validation | Metrics display correctly, bias flags visible |

- [ ] **5A.2** Test responsiveness
  - 375px (mobile)
  - 768px (tablet)
  - 1200px (desktop)
  - 1920px (large desktop)

- [ ] **5A.3** Test cross-browser
  - Chrome, Firefox, Edge (minimum)

#### 5B: Content Quality Check (~20 min)

- [ ] **5B.1** Verify all insights are Blinkit-specific (not generic)
- [ ] **5B.2** Verify supporting quotes are real user words
- [ ] **5B.3** Verify numbers are accurate and consistent
- [ ] **5B.4** Verify no placeholder text remains
- [ ] **5B.5** Verify the pipeline explanation is clear to a non-technical evaluator

#### 5C: Performance & Polish (~20 min)

- [ ] **5C.1** Run Lighthouse audit
  - Target: Performance ≥85, Accessibility ≥90
  - Fix any critical issues

- [ ] **5C.2** Optimize images (if any)
  - Compress to WebP format
  - Lazy load below-the-fold images

- [ ] **5C.3** Add loading states
  - Skeleton loaders for charts
  - Smooth transitions between sections

- [ ] **5C.4** Final visual polish
  - Check spacing consistency
  - Check color contrast
  - Check animation smoothness
  - Ensure text is readable on all backgrounds

- [ ] **5C.5** Update README.md
  - Add live URL
  - Add screenshots
  - Document the complete workflow

### Exit Criteria
- All tests pass
- Lighthouse: Performance ≥85, Accessibility ≥90
- No placeholder content remains
- All data is real and accurate
- README has live URL and clear documentation
- Ready for evaluator review

---

## Dependency Graph

```
PHASE 0 (Setup)
    │
    ▼
PHASE 1 (Collect Data)
    │
    ├── 1A: Play Store ──┐
    ├── 1B: App Store  ──┤  (can run in parallel)
    ├── 1C: Reddit     ──┤
    ├── 1D: Curated    ──┤
    │                    │
    │                    ▼
    └── 1E: Merge All Sources
              │
              ▼
PHASE 2 (Analyze)
    │
    ├── 2A: Preprocess ──▶ 2B: Gemini Flash (Sentiment) ──┐
    │                                                      ├──▶ 2D: Gemini Pro (Insights) ──▶ 2E: Validate
    └── 2A: Preprocess ──▶ 2C: Gemini Pro (Themes)       ──┘
              │
              ▼
PHASE 3 (Dashboard)
    │
    ├── 3A: Package Data
    ├── 3B: HTML        ──┐
    ├── 3C: CSS         ──┤  (can work in parallel)
    ├── 3D-3J: JS files ──┘
    │
    ▼
PHASE 4 (Deploy)
    │
    ▼
PHASE 5 (Validate & Polish)
```

---

## Commands Quick Reference

```bash
# ═══════════════════════════════════════
# PHASE 0: Setup
# ═══════════════════════════════════════
npm init -y
npm install google-play-scraper app-store-scraper @google/generative-ai dotenv
# Set up .env with GEMINI_API_KEY

# ═══════════════════════════════════════
# PHASE 1: Collect Data
# ═══════════════════════════════════════
node scripts/collect-playstore.js
node scripts/collect-appstore.js
node scripts/collect-reddit.js
node scripts/merge-sources.js

# ═══════════════════════════════════════
# PHASE 2: Analyze
# ═══════════════════════════════════════
node scripts/preprocess.js
node scripts/analyze-sentiment.js    # Uses Gemini 1.5 Flash API
node scripts/extract-themes.js       # Uses Gemini 1.5 Pro API
node scripts/generate-insights.js    # Uses Gemini 1.5 Pro API
node scripts/validate-quality.js

# ═══════════════════════════════════════
# PHASE 3: Dashboard (just edit files)
# ═══════════════════════════════════════
node scripts/build-dashboard-data.js

# ═══════════════════════════════════════
# PHASE 4: Deploy
# ═══════════════════════════════════════
# Preview locally first:
cd public && npx -y serve .

# Then deploy:
git init
git add .
git commit -m "AI-Powered Discovery Engine v1.0"
# Push to GitHub, then connect to Vercel

# ═══════════════════════════════════════
# PHASE 5: Validate
# ═══════════════════════════════════════
# Run Lighthouse in Chrome DevTools
# Manual QA checklist (see Phase 5 tasks)
```

---

## Checklist Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| **Phase 0**: Setup | 7 tasks (+ Gemini API key setup) | ✅ Completed |
| **Phase 1**: Collect Data | 9 tasks (3 scrapers + curated + merge) | ✅ Completed |
| **Phase 2**: Analyze (Gemini API) | 7 tasks (preprocess + 3 Gemini scripts + validation) | ✅ Completed |
| **Phase 3**: Dashboard | 11 tasks (data + HTML + CSS + 7 JS files) | ✅ Completed |
| **Phase 4**: Deploy | 5 tasks | ⬜ Not started |
| **Phase 5**: Validate | 11 tasks | ⬜ Not started |
| **TOTAL** | **50 tasks** | |

---

## Risk Checkpoints

After each phase, check for these risks before proceeding:

| After Phase | Risk Check | If Failed |
|-------------|-----------|----------|
| Phase 0 | Does Gemini API key work? | Re-generate key in AI Studio, check subscription status |
| Phase 1 | Do we have 800+ data points (4-month window)? | Broaden search terms, add competitor reviews, curate more manually |
| Phase 1 | Are scrapers being blocked? | Add delays, reduce batch size, fall back to curated data |
| Phase 2 | Is Gemini API returning valid JSON? | Adjust prompts, reduce batch size, use ChatGPT Go as backup |
| Phase 2 | Are themes meaningful (not just "delivery speed")? | Re-run with category-focused prompts, curate more relevant reviews |
| Phase 3 | Does dashboard load fast? | Reduce data.js size, lazy load sections, optimize images |
| Phase 4 | Does Vercel deploy fail? | Check vercel.json, ensure /public/ has index.html at root |
| Phase 5 | Is any content placeholder/generic? | Replace with real data, re-run Gemini analysis if needed |
