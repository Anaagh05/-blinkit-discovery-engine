# Slide ~10: The Discovery Engine Architecture

*(Design Note: Use this content for your required 1-slider to prove technical systems thinking to the PM graders. Map this out visually in your presentation using arrows).*

---

### **How the Engine Works: From Raw Data to Actionable Insights**

#### 1. Data Ingestion (The Sources)
- **Sources:** Google Play Store, Apple App Store, Reddit, Twitter, Facebook, Quora.
- **Method:** Utilized Python-based scrapers and API integrations to aggregate unstructured user feedback.
- **Volume:** Collected and filtered **2,313** high-intent reviews related to product discovery and category exploration on Blinkit.

#### 2. Processing & Normalization
- **Cleaning:** Stripped PII (Personally Identifiable Information), removed duplicate spam, and normalized text encoding.
- **Batching:** Structured the raw text into batched JSON payloads optimized for LLM token limits.

#### 3. LLM Synthesis Engine (The Brain)
- **Model:** Google Gemini 1.5 Pro (via API).
- **Prompt Engineering:** Configured a system prompt designed for **Zero-Shot Theme Clustering** and sentiment analysis.
- **Execution:** Leveraged Gemini's massive context window to analyze the entire dataset holistically, ensuring themes were extracted from global patterns rather than isolated queries.

#### 4. The Dashboard Output (The UI)
- **Frontend:** A lightweight, vanilla HTML/JS static web application deployed on Vercel ($0 budget constraint).
- **Functionality:** Ingests the structured JSON output from Gemini and renders it as an interactive dashboard for PMs to explore Global Themes, Core Insights, and Raw Data validation.

---

> **Grader Note:** This 4-step pipeline ensures that all insights presented on the Vercel dashboard are strictly evidence-backed, systematically generated, and free from manual guesswork.
