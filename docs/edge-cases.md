# Edge Cases & Corner Cases — AI-Powered Discovery Engine

> **References**:  
> [architecture.md](file:///d:/AI-Powered%20Discovery%20Engine/docs/architecture.md) — System design  
> [implementation-plan.md](file:///d:/AI-Powered%20Discovery%20Engine/docs/implementation-plan.md) — Execution plan

---

## Phase 0: Setup

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 0.1 | Node.js not installed or wrong version (< v18) | Scripts won't run, `@google/generative-ai` needs v18+ | Check `node -v` first. Install from nodejs.org if missing. |
| 0.2 | `npm install` fails due to network/firewall | No dependencies installed | Try `npm install --legacy-peer-deps`, or use a VPN. Retry on different network. |
| 0.3 | Gemini API key invalid or expired | Entire Phase 2 blocked | Test key immediately after creation with a simple API call. Re-generate if needed. |
| 0.4 | Gemini Pro subscription doesn't include API access | No API calls possible | Verify at [aistudio.google.com](https://aistudio.google.com). If API access is separate, use free tier (15 req/min for Flash). |
| 0.5 | `.env` file accidentally committed to Git | API key exposed publicly | Add `.env` to `.gitignore` BEFORE first commit. Never commit secrets. |
| 0.6 | Git not installed on system | Can't version control or deploy | Install from git-scm.com before proceeding. |

---

## Phase 1: Data Collection

### 1A. Play Store Scraper

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 1.1 | `google-play-scraper` returns 0 reviews | No Play Store data | Blinkit's App ID may have changed. Verify `com.grofers.customerapp` on Play Store. Try alternative ID `com.blinkit.grocery`. |
| 1.2 | Scraper gets rate-limited or blocked by Google | Partial or no data | Add `throttle: 1000` (1 sec delay between requests). Split into smaller batches (50 reviews at a time). |
| 1.3 | Reviews are in non-English languages (Hindi, Tamil, etc.) | Can't analyze if English-only pipeline | Keep Hinglish reviews (common for Indian apps). Filter out pure Hindi/regional using basic character detection. |
| 1.4 | Reviews have no date field or date is `null` | Can't apply 4-month filter | Default to including the review but flag it as `date_unknown: true`. Don't exclude — more data is better. |
| 1.5 | Most reviews are about delivery speed, not category exploration | Irrelevant data dominates | This is **expected**. Most app reviews are about delivery/quality. Even 10-15% relevance out of 500 reviews = 50-75 relevant data points. |
| 1.6 | Reviews contain only ratings (1★) with no text | No text to analyze | Filter out reviews with empty or whitespace-only text. Log count of filtered reviews. |
| 1.7 | Very long reviews (>2000 chars) | May hit Gemini token limits in batch processing | Truncate to first 500 characters for sentiment. Keep full text for theme extraction. |
| 1.8 | Reviews contain emojis, special characters, or Unicode | Parsing/display issues | Preserve emojis (they carry sentiment signal 😡👎). Sanitize control characters only. |
| 1.9 | Scraper library has breaking changes or is deprecated | Script crashes | Pin version in `package.json`. Check npm page for last updated date before using. |
| 1.10 | Duplicate reviews across different sort orders (newest, relevant) | Inflated counts | Deduplicate by review ID or text hash before saving. |

### 1B. App Store Scraper

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 1.11 | Blinkit not available on App Store in certain regions | No App Store data | Set `country: 'in'` in scraper config. Try alternate app names. |
| 1.12 | App Store returns fewer reviews than expected (<100) | Thin dataset from this source | App Store typically has fewer reviews than Play Store. Accept whatever we get. Even 50 reviews is valuable. |
| 1.13 | `app-store-scraper` doesn't support date filtering | Can't enforce 4-month window easily | Fetch all available reviews, then post-filter by date in our merge script. |
| 1.14 | App Store review text is very short (2-3 words) | Low analytical value | Keep reviews with ≥10 characters. Short reviews still signal sentiment (e.g., "Love it!" or "Worst app"). |

### 1C. Reddit Scraper

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 1.15 | Reddit `.json` API returns 403 Forbidden | No Reddit data at all | Reddit is increasingly blocking unauthenticated JSON access. **Fallback**: Manually curate top 50 posts from browser search. |
| 1.16 | Reddit rate limits (429 Too Many Requests) | Partial data | Enforce 2-second delay between requests. Reduce number of subreddits. Fetch in smaller batches. |
| 1.17 | Search returns posts about "Blinkit IPO" or "Blinkit valuation" instead of user experience | Irrelevant posts | Add negative keywords to filter: exclude posts mentioning `IPO, stock, valuation, funding, acquisition, CEO`. |
| 1.18 | Reddit comments have deeply nested threads | Complex parsing, missing context | Only fetch top-level comments + 1 level of replies. Flatten to individual text entries. |
| 1.19 | Subreddit is private or quarantined | Can't access data | Skip that subreddit, log warning. Move on to next one. |
| 1.20 | Reddit returns HTML instead of JSON | Parsing fails | Check `Content-Type` header. If HTML, the endpoint may need a `User-Agent` header. Set to `Mozilla/5.0 ...`. |
| 1.21 | Very few Blinkit-specific posts on niche subreddits (r/IndianFood) | Wasted API calls | Check post count first. If <5 results, skip that subreddit. |
| 1.22 | Posts contain images/videos without text | No text to analyze | Filter out posts with empty `selftext` and no comments. Log as `media_only_post`. |

### 1D. Curated Sources (Twitter, Forums, Blogs)

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 1.23 | Twitter/X search is heavily rate-limited for non-logged-in users | Can't find enough tweets | Use logged-in search (ChatGPT Go can search Twitter). Use Google: `site:twitter.com "blinkit"`. |
| 1.24 | Manually curated data has inconsistent formatting | Merge script breaks | Validate every curated entry against the unified schema before saving. Create a validation script. |
| 1.25 | Curated tweets/posts are from >4 months ago | Violates data window | Check dates during curation. Only include posts from March–July 2025. |
| 1.26 | Blog posts contain promotional content (sponsored by Blinkit) | Biased data | Flag promotional content. Check for disclosure statements. Exclude or mark as `is_promotional: true`. |
| 1.27 | Quora answers are very long (5000+ words) | Disproportionate weight in analysis | Truncate to first 1000 characters. Or split into multiple relevant excerpts. |

### 1E. Merge & Deduplication

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 1.28 | Same review appears on Play Store AND a blog (cross-posted) | Duplicate counting | Fuzzy match on text similarity (>90% match = duplicate). Keep the one from the primary source. |
| 1.29 | Total merged data is <500 entries | Too few for meaningful analysis | Lower the threshold. Include competitor reviews (Zepto, Swiggy Instamart). Broaden Reddit search terms. |
| 1.30 | Total merged data is >3000 entries | Gemini API batch processing takes too long | Sample down. Prioritize by relevance score. Use top 1200 most relevant. |
| 1.31 | Unified schema has missing fields for some sources | Null pointer errors in analysis | Set sensible defaults: `rating: null`, `date: "unknown"`, `title: ""`. Never leave fields undefined. |
| 1.32 | File encoding issues (UTF-8 BOM, Windows line endings) | JSON parsing breaks | Force UTF-8 encoding in all file reads/writes. Use `JSON.parse()` with try-catch. |

---

## Phase 2: AI Analysis (Gemini API)

### 2A. Preprocessing

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 2.1 | Preprocessing removes too many reviews (>50% filtered) | Insufficient data | Loosen filters. Keep reviews ≥5 chars instead of ≥10. Reduce similarity threshold for dedup (95% instead of 90%). |
| 2.2 | Hinglish text breaks NLP preprocessing | Incorrect tokenization | Don't force lowercase on Hinglish. Keep original casing. Gemini handles multilingual text well. |
| 2.3 | Reviews with only emojis (😡😡😡) | No text to analyze, but valid sentiment | Keep emoji-only reviews for sentiment. Gemini can interpret emoji sentiment. |
| 2.4 | Extremely long reviews (>5000 chars) | Eats up Gemini token budget in batches | Truncate to 800 chars for batch sentiment. Keep full text in raw data for manual reference. |

### 2B. Sentiment Analysis (Gemini Flash)

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 2.5 | Gemini API returns non-JSON response | Parse error crashes script | Wrap every API call in try-catch. Retry up to 3 times with exponential backoff. Log failures. |
| 2.6 | Gemini returns invalid sentiment values (e.g., "somewhat positive") | Schema mismatch | Normalize in code: map any non-standard values to `positive/neutral/negative`. Strict schema validation. |
| 2.7 | Gemini rate limit hit (1,500/day for Flash) | Can't complete sentiment for all reviews | We need ~50 calls for 1000 reviews (batches of 20). 50 << 1,500. But if reruns are needed, space them across the day. |
| 2.8 | Gemini assigns wrong sentiment to sarcastic reviews | Inaccurate analysis | Expected at ~5-10% rate. Flag during spot-check. Sarcasm detection is hard even for LLMs. Document as a known limitation. |
| 2.9 | Gemini API is temporarily down (503/500 errors) | Phase 2 blocked | Retry with exponential backoff (1s, 2s, 4s, 8s). If still failing after 5 retries, switch to **ChatGPT Go** backup (manual). |
| 2.10 | Batch of 20 reviews exceeds Gemini's context window | API error on that batch | Reduce batch size to 10. Gemini Flash handles ~30K tokens, so 20 short reviews should be fine. But long reviews may push over. |
| 2.11 | Gemini returns sentiment for only 15 out of 20 reviews in a batch | Missing data for 5 reviews | Detect missing reviews by comparing input count vs output count. Re-submit missing reviews individually. |
| 2.12 | All reviews classified as "neutral" | Useless sentiment data | This means the prompt is too vague. Add more context: "Consider delivery complaints as negative, feature praise as positive." |

### 2C. Theme Extraction (Gemini Pro)

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 2.13 | Gemini extracts themes unrelated to category exploration (e.g., "delivery speed") | Off-topic themes dominate | Explicitly instruct in prompt: "ONLY extract themes related to product category exploration, shopping habits, and discovery. Ignore delivery speed, app crashes, payment issues." |
| 2.14 | Gemini returns too few themes (<5) | Insufficient insight granularity | Send more diverse review batches. Add follow-up prompt: "Can you identify sub-themes within [broad theme]?" |
| 2.15 | Gemini returns too many themes (>20) | Overwhelming, fragmented analysis | Ask Gemini to consolidate: "Merge similar themes. Target 10-15 distinct themes." |
| 2.16 | Different batches return conflicting themes | Inconsistent analysis | Send all batch results back to Gemini in a consolidation call: "Merge these themes from 5 batches into a unified set." |
| 2.17 | Gemini "hallucinates" quotes that aren't in the reviews | Fabricated evidence | Cross-reference every quote against the actual review database. Flag any quote not found in raw data. This is a **critical check**. |
| 2.18 | Theme frequency counts don't add up across batches | Mathematical inconsistency | Recalculate frequencies ourselves from review-to-theme mappings. Don't trust Gemini's arithmetic. |
| 2.19 | Gemini Pro daily limit (50 req/day) reached | Can't complete theme extraction | We need ~5-10 calls. But if reruns are needed, wait until next day's quota resets (midnight UTC). |

### 2D. Insight Generation (Gemini Pro)

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 2.20 | Some of the 8 questions have no matching themes | Unanswered questions in dashboard | Generate a "No strong signal" response with a confidence of 0.1. Still display it with an explanation: "Insufficient evidence from collected reviews." |
| 2.21 | Gemini generates generic insights not specific to Blinkit | Low-value analysis | Add company-specific context in prompt: "You are analyzing Blinkit (India's largest quick commerce app). Reference specific Blinkit features like 10-minute delivery, reorder button, category tabs." |
| 2.22 | Insights contradict each other across questions | Confusing narrative | Review for logical consistency. If Q1 says "users stick to habits" and Q7 says "many users experiment", reconcile by noting different user segments. |
| 2.23 | Gemini returns recommendations instead of findings | Scope creep (Part 1 = insights, not solutions) | Clarify in prompt: "Focus on FINDINGS (what is happening and why), not solutions or recommendations." |

### 2E. Quality Validation

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 2.24 | A major theme appears in only 1 source (e.g., Reddit only) | Fails cross-source triangulation | Don't reject outright. Mark confidence as lower (0.5 instead of 0.8). Note the single-source limitation in validation report. |
| 2.25 | Spot-check accuracy is <70% | Analysis quality is too low | Re-run Gemini analysis with improved prompts. Add more context. Use ChatGPT Go for a second opinion. Consider increasing batch granularity. |
| 2.26 | All themes have similar frequencies (~equal distribution) | No clear priority ranking | This is actually valid — multiple equally important barriers exist. Present as "Top N themes" rather than a ranked list. |
| 2.27 | Play Store reviews are overwhelmingly negative (selection bias) | Skewed sentiment across entire analysis | Document this as a known bias in validation report. Weight Play Store sentiment at 0.85x. Users who are satisfied rarely write reviews. |
| 2.28 | Validation script crashes on malformed analysis files | No validation output | Add schema validation at the start of the validation script. Catch and log errors for individual reviews. |

---

## Phase 3: Dashboard

### 3A. Data Packaging

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 3.1 | `data.js` file becomes too large (>5 MB) | Slow page load, poor UX | Only embed 200 sample reviews (not all 1000). Themes and insights are small. Lazy load review data. |
| 3.2 | JSON has special characters that break JavaScript string literals | `data.js` has syntax errors | Use `JSON.stringify()` for safe embedding. Escape all backslashes, quotes, and template literals. |
| 3.3 | Analysis data has `undefined` or `NaN` values | Charts crash, display "NaN" | Sanitize all values before embedding. Replace `undefined` → `null`, `NaN` → `0`. |
| 3.4 | Review text contains HTML tags or XSS payloads | Security vulnerability / broken layout | Sanitize all user-generated text. Escape `<`, `>`, `&`, `"`. Use `textContent` instead of `innerHTML` where possible. |

### 3B-3C. HTML & CSS

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 3.5 | Google Fonts CDN is slow or blocked (corporate network) | Fallback fonts look different | Define fallback stack: `font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. |
| 3.6 | Chart.js CDN is down | No charts render | Use a specific pinned version URL. Consider bundling Chart.js locally (~70KB gzipped). |
| 3.7 | Glassmorphism (`backdrop-filter`) not supported in old browsers | Cards lose visual effect | Add fallback: `background: rgba(18, 18, 26, 0.95)` for browsers without `backdrop-filter`. Use `@supports` query. |
| 3.8 | Dark mode text is unreadable on some monitors | Accessibility issue | Test contrast ratios. Ensure ≥4.5:1 contrast for body text and ≥3:1 for large text. Use WebAIM contrast checker. |
| 3.9 | Dashboard looks broken on mobile (<375px) | Bad UX for evaluators on phones | Test at 320px minimum. Use `min-width: 320px`. Stack all elements vertically on mobile. |
| 3.10 | CSS animations cause jank on low-end devices | Poor performance | Use `transform` and `opacity` for animations (GPU-accelerated). Avoid animating `width`, `height`, `top`, `left`. Add `will-change` hints. |
| 3.11 | Color-blind users can't distinguish sentiment colors (red/green) | Accessibility violation | Use patterns/icons in addition to colors. Add text labels ("Positive", "Negative"). Use colorblind-safe palette. |

### 3D-3J. JavaScript

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 3.12 | `DISCOVERY_DATA` is undefined when JS files load | All sections crash | Ensure `data.js` loads BEFORE `app.js` in HTML. Use `<script>` load order or `DOMContentLoaded` event. |
| 3.13 | Filter returns 0 results in Source Explorer | Empty screen, confusing UX | Show a "No reviews match your filters" message with a "Clear filters" button. Never show a blank section. |
| 3.14 | Theme with 0 supporting quotes | Empty quote section in UI | Show "No direct quotes available" message. Never leave a section blank or show `undefined`. |
| 3.15 | Chart renders with 0 data points | Empty/broken chart | Check data length before rendering Chart.js. Show "Insufficient data for chart" placeholder if empty. |
| 3.16 | Very long theme names or insight text | Layout overflow, text clipping | Use `text-overflow: ellipsis` for theme names. Use expandable sections for long text. Set `max-width` on text containers. |
| 3.17 | User rapidly clicks filter buttons | Race conditions in rendering | Debounce filter events (200ms). Cancel pending renders before starting new ones. |
| 3.18 | Search query with special regex characters (e.g., `(`, `[`, `*`) | Search crashes with regex error | Escape special characters before using in filter: `query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`. |
| 3.19 | Pagination goes beyond available pages | Empty page or error | Clamp page number: `Math.max(0, Math.min(page, totalPages - 1))`. Disable "Next" button on last page. |
| 3.20 | Animated counters show decimal places (e.g., "1247.3 reviews") | Unprofessional look | Use `Math.round()` on all counter animations. Format with `toLocaleString()` for commas (1,247). |

---

## Phase 4: Deployment

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 4.1 | Vercel free tier doesn't support the project structure | Deploy fails | Ensure `vercel.json` has correct `outputDirectory: "public"`. Test with `vercel dev` locally first. |
| 4.2 | Large `data.js` file causes Vercel function timeout | Deployment error | This shouldn't happen — we're deploying static files, not serverless functions. But keep `data.js` < 5MB. |
| 4.3 | Vercel deployment succeeds but site shows blank page | No visible output | Check that `index.html` is at the root of `/public/`. Check browser console for JS errors. |
| 4.4 | CORS errors when loading CDN resources | Charts/fonts/icons don't load | All CDNs (cdnjs, googleapis, unpkg) have CORS enabled by default. If blocked, download and host locally. |
| 4.5 | GitHub repo is private, Vercel can't access it | Deploy fails | Either make repo public OR connect Vercel to GitHub with proper permissions (OAuth). |
| 4.6 | `.env` file is needed but not deployed (Vercel doesn't deploy `.env`) | API keys missing in production | This is fine — our dashboard is a **static site** with pre-generated data. No API calls happen in production. `.env` is only needed locally during Phase 2. |
| 4.7 | Vercel URL is very long and hard to share | Poor UX for evaluators | Use Vercel's custom domain feature (free) or create a short redirect link. |
| 4.8 | Vercel free tier bandwidth limit hit | Site goes down | Static sites use minimal bandwidth (~500KB/visit). Free tier has 100GB/month. Would need 200,000 visits to hit limit — not a risk. |

---

## Phase 5: Validation & Polish

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 5.1 | Lighthouse performance score <70 | Poor evaluation impression | Defer off-screen images/sections. Minimize DOM size. Compress CSS/JS. Remove unused code. |
| 5.2 | Dashboard has accessibility violations (no alt text, poor contrast) | Failed Lighthouse accessibility audit | Add `aria-label` to interactive elements. Add `alt` to images. Ensure focus states are visible. |
| 5.3 | Evaluator opens in Safari and animations are broken | Cross-browser compatibility issue | Test in Chrome, Firefox, Edge, Safari. Use `-webkit-` prefixes where needed. Avoid Safari-specific bugs with `backdrop-filter`. |
| 5.4 | Evaluator has slow internet connection | Long load time | Inline critical CSS. Lazy load below-the-fold content. Add loading skeleton screens. Total payload should be <2MB. |
| 5.5 | Evaluator uses a screen reader | Information is inaccessible | Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`). Add `role` attributes to custom components. |
| 5.6 | Charts render but are too small to read on mobile | Usability issue | Make charts responsive. Set minimum height (300px). Use Chart.js responsive option. |
| 5.7 | Pipeline animation doesn't replay when user scrolls back up | Missed content | Use Intersection Observer with `threshold: 0.3`. Replay animation each time section enters viewport, or add a "Replay" button. |
| 5.8 | "View more quotes" expansion pushes content below off-screen | Disorienting UX | Use smooth scroll or `scrollIntoView()` when expanding long sections. Don't shift the user's viewport unexpectedly. |

---

## Cross-Cutting Edge Cases

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| X.1 | Entire project takes longer than estimated (>12 hours) | Deadline pressure | Phase 3 (Dashboard) is the longest. Start with a minimal dashboard and progressively enhance. Ship MVP first. |
| X.2 | Scraper output format changes between runs | Inconsistent data | Always validate JSON schema after each scraper run. Use a schema validator function. |
| X.3 | Internet connection drops during scraping/API calls | Partial data, failed analysis | Save progress after each batch. Implement checkpoint/resume logic in scripts. |
| X.4 | Windows-specific path issues (backslash vs forward slash) | File not found errors | Use `path.join()` or `path.resolve()` in Node.js. Never hardcode path separators. |
| X.5 | `data.js` has a circular reference or is invalid JS | Dashboard crashes entirely | Validate `data.js` by running `node -e "require('./public/js/data.js')"` after generation. |
| X.6 | Analysis reveals NO insights about category exploration | The entire project premise fails | This is unlikely but possible if reviews are dominated by delivery/quality topics. **Mitigation**: Supplement with Reddit threads specifically about "what do you buy on Blinkit" or "Blinkit categories". |
| X.7 | Gemini and ChatGPT Go both go down simultaneously | Complete AI analysis blocked | Pre-generate analysis. Cache all results as JSON. Once generated, the dashboard doesn't need AI at all. |
| X.8 | Evaluator tries to interact with dashboard features that don't exist | Confusion, poor impression | Never show buttons/links that don't work. If a feature is "coming soon", remove it entirely rather than showing a dead link. |
| X.9 | The 4-month window has too few relevant reviews | Thin dataset | Extend window to 6 months. Or supplement with competitor reviews from same window. |
| X.10 | Some Blinkit reviews are about "Grofers" (old name) | Missed during search | Search for both "blinkit" AND "grofers" in all scrapers and curated searches. The app was rebranded but old reviews reference Grofers. |

---

## Summary: Top 10 Most Likely Edge Cases

These are the ones **most likely to actually happen** during development:

| Priority | Edge Case | Where | Quick Fix |
|----------|-----------|-------|-----------|
| 🔴 **1** | Reddit `.json` API returns 403 | Phase 1C | Manually curate 50 posts from browser |
| 🔴 **2** | Gemini API returns non-JSON or malformed response | Phase 2B-2D | Add try-catch + retry logic + response validation |
| 🔴 **3** | Most reviews are about delivery, not categories | Phase 1A | Expected. Filter for relevance. Even 10% = 50-75 usable reviews |
| 🟡 **4** | Gemini "hallucinates" fake quotes | Phase 2C | Cross-reference every quote against raw data |
| 🟡 **5** | `data.js` too large, slow page load | Phase 3A | Limit to 200 sample reviews in dashboard |
| 🟡 **6** | Scraper library API has changed since last update | Phase 1A-1B | Pin versions, test immediately, have manual backup |
| 🟡 **7** | Windows path separator issues | All phases | Use `path.join()` everywhere |
| 🟢 **8** | Chart.js CDN temporarily slow | Phase 3 | Use pinned version + fallback styling |
| 🟢 **9** | Color-blind evaluator can't read sentiment charts | Phase 3/5 | Use icons + labels alongside colors |
| 🟢 **10** | Old "Grofers" reviews missed | Phase 1 | Search for both "blinkit" AND "grofers" |
