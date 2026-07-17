document.addEventListener('DOMContentLoaded', () => {
    const pipelineGrid = document.getElementById('pipelineGrid');
    
    if (pipelineGrid) {
        const steps = [
            {
                name: 'Data Collection',
                icon: 'database',
                desc: 'Scraping Play Store, App Store, Reddit, and curated sources.',
                tech: ['google-play-scraper', 'Reddit API']
            },
            {
                name: 'Normalization',
                icon: 'filter',
                desc: 'Filtering out short reviews, emojis, non-English text, and bloat.',
                tech: ['Node.js', 'Regex']
            },
            {
                name: 'Sentiment Analysis',
                icon: 'activity',
                desc: 'Tagging 2,300+ reviews with sentiment and relevance scores.',
                tech: ['Gemini 1.5 Flash']
            },
            {
                name: 'Theme & Insights',
                icon: 'brain',
                desc: 'Massive context holistic clustering to extract actionable themes.',
                tech: ['Gemini 1.5 Pro']
            }
        ];

        pipelineGrid.innerHTML = steps.map((step, idx) => `
            <div class="pipeline-step">
                <div class="step-icon"><i data-lucide="${step.icon}"></i></div>
                <h3>${idx + 1}. ${step.name}</h3>
                <p>${step.desc}</p>
                <div class="tech-stack">
                    ${step.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
            </div>
        `).join('');
        
        if (window.lucide) window.lucide.createIcons();
    }
});
