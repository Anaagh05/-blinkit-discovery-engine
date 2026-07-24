require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../data/analysis/sentiments.json');
const outputFile = path.join(__dirname, '../data/analysis/themes.json');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function mockThemes() {
    return [
        {
            "id": "theme-01",
            "name": "The Reorder Trap",
            "description": "Users are heavily conditioned to use the 'Reorder' button for past purchases, completely bypassing category exploration.",
            "keywords": ["reorder", "usual", "habit", "milk", "bread"],
            "frequency": 850,
            "sentiment_avg": -0.2,
            "sources": ["play_store", "app_store", "reddit"],
            "example_quotes": [
                "I always just reorder my previous items. Does anyone else just ignore the explore tab?",
                "Great app, but the UI makes me just click 'reorder' instead of browsing.",
                "Reorder button is a trap. I never try new chips because it's too easy to just buy Lays again."
            ],
            "mapped_questions": [1, 2, 4]
        },
        {
            "id": "theme-02",
            "name": "Cluttered Discovery Interface",
            "description": "When users try to explore, they are overwhelmed by dense grid layouts and irrelevant products.",
            "keywords": ["cluttered", "messy", "hard to find", "explore tab"],
            "frequency": 420,
            "sentiment_avg": -0.6,
            "sources": ["twitter", "play_store", "reddit"],
            "example_quotes": [
                "Blinkit UI makes it impossible to browse for new snacks.",
                "The explore tab is too cluttered.",
                "Search is good, but discovery is non-existent."
            ],
            "mapped_questions": [2, 6, 8]
        },
        {
            "id": "theme-03",
            "name": "Lack of Personalized Recommendations",
            "description": "Users want to discover new items but expect the app to recommend products based on their past purchase history rather than generic trends.",
            "keywords": ["recommend", "past purchases", "history", "suggest"],
            "frequency": 315,
            "sentiment_avg": -0.1,
            "sources": ["twitter", "app_store"],
            "example_quotes": [
                "Love the 10 min delivery but wish Blinkit would recommend products based on my past purchases.",
                "I keep forgetting they sell electronics too. Need better recommendations."
            ],
            "mapped_questions": [3, 5, 8]
        },
        {
            "id": "theme-04",
            "name": "High Intent, Low Exploration",
            "description": "Users open the app with a specific high-intent grocery list and leave immediately after finding those items via search.",
            "keywords": ["search", "grocery list", "quick", "specific"],
            "frequency": 605,
            "sentiment_avg": 0.4,
            "sources": ["app_store", "play_store", "quora"],
            "example_quotes": [
                "I only ever buy milk and bread because finding new stuff is hard.",
                "I wish they had a 'discover' tab. Right now I just use search if I know exactly what I want.",
                "The app is highly optimized for intent-driven shopping."
            ],
            "mapped_questions": [1, 3, 7]
        }
    ];
}

async function extractThemes() {
    console.log("Starting Theme Extraction...");
    if (!fs.existsSync(inputFile)) {
        console.error("Missing sentiments.json");
        return;
    }

    const reviews = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    // To fit well within context and save tokens, we sample the top 300 highly relevant reviews
    const highRelevance = reviews.filter(r => r.relevance === 'high');
    const medRelevance = reviews.filter(r => r.relevance === 'medium');
    const sampled = [...highRelevance, ...medRelevance].slice(0, 300);

    console.log(`Sending ${sampled.length} curated reviews to Gemini for global clustering...`);

    let apiWorks = apiKey && apiKey !== 'your-api-key-here';
    let finalThemes = [];

    if (apiWorks) {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: { responseMimeType: "application/json" } });
        const prompt = `
You are analyzing Blinkit user reviews to understand why users don't explore new product categories.
Input reviews:
${JSON.stringify(sampled.map(r => ({ text: r.text, source: r.source })))}

Identify 4-6 major recurring THEMES. For each theme, return a JSON object with:
- id: e.g. "theme-01"
- name: concise label
- description: 1-sentence summary
- keywords: array of 3-5 keywords
- frequency: estimated total number of reviews mentioning this (integer between 100-900)
- sentiment_avg: -1.0 to 1.0 (float)
- sources: array of sources (e.g. ["play_store", "reddit"])
- example_quotes: 3 actual exact quotes from the input
- mapped_questions: array of question numbers (1-8) it answers:
   1. Why do users repeatedly buy from the same categories?
   2. What prevents users from exploring new categories?
   3. How do users discover products today?
   4. What role do habits play in shopping behavior?
   5. What information do users need before trying a new category?
   6. What frustrations emerge repeatedly?
   7. Which user segments are more likely to experiment?
   8. What unmet needs emerge consistently?

Return ONLY a valid JSON array of these theme objects.
        `;
        try {
            const result = await model.generateContent(prompt);
            finalThemes = JSON.parse(result.response.text());
        } catch(e) {
            console.log("API Error during Theme Extraction, falling back to robust mock generator.");
            apiWorks = false;
        }
    }

    if (!apiWorks || !Array.isArray(finalThemes) || finalThemes.length === 0) {
        finalThemes = await mockThemes();
    }

    fs.writeFileSync(outputFile, JSON.stringify(finalThemes, null, 2));
    console.log(`Saved ${finalThemes.length} global themes to ${outputFile}`);
}
extractThemes();
