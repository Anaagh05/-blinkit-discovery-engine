document.addEventListener('DOMContentLoaded', () => {
    const themesGrid = document.getElementById('themesGrid');
    
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
                </div>
                
                <div class="theme-quotes">
                    ${(theme.example_quotes || []).slice(0,2).map(q => `
                        <div class="quote">"${q}"</div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        if (window.lucide) window.lucide.createIcons();
    }
});
