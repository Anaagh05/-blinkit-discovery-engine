document.addEventListener('DOMContentLoaded', () => {
    const themesGrid = document.getElementById('themesGrid');
    
    const QUESTION_LABELS = [
        "Why do users repeatedly buy from the same categories?",
        "What prevents users from exploring new categories?",
        "How do users discover products today?",
        "What role do habits play in shopping behavior?",
        "What information do users need before trying a new category?",
        "What frustrations emerge repeatedly?",
        "Which user segments are more likely to experiment?",
        "What unmet needs emerge consistently?"
    ];

    if (themesGrid && window.DISCOVERY_DATA) {
        const themes = DISCOVERY_DATA.themes;

        themesGrid.innerHTML = themes.map(theme => `
            <div class="theme-card">
                <div class="theme-header">
                    <div>
                        <h3>${theme.name}</h3>
                        <p class="theme-desc">${theme.description}</p>
                    </div>
                </div>
                
                <div class="theme-stats">
                    <span class="t-stat" style="color: var(--accent)"><i data-lucide="users" style="width:14px; margin-right:4px; vertical-align:middle;"></i> ~${theme.frequency} mentions</span>
                    <span class="t-stat"><i data-lucide="hash" style="width:14px; margin-right:4px; vertical-align:middle;"></i> ${theme.keywords.slice(0,3).join(', ')}</span>
                    <span class="t-stat"><i data-lucide="globe" style="width:14px; margin-right:4px; vertical-align:middle;"></i> ${(theme.sources || []).join(', ')}</span>
                </div>
                
                <div class="theme-quotes">
                    ${(theme.example_quotes || []).slice(0,2).map(q => `
                        <div class="quote">"${q}"</div>
                    `).join('')}
                </div>

                ${theme.mapped_questions && theme.mapped_questions.length > 0 ? `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.35rem;">
                        <i data-lucide="help-circle" style="width:12px;"></i> Research Questions Addressed
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
                        ${theme.mapped_questions.map(qIdx => `
                            <span style="font-size: 0.75rem; background: rgba(232,149,0,0.1); color: var(--primary); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(232,149,0,0.2);">Q${qIdx}: ${QUESTION_LABELS[qIdx - 1] ? QUESTION_LABELS[qIdx - 1].substring(0, 45) + (QUESTION_LABELS[qIdx - 1].length > 45 ? '…' : '') : 'Unknown'}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `).join('');
        
        if (window.lucide) window.lucide.createIcons();
    }
});
