const fs = require('fs');
const path = require('path');

const rawDir = path.join(__dirname, '../data/raw');
const curatedDir = path.join(__dirname, '../data/curated');
const outputFile = path.join(__dirname, '../data/processed/all-reviews-merged.json');

function normalizePlayStore(item) {
    return {
        id: item.id || Math.random().toString(36).substr(2, 9),
        source: 'play_store',
        platform: 'Blinkit',
        author: item.userName || 'anonymous',
        date: item.date,
        rating: item.score || 0,
        title: item.title || '',
        text: item.text || '',
        url: item.url || '',
        metadata: { thumbsUp: item.thumbsUp }
    };
}

function normalizeAppStore(item) {
    return {
        id: item.id || Math.random().toString(36).substr(2, 9),
        source: 'app_store',
        platform: 'Blinkit',
        author: item.userName || 'anonymous',
        date: item.date || item.updated,
        rating: item.score || 0,
        title: item.title || '',
        text: item.text || '',
        url: item.url || '',
        metadata: { version: item.version }
    };
}

function normalizeReddit(item) {
    return {
        id: item.id || Math.random().toString(36).substr(2, 9),
        source: 'reddit',
        platform: 'Blinkit',
        author: item.author || 'anonymous',
        date: item.date,
        rating: 0,
        title: item.title || '',
        text: item.selftext || '',
        url: item.url || '',
        metadata: { subreddit: item.subreddit, score: item.score }
    };
}

function normalizeCurated(item) {
    return item;
}

function main() {
    console.log('Merging sources...');
    const allData = [];

    // Process Raw Files
    if (fs.existsSync(rawDir)) {
        const rawFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.json'));
        for (const file of rawFiles) {
            const filePath = path.join(rawDir, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            let normalized = [];
            if (file.includes('playstore')) {
                normalized = content.map(normalizePlayStore);
            } else if (file.includes('appstore')) {
                normalized = content.map(normalizeAppStore);
            } else if (file.includes('reddit')) {
                normalized = content.map(normalizeReddit);
            }
            allData.push(...normalized);
            console.log(`Processed ${normalized.length} records from ${file}`);
        }
    }

    // Process Curated Files
    if (fs.existsSync(curatedDir)) {
        const curatedFiles = fs.readdirSync(curatedDir).filter(f => f.endsWith('.json'));
        for (const file of curatedFiles) {
            const filePath = path.join(curatedDir, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const normalized = content.map(normalizeCurated);
            allData.push(...normalized);
            console.log(`Processed ${normalized.length} records from ${file}`);
        }
    }

    // Deduplicate exact texts
    const seenTexts = new Set();
    const uniqueData = [];
    for (const item of allData) {
        const normalizedText = (item.title + ' ' + item.text).trim().toLowerCase();
        if (normalizedText && !seenTexts.has(normalizedText)) {
            seenTexts.add(normalizedText);
            uniqueData.push(item);
        }
    }

    console.log(`Merged ${allData.length} total records into ${uniqueData.length} unique records.`);
    
    fs.writeFileSync(outputFile, JSON.stringify(uniqueData, null, 2));
    console.log(`Saved merged data to ${outputFile}`);
}

main();
