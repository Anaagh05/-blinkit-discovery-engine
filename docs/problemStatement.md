# Part 1: AI-Powered Discovery Engine — Problem Statement

## Company & Role

- **Product**: Blinkit (chosen)
- **Role**: Product Manager, Growth Team
- **Strategic Goal**: Increase the percentage of Monthly Active Customers (MACs) who purchase products from **at least one new category** every month.

---

## Business Context

Quick commerce platforms like Blinkit have become part of users' weekly routines. However:

- Users place **recurring orders** for groceries, snacks & beverages, and household essentials.
- Shopping behavior becomes **highly repetitive** over time.
- Users purchase the **same set of products repeatedly** and **rarely explore new categories**.

### Category Exploration Examples
| Current Category | Target New Category |
|-----------------|-------------------|
| Groceries | Pet Supplies |
| Snacks | Personal Care |
| Household Essentials | Baby Products |

---

## Part 1 Objective

Build an **AI-powered system** that analyzes user feedback **at scale** to understand why users don't explore new categories on Blinkit.

> This is a **discovery/research tool**, NOT a recommendation engine. The output is **insights**, not product features.

---

## Data Sources to Analyze

| Source | Type | Priority |
|--------|------|----------|
| Google Play Store reviews | App reviews (Blinkit) | High |
| Apple App Store reviews | App reviews (Blinkit) | High |
| Reddit discussions | r/india, r/bangalore, r/mumbai, etc. | High |
| Community forums | Quick commerce discussions | Medium |
| Social media conversations | Twitter/X, Instagram | Medium |
| Product review sites | Blog posts, comparison articles | Low |
| Quick-commerce discussions | General industry discourse | Low |

---

## 8 Key Questions the Engine Must Answer

1. **Why do users repeatedly buy from the same categories?**
2. **What prevents users from exploring new categories?**
3. **How do users discover products today?**
4. **What role do habits play in shopping behavior?**
5. **What information do users need before trying a new category?**
6. **What frustrations emerge repeatedly?**
7. **Which user segments are more likely to experiment?**
8. **What unmet needs emerge consistently across discussions?**

---

## What Must Be Demonstrated

The Discovery Engine must show:

| Requirement | What to Demonstrate |
|-------------|-------------------|
| **Data Gathering** | How the workflow collects data from multiple sources |
| **Theme Identification** | How raw feedback is clustered into meaningful themes |
| **Insight Generation** | How themes become actionable product insights |
| **Quality Validation** | How insight quality/accuracy was validated |

---

## Deliverables for Part 1

### 1. Live Workflow Link
- A **deployable, interactive web application** (dashboard)
- Evaluator should be able to **visit the URL and test the workflow**
- Shows data sources → analysis pipeline → insights

### 2. One-Slider (for the final deck)
- A single slide that explains **how the Discovery Engine works**
- Will be included in the final 10-slide deck (Slide ~10)

---

## Constraints

| Constraint | Detail |
|-----------|--------|
| **Budget** | $0 — Only free tools and services |
| **Deployment** | Vercel (free tier) |
| **AI APIs** | No paid API keys — pre-generate analysis using free AI tools |
| **Tech Stack** | HTML/CSS/JS (static site suitable for Vercel free tier) |
| **Timeline** | Build and deploy as quickly as possible |

---

## Scope Boundaries (Part 1 Only)

### ✅ In Scope
- Data collection from public sources (reviews, Reddit, forums)
- AI-powered analysis and theme extraction
- Interactive dashboard to explore insights
- Deployment to Vercel

### ❌ Out of Scope (Handled in Other Parts)
- User interviews and primary research → **Part 2** (separate folder)
- Problem definition and framing → **Part 3** (separate folder)
- MVP prototype / AI agent → **Part 4** (separate folder)
- Final 10-slide deck → Assembled after all parts complete

---

## Success Criteria

The Discovery Engine is successful if:

1. An evaluator can **visit a live URL** and interact with the analysis
2. The dashboard clearly shows **data → themes → insights** pipeline
3. All **8 key questions** are addressed with evidence-backed insights
4. The workflow demonstrates a **systematic, AI-powered approach** (not manual guesswork)
5. Insights are **specific to Blinkit's category exploration problem** (not generic)
6. Quality validation is **visible and transparent**
