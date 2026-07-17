# AI-Powered Discovery Engine

A pipeline that collects app reviews (Play Store, App Store, Reddit, etc.) for Blinkit, analyzes them using Google's Gemini API to extract themes around product discovery and shopping habits, and visualizes the insights in a stunning interactive dashboard.

## Overview
This project was built to understand why users stick to their reordering habits instead of exploring new categories. 

## Setup
1. `npm install`
2. Add your Gemini API key to `.env`: `GEMINI_API_KEY=your-key-here`

## Pipeline
1. **Collect Data**: Scrape sources for recent reviews.
2. **Analyze**: Use Gemini API for sentiment, themes, and insight extraction.
3. **Dashboard**: View the interactive visualizations of the insights.

## Tech Stack
- Node.js (Scraping & Data Processing)
- Gemini API (1.5 Flash & 1.5 Pro)
- Vanilla HTML/CSS/JS (Dashboard)
- Vercel (Deployment)
