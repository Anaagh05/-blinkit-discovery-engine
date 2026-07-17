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

    // Select top 200 reviews to keep payload small but representative
    // Sort by relevance (high first) and score
    const topReviews = [...sentiments]
        .sort((a, b) => {
            if (a.relevance === 'high' && b.relevance !== 'high') return -1;
            if (a.relevance !== 'high' && b.relevance === 'high') return 1;
            return b.score - a.score;
        })
        .slice(0, 200);

    // Compute source stats from full dataset
    const sourceStats = {};
    sentiments.forEach(r => {
        sourceStats[r.source] = (sourceStats[r.source] || 0) + 1;
    });

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
const DISCOVERY_DATA = ${JSON.stringify(discoveryData, null, 2)};
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
