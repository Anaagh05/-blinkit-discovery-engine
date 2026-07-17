const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../data/processed/all-reviews-merged.json');
const outputFile = path.join(__dirname, '../data/processed/all-reviews-clean.json');

function preprocess() {
    console.log('Starting Preprocessing...');
    const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    console.log(`Loaded ${rawData.length} reviews from merged file.`);

    const cleanedData = [];
    let removedShort = 0;
    let removedLanguageEmoji = 0;

    for (const review of rawData) {
        let text = (review.title + ' ' + review.text).trim();
        
        // Remove emojis using regex
        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}]/gu;
        if (emojiRegex.test(text)) {
            removedLanguageEmoji++;
            continue;
        }

        // Remove non-Latin characters (basic non-English filter)
        const nonLatinRegex = /[^\x00-\x7F\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/;
        if (nonLatinRegex.test(text)) {
            removedLanguageEmoji++;
            continue;
        }

        // Count words
        const words = text.split(/\s+/).filter(w => w.length > 0);
        if (words.length < 8) {
            removedShort++;
            continue;
        }

        // Normalize text
        text = text.toLowerCase().replace(/\s+/g, ' ');

        // Keep only required fields (Drop ID, url, author, username, etc)
        cleanedData.push({
            date: review.date,
            rating: review.rating,
            source: review.source,
            text: text,
            word_count: words.length
        });
    }

    console.log(`Filtering Summary:`);
    console.log(`- Removed <8 words: ${removedShort}`);
    console.log(`- Removed emojis/other langs: ${removedLanguageEmoji}`);
    console.log(`- Remaining clean normalized reviews: ${cleanedData.length}`);

    fs.writeFileSync(outputFile, JSON.stringify(cleanedData, null, 2));
    console.log(`Saved clean normalized reviews to ${outputFile}`);
}

preprocess();
