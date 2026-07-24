const fs = require('fs');
const path = require('path');

const analysisDir = path.join(__dirname, '../data/analysis');
const outputJsPath = path.join(__dirname, '../public/js/data.js');

function buildDashboardData() {
    console.log("Packaging data for the frontend dashboard...");
    
    // Read all JSON files
    const sentimentsFile = path.join(analysisDir, 'sentiments.json');
    const themesFile = path.join(analysisDir, 'themes.json');
    const insightsFile = path.join(analysisDir, 'insights.json');
    const validationFile = path.join(analysisDir, 'validation.json');

    const sentiments = fs.existsSync(sentimentsFile) ? JSON.parse(fs.readFileSync(sentimentsFile, 'utf8')) : [];
    const themes = fs.existsSync(themesFile) ? JSON.parse(fs.readFileSync(themesFile, 'utf8')) : [];
    const insights = fs.existsSync(insightsFile) ? JSON.parse(fs.readFileSync(insightsFile, 'utf8')) : [];
    const validation = fs.existsSync(validationFile) ? JSON.parse(fs.readFileSync(validationFile, 'utf8')) : {};

    // Compute source stats from full dataset
    const sourceStats = {};
    sentiments.forEach(r => {
        sourceStats[r.source] = (sourceStats[r.source] || 0) + 1;
    });

    const sourceBuckets = {};
    Object.keys(sourceStats).forEach(s => {
        sourceBuckets[s] = sentiments.filter(r => r.source === s).sort((a, b) => {
            if (a.relevance === 'high' && b.relevance !== 'high') return -1;
            if (a.relevance !== 'high' && b.relevance === 'high') return 1;
            return (b.score || 0) - (a.score || 0);
        });
    });

    const topReviews = [];
    const TARGET_TOTAL = 200;
    Object.keys(sourceBuckets).forEach(s => {
        const proportion = sourceStats[s] / sentiments.length;
        let allocate = Math.max(1, Math.floor(proportion * TARGET_TOTAL));
        if (allocate > sourceBuckets[s].length) allocate = sourceBuckets[s].length;
        topReviews.push(...sourceBuckets[s].slice(0, allocate));
    });

    // Shuffle the final array to mix sources well in the UI
    topReviews.sort(() => Math.random() - 0.5);

    const discoveryData = {
        meta: {
            totalReviews: sentiments.length,
            sourcesCount: Object.keys(sourceStats).length,
            lastUpdated: new Date().toISOString()
        },
        sourceStats: sourceStats,
        reviews: topReviews,
        themes: themes,
        insights: insights,
        validation: validation
    };

    const jsContent = `// Auto-generated data file for the Discovery Engine Dashboard
window.DISCOVERY_DATA = ${JSON.stringify(discoveryData, null, 2)};
`;

    // Ensure directory exists
    const jsDir = path.dirname(outputJsPath);
    if (!fs.existsSync(jsDir)) {
        fs.mkdirSync(jsDir, { recursive: true });
    }

    fs.writeFileSync(outputJsPath, jsContent);
    console.log(`Successfully bundled data into ${outputJsPath}`);
}

buildDashboardData();
