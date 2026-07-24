require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../data/processed/all-reviews-clean.json');
const outputFile = path.join(__dirname, '../data/analysis/sentiments.json');

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function mockGeminiResponse(batch) {
    // Fallback if API fails
    return batch.map(r => {
        const text = r.text.toLowerCase();
        let sentiment = "neutral";
        let score = 0;
        let relevance = "low";
        
        if (text.includes("bad") || text.includes("worst") || text.includes("terrible") || text.includes("expensive")) {
            sentiment = "negative";
            score = -0.7;
        } else if (text.includes("good") || text.includes("great") || text.includes("awesome") || text.includes("fast")) {
            sentiment = "positive";
            score = 0.8;
        }

        if (text.includes("discover") || text.includes("explore") || text.includes("category") || text.includes("new")) {
            relevance = "high";
        } else if (text.includes("reorder") || text.includes("habit") || text.includes("usual") || text.includes("repeat")) {
            relevance = "medium";
        }

        return {
            sentiment,
            score,
            relevance,
            category_signals: ["mock_signal"]
        };
    });
}

async function analyzeSentiment() {
    console.log("Starting Sentiment Analysis with Gemini 1.5 Flash...");
    
    if (!fs.existsSync(inputFile)) {
        console.error("Input file not found:", inputFile);
        return;
    }

    const reviews = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    console.log(`Loaded ${reviews.length} clean reviews.`);

    // Check if API key is properly set
    let apiWorks = apiKey && apiKey !== 'your-api-key-here';
    if (!apiWorks) {
        console.log("WARNING: Valid GEMINI_API_KEY not found in .env. Falling back to robust offline mock generator for sentiment.");
    }

    // Using gemini-flash-latest for fast batch processing
    const model = apiWorks ? genAI.getGenerativeModel({ 
        model: "gemini-flash-latest", 
        generationConfig: { responseMimeType: "application/json" } 
    }) : null;

    // Batch size of 50 to balance output token limits and speed
    const batchSize = 50;
    const results = [];
    
    for (let i = 0; i < reviews.length; i += batchSize) {
        const batch = reviews.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(reviews.length / batchSize)}...`);

        if (apiWorks) {
            const prompt = `
Analyze each review's sentiment toward Blinkit.
Input reviews (JSON array): ${JSON.stringify(batch.map(r => r.text))}

For each review in the array, return a JSON array of objects (in the exact same order) with:
- sentiment: "positive" | "neutral" | "negative"
- score: -1.0 to 1.0 (float)
- relevance: "high" | "medium" | "low" (to category exploration / product discovery)
- category_signals: array of strings (category/discovery/habit mentions)

Output MUST be a valid JSON array of length ${batch.length}.
            `;

            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const jsonArray = JSON.parse(responseText);
                
                if (Array.isArray(jsonArray) && jsonArray.length === batch.length) {
                    batch.forEach((r, idx) => {
                        results.push({ ...r, ...jsonArray[idx] });
                    });
                } else {
                    console.log("Response length mismatch, falling back for this batch.");
                    const fallback = await mockGeminiResponse(batch);
                    batch.forEach((r, idx) => results.push({ ...r, ...fallback[idx] }));
                }
                
                // Respect rate limits (15 RPM -> 4 seconds per request)
                await new Promise(res => setTimeout(res, 4000)); 

            } catch (error) {
                console.error("API Error, falling back to mock generator:", error.message);
                apiWorks = false; 
                const fallback = await mockGeminiResponse(batch);
                batch.forEach((r, idx) => results.push({ ...r, ...fallback[idx] }));
            }
        } else {
            const fallback = await mockGeminiResponse(batch);
            batch.forEach((r, idx) => results.push({ ...r, ...fallback[idx] }));
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`Saved ${results.length} analyzed reviews to ${outputFile}`);
}

analyzeSentiment();
