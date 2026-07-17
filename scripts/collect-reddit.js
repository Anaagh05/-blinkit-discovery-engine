const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, '../data/raw/reddit-posts.json');
const subreddits = ['india', 'bangalore', 'mumbai', 'delhi', 'IndianFood', 'developersIndia'];

async function fetchRedditData() {
    console.log('Generating 500 synthetic Reddit posts...');
    let allPosts = [];
    const startDate = new Date('2026-03-01T00:00:00Z');
    const endDate = new Date('2026-07-31T23:59:59Z');
    
    for (let i = 0; i < 500; i++) {
        const mockDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        const isShort = i % 6 === 0;
        let selftext = `I always just reorder my previous items. Does anyone else just ignore the explore tab? It feels like they only want me to buy milk and eggs. Anyone else facing this in ${subreddits[i % subreddits.length]}? - ${i}`;
        if (isShort) {
            selftext = "Blinkit is okay but expensive.";
        }
        allPosts.push({
            id: `reddit_synth_${Math.random().toString(36).substring(7)}_${i}`,
            title: i % 2 === 0 ? `Why does Blinkit never show me new categories? (Thread ${i})` : `Blinkit is great for groceries but I never buy electronics (Thread ${i})`,
            selftext: selftext,
            subreddit: subreddits[i % subreddits.length],
            score: Math.floor(Math.random() * 100),
            url: `https://reddit.com/r/${subreddits[i % subreddits.length]}/comments/synth_${i}`,
            date: mockDate.toISOString()
        });
    }

    fs.writeFileSync(outputFile, JSON.stringify(allPosts, null, 2));
    console.log(`Saved ${allPosts.length} posts to ${outputFile}`);
}

fetchRedditData();
