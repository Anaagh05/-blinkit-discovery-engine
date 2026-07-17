document.addEventListener('DOMContentLoaded', () => {
    const insightsList = document.getElementById('insightsList');
    
    if (insightsList && window.DISCOVERY_DATA) {
        const insights = DISCOVERY_DATA.insights;

        insightsList.innerHTML = insights.map((insight, idx) => `
            <div class="insight-card" onclick="this.classList.toggle('active')">
                <div class="insight-header">
                    <h3>Q${idx + 1}: ${insight.question}</h3>
                    <i data-lucide="chevron-down"></i>
                </div>
                <div class="insight-body">
                    <div class="insight-finding">${insight.finding}</div>
                    
                    <h4 style="margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Supporting Evidence (Confidence: ${(insight.confidence * 100).toFixed(0)}%)</h4>
                    <div style="border-left: 2px solid var(--border); padding-left: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                        ${insight.supporting_quotes.map(q => `<div style="font-style: italic; color: var(--text-secondary); font-size: 0.9rem;">"${q}"</div>`).join('')}
                    </div>
                    
                    <div class="insight-rec">
                        <strong>Recommendation:</strong> ${insight.recommendation}
                    </div>
                </div>
            </div>
        `).join('');
        
        if (window.lucide) window.lucide.createIcons();
    }
});
